#!/usr/bin/env bash
# Extracts the mascot video into scroll-scrub image sequences + card stills.
# Usage: bash scripts/extract-frames.sh [path/to/video.mp4]
# Requires ffmpeg built with libwebp (brew install ffmpeg / apt install ffmpeg).
set -euo pipefail

SRC="${1:-assets/generated_video.mp4}"
OUT="public/frames"
STILLS="public/stills"
# Upscale with lanczos plus a light unsharp to compensate for the 832px source.
UPSCALE="flags=lanczos,unsharp=5:5:0.6:5:5:0.0"

rm -rf "$OUT" "$STILLS"
mkdir -p "$OUT/desktop" "$OUT/mobile" "$STILLS"

echo "→ desktop frames (1920w, jpg + webp)"
ffmpeg -y -v error -i "$SRC" -vf "scale=1920:-2:$UPSCALE" -q:v 3 "$OUT/desktop/f_%04d.jpg"
ffmpeg -y -v error -i "$SRC" -vf "scale=1920:-2:$UPSCALE" -c:v libwebp -quality 70 -compression_level 5 "$OUT/desktop/f_%04d.webp"

echo "→ mobile frames (960w, jpg + webp)"
ffmpeg -y -v error -i "$SRC" -vf "scale=960:-2:flags=lanczos" -q:v 4 "$OUT/mobile/f_%04d.jpg"
ffmpeg -y -v error -i "$SRC" -vf "scale=960:-2:flags=lanczos" -c:v libwebp -quality 68 "$OUT/mobile/f_%04d.webp"

# Portrait card/receipt art: name:frameIndex:mascotCenterX (0..1 of source width)
# Crops a 3:4 window around the mascot, then upscales 2.5x.
STILL_LIST=(
  "vault:12:0.43"
  "cosigner:122:0.60"
  "guardian:66:0.63"
  "recovery:138:0.58"
  "step1:4:0.43"
  "step2:104:0.60"
  "step3:118:0.60"
  "step4:144:0.58"
  "finale:144:0.58"
)
for entry in "${STILL_LIST[@]}"; do
  IFS=":" read -r name n cx <<< "$entry"
  # crop w = 264 (352 * 3/4), x clamped to the frame
  vf="select=eq(n\,$n),crop=264:352:'max(0\,min(iw-264\,iw*$cx-132))':0,scale=660:-2:$UPSCALE"
  ffmpeg -y -v error -i "$SRC" -vf "$vf" -frames:v 1 -c:v libwebp -quality 80 "$STILLS/$name.webp"
  ffmpeg -y -v error -i "$SRC" -vf "$vf" -frames:v 1 -q:v 3 "$STILLS/$name.jpg"
done

# Wide key frames for prefers-reduced-motion (hero / threat / multi-sig)
for n in 18 70 132; do
  ffmpeg -y -v error -i "$SRC" -vf "select=eq(n\,$n),scale=1920:-2:$UPSCALE" -frames:v 1 -c:v libwebp -quality 75 "$STILLS/key_$n.webp"
  ffmpeg -y -v error -i "$SRC" -vf "select=eq(n\,$n),scale=1920:-2:$UPSCALE" -frames:v 1 -q:v 3 "$STILLS/key_$n.jpg"
done

COUNT=$(ls "$OUT/desktop"/*.jpg | wc -l | tr -d ' ')
echo "✓ $COUNT frames per set. Update FRAME_COUNT in src/config.ts if it changed."
