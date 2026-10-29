#!/usr/bin/env bash
# Hard gate for the Caller HUD hill climb: hud-design-system/tools/check.sh must report 0 on every state.
# Usage: caller-hud-v2/tools/score.sh [--shots]
set -u
DIR="$(cd "$(dirname "$0")/.." && pwd)"
CHECK="$DIR/../hud-design-system/tools/check.sh"
total=0
for run in "live 1440" "ended 1440" "unknown 1440" "empty 1440" "live 1280"; do
  set -- $run
  n=$("$CHECK" "../caller-hud-v2/caller-hud.html?state=$1" --width "$2" | python3 -c "
import json,sys; d=json.loads(sys.stdin.read()); c=d.get('counts',{})
bad={k:v for k,v in c.items() if v}
print(sum(c.values()) if c else 999, json.dumps(bad), json.dumps({k:v for k,v in d.get('details',{}).items() if v})[:600])")
  echo "$1@$2: $n"
  total=$((total + ${n%% *}))
done
echo "gate failures: $total"

if [ "${1:-}" = "--shots" ] || [ "${SHOTS:-}" = 1 ]; then
  C=(google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --no-first-run --force-device-scale-factor=1)
  shot() { rm -rf "/tmp/chv2-$1"; timeout 40 "${C[@]}" --window-size="$2" --user-data-dir="/tmp/chv2-$1" --screenshot="$DIR/$3" "file://$DIR/caller-hud.html?state=$1" >/dev/null 2>&1; }
  shot live 1440,900 final.png & shot ended 1440,900 state-ended.png & shot unknown 1440,900 state-unknown.png &
  shot empty 1440,900 state-empty-timeline.png & wait
  rm -rf /tmp/chv2-1280; timeout 40 "${C[@]}" --window-size=1280,800 --user-data-dir=/tmp/chv2-1280 --screenshot="$DIR/responsive-1280.png" "file://$DIR/caller-hud.html?state=live" >/dev/null 2>&1
  echo "rendered final.png state-ended.png state-unknown.png state-empty-timeline.png responsive-1280.png"
fi
