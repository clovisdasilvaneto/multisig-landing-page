#!/usr/bin/env bash
# Extracts the mascot video into scroll-scrub image sequences + card stills.
# Usage: bash scripts/extract-frames.sh [path/to/video.mp4]
# Requires ffmpeg, cwebp (brew install webp) and realesrgan-ncnn-vulkan
# (https://github.com/xinntao/Real-ESRGAN/releases, v0.2.5.0) on PATH or in $REALESRGAN.
set -euo pipefail

SRC="${1:-assets/generated_video.mp4}"
OUT="public/frames"
STILLS="public/stills"
ESR="${REALESRGAN:-realesrgan-ncnn-vulkan}"
# realesr-animevideov3 is built for video: sharp and temporally stable when scrubbed.
MODEL="realesr-animevideov3"
WEBP="-quiet -m 6 -sharp_yuv -af"

ESR="$(command -v "$ESR")" || { echo "✗ realesrgan-ncnn-vulkan not found (set REALESRGAN=/path/to/realesrgan-ncnn-vulkan)"; exit 1; }
MODELS="${REALESRGAN_MODELS:-$(dirname "$ESR")/models}"
command -v cwebp >/dev/null || { echo "✗ cwebp not found (brew install webp)"; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/src" "$TMP/up" "$TMP/desktop" "$TMP/mobile"

echo "→ decoding source frames"
ffmpeg -y -v error -i "$SRC" "$TMP/src/f_%04d.png"

# The source is 832×352; a 4× AI upscale (3328×1408) gives real detail to downscale from.
echo "→ upscaling 4× with Real-ESRGAN ($MODEL)"
"$ESR" -i "$TMP/src" -o "$TMP/up" -m "$MODELS" -n "$MODEL" -s 4 -f png >/dev/null 2>&1

rm -rf "$OUT" "$STILLS"
mkdir -p "$OUT/desktop" "$OUT/mobile" "$STILLS"

echo "→ desktop (1920w) + mobile (960w) webp frames"
ffmpeg -y -v error -i "$TMP/up/f_%04d.png" -vf "scale=1920:-2:flags=lanczos" "$TMP/desktop/f_%04d.png"
ffmpeg -y -v error -i "$TMP/up/f_%04d.png" -vf "scale=960:-2:flags=lanczos" "$TMP/mobile/f_%04d.png"
for f in "$TMP"/desktop/*.png; do n="$(basename "$f" .png)"
  cwebp $WEBP -q 55 "$f" -o "$OUT/desktop/$n.webp" &
  cwebp $WEBP -q 55 "$TMP/mobile/$n.png" -o "$OUT/mobile/$n.webp" &
  wait
done

# Portrait card/receipt art: name:frameIndex:mascotCenterX (0..1 of source width)
# Crops a 3:4 window around the mascot from the upscaled frame, then fits to 660×880.
STILL_LIST=(
  "vault:12:0.43"
  "cosigner:122:0.60"
  "guardian:66:0.63"
  "recovery:138:0.58"
  "step1:4:0.43"
  "step2:104:0.60"
  "step3:118:0.60"
  "step4:144:0.58"
  "finale:120:0.58"
)
for entry in "${STILL_LIST[@]}"; do
  IFS=":" read -r name n cx <<< "$entry"
  # crop w = 1056 (1408 * 3/4), x clamped to the frame
  file="$TMP/up/f_$(printf %04d $((n + 1))).png"
  ffmpeg -y -v error -i "$file" -vf "crop=1056:1408:'max(0\,min(iw-1056\,iw*$cx-528))':0,scale=660:-2:flags=lanczos" "$TMP/$name.png"
  cwebp $WEBP -q 70 "$TMP/$name.png" -o "$STILLS/$name.webp"
done

# Contact clip: the calm multi-sig tail (frames 120–144, same crop as "finale"),
# scrubbed by scroll, so every frame is a keyframe (-g 1) for instant seeks.
CLIP_FROM=120 CLIP_TO=144 CLIP_CX=0.58
echo "→ contact clip (mp4)"
ffmpeg -y -v error -framerate 24 -start_number $((CLIP_FROM + 1)) -i "$TMP/up/f_%04d.png" -frames:v $((CLIP_TO - CLIP_FROM + 1)) \
  -vf "crop=1056:1408:'max(0\,min(iw-1056\,iw*$CLIP_CX-528))':0,scale=660:-2:flags=lanczos" \
  -an -c:v libx264 -crf 32 -preset slow -g 1 -pix_fmt yuv420p -movflags +faststart "$STILLS/finale_clip.mp4"

# Wide key frames for prefers-reduced-motion (hero / threat / multi-sig)
for n in 18 70 132; do
  cwebp $WEBP -q 65 "$TMP/desktop/f_$(printf %04d $((n + 1))).png" -o "$STILLS/key_$n.webp"
done

COUNT=$(ls "$OUT/desktop"/*.webp | wc -l | tr -d ' ')
echo "✓ $COUNT frames per set. Update FRAME_COUNT in src/config.ts if it changed."
