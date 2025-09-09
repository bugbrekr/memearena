"""
Backend server for MemeArena using FastAPI.
Author: github.com/bugbrekr
Date: 08/09/2025
"""

# Imports
import core.config
import core.auth
import core.database
import schemas.auth
import schemas.meme
from typing import Callable
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

# Instantiation
app = FastAPI()

# Setup
config = core.config.load_config()
authorization_manager = core.auth.AuthManager()
db_client = core.database.factory(
    config.mongodb.uri,
    config.mongodb.db
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(config.server.cors_allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROTECTED_ROUTES = [
    "/a/auth/profile",
    "/a/meme",
    "/a/meme/{meme_id}",
    "/a/meme/{meme_id}/vote",
    "/a/meme/{meme_id}/delete",
]

ADMIN_ROUTES = [
    "/a/meme/{meme_id}/delete",
]

# Auth middleware
@app.middleware("http")
def auth_middleware(request: Request, call_next: Callable) -> Response:
    if request.url.path not in PROTECTED_ROUTES:
        return call_next(request)
    auth_header = request.headers.get("Authorization")
    is_valid, status_code = authorization_manager.verify_auth_header(
        auth_header,
        request.url.path in ADMIN_ROUTES
    )
    if not is_valid:
        return Response(
            status_code=status_code,
            content={
                "success": False,
                "code": status_code,
                "message": "Unauthorized" if status_code == 401 else "Forbidden",
            }
        )
    return call_next(request)

# Auth routes
@app.post("/a/auth/login")
def auth_login(login_request: schemas.auth.LoginRequest):
    pass

@app.post("/a/auth/register")
def auth_register(register_request: schemas.auth.RegisterRequest):
    pass

@app.get("/a/auth/profile")
def auth_profile():
    pass

# Meme routes
@app.post("/a/meme")
def meme_add(meme_request: schemas.meme.MemeRequest):
    pass

@app.delete("/a/meme/{meme_id}/delete")
def meme_delete(meme_id: str):
    pass

@app.get("/a/meme/{meme_id}")
def meme_get(meme_id: str):
    pass

@app.get("/a/meme")
def meme_list():
    pass

@app.put("/a/meme/{meme_id}/vote")
def meme_vote(meme_id: str, vote_request: schemas.meme.MemeVoteRequest):
    pass
