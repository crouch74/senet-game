import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from server.app import create_app
from server.room_registry import RoomRegistry
from server.room_service import RoomService


@pytest.fixture
def registry():
    return RoomRegistry()


@pytest.fixture
def room_service(registry):
    return RoomService(registry)


@pytest.fixture
def app(registry, room_service):
    return create_app(registry=registry, room_service=room_service)


@pytest.fixture
def client(app):
    with TestClient(app) as test_client:
        yield test_client
