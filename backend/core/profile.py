import core.database
import core.config

class ProfileManager:
    def __init__(self, config: core.config.Config) -> None:
        self.db = core.database.factory(
            config.mongodb.uri,
            config.mongodb.db
        )
    def create_profile(
            self,
            username: str,
            email: str,
        ) -> bool:
        if self.db.profiles.find_one({"username": username}):
            return False
        self.db.profiles.insert_one({
            "username": username,
            "email": email
        })
        return True
    def get_profile(self, username: str) -> dict | None:
        return self.db.profiles.find_one({"username": username})

    def update_profile(self, username: str, profile_data: dict) -> bool:
        result = self.db.profiles.update_one(
            {"username": username},
            {"$set": profile_data},
            upsert=True
        )
        return result.modified_count > 0 or result.upserted_id is not None