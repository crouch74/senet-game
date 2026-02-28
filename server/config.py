from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class AppConfig:
    client_dist: Path
    environment: str

    @property
    def client_assets(self) -> Path:
        return self.client_dist / "assets"

    @property
    def client_index(self) -> Path:
        return self.client_dist / "index.html"

    @property
    def has_static_client(self) -> bool:
        return self.client_dist.exists()


def get_app_config(root_dir: Path | None = None) -> AppConfig:
    project_root = root_dir or Path(__file__).resolve().parents[1]
    return AppConfig(
        client_dist=project_root / "client" / "dist",
        environment=os.getenv("ENVIRONMENT", "development"),
    )
