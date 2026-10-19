/* 04 — Idle Tach: a tachometer drawn in greyscale, then Floyd–Steinberg
   dithered to 1-bit. The needle settles around idle and blips now and then. */
ErberFX.register('tach', function (stage, P) {
  var S = 2;
  var cv = ErberFX.canvas(stage, 'pixel');
  var ctx = cv.getContext('2d');
  var lumC = document.createElement('canvas');
  var lctx = lumC.getContext('2d', { willReadFrequently: true });
  var W = 0, H = 0, img, lum, state = {};
  var A0 = Math.PI * 0.75, SWEEP = Math.PI * 1.5, MAX = 8;

  function g(l) { var v = Math.round(l * 255); return 'rgb(' + v + ',' + v + ',' + v + ')'; }
  function ang(v) { return A0 + SWEEP * v / MAX; }

  function resize(w, h) {
    W = Math.max(1, Math.ceil(w / S));
    H = Math.max(1, Math.ceil(h / S));
    cv.width = lumC.width = W;
    cv.height = lumC.height = H;
    img = ctx.createImageData(W, H);
    lum = new Float32Array(W * H);
  }

  function rpm(t) {
    if (ErberFX.isStill()) return 0.9;
    var v = 0.88 + 0.035 * Math.sin(t * 3.1) + 0.015 * Math.sin(t * 7.7);
    var p = (t % 9) / 9 * 9;
    if (p > 6 && p < 8.5) {
      var k = (p - 6) / 2.5;
      v += 1.9 * Math.pow(Math.sin(Math.min(1, k * 2.2) * Math.PI / 2), 2) * Math.exp(-k * 3.2);
    }
    return v;
  }

  function draw(c, t, redPass) {
    var cx = W * 0.5, cy = H * 0.54, R = Math.min(W, H) * 0.4;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#000';
    c.fillRect(0, 0, W, H);
    c.lineCap = 'butt';

    if (!redPass) {
      var halo = c.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.7);
      halo.addColorStop(0, g(0.16));
      halo.addColorStop(1, g(0));
      c.fillStyle = halo;
      c.fillRect(0, 0, W, H);

      var face = c.createRadialGradient(cx - R * 0.25, cy - R * 0.35, R * 0.05, cx, cy, R * 1.02);
      face.addColorStop(0, g(0.4));
      face.addColorStop(0.55, g(0.16));
      face.addColorStop(1, g(0.06));
      c.fillStyle = face;
      c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();

      c.strokeStyle = g(0.85); c.lineWidth = Math.max(2, R * 0.018);
      c.beginPath(); c.arc(cx, cy, R * 1.035, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = g(0.35); c.lineWidth = Math.max(1, R * 0.01);
      c.beginPath(); c.arc(cx, cy, R * 1.08, 0, Math.PI * 2); c.stroke();

      for (var i = 0; i <= MAX * 4; i++) {
        var v = i / 4;
        if (v >= 6.5) continue;
        var major = i % 4 === 0, half = i % 2 === 0;
        var len = major ? 0.15 : half ? 0.09 : 0.055;
        var a = ang(v);
        c.strokeStyle = g(major ? 1 : 0.75);
        c.lineWidth = major ? Math.max(2, R * 0.03) : Math.max(1, R * 0.012);
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * R * 0.93, cy + Math.sin(a) * R * 0.93);
        c.lineTo(cx + Math.cos(a) * R * (0.93 - len), cy + Math.sin(a) * R * (0.93 - len));
        c.stroke();
      }

      c.fillStyle = g(1);
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.font = '600 ' + Math.round(R * 0.15) + 'px "General Sans"';
      for (var n = 0; n <= MAX; n++) {
        var an = ang(n);
        c.fillText(String(n), cx + Math.cos(an) * R * 0.64, cy + Math.sin(an) * R * 0.64);
      }
      c.fillStyle = g(0.7);
      c.font = '500 ' + Math.round(R * 0.07) + 'px "General Sans"';
      c.fillText('RPM \u00d7 1000', cx, cy + R * 0.36);
    }

    c.strokeStyle = g(1);
    c.lineWidth = R * 0.07;
    c.beginPath(); c.arc(cx, cy, R * 0.895, ang(6.5), ang(8)); c.stroke();
    for (var r = 26; r < 32; r++) {
      var ar = ang(r / 4);
      c.lineWidth = r % 4 === 0 ? Math.max(2, R * 0.03) : Math.max(1, R * 0.012);
      c.beginPath();
      c.moveTo(cx + Math.cos(ar) * R * 0.93, cy + Math.sin(ar) * R * 0.93);
      c.lineTo(cx + Math.cos(ar) * R * (r % 4 === 0 ? 0.78 : 0.85), cy + Math.sin(ar) * R * (r % 4 === 0 ? 0.78 : 0.85));
      c.stroke();
    }

    var nv = rpm(t), na = ang(nv);
    if (!redPass) {
      var tipX = cx + Math.cos(na) * R * 0.8, tipY = cy + Math.sin(na) * R * 0.8;
      var glow = c.createRadialGradient(tipX, tipY, 0, tipX, tipY, R * 0.4);
      glow.addColorStop(0, g(0.28));
      glow.addColorStop(1, g(0));
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = glow;
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'source-over';
    }
    c.strokeStyle = g(1);
    c.lineCap = 'round';
    c.lineWidth = Math.max(2, R * 0.03);
    c.beginPath();
    c.moveTo(cx - Math.cos(na) * R * 0.14, cy - Math.sin(na) * R * 0.14);
    c.lineTo(cx + Math.cos(na) * R * 0.86, cy + Math.sin(na) * R * 0.86);
    c.stroke();
    if (!redPass) {
      c.fillStyle = g(0.2);
      c.beginPath(); c.arc(cx, cy, R * 0.085, 0, Math.PI * 2); c.fill();
      c.strokeStyle = g(0.95); c.lineWidth = Math.max(1, R * 0.015);
      c.stroke();
    }
  }

  var red = document.createElement('canvas');
  var rctx = red.getContext('2d', { willReadFrequently: true });

  function frame(t) {
    draw(lctx, t, false);
    if (red.width !== W || red.height !== H) { red.width = W; red.height = H; }
    draw(rctx, t, true);
    var ld = lctx.getImageData(0, 0, W, H).data;
    var rdd = rctx.getImageData(0, 0, W, H).data;
    for (var i = 0; i < W * H; i++) lum[i] = Math.min(1, ld[i * 4] / 255);
    for (var j = 0; j < W * H; j++) if (rdd[j * 4] > 140) lum[j] = 1;
    var bits = ErberFX.errorDiffuse(lum, W, H, 'fs', state);
    var d = img.data;
    for (var k = 0; k < W * H; k++) {
      var c = bits[k] ? (rdd[k * 4] > 140 ? P.red : P.white) : P.dark;
      var o = k * 4;
      d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  return { fps: 24, resize: resize, frame: frame };
});
