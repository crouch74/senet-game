from __future__ import annotations

import logging

_LOGGING_CONFIGURED = False


def configure_logging(level: int = logging.INFO) -> None:
    global _LOGGING_CONFIGURED

    if _LOGGING_CONFIGURED:
        return

    logging.basicConfig(level=level, format="%(message)s")
    _LOGGING_CONFIGURED = True


def get_logger(name: str) -> logging.Logger:
    configure_logging()
    return logging.getLogger(name)


def log_event(
    logger: logging.Logger,
    emoji: str,
    scope: str,
    message: str,
    *,
    level: int = logging.INFO,
) -> None:
    logger.log(level, "%s [%s] %s", emoji, scope, message)
