from server.websocket_protocol import (
    build_error_payload,
    build_game_start_payload,
    build_init_payload,
    build_opponent_disconnected_payload,
    build_sync_payload,
    extract_sync_state,
    parse_message,
)


def test_protocol_builders_preserve_existing_payload_shapes():
    assert build_init_payload("spectator") == {
        "type": "init",
        "role": "spectator",
        "game_type": "senet",
    }
    assert build_init_payload("anubis") == {
        "type": "init",
        "player": "anubis",
        "game_type": "senet",
    }
    assert build_game_start_payload("sphinx", {"anubis": 1, "sphinx": 4}) == {
        "type": "game_start",
        "opening_player": "sphinx",
        "opening_rolls": {"anubis": 1, "sphinx": 4},
    }
    assert build_sync_payload({"winner": None}) == {
        "type": "sync",
        "state": {"winner": None},
    }
    assert build_error_payload("Room is full") == {
        "type": "error",
        "message": "Room is full",
    }
    assert build_opponent_disconnected_payload() == {
        "type": "opponent_disconnected"
    }


def test_protocol_parsing_only_accepts_valid_sync_messages():
    assert parse_message("not-json") is None
    assert extract_sync_state(parse_message('{"type":"sync","state":{"winner":null}}')) == {
        "winner": None
    }
    assert extract_sync_state(parse_message('{"type":"sync","state":"invalid"}')) is None
