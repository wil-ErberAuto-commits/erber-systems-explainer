/* 02 — ASCII Idle: a generic sedan profile rasterised to a coarse luminance
   grid and re-typed as characters. Body ticks over at idle, exhaust drifts. */
ErberFX.register('ascii-car', function (stage, P) {
  var CW = 9, CH = 16;
  var RAMP = ' .`:-=+*#%@';
  var cv = ErberFX.canvas(stage);
  var ctx = cv.getContext('2d');
  var off = document.createElement('canvas');
  var octx = off.getContext('2d', { willReadFrequently: true });
  var dpr = 1, cols = 0, rows = 0, w = 0, h = 0;

  function resize(cw, ch) {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cw; h = ch;
    cv.width = Math.round(cw * dpr);
    cv.height = Math.round(ch * dpr);
    cols = Math.floor(cw / CW);
    rows = Math.floor(ch / CH);
    off.width = cols;
    off.height = rows;
  }

  function g(l) { var v = Math.round(l * 255); return 'rgb(' + v + ',' + v + ',' + v + ')'; }

  function body(c) {
    c.beginPath();
    c.moveTo(2, -8);
    c.lineTo(2, -17);
    c.quadraticCurveTo(2.5, -21.5, 8, -22.5);
    c.lineTo(22, -24);
    c.bezierCurveTo(26, -27, 31, -35.5, 38, -36.5);
    c.lineTo(55, -36.5);
    c.bezierCurveTo(60, -36, 64, -29, 69, -25.5);
    c.lineTo(91, -22.5);
    c.quadraticCurveTo(97.5, -21, 98, -16);
    c.lineTo(98, -9.5);
    c.quadraticCurveTo(98, -8, 96, -8);
    c.closePath();
  }

  function wheel(c, cx, spin) {
    c.fillStyle = g(0); c.beginPath(); c.arc(cx, -9, 10.6, 0, Math.PI * 2); c.fill();
    c.fillStyle = g(0.32); c.beginPath(); c.arc(cx, -9, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = g(0.78); c.beginPath(); c.arc(cx, -9, 5.6, 0, Math.PI * 2); c.fill();
    c.strokeStyle = g(0.2); c.lineWidth = 1.1;
    for (var k = 0; k < 5; k++) {
      var a = spin + k * Math.PI * 2 / 5;
      c.beginPath();
      c.moveTo(cx + Math.cos(a) * 1.6, -9 + Math.sin(a) * 1.6);
      c.lineTo(cx + Math.cos(a) * 5.2, -9 + Math.sin(a) * 5.2);
      c.stroke();
    }
    c.fillStyle = g(1); c.beginPath(); c.arc(cx, -9, 1.3, 0, Math.PI * 2); c.fill();
  }

  function scene(t) {
    var c = octx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#000';
    c.fillRect(0, 0, cols, rows);
    var u = cols / 132;
    var sy = u * CW / CH;
    var groundY = rows * 0.72;
    c.setTransform(u, 0, 0, sy, cols * 0.14, groundY);

    var floor = c.createLinearGradient(0, 0, 0, 18);
    floor.addColorStop(0, g(0.16));
    floor.addColorStop(1, g(0));
    c.fillStyle = floor;
    c.fillRect(-40, 0.6, 200, 18);
    c.fillStyle = g(0.03);
    c.beginPath(); c.ellipse(50, 1.4, 54, 2.6, 0, 0, Math.PI * 2); c.fill();

    var pulse = 0.85 + 0.15 * Math.sin(t * 1.3);
    var beam = c.createRadialGradient(99, -17, 1, 99, -17, 40);
    beam.addColorStop(0, g(0.42 * pulse));
    beam.addColorStop(1, g(0));
    c.fillStyle = beam;
    c.beginPath(); c.moveTo(98, -19); c.lineTo(140, -30); c.lineTo(140, 2); c.lineTo(98, -14); c.closePath(); c.fill();

    for (var k = 0; k < 6; k++) {
      var age = (t * 0.45 + k / 6) % 1;
      var px = -2 - age * 26;
      var py = -5 - age * 9 + Math.sin(t * 1.7 + k * 2.1) * 1.2;
      var rad = 1.5 + age * 6;
      var a = 0.42 * (1 - age) * Math.min(1, age * 6);
      var puff = c.createRadialGradient(px, py, 0, px, py, rad);
      puff.addColorStop(0, g(a));
      puff.addColorStop(1, g(0));
      c.fillStyle = puff;
      c.globalCompositeOperation = 'lighter';
      c.beginPath(); c.arc(px, py, rad, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = 'source-over';
    }

    var shake = ErberFX.isStill() ? 0 : Math.sin(t * 11) * 0.32 + Math.sin(t * 23) * 0.12;
    c.save();
    c.translate(0, shake);
    var paint = c.createLinearGradient(0, -37, 0, -8);
    paint.addColorStop(0, g(0.95));
    paint.addColorStop(0.45, g(0.66));
    paint.addColorStop(1, g(0.4));
    c.fillStyle = paint;
    body(c);
    c.fill();

    c.strokeStyle = g(1); c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(6, -22); c.lineTo(91, -21.6); c.stroke();
    c.strokeStyle = g(0.22); c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(47.5, -34); c.lineTo(47.5, -12); c.stroke();
    c.beginPath(); c.moveTo(25, -14); c.lineTo(90, -14); c.stroke();

    c.fillStyle = g(0.18);
    c.beginPath(); c.moveTo(28.5, -25.4); c.bezierCurveTo(32, -30, 35, -34.2, 39, -34.6);
    c.lineTo(46.5, -34.6); c.lineTo(46.5, -25.4); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(48.5, -25.4); c.lineTo(48.5, -34.6); c.lineTo(54.5, -34.6);
    c.bezierCurveTo(58, -34, 61, -29, 65, -25.4); c.closePath(); c.fill();
    c.strokeStyle = g(0.55); c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(37, -27); c.lineTo(42, -33.5); c.stroke();
    c.beginPath(); c.moveTo(52, -27); c.lineTo(56.5, -33.5); c.stroke();

    c.fillStyle = g(1);
    c.fillRect(93.5, -20, 4.2, 3.2);
    c.fillStyle = 'rgb(255,0,0)';
    c.fillRect(2, -20.5, 2.6, 3.6);
    c.fillStyle = g(0.9);
    c.fillRect(44, -21, 3, 0.8);
    c.restore();

    var spin = ErberFX.isStill() ? 0.3 : t * 0.05;
    wheel(c, 21, spin);
    wheel(c, 79, spin + 1);
    c.setTransform(1, 0, 0, 1, 0, 0);
  }

  function frame(t) {
    scene(t);
    var d = octx.getImageData(0, 0, cols, rows).data;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = 'rgb(' + P.dark.join(',') + ')';
    ctx.fillRect(0, 0, w, h);
    ctx.font = '500 ' + (CH * 0.82) + 'px "General Sans"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var n = RAMP.length;
    var buckets = [];
    for (var b = 0; b < n; b++) buckets.push([]);
    var reds = [];
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var o = (y * cols + x) * 4;
        var r = d[o], gg = d[o + 1];
        if (r - gg > 90) { reds.push(x, y); continue; }
        var idx = Math.round(r / 255 * (n - 1));
        if (idx > 0) buckets[idx].push(x, y);
      }
    }
    var ox = (w - cols * CW) / 2 + CW / 2;
    var oy = (h - rows * CH) / 2 + CH / 2;
    for (var k = 1; k < n; k++) {
      var list = buckets[k];
      if (!list.length) continue;
      var a = 0.28 + 0.72 * (k / (n - 1));
      ctx.fillStyle = k < 3 ? 'rgba(130,160,215,' + a + ')' : 'rgba(255,255,255,' + a + ')';
      var ch = RAMP[k];
      for (var j = 0; j < list.length; j += 2) {
        ctx.fillText(ch, ox + list[j] * CW, oy + list[j + 1] * CH);
      }
    }
    ctx.fillStyle = 'rgb(' + P.red.join(',') + ')';
    for (var q = 0; q < reds.length; q += 2) ctx.fillText('#', ox + reds[q] * CW, oy + reds[q + 1] * CH);
  }

  return { fps: 18, resize: resize, frame: frame };
});
