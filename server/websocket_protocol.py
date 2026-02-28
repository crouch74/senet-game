from __future__ import annotations

import json
from typing import Any, Dict, Literal, TypedDict, Union, cast

RoomPlayer = Literal["anubis", "sphinx"]
RoomRole = Union[RoomPlayer, Literal["spectator"]]


class ErrorPayload(TypedDict):
    message: str
    type: Literal["error"]


class SpectatorInitPayload(TypedDict):
    role: Literal["spectator"]
    type: Literal["init"]


class PlayerInitPayload(TypedDict):
    player: RoomPlayer
    type: Literal["init"]


class GameStartPayload(TypedDict, total=False):
    opening_player: RoomPlayer
    opening_rolls: Dict[str, int]
    type: Literal["game_start"]


class SyncPayload(TypedDict):
    state: Dict[str, Any]
    type: Literal["sync"]


class OpponentDisconnectedPayload(TypedDict):
    type: Literal["opponent_disconnected"]


def build_error_payload(message: str) -> ErrorPayload:
    return {"type": "error", "message": message}


def build_init_payload(role: RoomRole) -> SpectatorInitPayload | PlayerInitPayload:
    if role == "spectator":
        return {"type": "init", "role": role}

    return {"type": "init", "player": role}


def build_game_start_payload(
    opening_player: RoomPlayer | None = None,
    opening_rolls: Dict[str, int] | None = None,
) -> GameStartPayload:
    payload: GameStartPayload = {"type": "game_start"}

    if opening_player is not None:
        payload["opening_player"] = opening_player

    if opening_rolls is not None:
        payload["opening_rolls"] = opening_rolls

    return payload


def build_sync_payload(state: Dict[str, Any]) -> SyncPayload:
    return {"type": "sync", "state": state}


def build_opponent_disconnected_payload() -> OpponentDisconnectedPayload:
    return {"type": "opponent_disconnected"}


def parse_message(raw_message: str) -> Dict[str, Any] | None:
    try:
        message = json.loads(raw_message)
    except json.JSONDecodeError:
        return None

    if not isinstance(message, dict):
        return None

    return cast(Dict[str, Any], message)


def extract_sync_state(message: Dict[str, Any] | None) -> Dict[str, Any] | None:
    if message is None or message.get("type") != "sync":
        return None

    state = message.get("state")
    if not isinstance(state, dict):
        return None

    return cast(Dict[str, Any], state)
