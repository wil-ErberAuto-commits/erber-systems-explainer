/* Shared runtime for the concept gallery: registration, visibility-aware
   animation loop, reduced-motion handling and dithering helpers. */
(function () {
  'use strict';

  var PALETTE = {
    navy: [15, 47, 102],
    dark: [5, 13, 87],
    red: [236, 48, 19],
    white: [255, 255, 255]
  };

  var factories = {};
  var instances = [];
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function register(id, factory) {
    factories[id] = factory;
  }

  function bayer(n) {
    var m = [[0]];
    for (var size = 1; size < n; size *= 2) {
      var next = [];
      for (var y = 0; y < size * 2; y++) next.push(new Array(size * 2));
      for (var y2 = 0; y2 < size; y2++) {
        for (var x2 = 0; x2 < size; x2++) {
          var v = m[y2][x2] * 4;
          next[y2][x2] = v;
          next[y2][x2 + size] = v + 2;
          next[y2 + size][x2] = v + 3;
          next[y2 + size][x2 + size] = v + 1;
        }
      }
      m = next;
    }
    var out = new Float32Array(n * n);
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) out[i * n + j] = (m[i][j] + 0.5) / (n * n);
    }
    return out;
  }

  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  function canvas(stage, className) {
    var c = document.createElement('canvas');
    c.className = 'fx' + (className ? ' ' + className : '');
    c.setAttribute('aria-hidden', 'true');
    stage.insertBefore(c, stage.firstChild);
    return c;
  }

  /* Luminance buffer (0..1) -> 1-bit via Floyd–Steinberg or Atkinson. */
  function errorDiffuse(lum, w, h, kind, out) {
    var buf = out.err || (out.err = new Float32Array(w * h));
    if (buf.length !== w * h) buf = out.err = new Float32Array(w * h);
    buf.set(lum);
    var bits = out.bits || (out.bits = new Uint8Array(w * h));
    if (bits.length !== w * h) bits = out.bits = new Uint8Array(w * h);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var i = y * w + x;
        var old = buf[i];
        var on = old >= 0.5 ? 1 : 0;
        bits[i] = on;
        var e = old - on;
        if (kind === 'atkinson') {
          e /= 8;
          if (x + 1 < w) buf[i + 1] += e;
          if (x + 2 < w) buf[i + 2] += e;
          if (y + 1 < h) {
            if (x > 0) buf[i + w - 1] += e;
            buf[i + w] += e;
            if (x + 1 < w) buf[i + w + 1] += e;
          }
          if (y + 2 < h) buf[i + 2 * w] += e;
        } else {
          if (x + 1 < w) buf[i + 1] += e * 7 / 16;
          if (y + 1 < h) {
            if (x > 0) buf[i + w - 1] += e * 3 / 16;
            buf[i + w] += e * 5 / 16;
            if (x + 1 < w) buf[i + w + 1] += e * 1 / 16;
          }
        }
      }
    }
    return bits;
  }

  function grainTile() {
    var size = 160;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(size, size);
    var r = rng(7);
    for (var i = 0; i < size * size; i++) {
      var v = (r() + r() + r()) / 3 * 255;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 22;
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }

  function boot() {
    var params = new URLSearchParams(location.search);
    var solo = params.get('c');
    var sections = document.querySelectorAll('.concept');

    if (solo) {
      document.body.classList.add('solo');
      sections.forEach(function (s) { s.hidden = s.dataset.c !== solo; });
    }
    if (params.has('still')) document.body.classList.add('force-still');

    document.documentElement.style.setProperty('--grain', 'url(' + grainTile() + ')');

    sections.forEach(function (section) {
      if (section.hidden) return;
      var stage = section.querySelector('.stage');
      var factory = factories[section.dataset.fx];
      if (!stage || !factory) return;
      var inst = factory(stage, PALETTE);
      inst.stage = stage;
      inst.visible = true;
      inst.last = -1;
      inst.fps = inst.fps || 30;
      inst.still = inst.still == null ? 2 : inst.still;
      instances.push(inst);

      new ResizeObserver(function () {
        var r = stage.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        inst.resize(r.width, r.height);
        inst.ready = true;
        inst.frame(isStill() ? inst.still : now(), 0);
        inst.last = -1;
      }).observe(stage);

      new IntersectionObserver(function (entries) {
        inst.visible = entries[0].isIntersecting;
      }, { rootMargin: '120px' }).observe(stage);
    });

    reduceQuery.addEventListener('change', function () {
      instances.forEach(function (inst) {
        if (inst.ready) inst.frame(inst.still, 0);
      });
    });

    function tick() {
      requestAnimationFrame(tick);
      if (isStill() || document.hidden) return;
      var t = now();
      for (var i = 0; i < instances.length; i++) {
        var inst = instances[i];
        if (!inst.ready || !inst.visible) continue;
        if (inst.last >= 0 && t - inst.last < 1 / inst.fps) continue;
        var dt = inst.last < 0 ? 0 : t - inst.last;
        inst.last = t;
        inst.frame(t, dt);
      }
    }
    requestAnimationFrame(tick);
  }

  var startedAt = performance.now();
  function now() {
    return (performance.now() - startedAt) / 1000 + 2;
  }

  function isStill() {
    return reduceQuery.matches || document.body.classList.contains('force-still');
  }

  function whenFontsReady(cb) {
    var loads = ['500', '600', '700'].map(function (w) {
      return document.fonts.load(w + ' 64px "General Sans"');
    });
    Promise.all(loads).then(cb, cb);
  }

  window.ErberFX = {
    PALETTE: PALETTE,
    register: register,
    bayer: bayer,
    rng: rng,
    canvas: canvas,
    errorDiffuse: errorDiffuse,
    isStill: isStill,
    boot: function () { whenFontsReady(boot); }
  };
})();
