import re


def test_health_endpoint_returns_ok(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_room_returns_expected_room_code_shape(client):
    response = client.post("/api/match/create")

    assert response.status_code == 200
    assert re.fullmatch(r"[a-z]{3}-[a-z]{3}-[a-z]{3}", response.json()["room_id"])


def test_create_room_retries_until_it_finds_a_unique_room_id(client, registry, room_service):
    registry.create_room("abc-def-ghi")

    generated = iter([list("abcdefghi"), list("jklmnopqr")])
    room_service.choose_letters = lambda _chars, k: next(generated)

    response = client.post("/api/match/create")

    assert response.status_code == 200
    assert response.json() == {"room_id": "jkl-mno-pqr"}
    assert registry.has("jkl-mno-pqr")
