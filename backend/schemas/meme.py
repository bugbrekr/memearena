from pydantic import BaseModel

class MemeVoteRequest(BaseModel):
    vote: int

class MemeRequest(BaseModel):
    title: str
    image_url: str
    description: str
