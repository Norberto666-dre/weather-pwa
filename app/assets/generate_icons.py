from PIL import Image
import os

# Define the resolutions (10 different sizes starting from 16x16)
resolutions = [
    (16, 16),
    (32, 32),
    (64, 64),
    (128, 128),
    (256, 256),
    (512, 512),
    (1024, 1024),
    (2048, 2048),
    (4096, 4096),
    (8192, 8192),
]

# Path to the source image
base_dir = os.path.dirname(os.path.abspath(__file__))
png_path = os.path.join(base_dir, 'EmblemaAtardecer.png')

# Open the image and force RGBA to preserve transparency
print(f"Loading {png_path}...")
if not os.path.exists(png_path):
    raise FileNotFoundError(f"No se encontró el archivo: {png_path}")

img = Image.open(png_path).convert("RGBA")

# Safety check: warn if the image has no transparent pixels
alpha = img.getchannel("A")
if alpha.getextrema() == (255, 255):
    print("ADVERTENCIA: la imagen no tiene pixeles transparentes (alfa = 255 en todo).")

# Create directory for output if it doesn't exist
output_dir = os.path.join(base_dir, 'icons')
os.makedirs(output_dir, exist_ok=True)

# Generate images at different resolutions
for i, (width, height) in enumerate(resolutions, 1):
    print(f"Generating image {i}/{len(resolutions)}: {width}x{height}")

    resized_img = img.resize((width, height), Image.Resampling.LANCZOS)

    output_path = os.path.join(output_dir, f'EmblemaAtardecer_{width}x{height}.png')
    resized_img.save(output_path, 'PNG')
    print(f"Saved: {output_path}")

print(f"Done! Generated {len(resolutions)} images at different resolutions.")