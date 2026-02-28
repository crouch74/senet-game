import time
from typing import cast

from fastapi import WebSocket


def create_room(client):
    return client.post("/api/match/create").json()["room_id"]


def fixed_rolls(*values):
    iterator = iter(values)
    return lambda _start, _end: next(iterator)


def test_nonexistent_rooms_are_rejected(client):
    with client.websocket_connect("/api/match/missing-room") as websocket:
        assert websocket.receive_json() == {
            "type": "error",
            "message": "Room does not exist",
        }


def test_room_join_rejects_game_type_mismatch(client):
    room_id = client.post("/api/match/create?game=mehen").json()["room_id"]

    with client.websocket_connect(f"/api/match/{room_id}?game=senet") as websocket:
        assert websocket.receive_json() == {
            "type": "error",
            "message": "Room game type mismatch: expected senet, got mehen",
        }


def test_room_join_rejects_hounds_and_jackals_game_type_mismatch(client):
    room_id = client.post("/api/match/create?game=hounds-and-jackals").json()["room_id"]

    with client.websocket_connect(f"/api/match/{room_id}?game=senet") as websocket:
        assert websocket.receive_json() == {
            "type": "error",
            "message": "Room game type mismatch: expected senet, got hounds-and-jackals",
        }


def test_players_get_roles_and_opening_rolls_with_tie_rerolls(client, room_service):
    room_service.roll_die = fixed_rolls(3, 3, 2, 5)
    room_id = create_room(client)

    with client.websocket_connect(f"/api/match/{room_id}") as anubis:
        assert anubis.receive_json() == {
            "type": "init",
            "player": "anubis",
            "game_type": "senet",
        }

        with client.websocket_connect(f"/api/match/{room_id}") as sphinx:
            assert sphinx.receive_json() == {
                "type": "init",
                "player": "sphinx",
                "game_type": "senet",
            }

            game_start_for_anubis = anubis.receive_json()
            game_start_for_sphinx = sphinx.receive_json()

    expected_payload = {
        "type": "game_start",
        "opening_player": "sphinx",
        "opening_rolls": {"anubis": 2, "sphinx": 5},
    }
    assert game_start_for_anubis == expected_payload
    assert game_start_for_sphinx == expected_payload


def test_spectators_receive_game_start_and_the_latest_sync_state(client, room_service):
    room_service.roll_die = fixed_rolls(6, 2)
    room_id = create_room(client)

    with client.websocket_connect(f"/api/match/{room_id}") as anubis:
        anubis.receive_json()
        with client.websocket_connect(f"/api/match/{room_id}") as sphinx:
            sphinx.receive_json()
            anubis.receive_json()
            sphinx.receive_json()

            anubis.send_json(
                {"type": "sync", "state": {"currentPlayer": "sphinx", "winner": None}}
            )
            assert sphinx.receive_json() == {
                "type": "sync",
                "state": {"currentPlayer": "sphinx", "winner": None},
            }

            with client.websocket_connect(f"/api/match/{room_id}") as spectator:
                assert spectator.receive_json() == {
                    "type": "init",
                    "role": "spectator",
                    "game_type": "senet",
                }
                assert spectator.receive_json() == {"type": "game_start"}
                assert spectator.receive_json() == {
                    "type": "sync",
                    "state": {"currentPlayer": "sphinx", "winner": None},
                }
                # Current behavior broadcasts a resumed game_start to all room members.
                assert spectator.receive_json() == {"type": "game_start"}


def test_spectators_are_read_only_and_sync_messages_fan_out_to_opponents(client, room_service):
    room_service.roll_die = fixed_rolls(5, 1)
    room_id = create_room(client)

    with client.websocket_connect(f"/api/match/{room_id}") as anubis:
        anubis.receive_json()
        with client.websocket_connect(f"/api/match/{room_id}") as sphinx:
            sphinx.receive_json()
            anubis.receive_json()
            sphinx.receive_json()

            anubis.send_json(
                {"type": "sync", "state": {"currentPlayer": "sphinx", "winner": None}}
            )
            assert sphinx.receive_json() == {
                "type": "sync",
                "state": {"currentPlayer": "sphinx", "winner": None},
            }

            with client.websocket_connect(f"/api/match/{room_id}") as spectator:
                spectator.receive_json()
                spectator.receive_json()
                spectator.receive_json()
                spectator.receive_json()
                assert anubis.receive_json() == {"type": "game_start"}
                assert sphinx.receive_json() == {"type": "game_start"}

                spectator.send_json({"type": "sync", "state": {"currentPlayer": "anubis"}})
                assert room_service.get_latest_state(room_id) == {
                    "currentPlayer": "sphinx",
                    "winner": None,
                }

                anubis.send_json({"type": "sync", "state": {"currentPlayer": "anubis"}})
                assert sphinx.receive_json() == {
                    "type": "sync",
                    "state": {"currentPlayer": "anubis"},
                }
                assert spectator.receive_json() == {
                    "type": "sync",
                    "state": {"currentPlayer": "anubis"},
                }


def test_third_connections_can_be_rejected_as_room_full_before_start(client, registry):
    room = registry.create_room("abc-def-ghi")
    room.anubis = cast(WebSocket, object())
    room.sphinx = cast(WebSocket, object())

    with client.websocket_connect("/api/match/abc-def-ghi") as websocket:
        assert websocket.receive_json() == {
            "type": "error",
            "message": "Room is full",
        }


def test_disconnects_notify_the_opponent_and_empty_rooms_are_cleaned_up(
    client, registry, room_service
):
    room_service.roll_die = fixed_rolls(4, 2)
    room_id = create_room(client)

    with client.websocket_connect(f"/api/match/{room_id}") as anubis:
        anubis.receive_json()
        with client.websocket_connect(f"/api/match/{room_id}") as sphinx:
            sphinx.receive_json()
            anubis.receive_json()
            sphinx.receive_json()

        assert anubis.receive_json() == {"type": "opponent_disconnected"}

    for _ in range(20):
        if room_id not in registry.active_rooms:
            break
        time.sleep(0.01)

    assert room_id not in registry.active_rooms
