"""
Video Assembly Service
Uses FFmpeg to combine images and audio into a video
"""
import os
import asyncio
import tempfile
import subprocess
import shutil
from typing import List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class SlideAssets:
    """Assets for a single slide."""
    slide_number: int
    image_bytes: Optional[bytes]
    audio_bytes: Optional[bytes]
    duration_seconds: float


class VideoAssembler:
    """Service for assembling slides into a video using FFmpeg."""
    
    def __init__(self):
        # Check if ffmpeg is available
        self.ffmpeg_available = shutil.which("ffmpeg") is not None
        if not self.ffmpeg_available:
            print("WARNING: FFmpeg not found. Video assembly will not work.")
            print("Install with: brew install ffmpeg (macOS) or apt install ffmpeg (Linux)")
    
    async def assemble_video(
        self,
        slides: List[SlideAssets],
        output_filename: str = "lesson.mp4"
    ) -> Optional[str]:
        """
        Assemble slides into a video.
        Returns path to the output video file, or None if assembly fails.
        """
        if not self.ffmpeg_available:
            print("FFmpeg not available, cannot assemble video")
            return None
        
        if not slides:
            print("No slides provided")
            return None
        
        try:
            # Create temp directory for assets
            with tempfile.TemporaryDirectory() as temp_dir:
                # Write slide images and audio
                image_paths = []
                audio_paths = []
                durations = []
                
                for slide in slides:
                    # Write image
                    if slide.image_bytes:
                        img_path = os.path.join(temp_dir, f"slide_{slide.slide_number}.png")
                        with open(img_path, "wb") as f:
                            f.write(slide.image_bytes)
                        image_paths.append(img_path)
                    else:
                        # Use placeholder if no image
                        image_paths.append(None)
                    
                    # Write audio
                    if slide.audio_bytes:
                        audio_path = os.path.join(temp_dir, f"audio_{slide.slide_number}.mp3")
                        with open(audio_path, "wb") as f:
                            f.write(slide.audio_bytes)
                        audio_paths.append(audio_path)
                        durations.append(slide.duration_seconds)
                    else:
                        audio_paths.append(None)
                        durations.append(5.0)  # Default 5 seconds if no audio
                
                # Create FFmpeg concat file
                concat_file = os.path.join(temp_dir, "concat.txt")
                with open(concat_file, "w") as f:
                    for i, (img_path, duration) in enumerate(zip(image_paths, durations)):
                        if img_path and os.path.exists(img_path):
                            f.write(f"file '{img_path}'\n")
                            f.write(f"duration {duration}\n")
                            # Add last frame again to avoid cut-off
                            if i == len(image_paths) - 1:
                                f.write(f"file '{img_path}'\n")
                
                # Check if we have any valid images
                valid_images = [p for p in image_paths if p and os.path.exists(p)]
                if not valid_images:
                    print("[VIDEO ASSEMBLER] No valid images to assemble")
                    return None
                
                # Concatenate all audio files (if any exist)
                audio_list = os.path.join(temp_dir, "audio_list.txt")
                valid_audio_paths = [p for p in audio_paths if p and os.path.exists(p)]
                
                with open(audio_list, "w") as f:
                    for audio_path in valid_audio_paths:
                        f.write(f"file '{audio_path}'\n")
                
                combined_audio = os.path.join(temp_dir, "combined_audio.mp3")
                output_path = os.path.join(temp_dir, output_filename)
                
                has_audio = len(valid_audio_paths) > 0
                
                # Step 1: Combine audio files (only if we have audio)
                if has_audio:
                    audio_cmd = [
                        "ffmpeg", "-y",
                        "-f", "concat", "-safe", "0",
                        "-i", audio_list,
                        "-c", "copy",
                        combined_audio
                    ]
                    
                    try:
                        await asyncio.to_thread(
                            subprocess.run, audio_cmd,
                            capture_output=True, check=True
                        )
                    except subprocess.CalledProcessError as e:
                        print(f"[VIDEO ASSEMBLER] Audio concat failed: {e.stderr.decode() if e.stderr else str(e)}")
                        has_audio = False
                
                # Step 2: Create video from images (with or without audio)
                if has_audio and os.path.exists(combined_audio):
                    video_cmd = [
                        "ffmpeg", "-y",
                        "-f", "concat", "-safe", "0",
                        "-i", concat_file,
                        "-i", combined_audio,
                        "-c:v", "libx264",
                        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
                        "-pix_fmt", "yuv420p",
                        "-c:a", "aac",
                        "-shortest",
                        output_path
                    ]
                else:
                    # No audio - just create video from images
                    print("[VIDEO ASSEMBLER] Creating video without audio (TTS unavailable)")
                    video_cmd = [
                        "ffmpeg", "-y",
                        "-f", "concat", "-safe", "0",
                        "-i", concat_file,
                        "-c:v", "libx264",
                        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
                        "-pix_fmt", "yuv420p",
                        output_path
                    ]
                
                await asyncio.to_thread(
                    subprocess.run, video_cmd,
                    capture_output=True, check=True
                )
                
                # Read the output video
                if os.path.exists(output_path):
                    # Copy to a permanent location
                    final_path = os.path.join(os.getcwd(), "output", output_filename)
                    os.makedirs(os.path.dirname(final_path), exist_ok=True)
                    shutil.copy2(output_path, final_path)
                    return final_path
                
                return None
                
        except subprocess.CalledProcessError as e:
            print(f"FFmpeg error: {e.stderr.decode() if e.stderr else str(e)}")
            return None
        except Exception as e:
            print(f"Video assembly error: {e}")
            return None


# Singleton instance
_video_assembler: Optional[VideoAssembler] = None


def get_video_assembler() -> VideoAssembler:
    """Get singleton video assembler instance."""
    global _video_assembler
    if _video_assembler is None:
        _video_assembler = VideoAssembler()
    return _video_assembler
