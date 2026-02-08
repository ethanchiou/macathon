"""
Text-to-Speech Generation Service
Uses ElevenLabs API for high-quality voice narration
"""
import os
import asyncio
from typing import Optional, Tuple
import io


class TTSGenerator:
    """Service for generating voice narration using ElevenLabs."""
    
    # Default voice ID - "Rachel" (clear, professional female voice)
    DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"
    
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_KEY")
        self.client = None
        
        if self.api_key:
            try:
                from elevenlabs import ElevenLabs
                self.client = ElevenLabs(api_key=self.api_key)
            except ImportError:
                print("ElevenLabs package not installed. Run: pip install elevenlabs")
    
    async def generate_audio(
        self, 
        text: str, 
        voice_id: Optional[str] = None
    ) -> Tuple[Optional[bytes], float]:
        """
        Generate audio narration from text.
        Returns (audio_bytes, duration_seconds) or (None, 0) if generation fails.
        """
        if not self.client:
            print("TTS generator: No API key or client configured")
            return None, 0.0
        
        try:
            # Run sync elevenlabs call in thread pool
            audio_generator = await asyncio.to_thread(
                self.client.text_to_speech.convert,
                text=text,
                voice_id=voice_id or self.DEFAULT_VOICE_ID,
                model_id="eleven_multilingual_v2",
                output_format="mp3_44100_128"
            )
            
            # Convert generator to bytes
            audio_bytes = b''.join(audio_generator)
            
            # Estimate duration (rough: ~150 words per minute, ~5 chars per word)
            # More accurate would be to parse the actual audio header
            word_count = len(text.split())
            duration_seconds = (word_count / 150) * 60
            
            return audio_bytes, duration_seconds
            
        except Exception as e:
            print(f"TTS generation error: {e}")
            return None, 0.0
    
    async def generate_slide_narrations(
        self, 
        narration_texts: list[str]
    ) -> list[Tuple[Optional[bytes], float]]:
        """
        Generate audio for multiple slide narrations in parallel.
        Returns list of (audio_bytes, duration) tuples.
        """
        tasks = [self.generate_audio(text) for text in narration_texts]
        return await asyncio.gather(*tasks)


# Singleton instance
_tts_generator: Optional[TTSGenerator] = None


def get_tts_generator() -> TTSGenerator:
    """Get singleton TTS generator instance."""
    global _tts_generator
    if _tts_generator is None:
        _tts_generator = TTSGenerator()
    return _tts_generator
