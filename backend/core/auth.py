import core.database
import core.config
import time
import secrets
import hashlib

class AuthManager:
    def __init__(self, config: core.config.Config) -> None:
        self.config = config
        self.db = core.database.factory(
            config.mongodb.uri,
            config.mongodb.db
        )
    def create_credentials(self, username: str, password: str) -> bool:
        if self.db["user_credentials"].find_one({"username": username}):
            return False
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        self.db["user_credentials"].insert_one({
            "username": username,
            "password": hashed_password
        })
        return True
    def verify_credentials(self, username: str, password: str) -> bool:
        user = self.db["user_credentials"].find_one({"username": username})
        if not user or user["password"] != hashlib.sha256(password.encode()).hexdigest():
            return False
        return True
    def create_auth_token(self, username: str) -> str:
        token = secrets.token_urlsafe(32)
        self.db["auth_tokens"].insert_one({
            "token": token,
            "username": username,
            "created_at": int(time.time())
        })
        return token
    def verify_auth_token(self, token: str) -> tuple[int, str | None]:
        session = self.db["auth_tokens"].find_one({"token": token})
        if not session:
            return 401, None
        if session["created_at"] + self.config.auth.session_ttl < int(time.time()):
            return 403, None
        return 200, session["username"]
    def verify_auth_header(self, auth_header: str | None) -> tuple[int, str | None]:
        if not auth_header or not auth_header.startswith("Bearer "):
            return 401, None
        token = auth_header.split(" ")[1]
        return self.verify_auth_token(token)
