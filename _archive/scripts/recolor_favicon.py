from PIL import Image, ImageOps

source_path = r"D:\Things\Work\Wranngle\logos\output\logomark\wranngle_logomark_transparent.png"
dest_path = r"client\public\favicon.png"
brand_orange = (255, 95, 0)  # #ff5f00
target_size = (192, 192)

try:
    img = Image.open(source_path).convert("RGBA")
    
    # 1. Recolor
    r, g, b, alpha = img.split()
    orange_img = Image.new("RGB", img.size, brand_orange)
    img.paste(orange_img, mask=alpha)
    
    # 2. Crop whitespace
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
        # 3. Resize with high-quality resampling (LANCZOS)
        # Maintain aspect ratio
        img.thumbnail(target_size, Image.Resampling.LANCZOS)
        
        # 4. Save
        img.save(dest_path)
        print(f"Successfully recolored, cropped, and resized to {img.size} at {dest_path}")
    else:
        print("Image is empty.")

except Exception as e:
    print(f"Error: {e}")