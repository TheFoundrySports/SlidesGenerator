#!/usr/bin/env swift
// OCR a PNG using macOS Vision (VNRecognizeTextRequest).
// Usage: ocr_swift <input.png> <output.txt>
import Foundation
import Vision
import AppKit

let args = CommandLine.arguments
guard args.count == 3 else {
    fputs("usage: ocr_swift <input.png> <output.txt>\n", stderr)
    exit(2)
}
let inPath = args[1]
let outPath = args[2]

guard let img = NSImage(contentsOfFile: inPath),
      let cg  = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    fputs("ERR: cannot load image: \(inPath)\n", stderr)
    exit(3)
}

let req = VNRecognizeTextRequest()
req.recognitionLevel    = .accurate
req.usesLanguageCorrection = false
req.recognitionLanguages = ["es-ES", "es"]
// Handwritten-style not requested — accurate printed-text model.

let handler = VNImageRequestHandler(cgImage: cg, options: [:])
do {
    try handler.perform([req])
} catch {
    fputs("ERR: vision perform failed: \(error)\n", stderr)
    exit(4)
}

let lines: [String] = (req.results ?? []).compactMap { obs in
    guard let top = obs.topCandidates(1).first else { return nil }
    return top.string
}

let joined = lines.joined(separator: "\n")
try? joined.write(toFile: outPath, atomically: true, encoding: .utf8)
print("ok \(lines.count) lines → \(outPath)")