"""Rotate the hue of the KF monogram frames (orange rim light -> violet), keeping alpha and the neutral chrome."""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

src, dst = Path(sys.argv[1]), Path(sys.argv[2])
shift = int(round(250 / 360 * 255))  # orange (~5 deg) -> violet (~255 deg)
dst.mkdir(parents=True, exist_ok=True)
for f in sorted(src.glob("*.webp")):
    im = Image.open(f).convert("RGBA")
    alpha = im.getchannel("A")
    hsv = np.array(im.convert("RGB").convert("HSV"), dtype=np.uint16)
    h, sat = hsv[..., 0], hsv[..., 1]
    # Only the warm rim light: red/orange hues (330-45 deg) with real saturation; the cool chrome stays as is.
    warm = ((h <= 32) | (h >= 234)) & (sat >= 70)
    hsv[..., 0] = np.where(warm, (h + shift) % 256, h)
    shifted = np.array(Image.fromarray(hsv.astype(np.uint8), "HSV").convert("RGB"))
    rgb = np.array(im.convert("RGB"))
    out = Image.fromarray(np.where(warm[..., None], shifted, rgb).astype(np.uint8), "RGB")
    out.putalpha(alpha)
    out.save(dst / f.name, "WEBP", quality=88, method=6)
print("done", len(list(dst.glob("*.webp"))))
