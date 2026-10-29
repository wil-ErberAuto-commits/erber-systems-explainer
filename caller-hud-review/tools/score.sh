#!/usr/bin/env bash
# Mechanical half of the hill-climb score: detector findings, contrast fails, tap-target fails.
# Usage: tools/score.sh [--shots]   (run from anywhere; --shots also re-renders the 4 state PNGs)
set -u
DIR="$(cd "$(dirname "$0")/.." && pwd)"
IMPECCABLE="${IMPECCABLE:-$HOME/.cursor/plugins/cache/cursor-public/73000484/9dad388a41944a0d2b8d1fb547c8556d2ecb49e7/skills/impeccable/scripts/impeccable}"
CHROME=(google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --no-first-run
  --force-device-scale-factor=1 --window-size=1440,900 --allow-file-access-from-files)

shot() {
  rm -f "$DIR/$2"
  rm -rf "/tmp/hc-$1"
  timeout 25 "${CHROME[@]}" --user-data-dir="/tmp/hc-$1" --screenshot="$DIR/$2" "file://$DIR/mockup.html?state=$1" >/dev/null 2>&1
}

if [ "${1:-}" = "--shots" ]; then
  shot live mockup-1440.png & shot ended state-ended.png &
  shot unknown state-unknown.png & shot empty state-empty-timeline.png &
fi

rm -rf /tmp/hc-measure
timeout 25 "${CHROME[@]}" --user-data-dir=/tmp/hc-measure --virtual-time-budget=8000 --dump-dom \
  "file://$DIR/tools/measure.html" 2>/dev/null > /tmp/hc-measure.html
python3 - "$DIR" <<'EOF'
import html, json, re, subprocess, sys, os
d = sys.argv[1]
raw = open('/tmp/hc-measure.html').read()
m = re.search(r'<pre id="out">(.*?)</pre>', raw, re.S)
data = json.loads(html.unescape(m.group(1))) if m else None
det = subprocess.run([os.environ.get('IMPECCABLE') or os.path.expanduser('~/.cursor/plugins/cache/cursor-public/73000484/9dad388a41944a0d2b8d1fb547c8556d2ecb49e7/skills/impeccable/scripts/impeccable'),
                      'detect', '--json', os.path.join(d, 'mockup.html')], capture_output=True, text=True)
try: findings = json.loads(det.stdout or '[]')
except Exception: findings = []
print(json.dumps({
  'detect': len(findings),
  'detectRules': sorted({f['antipattern'] for f in findings}),
  'contrastFails': data and data['contrastFails'],
  'tapFails': data and data['tapFails'],
  'details': data and [{k: r[k] for k in ('state', 'contrast', 'taps')} for r in data['results'] if r['contrast'] or r['taps']],
}, indent=1))
EOF
wait
if [ "${1:-}" = "--shots" ]; then
  rm -rf /tmp/hc-1280; timeout 40 "${CHROME[@]/--window-size=1440,900/--window-size=1280,800}" --user-data-dir=/tmp/hc-1280 --screenshot="$DIR/responsive-1280.png" "file://$DIR/mockup.html?state=live" >/dev/null 2>&1
fi
