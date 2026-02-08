"""
Image Generation Service
Uses Gemini 2.0 Flash for generating slide images
"""
import os
import base64
from typing import Optional
import asyncio


class ImageGenerator:
    """Service for generating slide images using Gemini 2.0 Flash."""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_KEY")
        self.client = None
        
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                print("[IMAGE] Gemini client initialized successfully")
            except ImportError:
                print("[IMAGE] google-genai not installed")
            except Exception as e:
                print(f"[IMAGE] Failed to initialize client: {e}")
    
    async def generate_image(self, prompt: str, slide_number: int = 0) -> Optional[bytes]:
        """
        Generate an image from a text prompt using Gemini 2.0 Flash.
        Returns image bytes (PNG format) or placeholder if generation fails.
        """
        if not self.client:
            print(f"[IMAGE] No client, using placeholder for slide {slide_number}")
            return self._generate_placeholder(prompt, slide_number)
        
        try:
            from google.genai import types
            
            # Use Gemini 2.0 Flash with image output
            enhanced_prompt = f"""Create an educational illustration for a video slide about: {prompt}

Requirements:
- Style: Clear, colorful, professional educational illustration
- Suitable for students and educational content
- No text or labels in the image
- 16:9 aspect ratio composition
- Vibrant and engaging colors"""
            
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model="gemini-2.0-flash-exp",
                contents=enhanced_prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE", "TEXT"],
                )
            )
            
            # Extract image from response
            if response.candidates:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                        if part.inline_data.mime_type.startswith('image/'):
                            print(f"[IMAGE] Generated image for slide {slide_number}")
                            return part.inline_data.data
            
            print(f"[IMAGE] No image in response, using placeholder for slide {slide_number}")
            return self._generate_placeholder(prompt, slide_number)
            
        except Exception as e:
            print(f"[IMAGE] Generation error for slide {slide_number}: {e}")
            return self._generate_placeholder(prompt, slide_number)
    
    def _generate_placeholder(self, prompt: str, slide_number: int) -> bytes:
        """Generate a colored placeholder PNG image."""
        import struct
        import zlib
        
        # Colors for different slides
        colors = [
            (66, 133, 244),   # Blue
            (52, 168, 83),    # Green  
            (251, 188, 4),    # Orange
            (154, 83, 212),   # Purple
            (26, 188, 156),   # Teal
            (234, 67, 149),   # Pink
        ]
        
        color = colors[slide_number % len(colors)]
        width, height = 640, 360
        
        # Create raw pixel data with gradient
        raw_data = b''
        for y in range(height):
            raw_data += b'\x00'  # Filter byte
            for x in range(width):
                # Gradient effect
                r = min(255, color[0] + (y // 8))
                g = min(255, color[1] + (x // 15))
                b = min(255, color[2] - (y // 10))
                raw_data += bytes([max(0, r), max(0, g), max(0, b)])
        
        compressed = zlib.compress(raw_data, 9)
        
        def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
            chunk = chunk_type + data
            crc = zlib.crc32(chunk) & 0xffffffff
            return struct.pack('>I', len(data)) + chunk + struct.pack('>I', crc)
        
        png = b'\x89PNG\r\n\x1a\n'
        ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
        png += png_chunk(b'IHDR', ihdr_data)
        png += png_chunk(b'IDAT', compressed)
        png += png_chunk(b'IEND', b'')
        
        return png
    
    async def generate_slide_images(self, image_prompts: list[str]) -> list[Optional[bytes]]:
        """Generate images for multiple slides in parallel."""
        tasks = [self.generate_image(prompt, i) for i, prompt in enumerate(image_prompts)]
        return await asyncio.gather(*tasks)


def get_placeholder_image() -> bytes:
    """Returns a 1px transparent PNG placeholder."""
    return base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    )


# Singleton instance
_image_generator: Optional[ImageGenerator] = None


def get_image_generator() -> ImageGenerator:
    """Get singleton image generator instance."""
    global _image_generator
    if _image_generator is None:
        _image_generator = ImageGenerator()
    return _image_generator
