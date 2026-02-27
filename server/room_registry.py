from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, Optional, Set

from fastapi import WebSocket


@dataclass
class RoomState:
    anubis: Optional[WebSocket] = None
    latest_state: Optional[Dict[str, Any]] = None
    opening_player: Optional[str] = None
    spectators: Set[WebSocket] = field(default_factory=set)
    sphinx: Optional[WebSocket] = None


class RoomRegistry:
    def __init__(self) -> None:
        self.active_rooms: Dict[str, RoomState] = {}

    def create_room(self, room_id: str) -> RoomState:
        room = RoomState()
        self.active_rooms[room_id] = room
        return room

    def delete_room(self, room_id: str) -> None:
        self.active_rooms.pop(room_id, None)

    def get(self, room_id: str) -> RoomState:
        return self.active_rooms[room_id]

    def has(self, room_id: str) -> bool:
        return room_id in self.active_rooms
