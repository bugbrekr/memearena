import schemas.common
from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str

class LoginResponse(schemas.common.ResponseModel):
    auth_token: str

class RegisterResponse(schemas.common.ResponseModel):
    auth_token: str

class ProfileResponse(schemas.common.ResponseModel):
    username: str
    email: str