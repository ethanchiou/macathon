"""
Video Lesson Generator Service
Orchestrates script generation, image creation, TTS, and video assembly
"""
import json
import os
import asyncio
from typing import Optional, List
from datetime import datetime
import uuid

import google.generativeai as genai

from ..models.video import (
    VideoRequest,
    VideoScript,
    VideoResponse,
    Slide,
)


# System prompt for video script generation
VIDEO_SYSTEM_PROMPT = """You are an educational video script writer for biology lessons.
Create engaging, grade-appropriate content for short video lessons.
Each slide should have clear narration that takes 15-20 seconds to read aloud.
Image prompts should describe educational, clear visuals appropriate for students.
Return ONLY valid JSON, no markdown."""


def get_video_script_prompt(request: VideoRequest) -> str:
    """Build the prompt for generating a video lesson script."""
    return f"""Create a {request.slideCount}-slide video lesson script.

Topic: {request.topic}
Grade Band: {request.gradeBand}
Region: {request.region}

Required JSON Schema:
{{
  "title": "Engaging video title",
  "slides": [
    {{
      "slideNumber": 1,
      "title": "Slide title",
      "narration": "What the narrator says (2-3 sentences, ~15-20 seconds when read aloud)",
      "imagePrompt": "Detailed prompt for educational image generation - describe the visual clearly",
      "keyPoints": ["Key point 1", "Key point 2"]
    }}
  ]
}}

Slide structure guidelines:
- Slide 1: Hook/Introduction - Start with an interesting fact or question to grab attention
- Slides 2-{request.slideCount - 1}: Core Content - Explain main concepts clearly with examples from {request.region}
- Slide {request.slideCount}: Summary - Recap key takeaways and encourage further exploration

Requirements:
- Keep narration natural and conversational, like a friendly teacher
- Each slide's narration should be 2-3 sentences (~15-20 seconds when spoken)
- Image prompts should describe educational diagrams, illustrations, or photos
- Include local examples relevant to {request.region} when possible
- Content must be appropriate for grades {request.gradeBand}

Return ONLY valid JSON matching the schema."""


def get_fallback_video_script(request: VideoRequest) -> VideoScript:
    """Return a fallback video script if generation fails."""
    return VideoScript(
        title=f"Introduction to {request.topic}",
        slides=[
            Slide(
                slideNumber=1,
                title="Welcome!",
                narration=f"Hello! Today we're going to learn about {request.topic}. This is an exciting topic in biology that affects our everyday lives.",
                imagePrompt=f"Educational illustration showing the concept of {request.topic}, colorful and engaging for students",
                keyPoints=["What we'll learn today", f"Why {request.topic} matters"]
            ),
            Slide(
                slideNumber=2,
                title=f"What is {request.topic}?",
                narration=f"Let's start with the basics. {request.topic} is an important concept in biology that scientists have studied for many years.",
                imagePrompt=f"Scientific diagram explaining {request.topic}, labeled and clear for {request.gradeBand} grade students",
                keyPoints=["Definition", "Key characteristics"]
            ),
            Slide(
                slideNumber=3,
                title="Real World Examples",
                narration=f"You can see examples of {request.topic} all around you, especially in {request.region}. Look for these patterns in nature!",
                imagePrompt=f"Photo-realistic image showing {request.topic} in nature in {request.region}, educational style",
                keyPoints=[f"Examples in {request.region}", "Everyday observations"]
            ),
            Slide(
                slideNumber=4,
                title="Why It Matters",
                narration=f"Understanding {request.topic} helps us appreciate the natural world and make better decisions for our environment.",
                imagePrompt=f"Illustration showing the importance of {request.topic} to ecosystems and human life",
                keyPoints=["Environmental impact", "Human connection"]
            ),
            Slide(
                slideNumber=5,
                title="Let's Review!",
                narration=f"Great job! Today we learned about {request.topic}. Remember the key points and look for examples in your daily life. Keep exploring!",
                imagePrompt=f"Colorful summary graphic with icons representing key concepts of {request.topic}",
                keyPoints=["Key takeaways", "Keep learning!"]
            )
        ]
    )


class VideoScriptGenerator:
    """Service for generating video lesson scripts using Gemini."""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_KEY")
        if not api_key:
            self.model = None
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(
                model_name="gemini-2.0-flash-lite",
                system_instruction=VIDEO_SYSTEM_PROMPT
            )
    
    async def generate_script(self, request: VideoRequest) -> VideoScript:
        """Generate a video lesson script from the request."""
        
        if not self.model:
            return get_fallback_video_script(request)
        
        try:
            prompt = get_video_script_prompt(request)
            
            generation_config = {
                "temperature": 0.7,
                "top_p": 0.9,
                "max_output_tokens": 2000,
                "response_mime_type": "application/json",
            }
            
            response = await self.model.generate_content_async(
                prompt,
                generation_config=generation_config
            )
            
            content = response.text
            script_data = json.loads(content)
            
            # Validate against schema
            video_script = VideoScript(**script_data)
            return video_script
            
        except Exception as e:
            print(f"Video script generation error: {e}")
            return get_fallback_video_script(request)


# Singleton instance
_script_generator: Optional[VideoScriptGenerator] = None


def get_video_script_generator() -> VideoScriptGenerator:
    """Get singleton script generator instance."""
    global _script_generator
    if _script_generator is None:
        _script_generator = VideoScriptGenerator()
    return _script_generator
