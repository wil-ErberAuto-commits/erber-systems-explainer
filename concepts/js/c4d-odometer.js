/* 04d — Mouse Miles: a half-dial speedometer beside rolling odometer drums,
   Bayer-dithered. The needle reads pointer speed; the drums count how far
   the pointer has travelled this visit, in inches. With reduced motion the
   needle reads pointer x instead and the drums snap rather than roll. */
ErberFX.register('tach-odo', function (stage) {
  var M = ErberFX.mini, P = ErberFX.PALETTE, PI = Math.PI;
  var row = stage.querySelector('[data-surface]');
  var dialSlot = row.querySelector('.odo-dial');
  var drumSlot = row.querySelector('.odo-drums');
  var surf = new M.Surface(row, 1, 'bayer', P.navy);
  var o = { a0: PI, sweep: PI, max: 100, majors: 5, minors: 2, redFrom: 80, value: 0, ringFull: false };
  var DIGITS = 6;
  var lastTravel = 0, speed = 0;
  var ptr = M.pointer(stage, function () { if (ErberFX.isStill()) frame(2, 0); });

  function resize() { surf.resize(); }

  function rel(el) {
    var r = el.getBoundingClientRect();
    return {
      x: (r.left - surf.rect.left) / surf.S, y: (r.top - surf.rect.top) / surf.S,
      w: r.width / surf.S, h: r.height / surf.S
    };
  }

  function drums(c, box, v, still, redPass) {
    var cw = box.w / DIGITS, ch = box.h;
    c.save();
    c.font = '600 ' + Math.round(ch * 0.66) + 'px "General Sans"';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    for (var i = 0; i < DIGITS; i++) {
      var x = box.x + box.w - (i + 1) * cw;
      var isTenths = i === 0;
      if (redPass && !isTenths) continue;
      var pos;
      if (still) {
        pos = Math.floor(v / Math.pow(10, i)) % 10;
      } else if (isTenths) {
        pos = v % 10;
      } else {
        var p10 = Math.pow(10, i);
        pos = Math.floor(v / p10) % 10 + Math.max(0, (v % p10) - (p10 - 1));
      }
      c.save();
      c.beginPath();
      c.rect(x + 1, box.y, cw - 2, ch);
      c.clip();
      if (!redPass) {
        var drum = c.createLinearGradient(0, box.y, 0, box.y + ch);
        drum.addColorStop(0, M.g(0));
        drum.addColorStop(0.5, M.g(0.3));
        drum.addColorStop(1, M.g(0));
        c.fillStyle = drum;
        c.fillRect(x + 1, box.y, cw - 2, ch);
      }
      var d = Math.floor(pos), f = pos - d;
      c.fillStyle = M.g(1);
      c.fillText(String(d % 10), x + cw / 2, box.y + ch * (0.53 - f));
      c.fillText(String((d + 1) % 10), x + cw / 2, box.y + ch * (1.53 - f));
      if (!redPass) {
        var shade = c.createLinearGradient(0, box.y, 0, box.y + ch);
        shade.addColorStop(0, 'rgba(0,0,0,0.85)');
        shade.addColorStop(0.3, 'rgba(0,0,0,0)');
        shade.addColorStop(0.7, 'rgba(0,0,0,0)');
        shade.addColorStop(1, 'rgba(0,0,0,0.85)');
        c.fillStyle = shade;
        c.fillRect(x, box.y, cw, ch);
      }
      c.restore();
    }
    if (!redPass) {
      c.strokeStyle = M.g(0.85);
      c.lineWidth = 1;
      c.strokeRect(box.x + 0.5, box.y - 1.5, box.w - 1, ch + 3);
    }
    c.restore();
  }

  function frame(t, dt) {
    var still = ErberFX.isStill();
    var sr = stage.getBoundingClientRect();
    surf.rect = row.getBoundingClientRect();
    var db = rel(dialSlot);
    o.R = Math.min(db.w / 2, db.h) * 0.9;
    o.cx = db.x + db.w / 2;
    o.cy = db.y + db.h * 0.5 + o.R * 0.45;

    var target;
    if (still) {
      target = ptr.active ? Math.max(0, Math.min(1, ptr.x / sr.width)) * o.max : 0;
    } else {
      var moved = ptr.travel - lastTravel;
      lastTravel = ptr.travel;
      if (dt > 0) speed += (moved / dt - speed) * (1 - Math.exp(-dt * 6));
      target = Math.min(o.max * 1.02, speed / 30);
    }
    o.value = M.ease(o.value, target, dt, 5);

    var v = ptr.travel / 96 * 10;
    var box = rel(drumSlot);
    surf.clear();
    M.dial(surf.l, o, false);
    M.dial(surf.r, o, true);
    drums(surf.l, box, v, still, false);
    drums(surf.r, box, v, still, true);
    surf.present();
  }

  return { fps: 30, resize: resize, frame: frame };
});
