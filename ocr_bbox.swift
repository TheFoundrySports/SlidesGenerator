#!/usr/bin/env swift
// OCR a PNG with bounding boxes using macOS Vision.
// Usage: ocr_bbox <input.png> <output.json>
import Foundation
import Vision
import AppKit
import CoreGraphics

let args = CommandLine.arguments
guard args.count == 3 else {
    fputs("usage: ocr_bbox <input.png> <output.json>\n", stderr)
    exit(2)
}
let inPath  = args[1]
let outPath = args[2]

guard let img = NSImage(contentsOfFile: inPath),
      let cg  = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    fputs("ERR: cannot load image: \(inPath)\n", stderr)
    exit(3)
}
let W = Double(cg.width)
let H = Double(cg.height)

let req = VNRecognizeTextRequest()
req.recognitionLevel    = .accurate
req.usesLanguageCorrection = false
req.recognitionLanguages = ["es-ES", "es"]
req.minimumTextHeight   = 0.0  // catch even small text

let handler = VNImageRequestHandler(cgImage: cg, options: [:])
do {
    try handler.perform([req])
} catch {
    fputs("ERR: vision perform failed: \(error)\n", stderr)
    exit(4)
}

// Build a sorted (top-to-bottom) list of recognized lines with pixel-space bboxes.
// Vision returns normalized CGRect with origin at BOTTOM-LEFT, Y up.
struct Line: Codable {
    let text: String
    let x: Int      // pixel left
    let y: Int      // pixel top  (flipped to match PIL coords)
    let w: Int
    let h: Int
    let confidence: Float
}

var lines: [Line] = []
for obs in (req.results ?? []) {
    guard let cand = obs.topCandidates(1).first else { continue }
    let bb = obs.boundingBox   // normalized, origin BL, Y up
    let xPx = Int(bb.minX * W)
    let yBL = bb.minY * H
    let hPx = Int(bb.height * H)
    // Convert BL-origin Y -> top-origin Y for PIL:  yTop = H - yBL - h
    let yTopPx = Int(Double(W == 0 ? 0 : W)) == 0 ? 0 : (Int(H) - Int(yBL) - hPx)
    _ = yBL
    _ = W
    lines.append(Line(
        text: cand.string,
        x: xPx,
        y: yTopPx,
        w: Int(bb.width * W),
        h: hPx,
        confidence: cand.confidence
    ))
}
// Sort top-to-bottom, then left-to-right
lines.sort { a, b in
    if a.y != b.y { return a.y < b.y }
    return a.x < b.x
}

let payload: [String: Any] = [
    "width":  Int(W),
    "height": Int(H),
    "lines":  lines.map { l -> [String: Any] in
        return [
            "text": l.text,
            "x": l.x, "y": l.y, "w": l.w, "h": l.h,
            "confidence": l.confidence
        ]
    }
]

let data = try JSONSerialization.data(
    withJSONObject: payload,
    options: [.prettyPrinted]
)
try data.write(to: URL(fileURLWithPath: outPath))
print("ok \(lines.count) lines → \(outPath)")