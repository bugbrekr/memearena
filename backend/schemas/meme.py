import schemas.common
from pydantic import BaseModel

class MemeRequest(BaseModel):
    title: str
    description: str

class MemeVoteRequest(BaseModel):
    upvote: bool
    clicked: bool

class MemeListResponse(schemas.common.ResponseModel):
    memes: list[dict]

class MemeResponse(schemas.common.ResponseModel):
    meme_id: str
