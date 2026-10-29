#!/usr/bin/env bash
# Mechanical half of the hill-climb score: detector findings, contrast fails, tap-target fails.
# Usage: tools/score.sh [--shots]   (run from anywhere; --shots also re-renders the 4 state PNGs)
set -u
DIR="$(cd "$(dirname "$0")/.." && pwd)"
IMPECCABLE="${IMPECCABLE:-$HOME/.cursor/plugins/cache/cursor-public/73000484/9dad388a41944a0d2b8d1fb547c8556d2ecb49e7/skills/impeccable/scripts/impeccable}"
CHROME=(google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --no-first-run
  --force-device-scale-factor=1 --window-size=1440,900 --allow-file-access-from-files)

shot() {
  rm -rf "/tmp/oc-$1"
  timeout 25 "${CHROME[@]}" --user-data-dir="/tmp/oc-$1" --screenshot="$DIR/$2" "file://$DIR/mockup.html?state=$1" >/dev/null 2>&1
}

if [ "${1:-}" = "--shots" ]; then
  shot withheld mockup-1440.png & shot text state-text-allowed-undo.png &
  shot empty state-empty.png & shot done state-done.png &
fi

rm -rf /tmp/oc-measure
timeout 25 "${CHROME[@]}" --user-data-dir=/tmp/oc-measure --virtual-time-budget=8000 --dump-dom \
  "file://$DIR/tools/measure.html" 2>/dev/null > /tmp/oc-measure.html
python3 - "$DIR" <<'EOF'
import html, json, re, subprocess, sys, os
d = sys.argv[1]
raw = open('/tmp/oc-measure.html').read()
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
