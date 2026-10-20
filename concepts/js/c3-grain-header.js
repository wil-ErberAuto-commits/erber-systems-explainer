/* 03 — Shop-Light Grain: a header lit like a bay under a single work lamp,
   with per-pixel film grain re-rolled at 12 fps and a faint tail-lamp glow. */
ErberFX.register('grain-header', function (stage, P) {
  var host = stage.querySelector('.grain-host') || stage;
  var S = 1;
  var cv = ErberFX.canvas(host, 'grain');
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, img;
  var seed = 1337;

  function rand() {
    seed ^= seed << 13; seed >>>= 0;
    seed ^= seed >>> 17;
    seed ^= seed << 5; seed >>>= 0;
    return seed / 4294967296;
  }

  function resize() {
    var r = host.getBoundingClientRect();
    W = Math.max(1, Math.ceil(r.width / S));
    H = Math.max(1, Math.ceil(r.height / S));
    cv.width = W; cv.height = H;
    img = ctx.createImageData(W, H);
  }

  function frame(t) {
    if (ErberFX.isStill()) seed = 1337;
    var d = img.data;
    var lx = W * (0.24 + 0.05 * Math.sin(t * 0.07)), ly = -H * 0.35;
    var rx = W * 0.97, ry = H * 1.15;
    var lr = Math.pow(W * 0.5, 2), rr = Math.pow(W * 0.16, 2);
    var dk = P.dark, nv = P.navy, rd = P.red;
    for (var y = 0; y < H; y++) {
      var vign = 1 - Math.pow(y / H, 2) * 0.25;
      for (var x = 0; x < W; x++) {
        var dx = x - lx, dy = (y - ly) * 1.8;
        var f = Math.exp(-(dx * dx + dy * dy) / lr) * vign;
        var ex = x - rx, ey = (y - ry) * 2.2;
        var rg = Math.exp(-(ex * ex + ey * ey) / rr) * 0.34;
        var hi = f * f * f * 0.22;
        var rC = dk[0] + (nv[0] - dk[0]) * f * 1.3;
        var gC = dk[1] + (nv[1] - dk[1]) * f * 1.3;
        var bC = dk[2] + (nv[2] - dk[2]) * f * 1.3;
        rC += (255 - rC) * hi; gC += (255 - gC) * hi; bC += (255 - bC) * hi;
        rC += (rd[0] - rC) * rg; gC += (rd[1] - gC) * rg; bC += (rd[2] - bC) * rg;
        var n = (rand() + rand() - 1) * 34 * (0.65 + f * 0.6);
        var o = (y * W + x) * 4;
        d[o] = rC + n; d[o + 1] = gC + n; d[o + 2] = bC + n; d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  return { fps: 12, resize: resize, frame: frame };
});
