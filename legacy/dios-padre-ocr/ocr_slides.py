#!/usr/bin/env python3
"""OCR via Vision + Quartz CGImageSource (avoids NSImage selector quirks)."""
import sys, json
from pathlib import Path
import Quartz, Vision

IMG_DIR = Path("slides/img")
OUT = Path("slides/ocr.json")

def load_cgimage(png_path):
    url = Quartz.CFURLCreateWithFileSystemPath(None, str(png_path.resolve()), Quartz.kCFURLPOSIXPathStyle, False)
    src = Quartz.CGImageSourceCreateWithURL(url, None)
    if not src: return None, 0, 0
    cg = Quartz.CGImageSourceCreateImageAtIndex(src, 0, None)
    if not cg: return None, 0, 0
    return cg, Quartz.CGImageGetWidth(cg), Quartz.CGImageGetHeight(cg)

def ocr(png_path: Path) -> dict:
    cg, img_w, img_h = load_cgimage(png_path)
    if cg is None:
        return {"slide": png_path.name, "error": "load failed", "lines": []}

    handler = Vision.VNImageRequestHandler.alloc()
    req = Vision.VNRecognizeTextRequest.alloc().init()
    req.setRecognitionLevel_(1)
    req.setUsesLanguageCorrection_(True)
    req.setRecognitionLanguages_(["es-ES", "es", "en-US", "en", "la"])

    handler.performRequests_error_([req], None)

    obs = req.results() or []
    lines = []
    for o in obs:
        cands = o.topCandidates_(1)
        if not cands: continue
        c = cands[0]
        bb = o.boundingBox()
        x0, y0 = bb.origin.x, bb.origin.y
        w, h = bb.size.width, bb.size.height
        x_px = x0 * img_w
        y_px = img_h - (y0 + h) * img_h
        lines.append({
            "text": c.string(),
            "conf": round(c.confidence(), 3),
            "x": round(x_px, 1),
            "y": round(y_px, 1),
            "w": round(w * img_w, 1),
            "h": round(h * img_h, 1),
        })
    return {"slide": png_path.name, "lines": lines}

def main():
    files = sorted([p for p in IMG_DIR.glob("slide-*.png")])
    results = []
    for p in files:
        print(f"OCR {p.name} ({p.stat().st_size//1024}KB)...", flush=True)
        try:
            r = ocr(p)
            n = len(r["lines"])
            txt_summary = " | ".join(l["text"][:50] for l in r["lines"][:4])
            print(f"  -> {n} lines. Sample: {txt_summary}", flush=True)
            results.append(r)
        except Exception as e:
            print(f"  FAIL: {type(e).__name__}: {e}", flush=True)
            results.append({"slide": p.name, "error": str(e), "lines": []})
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2))
    print(f"\nWrote {OUT} ({OUT.stat().st_size} bytes)")

if __name__ == "__main__":
    main()
