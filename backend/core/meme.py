import core.config
import core.database
import time
import secrets

class MemeManager:
    def __init__(self, config: core.config.Config) -> None:
        self.db = core.database.factory(
            config.mongodb.uri,
            config.mongodb.db
        )
    def add_meme(
            self,
            title: str,
            base64_data: str,
            username: str
        ) -> str:
        meme_id = secrets.token_urlsafe(16)
        meme_data = {
            "meme_id": meme_id,
            "title": title,
            "image_data": base64_data,
            "username": username,
            "votes": 0,
            "created_at": time.time()
        }
        self.db.memes.insert_one(meme_data)
        return meme_id
    def get_meme(self, meme_id: str) -> dict | None:
        return self.db.memes.find_one({"meme_id": meme_id})
    def vote_meme(self, meme_id: str, upvote: bool, clicked: bool, username: str) -> bool:
        update = {"$inc": {"votes": 1 if upvote == clicked else -1}}
        self.db["profiles"].update_one(
            {"username": username},
            {"$set": {f"voted_memes.{meme_id}": upvote} if clicked else {"$unset": {f"voted_memes.{meme_id}": ""}}},
            upsert=True
        )
        result = self.db.memes.update_one({"meme_id": meme_id}, update)
        return result.modified_count > 0
    def list_memes(self, limit: int = 10, sort: str = "votes") -> list[dict]:
        memes = self.db.memes.find().sort(sort, -1).limit(limit)
        return list(memes)
    def delete_meme(self, meme_id: str) -> bool:
        result = self.db.memes.delete_one({"meme_id": meme_id})
        return result.deleted_count > 0
