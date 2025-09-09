"""
Image processing utilities for MemeArena.
Handles image format conversion and base64 encoding.
"""

import base64
import subprocess
import tempfile
import os
from typing import Optional, Tuple
from fastapi import UploadFile
import uuid

class ImageProcessor:
    def __init__(self):
        self.supported_formats = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp",
            "image/tiff"
        ]
    def is_supported_format(self, content_type: str) -> bool:
        return content_type.lower() in self.supported_formats
    async def process_image(self, file: UploadFile) -> Tuple[bool, Optional[str], Optional[str]]:
        if not file.content_type or not self.is_supported_format(file.content_type):
            return False, None, f"Unsupported file format: {file.content_type or "unknown"}"
        
        if not file.filename:
            return False, None, "No filename provided"
        
        try:
            file_content = await file.read()
            file_extension = file.filename.split(".")[-1] if "." in file.filename else "tmp"
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_input:
                temp_input.write(file_content)
                temp_input_path = temp_input.name
            output_filename = f"{uuid.uuid4().hex}.jpg"
            temp_output_path = os.path.join(tempfile.gettempdir(), output_filename)
            
            try:
                result = subprocess.run([
                    "ffmpeg", "-i", temp_input_path,
                    "-vf", "scale=800:600:force_original_aspect_ratio=decrease,pad=800:600:(ow-iw)/2:(oh-ih)/2",
                    "-q:v", "2",
                    "-y",
                    temp_output_path
                ], capture_output=True, text=True, timeout=30)
                
                if result.returncode != 0:
                    return False, None, f"FFmpeg conversion failed: {result.stderr}"
                
                with open(temp_output_path, "rb") as jpg_file:
                    jpg_data = jpg_file.read()
                    base64_data = base64.b64encode(jpg_data).decode("utf-8")
                
                return True, base64_data, None
                
            finally:
                if os.path.exists(temp_input_path):
                    os.unlink(temp_input_path)
                if os.path.exists(temp_output_path):
                    os.unlink(temp_output_path)
                    
        except subprocess.TimeoutExpired:
            return False, None, "Image processing timed out"
        except Exception as e:
            return False, None, f"Image processing error: {str(e)}"
        finally:
            await file.seek(0)
