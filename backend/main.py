"""
Backend server for MemeArena using FastAPI.
Author: github.com/bugbrekr
Date: 08/09/2025
"""

# Imports
import core.config
import core.auth
import core.database
import core.profile
import core.image_utils
import core.meme
import schemas.auth
import schemas.meme
import schemas.common
import time
import base64
import io
from typing import Annotated
from fastapi import FastAPI, Request, Response, Header, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

# Instantiation
app = FastAPI()

# Setup
config = core.config.load_config()
authorization_manager = core.auth.AuthManager(config=config)
profile_manager = core.profile.ProfileManager(config=config)
image_processor = core.image_utils.ImageProcessor()
meme_manager = core.meme.MemeManager(config=config)
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

# Auth routes
@app.post("/a/auth/login")
def auth_login(login_request: schemas.auth.LoginRequest):
    if not authorization_manager.verify_credentials(
        username=login_request.username,
        password=login_request.password
    ):
        return schemas.common.ResponseModel(
            success=False,
            code=401
        )
    auth_token = authorization_manager.create_auth_token(
        username=login_request.username
    )
    return schemas.auth.LoginResponse(
        success=True,
        code=200,
        auth_token=auth_token
    )

@app.post("/a/auth/register")
def auth_register(register_request: schemas.auth.RegisterRequest):
    success = authorization_manager.create_credentials(
        username=register_request.username,
        password=register_request.password
    )
    if not success:
        return schemas.common.ResponseModel(
            success=False,
            code=409
        )
    profile_manager.create_profile(
        username=register_request.username,
        email=register_request.email
    )
    auth_token = authorization_manager.create_auth_token(
        username=register_request.username
    )
    return schemas.auth.RegisterResponse(
        success=True,
        code=201,
        auth_token=auth_token
    )

@app.get("/a/auth/profile")
def auth_profile(authorization: Annotated[str | None, Header()] = None):
    code, username = authorization_manager.verify_auth_header(authorization)
    if not username:
        return schemas.common.ResponseModel(
            success=False,
            code=code
        )
    profile = profile_manager.get_profile(username)
    if not profile:
        return schemas.common.ResponseModel(
            success=False,
            code=404
        )
    return schemas.auth.ProfileResponse(
        success=True,
        code=200,
        username=profile["username"],
        email=profile["email"],
        is_admin=(username == config.auth.admin_username)
    )

# Meme routes
@app.post("/a/meme")
async def meme_add(
    title: Annotated[str, Form()],
    image: UploadFile = File(...),
    authorization: Annotated[str | None, Header()] = None
):
    code, username = authorization_manager.verify_auth_header(authorization)
    if not username:
        return schemas.common.ResponseModel(
            success=False,
            code=code
        )
    if not image.filename:
        return schemas.common.ResponseModel(
            success=False,
            code=400
        )
    success, base64_data, _ = await image_processor.process_image(image)
    if not success or not base64_data:
        return schemas.common.ResponseModel(
            success=False,
            code=400
        )
    try:
        meme_id = meme_manager.add_meme(
            title=title,
            base64_data=base64_data,
            username=username
        )
        if not meme_id:
            return schemas.common.ResponseModel(
                success=False,
                code=500
            )
        return schemas.meme.MemeResponse(
            success=True,
            code=201,
            meme_id=meme_id
        )
    except Exception as e:
        return schemas.common.ResponseModel(
            success=False,
            code=500
        )

@app.delete("/a/meme/{meme_id}/delete")
def meme_delete(meme_id: str, authorization: Annotated[str | None, Header()] = None):
    code, username = authorization_manager.verify_auth_header(authorization)
    if not username:
        return schemas.common.ResponseModel(
            success=False,
            code=code
        )
    if username != config.auth.admin_username:
        return schemas.common.ResponseModel(
            success=False,
            code=403
        )
    res = meme_manager.delete_meme(meme_id)
    return schemas.common.ResponseModel(
        success=True,
        code=200 if res else 404
    )

@app.get("/a/meme/{meme_id}")
def meme_get(meme_id: str):
    meme = meme_manager.get_meme(meme_id)
    if not meme:
        return schemas.common.ResponseModel(
            success=False,
            code=404
        )
    try:
        image_data = base64.b64decode(meme["image_data"])
        return StreamingResponse(
            io.BytesIO(image_data),
            media_type="image/jpeg",
            headers={
                "Content-Disposition": f"inline; filename=meme_{meme_id}.jpg",
                "Cache-Control": "public, max-age=3600"
            }
        )
    except Exception as e:
        return schemas.common.ResponseModel(
            success=False,
            code=500
        )

@app.get("/a/meme")
def meme_list(authorization: Annotated[str | None, Header()] = None):
    code, username = authorization_manager.verify_auth_header(authorization)
    if not username:
        memes = meme_manager.list_memes(limit=8)
        return schemas.meme.MemeListResponse(
            success=True,
            code=200,
            memes=memes
        )
    memes = meme_manager.list_memes(limit=8, username=username)
    return schemas.meme.MemeListResponse(
        success=True,
        code=200,
        memes=memes
    )

@app.put("/a/meme/{meme_id}/vote")
def meme_vote(
    meme_id: str,
    vote_request: schemas.meme.MemeVoteRequest,
    authorization: Annotated[str | None, Header()] = None
):
    code, username = authorization_manager.verify_auth_header(authorization)
    if not username:
        return schemas.common.ResponseModel(
            success=False,
            code=code
        )
    res = meme_manager.vote_meme(
        meme_id,
        vote_request.upvote,
        vote_request.clicked,
        username
    )
    return schemas.common.ResponseModel(
        success=True,
        code=200 if res else 404
    )
