#!/usr/bin/env python3
"""Remove text from PPTX slide images by filling OCR-detected bounding boxes
with locally-sampled parchment color (gradient-aware).

Strategy: for each bbox, expand it by `pad` px, sample the mean color of the
4-pixel border ring (which is guaranteed parchment, since the text sits inside
the inner area), then fill the *inner* bbox with that color. This respects the
slow radial gradient because each fill uses its own local background color.
"""
from PIL import Image
from pathlib import Path
import json

IMG_DIR  = Path("slides/img")
BBOX_DIR = Path("slides/bbox")
OUT_DIR  = IMG_DIR / "cleaned"
OUT_DIR.mkdir(parents=True, exist_ok=True)

PAD_PX        = 6     # outer ring width to sample from
INNER_PADDING = 2     # shrink inner fill box by this many px so we don't paint over glyph edges
SLIDES        = ["01","02","03","04","06","07","08","09","10","11","12","13","14","15","16","17","18"]

def sample_ring_color(img: Image.Image, x: int, y: int, w: int, h: int, pad: int):
    """Mean color of a `pad`-pixel ring around the bbox (left/right/top/bottom strips)."""
    px = img.load()
    iw, ih = img.size
    xs = max(0, x - pad); ys = max(0, y - pad)
    xe = min(iw, x + w + pad); ye = min(ih, y + h + pad)
    rs, gs, bs, n = 0, 0, 0, 0
    # top strip
    for yy in range(ys, y):
        for xx in range(xs, xe):
            r, g, b = px[xx, yy]
            rs += r; gs += g; bs += b; n += 1
    # bottom strip
    for yy in range(y + h, ye):
        for xx in range(xs, xe):
            r, g, b = px[xx, yy]
            rs += r; gs += g; bs += b; n += 1
    # left strip (excluding top/bot already covered)
    for yy in range(y, y + h):
        for xx in range(xs, x):
            r, g, b = px[xx, yy]
            rs += r; gs += g; bs += b; n += 1
    # right strip
    for yy in range(y, y + h):
        for xx in range(x + w, xe):
            r, g, b = px[xx, yy]
            rs += r; gs += g; bs += b; n += 1
    if n == 0:
        return (215, 197, 167)  # fallback parchment
    return (rs // n, gs // n, bs // n)

def fill_bbox(img: Image.Image, x: int, y: int, w: int, h: int, color):
    """Fill the inner bbox (with INNER_PADDING inset) with `color`."""
    iw, ih = img.size
    px = img.load()
    fx = max(0, x + INNER_PADDING); fy = max(0, y + INNER_PADDING)
    fw = max(0, w - 2 * INNER_PADDING); fh = max(0, h - 2 * INNER_PADDING)
    for yy in range(fy, min(ih, fy + fh)):
        for xx in range(fx, min(iw, fx + fw)):
            px[xx, yy] = color

def process(slide_id: str):
    src_path = IMG_DIR / f"slide-{slide_id}.png"
    bbox_path = BBOX_DIR / f"slide-{slide_id}.json"
    out_path = OUT_DIR / f"slide-{slide_id}.png"

    img = Image.open(src_path).convert("RGB")
    bbox_data = json.loads(bbox_path.read_text())

    n_filled = 0
    for line in bbox_data.get("lines", []):
        x, y, w, h = line["x"], line["y"], line["w"], line["h"]
        if w <= 0 or h <= 0:
            continue
        color = sample_ring_color(img, x, y, w, h, PAD_PX)
        fill_bbox(img, x, y, w, h, color)
        n_filled += 1

    img.save(out_path, "PNG", optimize=True)
    return n_filled

for sid in SLIDES:
    n = process(sid)
    print(f"slide-{sid}: {n} bboxes filled")
