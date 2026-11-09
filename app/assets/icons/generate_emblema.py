from pathlib import Path
from PIL import Image

SRC = Path(__file__).parent / "EmblemaAtardecer.png"
SIZES = [16, 32, 64, 128, 256, 512, 768, 1024, 1152, 1254]

with Image.open(SRC) as src:
    img = src.convert("RGBA")
    for size in SIZES:
        out = img.resize((size, size), Image.Resampling.LANCZOS)
        path = SRC.parent / f"emblema_{size}x{size}.png"
        out.save(path, "PNG", optimize=True)
        print(f"{path.name}: {out.size[0]}x{out.size[1]} {out.mode}")