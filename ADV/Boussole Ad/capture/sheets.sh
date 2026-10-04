#!/usr/bin/env bash
# Planches contact (une image par seconde) et aperçus vidéo des captures.
#   ./sheets.sh 16x9   ou   ./sheets.sh 9x16
# Sortie : sheets/<format>.jpg (dans git) et out/apercu-<format>.mp4 (hors git, 30 i/s, légers).
set -euo pipefail
cd "$(dirname "$0")"
fmt="${1:-16x9}"
if [ "$fmt" = "16x9" ]; then w=320; cols=6; pw=960; else w=180; cols=10; pw=540; fi
mkdir -p sheets
list=$(mktemp); vids=$(mktemp)
for d in out/"$fmt"/*/; do
  seg=$(basename "$d")
  # une image par seconde, plus la dernière, avec le nom du segment
  ls "$d" | awk -F. '{ if (($1+0) % 60 == 0) print }' | sed "s#^#file '$PWD/$d#; s#\$#'#" >> "$list"
  ffmpeg -v error -y -framerate 60 -i "$d/%06d.jpg" -vf "scale=$pw:-2,fps=30,drawtext=text='$seg':x=16:y=16:fontsize=22:fontcolor=0x2D2440:box=1:boxcolor=0xFFF9F3@0.85:boxborderw=8" \
    -c:v libx264 -crf 26 -preset veryfast -pix_fmt yuv420p "out/.apercu-$seg.mp4"
  echo "file '$PWD/out/.apercu-$seg.mp4'" >> "$vids"
done
n=$(wc -l < "$list"); rows=$(( (n + cols - 1) / cols ))
ffmpeg -v error -y -f concat -safe 0 -i "$list" -vf "scale=$w:-1,tile=${cols}x${rows}:padding=6:margin=6:color=0xFFF9F3" -frames:v 1 -q:v 4 "sheets/$fmt.jpg"
ffmpeg -v error -y -f concat -safe 0 -i "$vids" -c copy "out/apercu-$fmt.mp4"
rm -f "$list" "$vids" out/.apercu-*.mp4
echo "sheets/$fmt.jpg ($n images)  et  out/apercu-$fmt.mp4"
