#!/usr/bin/env python3
"""
Simple server runner for development.
Run this script to start the FastAPI server with the meme upload functionality.
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
