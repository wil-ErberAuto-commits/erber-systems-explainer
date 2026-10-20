/* 04a — Cluster Strip: four small dials in one slim strip, Bayer-dithered.
   Every needle turns to look at the pointer; at rest they sit at idle. */
ErberFX.register('tach-strip', function (stage) {
  var M = ErberFX.mini, P = ErberFX.PALETTE, PI = Math.PI;
  var strip = stage.querySelector('[data-surface]');
  var slots = strip.querySelectorAll('.dial-slot');
  var surf = new M.Surface(strip, 1, 'bayer', P.navy);
  var top = { a0: PI * 7 / 6, sweep: PI * 2 / 3, cyOff: 0.28 };
  var specs = [
    { a0: PI * 0.75, sweep: PI * 1.5, max: 8, majors: 8, minors: 2, redFrom: 6.5, rest: 0.9, wob: 0.05 },
    { a0: top.a0, sweep: top.sweep, cyOff: top.cyOff, max: 1, majors: 4, minors: 2, redFrom: 0.85, rest: 0.5, wob: 0.004 },
    { a0: top.a0, sweep: top.sweep, cyOff: top.cyOff, max: 1, majors: 4, minors: 2, rest: 0.62, wob: 0 },
    { a0: PI, sweep: PI, cyOff: 0.22, max: 80, majors: 4, minors: 2, rest: 40, wob: 0.6, ringFull: false }
  ];
  specs.forEach(function (s) { s.value = s.rest; });
  var ptr = M.pointer(stage, function () { if (ErberFX.isStill()) frame(2, 0); });

  function resize() { surf.resize(); }

  function frame(t, dt) {
    var sr = stage.getBoundingClientRect();
    surf.rect = strip.getBoundingClientRect();
    surf.clear();
    for (var i = 0; i < specs.length; i++) {
      var s = specs[i];
      var r = slots[i].getBoundingClientRect();
      s.R = Math.min(r.width, r.height) / 2 / surf.S * 0.94;
      s.cx = (r.left - surf.rect.left + r.width / 2) / surf.S;
      s.cy = (r.top - surf.rect.top + r.height / 2) / surf.S + (s.cyOff || 0) * s.R;
      var target = s.rest;
      if (ptr.active) {
        var p = surf.local(sr, ptr.x, ptr.y);
        target = M.aim(s, p[0], p[1]);
      } else if (!ErberFX.isStill()) {
        target += Math.sin(t * 3.1 + i) * s.wob * s.max / 8;
      }
      s.value = M.ease(s.value, target, dt, 7);
      M.dial(surf.l, s, false);
      M.dial(surf.r, s, true);
    }
    surf.present();
  }

  return { fps: 30, resize: resize, frame: frame };
});
