#!/usr/bin/env python3
"""
Test script for the meme upload endpoint.
This script demonstrates how to upload an image to the /a/meme endpoint.
"""

import requests
import os

def test_meme_upload():
    """Test the meme upload functionality."""
    
    # Server URL
    base_url = "http://localhost:8000"
    
    # Test image file path (you'll need to provide an actual image file)
    test_image_path = "test_image.jpg"  # Change this to an actual image file
    
    # First, you would need to authenticate to get an auth token
    # For this example, we'll assume you have a valid token
    auth_token = "your_auth_token_here"
    
    # Check if test image exists
    if not os.path.exists(test_image_path):
        print(f"Test image {test_image_path} not found. Please provide a valid image file.")
        return
    
    # Prepare the multipart form data
    with open(test_image_path, 'rb') as image_file:
        files = {
            'image': ('test_meme.jpg', image_file, 'image/jpeg')
        }
        data = {
            'title': 'Test Meme',
            'description': 'This is a test meme uploaded via the API'
        }
        headers = {
            'Authorization': f'Bearer {auth_token}'
        }
        
        # Make the request
        response = requests.post(
            f"{base_url}/a/meme",
            files=files,
            data=data,
            headers=headers
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")

if __name__ == "__main__":
    test_meme_upload()
