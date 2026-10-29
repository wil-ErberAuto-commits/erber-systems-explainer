#!/usr/bin/env bash
# Token conformance check + optional full-page render.
# Usage: tools/check.sh [page.html relative to hud-design-system/] [--shot out.png] [--width 1440]
set -u
DIR="$(cd "$(dirname "$0")/.." && pwd)"
PAGE="reference.html"; SHOT=""; WIDTH=1440
while [ $# -gt 0 ]; do
  case "$1" in
    --shot) SHOT="$2"; shift 2 ;;
    --width) WIDTH="$2"; shift 2 ;;
    *) PAGE="$1"; shift ;;
  esac
done
CHROME=(google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --no-first-run
  --force-device-scale-factor=1 --allow-file-access-from-files)

rm -rf /tmp/ds-check
timeout 30 "${CHROME[@]}" --window-size="$WIDTH,900" --user-data-dir=/tmp/ds-check --virtual-time-budget=8000 --dump-dom \
  "file://$DIR/tools/check.html?page=../$PAGE&w=$WIDTH" 2>/dev/null > /tmp/ds-check.html
OUT=$(python3 - <<'EOF'
import html, json, re
raw = open('/tmp/ds-check.html').read()
m = re.search(r'<pre id="out">(.*?)</pre>', raw, re.S)
print(html.unescape(m.group(1)) if m else '{}')
EOF
)
python3 -c "import json,sys; d=json.loads(sys.argv[1]); d['offToken']=sum(v for k,v in d.get('counts',{}).items()); print(json.dumps(d, indent=1))" "$OUT"

if [ -n "$SHOT" ]; then
  H=$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('height', 900))" "$OUT")
  rm -rf /tmp/ds-shot
  timeout 40 "${CHROME[@]}" --window-size="$WIDTH,$H" --user-data-dir=/tmp/ds-shot --screenshot="$DIR/$SHOT" "file://$DIR/$PAGE" >/dev/null 2>&1
  echo "rendered $SHOT at ${WIDTH}x$H"
fi
