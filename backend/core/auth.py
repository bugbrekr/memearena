class AuthManager:
    @staticmethod
    def verify_auth_header(auth_header: str) -> tuple[bool, int]:
        if not auth_header or not auth_header.startswith("Bearer "):
            return False, 401
        token = auth_header.split(" ")[1]
        return token == "valid-token", 200