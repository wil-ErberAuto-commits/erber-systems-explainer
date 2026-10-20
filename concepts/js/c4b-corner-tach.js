/* 04b — Corner Tach: one small tach tucked into the header's right corner,
   Floyd–Steinberg dithered. It revs as the pointer gets closer. */
ErberFX.register('tach-corner', function (stage) {
  var M = ErberFX.mini, P = ErberFX.PALETTE;
  var slot = stage.querySelector('[data-surface]');
  var surf = new M.Surface(slot, 1, 'fs', P.dark);
  var o = { a0: Math.PI * 0.75, sweep: Math.PI * 1.5, max: 8, majors: 8, minors: 2, redFrom: 6.5, value: 0.85 };
  var ptr = M.pointer(stage, function () { if (ErberFX.isStill()) frame(2, 0); });

  function resize() { surf.resize(); }

  function frame(t, dt) {
    var sr = stage.getBoundingClientRect();
    surf.rect = slot.getBoundingClientRect();
    o.R = Math.min(surf.W, surf.H) / 2 * 0.9;
    o.cx = surf.W / 2;
    o.cy = surf.H / 2;
    var target = 0.85;
    if (ptr.active) {
      var cx = surf.rect.left - sr.left + surf.rect.width / 2;
      var cy = surf.rect.top - sr.top + surf.rect.height / 2;
      var d = Math.hypot(ptr.x - cx, ptr.y - cy);
      var k = Math.max(0, 1 - d / (sr.width * 0.6));
      target = 0.85 + 7.1 * Math.pow(k, 2.2);
    } else if (!ErberFX.isStill()) {
      target += 0.04 * Math.sin(t * 3.3) + 0.02 * Math.sin(t * 8.1);
    }
    o.value = M.ease(o.value, target, dt, target > o.value ? 8 : 3);
    surf.clear();
    M.dial(surf.l, o, false);
    M.dial(surf.r, o, true);
    surf.present();
  }

  return { fps: 30, resize: resize, frame: frame };
});
