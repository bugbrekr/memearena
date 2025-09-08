"""
Backend server for MemeArena using FastAPI.
Author: github.com/bugbrekr
Date: 08/09/2025
"""

# Imports
import core.config
import schemas.auth
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Instantiation
app = FastAPI()

# Setup
config = core.config.load_config()
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(config.server.cors_allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/a/meme/{meme_id}")
def meme_get(meme_id: str):
    pass

@app.delete("/a/meme/{meme_id}")
def meme_delete(meme_id: str):
    pass

@app.get("/a/meme")
def meme_list():
    pass

@app.put("/a/meme/{meme_id}/vote")
def meme_vote(meme_id: str, vote_request: schemas.meme.MemeVoteRequest):
    pass
