/* 06 — Palouse After Hours: rolling contour-farmed hills at dusk, a small
   shop with its bay door lit, and one red tail-lamp easing along the road.
   Rendered in greyscale and Atkinson-dithered to two tones. */
ErberFX.register('palouse', function (stage, P) {
  var S = 2;
  var cv = ErberFX.canvas(stage, 'pixel');
  var ctx = cv.getContext('2d');
  var lc = document.createElement('canvas');
  var lctx = lc.getContext('2d', { willReadFrequently: true });
  var W = 0, H = 0, img, lum, state = {}, stars = [], layers = [];
  var redPx = [];

  function g(l) { var v = Math.round(Math.max(0, Math.min(1, l)) * 255); return 'rgb(' + v + ',' + v + ',' + v + ')'; }

  function resize(w, h) {
    W = Math.max(1, Math.ceil(w / S));
    H = Math.max(1, Math.ceil(h / S));
    cv.width = lc.width = W;
    cv.height = lc.height = H;
    img = ctx.createImageData(W, H);
    lum = new Float32Array(W * H);
    var r = ErberFX.rng(42);
    stars = [];
    for (var i = 0; i < 90; i++) stars.push([r() * W, r() * H * 0.45, r(), r() * 6.28]);
    layers = [];
    var specs = [
      [0.57, 0.03, 0.34],
      [0.64, 0.045, 0.28],
      [0.73, 0.05, 0.24],
      [0.9, 0.05, 0.11]
    ];
    specs.forEach(function (s, li) {
      var waves = [];
      for (var k = 0; k < 3; k++) waves.push([1 + r() * 3 + k * 1.7, r() * 6.28, (0.55 / (k + 1)) * (0.6 + r() * 0.6)]);
      layers.push({ base: s[0], amp: s[1], top: s[2], waves: waves, i: li });
    });
  }

  function ridge(L, x) {
    var u = x / W, y = 0;
    for (var k = 0; k < L.waves.length; k++) {
      var wv = L.waves[k];
      y += Math.sin(u * wv[0] * Math.PI + wv[1]) * wv[2];
    }
    return H * (L.base - L.amp * y);
  }

  function drawLayer(c, L, t) {
    var step = 2;
    c.beginPath();
    c.moveTo(0, H);
    for (var x = 0; x <= W; x += step) c.lineTo(x, ridge(L, x));
    c.lineTo(W, H);
    c.closePath();
    var top = ridge(L, W * 0.5) - H * L.amp;
    var grad = c.createLinearGradient(0, top, 0, H);
    grad.addColorStop(0, g(L.top));
    grad.addColorStop(0.35, g(L.top * 0.55));
    grad.addColorStop(1, g(0.04));
    c.fillStyle = grad;
    c.fill();

    c.save();
    c.clip();
    var rows = 6 + L.i * 3;
    var gap = H * (0.012 + L.i * 0.006);
    c.lineWidth = Math.max(1, gap * 0.35);
    for (var s = 1; s < rows; s++) {
      c.strokeStyle = g((L.top * 0.9) * (1 - s / rows) + 0.03);
      c.beginPath();
      for (var x2 = 0; x2 <= W; x2 += step) {
        var y2 = ridge(L, x2) + s * gap * (1 + 0.25 * Math.sin(x2 / W * 7 + L.i + s * 0.3));
        if (x2 === 0) c.moveTo(x2, y2); else c.lineTo(x2, y2);
      }
      c.stroke();
    }
    c.restore();

    c.strokeStyle = g(Math.min(1, L.top + 0.35));
    c.lineWidth = 1;
    c.beginPath();
    for (var x3 = 0; x3 <= W; x3 += step) {
      var y3 = ridge(L, x3);
      if (x3 === 0) c.moveTo(x3, y3); else c.lineTo(x3, y3);
    }
    c.stroke();
  }

  function road(L, u) {
    var x = W * u;
    return [x, ridge(L, x) + H * 0.035 + Math.sin(u * 9) * H * 0.008];
  }

  function frame(t) {
    var still = ErberFX.isStill();
    var c = lctx;
    var sky = c.createLinearGradient(0, 0, 0, H * 0.62);
    sky.addColorStop(0, g(0.02));
    sky.addColorStop(0.7, g(0.12));
    sky.addColorStop(1, g(0.4));
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);

    var mx = W * 0.78, my = H * 0.24, mr = Math.min(W, H) * 0.075;
    var halo = c.createRadialGradient(mx, my, mr, mx, my, mr * 5);
    halo.addColorStop(0, g(0.3));
    halo.addColorStop(1, g(0));
    c.fillStyle = halo;
    c.fillRect(0, 0, W, H);
    var moon = c.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.1, mx, my, mr);
    moon.addColorStop(0, g(1));
    moon.addColorStop(1, g(0.7));
    c.fillStyle = moon;
    c.beginPath(); c.arc(mx, my, mr, 0, Math.PI * 2); c.fill();

    for (var s = 0; s < stars.length; s++) {
      var st = stars[s];
      var tw = still ? 0.8 : 0.6 + 0.4 * Math.sin(t * (0.6 + st[2]) + st[3]);
      c.fillStyle = g(0.55 + 0.45 * st[2] * tw);
      c.fillRect(st[0] | 0, st[1] | 0, 1, 1);
    }

    c.globalCompositeOperation = 'lighter';
    for (var k = 0; k < 4; k++) {
      var cx = ((k * 0.31 + (still ? 0 : t * 0.006 * (1 + k * 0.3))) % 1.3 - 0.15) * W;
      var cy = H * (0.12 + k * 0.07);
      var cl = c.createRadialGradient(cx, cy, 0, cx, cy, W * 0.14);
      cl.addColorStop(0, g(0.07));
      cl.addColorStop(1, g(0));
      c.fillStyle = cl;
      c.save(); c.translate(cx, cy); c.scale(1, 0.22); c.translate(-cx, -cy);
      c.fillRect(cx - W * 0.15, cy - W * 0.15, W * 0.3, W * 0.3);
      c.restore();
    }
    c.globalCompositeOperation = 'source-over';

    drawLayer(c, layers[0], t);
    drawLayer(c, layers[1], t);

    var L2 = layers[2];
    drawLayer(c, L2, t);
    c.beginPath();
    for (var u2 = 0; u2 <= 1.001; u2 += 0.01) {
      var p2 = road(L2, u2);
      if (u2 === 0) c.moveTo(p2[0], p2[1]); else c.lineTo(p2[0], p2[1]);
    }
    c.strokeStyle = g(0.55);
    c.lineWidth = 2;
    c.stroke();

    var shopX = W * 0.3, shopY = ridge(L2, shopX) + 2;
    var sw = W * 0.075, shh = sw * 0.55;
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.translate(shopX - sw * 0.16, shopY + 1);
    c.scale(1, 0.28);
    var spill = c.createRadialGradient(0, 0, 0, 0, 0, sw * 1.6);
    spill.addColorStop(0, g(0.5));
    spill.addColorStop(1, g(0));
    c.fillStyle = spill;
    c.beginPath(); c.arc(0, 0, sw * 1.6, 0, Math.PI * 2); c.fill();
    c.restore();
    c.fillStyle = g(0.03);
    c.beginPath();
    c.moveTo(shopX - sw / 2, shopY);
    c.lineTo(shopX - sw / 2, shopY - shh);
    c.lineTo(shopX - sw * 0.1, shopY - shh * 1.45);
    c.lineTo(shopX + sw / 2, shopY - shh * 1.1);
    c.lineTo(shopX + sw / 2, shopY);
    c.closePath(); c.fill();
    c.fillStyle = g(1);
    c.fillRect(shopX - sw * 0.38, shopY - shh * 0.72, sw * 0.42, shh * 0.72);
    c.fillStyle = g(0.85);
    c.fillRect(shopX + sw * 0.16, shopY - shh * 0.7, sw * 0.18, shh * 0.24);
    c.fillStyle = g(0.03);
    c.fillRect(shopX + sw * 0.52, shopY - shh * 1.6, Math.max(1, sw * 0.03), shh * 1.6);
    c.fillRect(shopX + sw * 0.52, shopY - shh * 1.6, sw * 0.32, shh * 0.32);

    drawLayer(c, layers[3], t);

    var d = c.getImageData(0, 0, W, H).data;
    for (var i = 0; i < W * H; i++) lum[i] = d[i * 4] / 255;

    var uCar = still ? 0.62 : ((t * 0.012 + 0.6) % 1.2) - 0.1;
    redPx = [];
    if (uCar > 0 && uCar < 1) {
      var cp = road(L2, uCar);
      var px = Math.round(cp[0]), py = Math.round(cp[1]) - 2;
      var occluded = py > ridge(layers[3], px);
      if (!occluded) {
        for (var yy = 0; yy < 3; yy++) for (var xx = 0; xx < 4; xx++) {
          var ix = px + xx, iy = py + yy;
          if (ix >= 0 && ix < W && iy >= 0 && iy < H) { redPx.push(iy * W + ix); lum[iy * W + ix] = 0; }
        }
        for (var gx = -6; gx <= 8; gx++) {
          var ii = (py + 1) * W + px + gx;
          if (ii > 0 && ii < W * H) lum[ii] += 0.25 * Math.exp(-gx * gx / 18);
        }
      }
    }

    var bits = ErberFX.errorDiffuse(lum, W, H, 'atkinson', state);
    var out = img.data;
    for (var q = 0; q < W * H; q++) {
      var col = bits[q] ? P.white : P.dark;
      var o = q * 4;
      out[o] = col[0]; out[o + 1] = col[1]; out[o + 2] = col[2]; out[o + 3] = 255;
    }
    for (var rr = 0; rr < redPx.length; rr++) {
      var o2 = redPx[rr] * 4;
      out[o2] = P.red[0]; out[o2 + 1] = P.red[1]; out[o2 + 2] = P.red[2];
    }
    ctx.putImageData(img, 0, 0);
  }

  return { fps: 15, resize: resize, frame: frame, still: 2 };
});
