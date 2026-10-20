/* 05 — Pointer Field: a WebGL fragment shader that turns a slow flow-noise
   field into a glyph grid. The pointer warms the glyphs it passes over and
   sends a faint red ripple out. Falls back to a 2D canvas without WebGL. */
ErberFX.register('ascii-field', function (stage, P) {
  var CELL_W = 10, CELL_H = 18;
  var RAMP = ' .:-=+*#%@';
  var cv = ErberFX.canvas(stage);
  var gl = cv.getContext('webgl', { antialias: false, preserveDrawingBuffer: true });
  var dpr = 1, w = 0, h = 0;
  var target = { x: 0, y: 0, on: false }, mouse = { x: 0, y: 0, amt: 0 };
  var lastT = 2;

  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FRAG = [
    'precision mediump float;',
    'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uAmt;',
    'uniform sampler2D uAtlas;uniform vec2 uCell;uniform float uGlyphs;',
    'uniform vec3 uDark;uniform vec3 uNavy;uniform vec3 uRed;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    ' return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}',
    'void main(){',
    ' vec2 frag=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);',
    ' vec2 cell=floor(frag/uCell);vec2 local=fract(frag/uCell);',
    ' vec2 p=(cell+.5)*uCell/uRes.y;',
    ' float t=uTime*.035;',
    ' vec2 q=vec2(fbm(p*2.2+vec2(t,0.)),fbm(p*2.2+vec2(0.,-t)+4.));',
    ' float f=fbm(p*1.5+1.9*q+vec2(t*.6,t*.25));',
    ' float band=abs(fract(f*8.)-.5)*2.;',
    ' float v=smoothstep(.3,.82,f)*.72+(1.-smoothstep(0.,.16,band))*.3*smoothstep(.2,.6,f);',
    ' vec2 m=uMouse/uRes.y;float d=distance(p,m);',
    ' float lens=exp(-d*d*26.)*uAmt;',
    ' float ph=fract(uTime*.22);',
    ' float ring=exp(-pow((d-ph*.55)*30.,2.))*(1.-ph)*uAmt;',
    ' v=clamp(v+lens*.6+ring*.25,0.,1.);',
    ' float gi=floor(v*(uGlyphs-1.)+.5);',
    ' float glyph=texture2D(uAtlas,vec2((gi+local.x)/uGlyphs,local.y)).r;',
    ' vec3 ink=mix(mix(uNavy,vec3(1.),.28),vec3(1.),smoothstep(.5,1.,v));',
    ' ink=mix(ink,uRed,clamp(ring*1.3,0.,1.)*.8);',
    ' gl_FragColor=vec4(mix(uDark,ink,glyph),1.);',
    '}'
  ].join('\n');

  var prog, loc = {}, tex;

  function atlas() {
    var gw = 40, gh = 72;
    var a = document.createElement('canvas');
    a.width = gw * RAMP.length; a.height = gh;
    var c = a.getContext('2d');
    c.fillStyle = '#000'; c.fillRect(0, 0, a.width, a.height);
    c.fillStyle = '#fff';
    c.font = '600 ' + Math.round(gh * 0.62) + 'px "General Sans"';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (var i = 0; i < RAMP.length; i++) c.fillText(RAMP[i], gw * (i + 0.5), gh * 0.52);
    return a;
  }

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  function initGL() {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var pl = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(pl);
    gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);
    ['uRes', 'uTime', 'uMouse', 'uAmt', 'uAtlas', 'uCell', 'uGlyphs', 'uDark', 'uNavy', 'uRed'].forEach(function (n) {
      loc[n] = gl.getUniformLocation(prog, n);
    });
    tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(loc.uAtlas, 0);
    gl.uniform1f(loc.uGlyphs, RAMP.length);
    function col(c) { return [c[0] / 255, c[1] / 255, c[2] / 255]; }
    gl.uniform3fv(loc.uDark, col(P.dark));
    gl.uniform3fv(loc.uNavy, col(P.navy));
    gl.uniform3fv(loc.uRed, col(P.red));
  }

  var fallback = null;
  if (gl) {
    try { initGL(); } catch (e) { console.warn(e); gl = null; }
  }
  if (!gl) {
    cv.remove();
    cv = ErberFX.canvas(stage);
    fallback = cv.getContext('2d');
  }

  stage.addEventListener('pointermove', function (e) {
    var r = stage.getBoundingClientRect();
    target.x = e.clientX - r.left; target.y = e.clientY - r.top; target.on = true;
    if (ErberFX.isStill()) { mouse.x = target.x; mouse.y = target.y; mouse.amt = 1; frame(lastT, 0); }
  });
  stage.addEventListener('pointerleave', function () { target.on = false; });

  function resize(cw, ch) {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cw; h = ch;
    cv.width = Math.round(cw * dpr);
    cv.height = Math.round(ch * dpr);
    if (!target.on) { mouse.x = w * 0.66; mouse.y = h * 0.42; mouse.amt = 0.8; }
  }

  function updatePointer(t, dt) {
    if (!target.on) {
      target.x = w * (0.6 + 0.18 * Math.sin(t * 0.21));
      target.y = h * (0.45 + 0.16 * Math.sin(t * 0.17 + 1));
    }
    var k = dt ? 1 - Math.exp(-dt * 4) : 1;
    mouse.x += (target.x - mouse.x) * k;
    mouse.y += (target.y - mouse.y) * k;
    mouse.amt += ((target.on ? 1 : 0.8) - mouse.amt) * k;
  }

  function frame(t, dt) {
    lastT = t;
    if (!ErberFX.isStill()) updatePointer(t, dt);
    if (gl) {
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(loc.uRes, cv.width, cv.height);
      gl.uniform1f(loc.uTime, t);
      gl.uniform2f(loc.uMouse, mouse.x * dpr, mouse.y * dpr);
      gl.uniform1f(loc.uAmt, mouse.amt);
      gl.uniform2f(loc.uCell, CELL_W * dpr, CELL_H * dpr);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return;
    }
    drawFallback(t);
  }

  function drawFallback(t) {
    var c = fallback;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = 'rgb(' + P.dark.join(',') + ')';
    c.fillRect(0, 0, w, h);
    c.font = '600 ' + (CELL_H * 0.62) + 'px "General Sans"';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#fff';
    for (var y = 0; y < h / CELL_H; y++) {
      for (var x = 0; x < w / CELL_W; x++) {
        var px = x * CELL_W, py = y * CELL_H;
        var v = 0.5 + 0.25 * Math.sin(px * 0.008 + t * 0.2) * Math.cos(py * 0.011 - t * 0.15);
        var dx = px - mouse.x, dy = py - mouse.y;
        v += 0.5 * Math.exp(-(dx * dx + dy * dy) / 16000) * mouse.amt;
        var i = Math.max(0, Math.min(RAMP.length - 1, Math.round((v - 0.35) * 1.6 * (RAMP.length - 1))));
        if (i) c.fillText(RAMP[i], px + CELL_W / 2, py + CELL_H / 2);
      }
    }
  }

  return { fps: 30, resize: resize, frame: frame };
});
