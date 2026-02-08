#!/usr/bin/env python3
"""Simple test script to verify Gemini API key works."""
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

import google.generativeai as genai

api_key = os.getenv("GEMINI_KEY")
if not api_key:
    print("❌ ERROR: GEMINI_KEY not found in environment")
    exit(1)

print(f"✓ Found GEMINI_KEY: {api_key[:10]}...{api_key[-4:]}")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash-lite")
    
    print("→ Sending test prompt to Gemini...")
    response = model.generate_content("Say 'Hello, the API is working!' in exactly those words.")
    
    print(f"✓ Response received: {response.text}")
    print("\n✅ Gemini API key is working correctly!")
    
except Exception as e:
    print(f"\n❌ ERROR: {type(e).__name__}: {e}")
