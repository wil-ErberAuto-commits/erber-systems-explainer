/* 04c — Instrument Row: three mini dials in one dashboard card, Atkinson
   dithered. Pointer x is the throttle; each dial answers at its own pace. */
ErberFX.register('tach-row', function (stage) {
  var M = ErberFX.mini, P = ErberFX.PALETTE, PI = Math.PI;
  var row = stage.querySelector('[data-surface]');
  var slots = row.querySelectorAll('.dial-slot');
  var surf = new M.Surface(row, 2, 'atkinson', P.navy);
  var specs = [
    { a0: PI * 0.75, sweep: PI * 1.5, max: 8, majors: 8, minors: 2, redFrom: 6.5, rest: 0.85, map: function (k) { return 0.85 + 7 * k; }, rate: 8 },
    { a0: PI * 0.75, sweep: PI * 1.5, max: 140, majors: 7, minors: 2, rest: 0, map: function (k) { return 125 * k; }, rate: 1.6 },
    { a0: PI * 7 / 6, sweep: PI * 2 / 3, cyOff: 0.22, scale: 0.84, max: 1, majors: 4, minors: 2, redFrom: 0.85, rest: 0.45, map: function (k) { return 0.45 + 0.48 * k; }, rate: 0.6 }
  ];
  specs.forEach(function (s) { s.value = s.rest; });
  var ptr = M.pointer(stage, function () { if (ErberFX.isStill()) frame(2, 0); });

  function resize() { surf.resize(); }

  function frame(t, dt) {
    var sr = stage.getBoundingClientRect();
    var k = ptr.active ? Math.max(0, Math.min(1, ptr.x / sr.width)) : -1;
    surf.rect = row.getBoundingClientRect();
    surf.clear();
    for (var i = 0; i < specs.length; i++) {
      var s = specs[i];
      var r = slots[i].getBoundingClientRect();
      s.R = Math.min(r.width, r.height) / 2 / surf.S * (s.scale || 0.92);
      s.cx = (r.left - surf.rect.left + r.width / 2) / surf.S;
      s.cy = (r.top - surf.rect.top + r.height / 2) / surf.S + (s.cyOff || 0) * s.R;
      var target = k < 0 ? s.rest : s.map(k);
      if (k < 0 && i === 0 && !ErberFX.isStill()) target += 0.04 * Math.sin(t * 3.2);
      s.value = M.ease(s.value, target, dt, s.rate);
      M.dial(surf.l, s, false);
      M.dial(surf.r, s, true);
    }
    surf.present();
  }

  return { fps: 30, resize: resize, frame: frame };
});
