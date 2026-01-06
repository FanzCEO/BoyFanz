#!/usr/bin/env python3
"""Create placeholder images for BoyFanz platform"""

from PIL import Image, ImageDraw, ImageFont
import os

# Output directory
PUBLIC_DIR = "/Users/wyattcole/The Correct Platforms/boyfanz/client/public"

# BoyFanz theme colors (cyan neon theme)
DARK_BG = (5, 10, 12)  # Charcoal black
CYAN = (0, 229, 255)  # Neon cyan
GRAY = (50, 55, 60)  # Dark gray

def create_avatar_placeholder():
    """Create default-avatar.png"""
    size = (200, 200)
    img = Image.new('RGB', size, DARK_BG)
    draw = ImageDraw.Draw(img)

    # Draw circle
    draw.ellipse([40, 40, 160, 160], fill=GRAY, outline=CYAN, width=3)

    # Draw simple person icon
    # Head
    draw.ellipse([85, 70, 115, 100], fill=CYAN)
    # Body
    draw.ellipse([70, 100, 130, 160], fill=CYAN)

    img.save(os.path.join(PUBLIC_DIR, "default-avatar.png"))
    print("✓ Created default-avatar.png")

def create_bot_avatar():
    """Create bot-avatar.png"""
    size = (200, 200)
    img = Image.new('RGB', size, DARK_BG)
    draw = ImageDraw.Draw(img)

    # Draw robot face
    draw.rectangle([50, 50, 150, 150], fill=GRAY, outline=CYAN, width=3)

    # Eyes
    draw.rectangle([70, 80, 90, 100], fill=CYAN)
    draw.rectangle([110, 80, 130, 100], fill=CYAN)

    # Mouth
    draw.rectangle([75, 120, 125, 130], fill=CYAN)

    img.save(os.path.join(PUBLIC_DIR, "bot-avatar.png"))
    print("✓ Created bot-avatar.png")

def create_verifymy_logo():
    """Create verifymy-logo.png"""
    size = (300, 100)
    img = Image.new('RGB', size, DARK_BG)
    draw = ImageDraw.Draw(img)

    # Draw checkmark shield
    draw.polygon([150, 20, 200, 50, 150, 80, 100, 50], fill=GRAY, outline=CYAN)
    draw.line([120, 50, 140, 65, 180, 35], fill=CYAN, width=5)

    # Text "VERIFY MY"
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    except:
        font = ImageFont.load_default()
    draw.text((30, 40), "VERIFY", fill=CYAN, font=font)

    img.save(os.path.join(PUBLIC_DIR, "verifymy-logo.png"))
    print("✓ Created verifymy-logo.png")

def create_flames_pattern():
    """Create flames-pattern.png (texture)"""
    size = (200, 200)
    img = Image.new('RGB', size, DARK_BG)
    draw = ImageDraw.Draw(img)

    # Create flame-like pattern with triangles
    for i in range(0, 200, 40):
        for j in range(0, 200, 40):
            draw.polygon([
                (i+10, j+30), (i+20, j+10), (i+30, j+30)
            ], fill=(180, 50, 20, 128))

    img.save(os.path.join(PUBLIC_DIR, "flames-pattern.png"))
    print("✓ Created flames-pattern.png")

def create_stream_thumbnail():
    """Create default-stream-thumb.jpg"""
    size = (640, 360)  # 16:9 aspect ratio
    img = Image.new('RGB', size, DARK_BG)
    draw = ImageDraw.Draw(img)

    # Draw play button
    center_x, center_y = 320, 180
    draw.ellipse([
        center_x - 80, center_y - 80,
        center_x + 80, center_y + 80
    ], fill=GRAY, outline=CYAN, width=4)

    # Triangle (play icon)
    draw.polygon([
        (center_x - 30, center_y - 40),
        (center_x - 30, center_y + 40),
        (center_x + 40, center_y)
    ], fill=CYAN)

    # Text
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
    except:
        font = ImageFont.load_default()
    draw.text((200, 280), "STREAM OFFLINE", fill=CYAN, font=font)

    img.save(os.path.join(PUBLIC_DIR, "default-stream-thumb.jpg"), quality=85)
    print("✓ Created default-stream-thumb.jpg")

def create_noise_texture():
    """Create noise.png (texture overlay)"""
    import random
    size = (256, 256)
    img = Image.new('RGB', size)
    pixels = img.load()

    for i in range(size[0]):
        for j in range(size[1]):
            val = random.randint(0, 50)
            pixels[i, j] = (val, val, val)

    img.save(os.path.join(PUBLIC_DIR, "noise.png"))
    print("✓ Created noise.png")

def create_video_placeholder():
    """Create placeholder-video.jpg"""
    size = (640, 360)
    img = Image.new('RGB', size, DARK_BG)
    draw = ImageDraw.Draw(img)

    # Draw film strip border
    for i in range(0, 640, 40):
        draw.rectangle([i, 0, i+20, 20], fill=CYAN)
        draw.rectangle([i, 340, i+20, 360], fill=CYAN)

    # Video icon
    center_x, center_y = 320, 180
    draw.rectangle([
        center_x - 60, center_y - 40,
        center_x + 40, center_y + 40
    ], fill=GRAY, outline=CYAN, width=3)

    # Camera lens circles
    draw.ellipse([
        center_x + 40, center_y - 20,
        center_x + 80, center_y + 20
    ], outline=CYAN, width=3)

    img.save(os.path.join(PUBLIC_DIR, "placeholder-video.jpg"), quality=85)
    print("✓ Created placeholder-video.jpg")

if __name__ == "__main__":
    print("Creating placeholder images for BoyFanz...")
    print(f"Output directory: {PUBLIC_DIR}\n")

    create_avatar_placeholder()
    create_bot_avatar()
    create_verifymy_logo()
    create_flames_pattern()
    create_stream_thumbnail()
    create_noise_texture()
    create_video_placeholder()

    print("\n✓ All placeholder images created successfully!")
