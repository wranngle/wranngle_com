from PIL import Image
import os

source_path = r"D:\Things\Work\Wranngle\logos\output\logomark\wranngle_logomark_1024.png"
dest_path = r"client\public\favicon.png"

try:
    img = Image.open(source_path)
    # Get the bounding box of the non-zero regions
    bbox = img.getbbox()
    if bbox:
        cropped_img = img.crop(bbox)
        # Optional: Resize to standard favicon size (e.g., 192x192) or keep high res
        # cropped_img.thumbnail((192, 192), Image.Resampling.LANCZOS)
        cropped_img.save(dest_path)
        print(f"Successfully cropped and saved to {dest_path}")
    else:
        print("Image is empty or transparent.")
except Exception as e:
    print(f"Error: {e}")
