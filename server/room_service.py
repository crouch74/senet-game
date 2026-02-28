from __future__ import annotations

import random
import string
from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Literal, Optional, Union

from fastapi import WebSocket

from .room_registry import RoomRegistry, RoomState
from .websocket_protocol import build_game_start_payload

RoomPlayer = Literal["anubis", "sphinx"]
RoomRole = Union[RoomPlayer, Literal["spectator"]]

PLAYER_ROLES: tuple[RoomPlayer, RoomPlayer] = ("anubis", "sphinx")


class RoomAssignmentError(Exception):
    pass


@dataclass
class GameStartBroadcast:
    opening_player: Optional[RoomPlayer]
    payload: Dict[str, Any]
    rolls: Optional[Dict[str, int]]


class RoomService:
    def __init__(
        self,
        registry: RoomRegistry,
        choose_letters: Callable[..., List[str]] = random.choices,
        roll_die: Callable[[int, int], int] = random.randint,
    ) -> None:
        self.registry = registry
        self.choose_letters = choose_letters
        self.roll_die = roll_die

    def create_room(self, game_type: str = "senet") -> str:
        while True:
            letters = "".join(self.choose_letters(string.ascii_lowercase, k=9))
            room_id = f"{letters[:3]}-{letters[3:6]}-{letters[6:]}"
            if not self.registry.has(room_id):
                self.registry.create_room(room_id, game_type=game_type)
                return room_id

    def assign_role(
        self,
        room_id: str,
        websocket: WebSocket,
        expected_game_type: str | None = None,
    ) -> RoomRole:
        room = self._get_room_or_raise(room_id)

        if expected_game_type is not None and expected_game_type != room.game_type:
            raise RoomAssignmentError(
                f"Room game type mismatch: expected {expected_game_type}, got {room.game_type}"
            )

        if self._is_spectator_join(room):
            room.spectators.add(websocket)
            return "spectator"

        for role in PLAYER_ROLES:
            if getattr(room, role) is None:
                setattr(room, role, websocket)
                return role

        raise RoomAssignmentError("Room is full")

    def build_game_start_broadcast(
        self, room_id: str
    ) -> Optional[GameStartBroadcast]:
        room = self.registry.get(room_id)
        if room.anubis is None or room.sphinx is None:
            return None

        if room.opening_player is None:
            while True:
                anubis_roll = self.roll_die(1, 6)
                sphinx_roll = self.roll_die(1, 6)
                if anubis_roll != sphinx_roll:
                    break

            opening_player: RoomPlayer = (
                "anubis" if anubis_roll > sphinx_roll else "sphinx"
            )
            room.opening_player = opening_player
            rolls = {"anubis": anubis_roll, "sphinx": sphinx_roll}
            return GameStartBroadcast(
                opening_player=opening_player,
                payload=build_game_start_payload(opening_player, rolls),
                rolls=rolls,
            )

        return GameStartBroadcast(
            opening_player=room.opening_player,
            payload=build_game_start_payload(),
            rolls=None,
        )

    def get_room_recipients(self, room_id: str) -> List[WebSocket]:
        room = self.registry.get(room_id)
        recipients: List[WebSocket] = []
        for role in PLAYER_ROLES:
            socket = getattr(room, role)
            if socket is not None:
                recipients.append(socket)
        recipients.extend(room.spectators)
        return recipients

    def get_sync_recipients(
        self, room_id: str, assigned_role: RoomRole
    ) -> List[WebSocket]:
        room = self.registry.get(room_id)
        recipients: List[WebSocket] = []
        opponent_socket = self.get_opponent_socket(room_id, assigned_role)
        if opponent_socket is not None:
            recipients.append(opponent_socket)
        recipients.extend(room.spectators)
        return recipients

    def store_latest_state(self, room_id: str, state: Dict[str, Any]) -> None:
        self.registry.get(room_id).latest_state = state

    def discard_spectator(self, room_id: str, websocket: WebSocket) -> None:
        self.registry.get(room_id).spectators.discard(websocket)

    def get_latest_state(self, room_id: str) -> Optional[Dict[str, Any]]:
        return self.registry.get(room_id).latest_state

    def mark_disconnected(
        self, room_id: str, assigned_role: RoomRole, websocket: WebSocket
    ) -> None:
        room = self.registry.get(room_id)

        if assigned_role == "spectator":
            room.spectators.discard(websocket)
            return

        setattr(room, assigned_role, None)

    def get_opponent_socket(
        self, room_id: str, assigned_role: RoomRole
    ) -> Optional[WebSocket]:
        if assigned_role == "spectator":
            return None

        room = self.registry.get(room_id)
        opponent_role: RoomPlayer = (
            "sphinx" if assigned_role == "anubis" else "anubis"
        )
        return getattr(room, opponent_role)

    def is_empty(self, room_id: str) -> bool:
        room = self.registry.get(room_id)
        return (
            room.anubis is None
            and room.sphinx is None
            and len(room.spectators) == 0
        )

    def _get_room_or_raise(self, room_id: str) -> RoomState:
        if not self.registry.has(room_id):
            raise RoomAssignmentError("Room does not exist")

        return self.registry.get(room_id)

    def _is_spectator_join(self, room: RoomState) -> bool:
        return (
            room.opening_player is not None
            and room.anubis is not None
            and room.sphinx is not None
        )
