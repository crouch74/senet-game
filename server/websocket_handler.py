from __future__ import annotations

import logging
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect

from .logging_utils import log_event
from .room_registry import RoomRegistry
from .room_service import (
    GameStartBroadcast,
    RoomAssignmentError,
    RoomRole,
    RoomService,
)
from .websocket_protocol import (
    build_error_payload,
    build_game_start_payload,
    build_init_payload,
    build_opponent_disconnected_payload,
    build_sync_payload,
    extract_sync_state,
    parse_message,
)


async def safe_send_json(
    websocket: WebSocket,
    payload: dict[str, Any],
    logger: logging.Logger,
    *,
    room_id: str,
    description: str,
) -> bool:
    try:
        await websocket.send_json(payload)
        return True
    except Exception as exc:  # pragma: no cover - defensive logging path
        log_event(
            logger,
            "⚠️",
            "WS",
            f"{description} failed for room {room_id}: {exc}",
            level=logging.WARNING,
        )
        return False


async def safe_send_text(
    websocket: WebSocket,
    payload: str,
    logger: logging.Logger,
    *,
    room_id: str,
    description: str,
) -> bool:
    try:
        await websocket.send_text(payload)
        return True
    except Exception as exc:  # pragma: no cover - defensive logging path
        log_event(
            logger,
            "⚠️",
            "WS",
            f"{description} failed for room {room_id}: {exc}",
            level=logging.WARNING,
        )
        return False


async def _send_initial_state(
    websocket: WebSocket,
    room_id: str,
    assigned_role: RoomRole,
    room_service: RoomService,
    logger: logging.Logger,
) -> None:
    if assigned_role == "spectator":
        log_event(logger, "✅", "WS", f"Spectator joined room {room_id}")
        room_state = room_service.registry.get(room_id)
        await safe_send_json(
            websocket,
            build_init_payload(assigned_role, game_type=room_state.game_type),
            logger,
            room_id=room_id,
            description="Sending spectator init payload",
        )
        await safe_send_json(
            websocket,
            build_game_start_payload(),
            logger,
            room_id=room_id,
            description="Sending spectator resume payload",
        )
        latest_state = room_service.get_latest_state(room_id)
        if latest_state is not None:
            await safe_send_json(
                websocket,
                build_sync_payload(latest_state),
                logger,
                room_id=room_id,
                description="Sending spectator sync payload",
            )
        return

    log_event(logger, "✅", "WS", f"Player joined room {room_id} as {assigned_role}")
    room_state = room_service.registry.get(room_id)
    await safe_send_json(
        websocket,
        build_init_payload(assigned_role, game_type=room_state.game_type),
        logger,
        room_id=room_id,
        description="Sending player init payload",
    )


def _log_broadcast(
    logger: logging.Logger,
    room_id: str,
    broadcast: GameStartBroadcast,
) -> None:
    if broadcast.rolls is not None and broadcast.opening_player is not None:
        log_event(
            logger,
            "🔍",
            "WS",
            (
                f"Opening roll-off for room {room_id}: "
                f"anubis={broadcast.rolls['anubis']}, "
                f"sphinx={broadcast.rolls['sphinx']}, "
                f"starter={broadcast.opening_player}"
            ),
        )
        return

    log_event(logger, "✅", "WS", f"Room {room_id} resumed and broadcast game_start")


async def _broadcast_game_start(
    room_id: str,
    broadcast: GameStartBroadcast,
    room_service: RoomService,
    logger: logging.Logger,
) -> None:
    _log_broadcast(logger, room_id, broadcast)

    for recipient in room_service.get_room_recipients(room_id):
        await safe_send_json(
            recipient,
            broadcast.payload,
            logger,
            room_id=room_id,
            description="Broadcasting game_start",
        )


async def _broadcast_sync_message(
    room_id: str,
    assigned_role: RoomRole,
    raw_message: str,
    room_service: RoomService,
    logger: logging.Logger,
) -> None:
    opponent_socket = room_service.get_opponent_socket(room_id, assigned_role)

    for recipient in room_service.get_sync_recipients(room_id, assigned_role):
        was_sent = await safe_send_text(
            recipient,
            raw_message,
            logger,
            room_id=room_id,
            description="Forwarding sync payload",
        )
        if was_sent or recipient is opponent_socket:
            continue

        room_service.discard_spectator(room_id, recipient)


async def _handle_disconnect(
    room_id: str,
    assigned_role: RoomRole,
    websocket: WebSocket,
    registry: RoomRegistry,
    room_service: RoomService,
    logger: logging.Logger,
) -> None:
    room_service.mark_disconnected(room_id, assigned_role, websocket)

    if assigned_role == "spectator":
        log_event(logger, "⚠️", "WS", f"Spectator disconnected from room {room_id}")
    else:
        log_event(
            logger,
            "⚠️",
            "WS",
            f"Player {assigned_role} disconnected from room {room_id}",
        )

    if room_service.is_empty(room_id):
        registry.delete_room(room_id)
        log_event(logger, "✅", "WS", f"Room {room_id} closed")
        return

    if assigned_role == "spectator":
        return

    opponent_socket = room_service.get_opponent_socket(room_id, assigned_role)
    if opponent_socket is None:
        return

    await safe_send_json(
        opponent_socket,
        build_opponent_disconnected_payload(),
        logger,
        room_id=room_id,
        description="Sending opponent_disconnected payload",
    )


async def handle_match_websocket(
    websocket: WebSocket,
    room_id: str,
    registry: RoomRegistry,
    room_service: RoomService,
    logger: logging.Logger,
) -> None:
    await websocket.accept()
    log_event(logger, "🔍", "WS", f"New connection attempt for room {room_id}")

    try:
        expected_game_type = websocket.query_params.get("game")
        assigned_role = room_service.assign_role(
            room_id,
            websocket,
            expected_game_type=expected_game_type,
        )
    except RoomAssignmentError as exc:
        log_event(
            logger,
            "⚠️",
            "WS",
            f"Connection to room {room_id} rejected. {exc}.",
            level=logging.WARNING,
        )
        await safe_send_json(
            websocket,
            build_error_payload(str(exc)),
            logger,
            room_id=room_id,
            description="Sending room rejection payload",
        )
        await websocket.close()
        return

    await _send_initial_state(websocket, room_id, assigned_role, room_service, logger)

    broadcast = room_service.build_game_start_broadcast(room_id)
    if broadcast is not None:
        await _broadcast_game_start(room_id, broadcast, room_service, logger)

    try:
        while True:
            raw_message = await websocket.receive_text()
            if assigned_role == "spectator":
                continue

            parsed_message = parse_message(raw_message)
            sync_state = extract_sync_state(parsed_message)
            if sync_state is not None:
                room_service.store_latest_state(room_id, sync_state)
                await _broadcast_sync_message(
                    room_id,
                    assigned_role,
                    raw_message,
                    room_service,
                    logger,
                )
                continue

            opponent_socket = room_service.get_opponent_socket(room_id, assigned_role)
            if opponent_socket is not None:
                await safe_send_text(
                    opponent_socket,
                    raw_message,
                    logger,
                    room_id=room_id,
                    description="Forwarding peer payload",
                )
    except WebSocketDisconnect:
        await _handle_disconnect(
            room_id,
            assigned_role,
            websocket,
            registry,
            room_service,
            logger,
        )
