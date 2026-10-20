/* Shared pieces for the compact tach variations (04a–04d): a dithered drawing
   surface, a dial painter, and pointer tracking with a touch fallback. */
(function () {
  'use strict';
  var P = ErberFX.PALETTE;
  var B = ErberFX.bayer(8);
  var TAU = Math.PI * 2;

  function g(l) {
    var v = Math.round(Math.max(0, Math.min(1, l)) * 255);
    return 'rgb(' + v + ',' + v + ',' + v + ')';
  }

  /* Greyscale + red-mask canvases that get dithered onto a visible canvas.
     Everything drawn white on the red pass comes out brand red. */
  function Surface(el, S, kind, bg) {
    this.el = el;
    this.S = S;
    this.kind = kind;
    this.bg = bg || P.dark;
    this.cv = ErberFX.canvas(el, 'pixel');
    this.ctx = this.cv.getContext('2d');
    this.lc = document.createElement('canvas');
    this.l = this.lc.getContext('2d', { willReadFrequently: true });
    this.rc = document.createElement('canvas');
    this.r = this.rc.getContext('2d', { willReadFrequently: true });
    this.state = {};
  }

  Surface.prototype.resize = function () {
    var rect = this.el.getBoundingClientRect();
    this.rect = rect;
    this.W = Math.max(1, Math.ceil(rect.width / this.S));
    this.H = Math.max(1, Math.ceil(rect.height / this.S));
    this.cv.width = this.lc.width = this.rc.width = this.W;
    this.cv.height = this.lc.height = this.rc.height = this.H;
    this.img = this.ctx.createImageData(this.W, this.H);
    this.lum = new Float32Array(this.W * this.H);
    this.red = new Uint8Array(this.W * this.H);
  };

  /* Converts a point in stage CSS pixels into this surface's pixel space. */
  Surface.prototype.local = function (stageRect, x, y) {
    return [(x + stageRect.left - this.rect.left) / this.S, (y + stageRect.top - this.rect.top) / this.S];
  };

  Surface.prototype.clear = function () {
    var cs = [this.l, this.r];
    for (var i = 0; i < 2; i++) {
      cs[i].setTransform(1, 0, 0, 1, 0, 0);
      cs[i].globalCompositeOperation = 'source-over';
      cs[i].fillStyle = '#000';
      cs[i].fillRect(0, 0, this.W, this.H);
    }
  };

  Surface.prototype.present = function () {
    var W = this.W, H = this.H, n = W * H;
    var ld = this.l.getImageData(0, 0, W, H).data;
    var rd = this.r.getImageData(0, 0, W, H).data;
    var lum = this.lum, red = this.red;
    for (var i = 0; i < n; i++) {
      red[i] = rd[i * 4] > 140 ? 1 : 0;
      lum[i] = red[i] ? 1 : ld[i * 4] / 255;
    }
    var bits;
    if (this.kind === 'bayer') {
      bits = this.state.bits && this.state.bits.length === n ? this.state.bits : (this.state.bits = new Uint8Array(n));
      for (var y = 0; y < H; y++) {
        for (var x = 0; x < W; x++) {
          var k = y * W + x;
          bits[k] = lum[k] > B[(y & 7) * 8 + (x & 7)] ? 1 : 0;
        }
      }
    } else {
      bits = ErberFX.errorDiffuse(lum, W, H, this.kind, this.state);
    }
    var d = this.img.data, bg = this.bg;
    for (var j = 0; j < n; j++) {
      var c = bits[j] ? (red[j] ? P.red : P.white) : bg;
      var o = j * 4;
      d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
    }
    this.ctx.putImageData(this.img, 0, 0);
  };

  /* o: cx, cy, R, a0, sweep, max, majors, minors, redFrom, value, face, hub, ring */
  function dial(c, o, redPass) {
    var ang = function (v) { return o.a0 + o.sweep * v / o.max; };
    var R = o.R, cx = o.cx, cy = o.cy;
    c.lineCap = 'butt';
    if (!redPass) {
      if (o.face !== false) {
        var face = c.createRadialGradient(cx - R * 0.3, cy - R * 0.4, R * 0.05, cx, cy, R);
        face.addColorStop(0, g(0.42));
        face.addColorStop(0.6, g(0.16));
        face.addColorStop(1, g(0.05));
        c.fillStyle = face;
        c.beginPath();
        if (o.ringFull === false) {
          c.moveTo(cx, cy);
          c.arc(cx, cy, R, o.a0, o.a0 + o.sweep);
          c.closePath();
        } else {
          c.arc(cx, cy, R, 0, TAU);
        }
        c.fill();
      }
      if (o.ring !== false) {
        c.strokeStyle = g(0.9);
        c.lineWidth = Math.max(1, R * 0.05);
        c.beginPath(); c.arc(cx, cy, R * 1.04, o.ringFull === false ? o.a0 : 0, o.ringFull === false ? o.a0 + o.sweep : TAU); c.stroke();
      }
      var steps = o.majors * o.minors;
      for (var i = 0; i <= steps; i++) {
        var v = o.max * i / steps;
        if (o.redFrom != null && v > o.redFrom + 1e-6) continue;
        var major = i % o.minors === 0;
        var a = ang(v);
        c.strokeStyle = g(major ? 1 : 0.7);
        c.lineWidth = Math.max(1, R * (major ? 0.07 : 0.03));
        var r0 = R * 0.9, r1 = R * (major ? 0.68 : 0.78);
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        c.stroke();
      }
    }
    if (o.redFrom != null) {
      c.strokeStyle = g(1);
      c.lineWidth = Math.max(2, R * 0.14);
      c.beginPath(); c.arc(cx, cy, R * 0.83, ang(o.redFrom), ang(o.max)); c.stroke();
    }
    var na = ang(Math.max(0, Math.min(o.max, o.value)));
    if (!redPass) {
      var tx = cx + Math.cos(na) * R * 0.75, ty = cy + Math.sin(na) * R * 0.75;
      var glow = c.createRadialGradient(tx, ty, 0, tx, ty, R * 0.6);
      glow.addColorStop(0, g(0.3));
      glow.addColorStop(1, g(0));
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = glow;
      c.beginPath(); c.arc(tx, ty, R * 0.6, 0, TAU); c.fill();
      c.globalCompositeOperation = 'source-over';
    }
    c.strokeStyle = g(1);
    c.lineCap = 'round';
    c.lineWidth = Math.max(1.5, R * 0.06);
    c.beginPath();
    c.moveTo(cx - Math.cos(na) * R * 0.16, cy - Math.sin(na) * R * 0.16);
    c.lineTo(cx + Math.cos(na) * R * 0.88, cy + Math.sin(na) * R * 0.88);
    c.stroke();
    if (!redPass && o.hub !== false) {
      c.fillStyle = g(0.15);
      c.beginPath(); c.arc(cx, cy, R * 0.13, 0, TAU); c.fill();
      c.strokeStyle = g(1);
      c.lineWidth = Math.max(1, R * 0.035);
      c.stroke();
    }
  }

  /* Value a dial would show if its needle pointed straight at (px, py). */
  function aim(o, px, py) {
    var rel = Math.atan2(py - o.cy, px - o.cx) - o.a0;
    rel = ((rel % TAU) + TAU) % TAU;
    if (rel > o.sweep) rel = rel > o.sweep + (TAU - o.sweep) / 2 ? 0 : o.sweep;
    return rel / o.sweep * o.max;
  }

  function ease(cur, target, dt, rate) {
    if (ErberFX.isStill() || !dt) return target;
    return cur + (target - cur) * (1 - Math.exp(-dt * rate));
  }

  /* Tracks the pointer over a stage. Mouse: hover drives it, leaving releases it.
     Touch/pen: tap or horizontal drag drives it, then it lets go shortly after lift. */
  function pointer(stage, onChange) {
    var p = { x: 0, y: 0, active: false, travel: 0 };
    var releaseTimer = 0;
    stage.classList.add('interactive');
    function set(e) {
      var r = stage.getBoundingClientRect();
      var nx = e.clientX - r.left, ny = e.clientY - r.top;
      if (p.active) p.travel += Math.hypot(nx - p.x, ny - p.y);
      p.x = nx; p.y = ny;
      p.active = true;
      clearTimeout(releaseTimer);
      onChange();
    }
    function release(delay) {
      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(function () { p.active = false; onChange(); }, delay);
    }
    stage.addEventListener('pointermove', set);
    stage.addEventListener('pointerdown', set);
    stage.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') release(0); });
    stage.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') release(1400); });
    stage.addEventListener('pointercancel', function () { release(600); });
    return p;
  }

  ErberFX.mini = { Surface: Surface, dial: dial, aim: aim, ease: ease, pointer: pointer, g: g };
})();
