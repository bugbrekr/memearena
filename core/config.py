"""
Main backend server code.
Author: github.com/bugbrekr
Date: 31/08/2025
"""

from dataclasses import dataclass
from typing import get_type_hints
import toml

@dataclass
class SubConfig:
    pass

@dataclass
class Server(SubConfig):
    cors_allowed_origins: tuple[str] = ()

@dataclass
class MongoDB(SubConfig):
    uri: str
    db: str

@dataclass
class Config:
    server: Server
    mongodb: MongoDB
    def __init__(self, config: dict[str, dict[str, str]]):
        registered_types = get_type_hints(self)
        for k, v in config.items():
            if k in registered_types:
                setattr(self, k, registered_types[k](**v))

def load_config(config_file: str = "config.toml") -> Config:
    """
    Loads config.toml and instantiates Config object.
    """
    with open(config_file, encoding="utf-8") as f:
        config = toml.load(f)
    return Config(config)
