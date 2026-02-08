
import asyncio
import os
from app.services.video_assembler import VideoAssembler, SlideAssets

async def main():
    assembler = VideoAssembler()
    
    assets_dir = "/Users/ethanchiou/Desktop/Programming/Projects/macathon2026/assets"
    image_files = [
        "macathonslide1.jpg",
        "macathonslide2.png",
        "macathonslide3.jpg",
        "macathonslide4.jpg"
    ]
    
    slides = []
    print("Loading images...")
    for i, img_file in enumerate(image_files):
        img_path = os.path.join(assets_dir, img_file)
        if os.path.exists(img_path):
            with open(img_path, "rb") as f:
                img_bytes = f.read()
                print(f"Loaded {img_file}: {len(img_bytes)} bytes")
                slides.append(SlideAssets(
                    slide_number=i+1,
                    image_bytes=img_bytes,
                    audio_bytes=None, # Test without audio first
                    duration_seconds=3.0
                ))
        else:
            print(f"Checking {img_path}: NOT FOUND")

    if not slides:
        print("No slides loaded.")
        return

    print(f"Attempting to assemble {len(slides)} slides...")
    try:
        output_path = await assembler.assemble_video(slides, "test_assembly.mp4")
        if output_path:
            print(f"SUCCESS: Video assembled at {output_path}")
        else:
            print("FAILURE: assemble_video returned None")
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    asyncio.run(main())
