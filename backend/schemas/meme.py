import schemas.common

class MemeRequest(schemas.common.ResponseModel):
    title: str
    description: str

class MemeVoteRequest(schemas.common.ResponseModel):
    upvote: bool
    clicked: bool

class MemeListResponse(schemas.common.ResponseModel):
    memes: list[dict]

class MemeResponse(schemas.common.ResponseModel):
    meme_id: str
