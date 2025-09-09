import core.config
import core.database
import time
import secrets
from bson import ObjectId
from typing import List, Dict, Optional

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
        return self.db.memes.find_one({"meme_id": meme_id}, {"_id": 0})
    def vote_meme(self, meme_id: str, upvote: bool, clicked: bool, username: str) -> bool:
        profile = self.db["profiles"].find_one({"username": username})
        if not profile:
            return False
        if profile.get("voted_memes", {}).get(meme_id) == upvote and clicked:
            return False
        elif profile.get("voted_memes", {}).get(meme_id) is None and not clicked:
            return False
        update = {"$inc": {"votes": 1 if upvote == clicked else -1}}

        if clicked:
            profile_update = {"$set": {f"voted_memes.{meme_id}": upvote}}
        else:
            profile_update = {"$unset": {f"voted_memes.{meme_id}": ""}}
        
        self.db["profiles"].update_one(
            {"username": username},
            profile_update,
            upsert=True
        )
        result = self.db.memes.update_one({"meme_id": meme_id}, update)
        return result.modified_count > 0
    def list_memes(self, skip: int = 0, limit: int = 10, username: str | None = None) -> List[Dict]:
        if limit > 25:
            limit = 25
        memes = []
        voted_memes = {}
        if username:
            profile = self.db.profiles.find_one({"username": username})
            if profile:
                voted_memes = profile.get("voted_memes", {})
        for i in list(self.db.memes.find({}, {"_id": 0}).skip(skip).limit(limit)):
            memes.append({
                "meme_id": i["meme_id"],
                "title": i["title"],
                "username": i["username"],
                "votes": i["votes"],
                "created_at": i["created_at"],
                "user_vote": voted_memes.get(i["meme_id"], None)
            })
        return memes
    def delete_meme(self, meme_id: str) -> bool:
        result = self.db.memes.delete_one({"meme_id": meme_id})
        return result.deleted_count > 0
