from __future__ import annotations

import random
import string
from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Optional

from fastapi import WebSocket

from .room_registry import RoomRegistry


class RoomAssignmentError(Exception):
    pass


@dataclass
class GameStartBroadcast:
    opening_player: Optional[str]
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

    def create_room(self) -> str:
        while True:
            letters = "".join(self.choose_letters(string.ascii_lowercase, k=9))
            room_id = f"{letters[:3]}-{letters[3:6]}-{letters[6:]}"
            if not self.registry.has(room_id):
                self.registry.create_room(room_id)
                return room_id

    def assign_role(self, room_id: str, websocket: WebSocket) -> str:
        if not self.registry.has(room_id):
            raise RoomAssignmentError("Room does not exist")

        room = self.registry.get(room_id)

        if (
            room.opening_player is not None
            and room.anubis is not None
            and room.sphinx is not None
        ):
            room.spectators.add(websocket)
            return "spectator"

        if room.anubis is None:
            room.anubis = websocket
            return "anubis"

        if room.sphinx is None:
            room.sphinx = websocket
            return "sphinx"

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

            opening_player = "anubis" if anubis_roll > sphinx_roll else "sphinx"
            room.opening_player = opening_player
            rolls = {"anubis": anubis_roll, "sphinx": sphinx_roll}
            return GameStartBroadcast(
                opening_player=opening_player,
                payload={
                    "type": "game_start",
                    "opening_player": opening_player,
                    "opening_rolls": rolls,
                },
                rolls=rolls,
            )

        return GameStartBroadcast(
            opening_player=room.opening_player,
            payload={"type": "game_start"},
            rolls=None,
        )

    def get_room_recipients(self, room_id: str) -> List[WebSocket]:
        room = self.registry.get(room_id)
        recipients: List[WebSocket] = []
        if room.anubis is not None:
            recipients.append(room.anubis)
        if room.sphinx is not None:
            recipients.append(room.sphinx)
        recipients.extend(room.spectators)
        return recipients

    def get_sync_recipients(
        self, room_id: str, assigned_role: str
    ) -> List[WebSocket]:
        room = self.registry.get(room_id)
        recipients: List[WebSocket] = []
        other_color = "sphinx" if assigned_role == "anubis" else "anubis"
        other_ws = getattr(room, other_color)
        if other_ws is not None:
            recipients.append(other_ws)
        recipients.extend(room.spectators)
        return recipients

    def store_latest_state(self, room_id: str, state: Dict[str, Any]) -> None:
        self.registry.get(room_id).latest_state = state

    def discard_spectator(self, room_id: str, websocket: WebSocket) -> None:
        self.registry.get(room_id).spectators.discard(websocket)

    def get_latest_state(self, room_id: str) -> Optional[Dict[str, Any]]:
        return self.registry.get(room_id).latest_state

    def mark_disconnected(self, room_id: str, assigned_role: str, websocket: WebSocket) -> None:
        room = self.registry.get(room_id)

        if assigned_role == "spectator":
            room.spectators.discard(websocket)
            return

        setattr(room, assigned_role, None)

    def get_opponent_socket(
        self, room_id: str, assigned_role: str
    ) -> Optional[WebSocket]:
        room = self.registry.get(room_id)
        other_color = "sphinx" if assigned_role == "anubis" else "anubis"
        return getattr(room, other_color)

    def is_empty(self, room_id: str) -> bool:
        room = self.registry.get(room_id)
        return room.anubis is None and room.sphinx is None and len(room.spectators) == 0
