/* 01 — Bayer Wordmark: "ERBER AUTO" set in General Sans Bold, lit by a slow
   drifting work-light and ordered-dithered into three brand tones. */
ErberFX.register('wordmark', function (stage, P) {
  var S = 3;
  var cv = ErberFX.canvas(stage, 'pixel');
  var ctx = cv.getContext('2d');
  var mask = document.createElement('canvas');
  var mctx = mask.getContext('2d', { willReadFrequently: true });
  var B = ErberFX.bayer(8);
  var tones = [P.dark, P.navy, P.white];
  var W = 0, H = 0, img, textA, ruleA;

  function resize(w, h) {
    W = Math.max(1, Math.ceil(w / S));
    H = Math.max(1, Math.ceil(h / S));
    cv.width = mask.width = W;
    cv.height = mask.height = H;
    img = ctx.createImageData(W, H);

    mctx.clearRect(0, 0, W, H);
    mctx.fillStyle = '#fff';
    mctx.textBaseline = 'alphabetic';
    mctx.letterSpacing = '0px';
    mctx.font = '700 100px "General Sans"';
    var target = W * 0.86;
    var size = 100 * target / mctx.measureText('ERBER AUTO').width;
    mctx.font = '700 ' + size + 'px "General Sans"';
    var m = mctx.measureText('ERBER AUTO');
    var x = (W - m.width) / 2;
    var base = H * 0.5 + m.actualBoundingBoxAscent * 0.5;
    mctx.fillText('ERBER AUTO', x, base);
    var d = mctx.getImageData(0, 0, W, H).data;
    textA = new Float32Array(W * H);
    for (var i = 0; i < W * H; i++) textA[i] = d[i * 4 + 3] / 255;

    mctx.clearRect(0, 0, W, H);
    mctx.fillRect(Math.round(x + size * 0.04), Math.round(base + size * 0.12),
      Math.round(W * 0.11), Math.max(3, Math.round(size * 0.07)));
    d = mctx.getImageData(0, 0, W, H).data;
    ruleA = new Uint8Array(W * H);
    for (var j = 0; j < W * H; j++) ruleA[j] = d[j * 4 + 3] > 127 ? 1 : 0;
  }

  function frame(t) {
    var lx = W * (0.5 + 0.32 * Math.sin(t * 0.11));
    var ly = H * (0.3 + 0.14 * Math.cos(t * 0.083));
    var r2 = Math.pow(W * 0.42, 2);
    var data = img.data;
    for (var y = 0; y < H; y++) {
      var vy = 1 - y / H;
      for (var x = 0; x < W; x++) {
        var i = y * W + x;
        var dx = x - lx, dy = (y - ly) * 1.6;
        var light = Math.exp(-(dx * dx + dy * dy) / r2);
        var bg = 0.04 + 0.5 * light + 0.06 * vy;
        var fg = 0.54 + 0.6 * light + 0.2 * vy;
        var a = textA[i];
        var l = bg + (fg - bg) * a;
        var th = B[(y & 7) * 8 + (x & 7)];
        var c;
        if (ruleA[i]) {
          c = th < 0.82 ? P.red : P.dark;
        } else {
          var v = Math.min(1.999, Math.max(0, l) * 2);
          var lo = v | 0;
          c = tones[(v - lo) > th ? lo + 1 : lo];
        }
        var o = i * 4;
        data[o] = c[0]; data[o + 1] = c[1]; data[o + 2] = c[2]; data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  return { fps: 20, resize: resize, frame: frame };
});
