/* AI in Motion — Mathematics for ML kits (linear algebra, calculus, probability, statistics, information). © Janin A Apurba, CSE, AUST */
(function (M) {
  'use strict';
  var R = function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  var gauss = function (r) { var u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
  var nf = function (v, d) { var s = (+v).toFixed(d == null ? 2 : d); if (/^-0\.?0*$/.test(s)) s = s.slice(1); return s.replace('-', '−'); };
  var ni = function (v, d) { return Math.abs(v - Math.round(v)) < 1e-9 ? nf(v, 0) : nf(v, d == null ? 1 : d); };
  var vs = function (v, d) { return '[' + v.map(function (x) { return ni(x, d); }).join(', ') + ']'; };
  var I2 = [[1, 0], [0, 1]];
  var lerpM = function (A, B, s) { return A.map(function (r, i) { return r.map(function (v, j) { return v + (B[i][j] - v) * s; }); }); };
  var mul = function (A, B) { return [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]]; };
  var rot = function (a) { return [[Math.cos(a), -Math.sin(a)], [Math.sin(a), Math.cos(a)]]; };
  var app = function (m, v) { return [m[0][0] * v[0] + m[0][1] * v[1], m[1][0] * v[0] + m[1][1] * v[1]]; };
  var pdf = function (x, mu, s) { return Math.exp(-(x - mu) * (x - mu) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI)); };
  function lgamma(z) { var c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5], y = z, tmp = z + 5.5, ser = 1.000000000190015; tmp -= (z + .5) * Math.log(tmp); for (var j = 0; j < 6; j++) ser += c[j] / ++y; return -tmp + Math.log(2.5066282746310005 * ser / z); }
  var betaPdf = function (x, a, b) { return x <= 0 || x >= 1 ? 0 : Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - (lgamma(a) + lgamma(b) - lgamma(a + b))); };

  function plane(g, cx, cy, u, ex, ey, a) {
    for (var i = -ex; i <= ex; i++) g.line(cx + i * u, cy - ey * u, cx + i * u, cy + ey * u, { color: i ? 'rgba(120,140,220,.13)' : '#56629c', lw: i ? 1 : 2, alpha: a });
    for (var j = -ey; j <= ey; j++) g.line(cx - ex * u, cy + j * u, cx + ex * u, cy + j * u, { color: j ? 'rgba(120,140,220,.13)' : '#56629c', lw: j ? 1 : 2, alpha: a });
  }
  function vec(g, cx, cy, u, x0, y0, x1, y1, c, o) {
    o = o || {}; if (o.alpha != null && o.alpha <= 0) return;
    g.arrow(cx + x0 * u, cy - y0 * u, cx + x1 * u, cy - y1 * u, { color: c, lw: o.lw || 5, head: o.head || 16, glow: o.dash ? null : c, p: o.p, alpha: o.alpha, dash: o.dash });
    if (o.label) g.text(o.label, cx + x1 * u + (o.lx == null ? 12 : o.lx), cy - y1 * u + (o.ly == null ? -18 : o.ly), { size: o.size || 22, weight: 700, color: c, alpha: o.alpha == null ? 1 : o.alpha, head: true });
  }
  function clip(g, x, y, w, h, fn) { var c = g.ctx; c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); fn(); c.restore(); }
  function sidePanel(g, p, x, y, w, h, lines, st) {
    g.panel(x, y, w, h, { alpha: g.E.out(g.seg(p, st || .04, (st || .04) + .1)) });
    var yy = y + 38;
    lines.forEach(function (l) { if (!l) return; var o = l[2] || {}, a = o.a == null ? 1 : o.a; if (a > 0) g.text(l[0], x + 26, yy, { size: o.size || 21, weight: o.w || 600, color: l[1] || g.C.ink, mono: !!o.mono, alpha: a, maxW: w - 48, lh: 26 }); yy += o.gap || 46; });
  }
  function matrix(g, x, y, m, o) {
    o = o || {}; var size = o.size || 26, cw = o.cw || 76, rh = size * 1.55, rows = m.length, cols = m[0].length, h = rows * rh + 8, w = cols * cw + 20, a = o.alpha == null ? 1 : o.alpha, c = o.color || '#aab3d8';
    g.path([[x + 12, y], [x, y], [x, y + h], [x + 12, y + h]], { color: c, lw: 3, alpha: a });
    g.path([[x + w - 12, y], [x + w, y], [x + w, y + h], [x + w - 12, y + h]], { color: c, lw: 3, alpha: a });
    m.forEach(function (r, i) { r.forEach(function (v, j) { g.text(typeof v === 'string' ? v : ni(v, o.dec), x + 10 + j * cw + cw / 2, y + 4 + i * rh + rh / 2 + 1, { size: size, weight: 700, mono: true, align: 'center', color: o.colors ? (o.colors[j] || o.colors[0]) : g.C.ink, alpha: a }); }); });
    return w;
  }
  M.mathUtil = { plane: plane, vec: vec, matrix: matrix, nf: nf };

  /* ---------- vectors: add, scale, dot product, basis ---------- */
  M.kit('vectors', {
    draw: function (g, p, P, S, t) {
      var mode = P.mode || 'add', a = P.a || [3, 1], b = P.b || [1, 2], cx = 420, cy = 440, u = 56, C = g.C;
      g.heading(P.head || { add: 'Adding vectors', scale: 'Scaling a vector', dot: 'The dot product', basis: 'Basis vectors' }[mode], p, P.sub);
      plane(g, cx, cy, u, 6, 4, g.E.out(g.seg(p, 0, .08)));
      var L = [];
      if (mode === 'add') {
        var q1 = g.E.out(g.seg(p, .06, .2)), q2 = g.E.out(g.seg(p, .22, .36)), q3 = g.E.inOut(g.seg(p, .4, .6)), q4 = g.E.out(g.seg(p, .64, .8)), s = [a[0] + b[0], a[1] + b[1]];
        if (q3 > 0) vec(g, cx, cy, u, 0, 0, b[0], b[1], C.pink, { alpha: .3 * q2, dash: [6, 6], lw: 3 });
        vec(g, cx, cy, u, 0, 0, a[0], a[1], C.cyan, { p: q1, label: q1 > .95 ? 'a' : '' });
        vec(g, cx, cy, u, a[0] * q3, a[1] * q3, a[0] * q3 + b[0], a[1] * q3 + b[1], C.pink, { alpha: q2, label: q4 > .5 ? '' : 'b' });
        if (q4 > .5) g.text('b', cx + (a[0] + b[0] * .5) * u - 22, cy - (a[1] + b[1] * .5) * u, { size: 22, weight: 700, color: C.pink, head: true });
        vec(g, cx, cy, u, 0, 0, s[0], s[1], C.amber, { p: q4, label: q4 > .95 ? 'a + b' : '', lw: 6 });
        L = [['a = ' + vs(a), C.cyan, { a: q1, mono: true }], ['b = ' + vs(b), C.pink, { a: q2, mono: true }], ['Slide b to the tip of a', C.muted, { a: q3 }], ['a + b = [' + a[0] + '+' + b[0] + ', ' + a[1] + '+' + b[1] + ']', C.amber, { a: q4, mono: true }], ['      = ' + vs(s), C.amber, { a: q4, mono: true }], ['Add component by component', C.ink, { a: g.seg(p, .82, .9) }]];
      } else if (mode === 'scale') {
        var cs = P.cs || [1, 2, -1, .5], n = cs.length, pos = g.seg(p, .1, .95) * n, k = Math.min(n - 1, Math.floor(pos)), f = g.E.inOut(g.seg(pos - k, 0, .4)), c = k ? g.lerp(cs[k - 1], cs[k], f) : cs[0];
        vec(g, cx, cy, u, 0, 0, a[0], a[1], C.cyan, { alpha: .35, lw: 3, label: 'v' });
        vec(g, cx, cy, u, 0, 0, c * a[0], c * a[1], C.amber, { p: g.E.out(g.seg(p, .05, .15)), lw: 6, label: 'c·v', lx: c < 0 ? -60 : 12 });
        var what = c < 0 ? 'Negative c flips the direction' : c > 1.01 ? 'c > 1 stretches' : c < .99 ? '0 < c < 1 shrinks' : 'c = 1 leaves v unchanged';
        L = [['v = ' + vs(a), C.cyan, { mono: true }], ['c = ' + nf(c), C.amber, { mono: true, size: 26 }], ['c·v = ' + vs([c * a[0], c * a[1]], 2), C.amber, { mono: true }], [what, C.ink], ['Direction stays on the same line; only length (and sign) change', C.muted, { size: 18 }]];
      } else if (mode === 'dot') {
        var la = Math.hypot(a[0], a[1]), lb = Math.hypot(b[0], b[1]), th0 = Math.atan2(b[1], b[0]), tha = Math.atan2(a[1], a[0]);
        var th = P.sweep ? tha + g.lerp(.3, 2.8, g.E.inOut(g.seg(p, .35, .92))) : th0, bb = [lb * Math.cos(th), lb * Math.sin(th)];
        var d = a[0] * bb[0] + a[1] * bb[1], pr = d / (la * la), pj = [a[0] * pr, a[1] * pr], ang = Math.acos(Math.max(-1, Math.min(1, d / (la * lb)))), q = g.E.out(g.seg(p, .06, .2)), qb = g.E.out(g.seg(p, .18, .3)), qp = g.seg(p, .3, .4);
        var line = function (s) { g.line(cx - a[0] / la * s * u, cy + a[1] / la * s * u, cx + a[0] / la * s * u, cy - a[1] / la * s * u, { color: 'rgba(34,211,238,.22)', lw: 2, dash: [6, 8], alpha: qp }); }; line(8);
        g.line(cx + bb[0] * u, cy - bb[1] * u, cx + pj[0] * u, cy - pj[1] * u, { color: C.muted, lw: 2, dash: [5, 6], alpha: qp });
        vec(g, cx, cy, u, 0, 0, pj[0], pj[1], d >= 0 ? C.green : C.red, { alpha: qp, lw: 9, head: 1, label: '' });
        vec(g, cx, cy, u, 0, 0, a[0], a[1], C.cyan, { p: q, label: 'a' });
        vec(g, cx, cy, u, 0, 0, bb[0], bb[1], C.pink, { alpha: qb, label: 'b' });
        var ctx = g.ctx; ctx.save(); ctx.globalAlpha *= qp; ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.beginPath(); var s1 = -tha, s2 = -th; ctx.arc(cx, cy, 44, Math.min(s1, s2), Math.max(s1, s2)); ctx.stroke(); ctx.restore();
        var sign = d > .05 ? ['> 0: they point the same way', C.green] : d < -.05 ? ['< 0: they point in opposite ways', C.red] : ['≈ 0: perpendicular (orthogonal)', C.amber];
        L = [['a · b = a₁b₁ + a₂b₂', C.ink, { mono: true, a: q }], ['= ' + nf(a[0], 1) + '×' + nf(bb[0]) + ' + ' + nf(a[1], 1) + '×' + nf(bb[1]), C.muted, { mono: true, size: 18, a: qb }], ['= ' + nf(d), d >= 0 ? C.green : C.red, { mono: true, size: 30, a: qb }], ['= |a| |b| cos θ', C.ink, { mono: true, a: qp }], ['θ = ' + nf(ang * 180 / Math.PI, 1) + '°', C.amber, { mono: true, a: qp }], [sign[0], sign[1], { a: qp }], ['Green bar: the projection of b onto a', C.muted, { size: 17, a: qp }]];
      } else {
        var v = a, qi = g.E.out(g.seg(p, .05, .2)), qx = g.seg(p, .24, .5), qy = g.seg(p, .5, .7), qv = g.E.out(g.seg(p, .72, .86)), nx = Math.abs(v[0]), ny = Math.abs(v[1]), sx = v[0] < 0 ? -1 : 1, sy = v[1] < 0 ? -1 : 1;
        for (var i = 0; i < nx; i++) vec(g, cx, cy, u, i * sx, 0, (i + 1) * sx, 0, C.green, { alpha: g.seg(qx * nx - i, 0, 1), lw: 4, head: 12 });
        for (var j = 0; j < ny; j++) vec(g, cx, cy, u, v[0], j * sy, v[0], (j + 1) * sy, C.pink, { alpha: g.seg(qy * ny - j, 0, 1), lw: 4, head: 12 });
        vec(g, cx, cy, u, 0, 0, 1, 0, C.green, { alpha: qi, lw: 6, label: 'î', ly: 28 });
        vec(g, cx, cy, u, 0, 0, 0, 1, C.pink, { alpha: qi, lw: 6, label: 'ĵ', lx: -30 });
        vec(g, cx, cy, u, 0, 0, v[0], v[1], C.amber, { p: qv, lw: 6, label: qv > .9 ? 'v' : '' });
        L = [['î = [1, 0]', C.green, { mono: true, a: qi }], ['ĵ = [0, 1]', C.pink, { mono: true, a: qi }], ['v = ' + v[0] + 'î + ' + v[1] + 'ĵ', C.amber, { mono: true, a: g.seg(p, .3, .4) }], ['  = ' + vs(v), C.amber, { mono: true, a: qv }], ['The numbers in a vector are "how much of each basis vector"', C.muted, { size: 18, a: qv }]];
      }
      sidePanel(g, p, 830, 190, 390, 470, L);
    }
  });

  /* ---------- a matrix as a transformation of space ---------- */
  M.kit('transform', {
    draw: function (g, p, P, S, t) {
      var m = P.m || [[1, 1], [0, 1]], m2 = P.m2, cx = 420, cy = 430, u = 50, C = g.C;
      g.heading(P.head || 'A matrix transforms space', p, P.sub);
      var q = g.E.inOut(g.seg(p, .12, m2 ? .42 : .62)), q2 = m2 ? g.E.inOut(g.seg(p, .55, .85)) : 0, Mq = lerpM(I2, m, q);
      if (m2 && q2 > 0) Mq = mul(lerpM(I2, m2, q2), m);
      var T = function (x, y) { var v = app(Mq, [x, y]); return [cx + v[0] * u, cy - v[1] * u]; }, a0 = g.E.out(g.seg(p, 0, .08));
      plane(g, cx, cy, u, 7, 5, a0 * .8);
      clip(g, cx - 7 * u, cy - 5 * u, 14 * u, 10 * u, function () {
        for (var i = -14; i <= 14; i++) { var A1 = T(i, -14), B1 = T(i, 14), A2 = T(-14, i), B2 = T(14, i); g.line(A1[0], A1[1], B1[0], B1[1], { color: g.hexA(C.cyan, i ? .32 : .8), lw: i ? 1.5 : 2.5, alpha: a0 }); g.line(A2[0], A2[1], B2[0], B2[1], { color: g.hexA(C.violet, i ? .32 : .8), lw: i ? 1.5 : 2.5, alpha: a0 }); }
        g.path([T(0, 0), T(1, 0), T(1, 1), T(0, 1), T(0, 0)], { color: C.amber, lw: 2, fill: g.hexA(C.amber, .28), alpha: a0 });
        if (P.v) { var pv = T(P.v[0], P.v[1]), o = T(0, 0); g.arrow(o[0], o[1], pv[0], pv[1], { color: C.orange, lw: 5, head: 15, glow: C.orange, alpha: g.seg(p, .06, .14) }); }
        var o2 = T(0, 0), ih = T(1, 0), jh = T(0, 1);
        g.arrow(o2[0], o2[1], ih[0], ih[1], { color: C.green, lw: 6, head: 16, glow: C.green, alpha: a0 });
        g.arrow(o2[0], o2[1], jh[0], jh[1], { color: C.pink, lw: 6, head: 16, glow: C.pink, alpha: a0 });
      });
      var det = Mq[0][0] * Mq[1][1] - Mq[0][1] * Mq[1][0], x0 = 810, sa = g.E.out(g.seg(p, .04, .14));
      g.panel(x0, 170, 410, 500, { alpha: sa });
      g.text(P.name || 'Matrix', x0 + 26, 206, { size: 22, weight: 700, head: true, color: P.accent || C.cyan, alpha: sa });
      matrix(g, x0 + 26, 236, Mq, { colors: [C.green, C.pink], dec: 2, cw: 92, alpha: sa });
      var yy = 360;
      [['î lands on (' + ni(Mq[0][0], 2) + ', ' + ni(Mq[1][0], 2) + ')', C.green], ['ĵ lands on (' + ni(Mq[0][1], 2) + ', ' + ni(Mq[1][1], 2) + ')', C.pink], ['det = ' + nf(det) + (Math.abs(det) < .02 ? '  → space squashed flat!' : det < 0 ? '  → orientation flipped' : ''), C.amber], ['Yellow square: area × |det|', C.muted]].forEach(function (l) { g.text(l[0], x0 + 26, yy, { size: 20, weight: 600, mono: l[1] !== C.muted, color: l[1], alpha: sa, maxW: 360 }); yy += 44; });
      if (m2) { var ma = g.seg(p, .5, .58); g.text('Then apply B = ' + vs(m2[0]) + ' ' + vs(m2[1]), x0 + 26, yy + 6, { size: 18, mono: true, color: C.cyan, alpha: ma, maxW: 370 }); g.text('Two steps in a row = one matrix B·A', x0 + 26, yy + 44, { size: 18, color: C.muted, alpha: ma }); }
    }
  });

  /* ---------- eigenvectors stay on their own line ---------- */
  M.kit('eigen', {
    init: function (P) {
      var m = P.m || [[2, 1], [1, 2]], a = m[0][0], b = m[0][1], c = m[1][0], d = m[1][1], tr = a + d, det = a * d - b * c, disc = tr * tr / 4 - det;
      if (disc < 0) return { real: false, m: m };
      var l1 = tr / 2 + Math.sqrt(disc), l2 = tr / 2 - Math.sqrt(disc);
      var ev = function (l) { var v = Math.abs(b) > 1e-9 ? [b, l - a] : Math.abs(c) > 1e-9 ? [l - d, c] : (Math.abs(l - a) < 1e-9 ? [1, 0] : [0, 1]), n = Math.hypot(v[0], v[1]); return [v[0] / n, v[1] / n]; };
      return { real: true, m: m, l: [l1, l2], v: [ev(l1), ev(l2)] };
    },
    draw: function (g, p, P, S, t) {
      var m = S.m || [[2, 1], [1, 2]], cx = 420, cy = 430, u = 55, C = g.C, q = g.E.inOut(g.seg(p, .16, .6)), Mq = lerpM(I2, m, q), a0 = g.E.out(g.seg(p, 0, .1)), hi = g.seg(p, .62, .72);
      g.heading(P.head || 'Eigenvectors: directions that do not turn', p, P.sub);
      plane(g, cx, cy, u, 7, 5, a0 * .8);
      clip(g, cx - 7 * u, cy - 5 * u, 14 * u, 10 * u, function () {
        if (S.real) S.v.forEach(function (v, k) { var c = k ? C.green : C.amber; g.line(cx - v[0] * 12 * u, cy + v[1] * 12 * u, cx + v[0] * 12 * u, cy - v[1] * 12 * u, { color: c, lw: 2, dash: [8, 8], alpha: hi * .8 }); });
        for (var k = 0; k < 16; k++) { var an = k / 16 * Math.PI * 2, v0 = [2 * Math.cos(an), 2 * Math.sin(an)], w = app(Mq, v0); g.arrow(cx, cy, cx + w[0] * u, cy - w[1] * u, { color: g.hexA(C.cyan, .55), lw: 3, head: 10, alpha: a0 }); }
        if (S.real) S.v.forEach(function (v, k) { var c = k ? C.green : C.amber; [1, -1].forEach(function (sg) { var w = app(Mq, [2 * v[0] * sg, 2 * v[1] * sg]); g.arrow(cx, cy, cx + w[0] * u, cy - w[1] * u, { color: c, lw: 6, head: 16, glow: c, alpha: a0 }); if (sg > 0) g.text('λ' + (k ? '₂' : '₁') + ' = ' + ni(S.l[k], 2), cx + w[0] * u + 14, cy - w[1] * u - 16, { size: 22, weight: 800, color: c, alpha: hi, head: true }); }); });
      });
      var L = S.real ? [['A v = λ v', C.ink, { size: 28, mono: true }], ['λ₁ = ' + ni(S.l[0], 2) + '   v₁ = ' + vs(S.v[0], 2), C.amber, { mono: true, size: 19, a: hi }], ['λ₂ = ' + ni(S.l[1], 2) + '   v₂ = ' + vs(S.v[1], 2), C.green, { mono: true, size: 19, a: hi }], ['Eigenvectors only stretch by λ; every other arrow gets turned off its line.', C.muted, { size: 18, a: hi, gap: 70 }]]
        : [['A v = λ v', C.ink, { size: 28, mono: true }], ['This matrix turns every direction:', C.muted], ['no real eigenvectors.', C.red]];
      sidePanel(g, p, 810, 170, 410, 500, [['Matrix A', P.accent || C.cyan, { w: 700 }]].concat(L));
      matrix(g, 1010, 186, m, { size: 22, cw: 64, alpha: g.E.out(g.seg(p, .04, .14)) });
    }
  });

  /* ---------- SVD: rotate, stretch, rotate ---------- */
  M.kit('svd', {
    init: function (P) {
      var A = P.m || [[2, 1], [0, 1.5]], a = A[0][0], b = A[0][1], c = A[1][0], d = A[1][1];
      var s11 = a * a + c * c, s12 = a * b + c * d, s22 = b * b + d * d, tr = s11 + s22, dt = s11 * s22 - s12 * s12, di = Math.sqrt(Math.max(0, tr * tr / 4 - dt)), l1 = tr / 2 + di, l2 = Math.max(0, tr / 2 - di);
      var v1 = Math.abs(s12) > 1e-9 ? [s12, l1 - s11] : (s11 >= s22 ? [1, 0] : [0, 1]), n1 = Math.hypot(v1[0], v1[1]); v1 = [v1[0] / n1, v1[1] / n1];
      var v2 = [-v1[1], v1[0]], sg = [Math.sqrt(l1), Math.sqrt(l2)], u1 = app(A, v1).map(function (x) { return x / sg[0]; }), u2 = sg[1] > 1e-9 ? app(A, v2).map(function (x) { return x / sg[1]; }) : [-u1[1], u1[0]];
      var U = [[u1[0], u2[0]], [u1[1], u2[1]]], detU = U[0][0] * U[1][1] - U[0][1] * U[1][0];
      return { A: A, phV: Math.atan2(v1[1], v1[0]), sg: sg, U: U, rotU: detU > 0, phU: Math.atan2(u1[1], u1[0]), v1: v1, v2: v2 };
    },
    draw: function (g, p, P, S, t) {
      var cx = 420, cy = 430, u = 62, C = g.C, s1 = g.E.inOut(g.seg(p, .12, .32)), s2 = g.E.inOut(g.seg(p, .38, .58)), s3 = g.E.inOut(g.seg(p, .64, .84));
      g.heading(P.head || 'SVD: every matrix is rotate · stretch · rotate', p, P.sub);
      var Vt = rot(-S.phV * s1), Sg = [[1 + (S.sg[0] - 1) * s2, 0], [0, 1 + (S.sg[1] - 1) * s2]], Uq = S.rotU ? rot(S.phU * s3) : lerpM(I2, S.U, s3), Mq = mul(Uq, mul(Sg, Vt)), a0 = g.E.out(g.seg(p, 0, .1));
      plane(g, cx, cy, u, 6, 4, a0 * .8);
      clip(g, cx - 6 * u, cy - 4 * u, 12 * u, 8 * u, function () {
        var circ = [], orig = [];
        for (var i = 0; i <= 90; i++) { var an = i / 90 * Math.PI * 2, w = app(Mq, [Math.cos(an), Math.sin(an)]); circ.push([cx + w[0] * u, cy - w[1] * u]); orig.push([cx + Math.cos(an) * u, cy - Math.sin(an) * u]); }
        g.path(orig, { color: 'rgba(170,180,230,.35)', lw: 2, dash: [5, 6], alpha: a0 });
        g.path(circ, { color: C.violet, lw: 3, fill: g.hexA(C.violet, .18), alpha: a0 });
        [[S.v1, C.amber, 'v₁'], [S.v2, C.green, 'v₂']].forEach(function (q) { var w = app(Mq, q[0]); g.arrow(cx, cy, cx + w[0] * u, cy - w[1] * u, { color: q[1], lw: 6, head: 15, glow: q[1], alpha: a0 }); });
      });
      var st = s3 > 0 ? 2 : s2 > 0 ? 1 : s1 > 0 ? 0 : -1, x0 = 810;
      g.panel(x0, 170, 410, 500, { alpha: a0 });
      g.text('A = U Σ Vᵀ', x0 + 26, 212, { size: 32, weight: 700, mono: true, color: P.accent || C.cyan, alpha: a0 });
      [['Vᵀ', 'rotate so v₁, v₂ line up with the axes'], ['Σ', 'stretch along the axes by σ₁ = ' + nf(S.sg[0]) + ', σ₂ = ' + nf(S.sg[1])], ['U', 'rotate into the final directions']].forEach(function (r, k) {
        var on = st === k, y = 280 + k * 110;
        g.box(x0 + 18, y - 30, 374, 92, { r: 14, fill: on ? g.hexA(C.amber, .16) : 'rgba(30,40,84,.4)', stroke: on ? C.amber : null, alpha: a0 });
        g.text((k + 1) + '. ' + r[0], x0 + 36, y - 6, { size: 22, weight: 800, mono: true, color: on ? C.amber : C.ink, alpha: a0 });
        g.text(r[1], x0 + 36, y + 26, { size: 17, color: C.muted, alpha: a0, maxW: 340, lh: 21 });
      });
      g.text('The circle becomes an ellipse with radii σ₁ and σ₂', x0 + 26, 636, { size: 16, color: C.muted, alpha: g.seg(p, .86, .94), maxW: 370 });
    }
  });

  /* ---------- matrix multiplication cell by cell ---------- */
  M.kit('matmul', {
    draw: function (g, p, P, S, t) {
      var A = P.A || [[1, 2, 0], [3, 1, 2]], B = P.B || [[2, 1], [0, 3], [1, 1]], m = A.length, n = A[0].length, k = B[0].length, C = g.C, Cm = [];
      for (var i = 0; i < m; i++) { Cm.push([]); for (var j = 0; j < k; j++) { var s = 0; for (var r = 0; r < n; r++) s += A[i][r] * B[r][j]; Cm[i].push(s); } }
      g.heading(P.head || 'Matrix multiplication', p, P.sub);
      var cs = Math.min(64, 330 / (n + m)), gw = n * cs + 30 + k * cs, cx0 = 640 - gw / 2 + n * cs + 30, by0 = 186, cy0 = by0 + n * cs + 26, ax0 = cx0 - 30 - n * cs, a0 = g.E.out(g.seg(p, 0, .1));
      var cells = m * k, prog = g.seg(p, .14, .86) * cells, cur = Math.min(cells - 1, Math.floor(prog)), f = prog - cur, ci = Math.floor(cur / k), cj = cur % k, active = p > .14 && p < .86;
      var cell = function (x, y, v, o) { g.box(x + 3, y + 3, cs - 6, cs - 6, { r: 10, fill: o.fill || 'rgba(40,52,100,.7)', stroke: o.stroke, lw: 2.5, glow: o.glow, alpha: a0 }); if (v !== '') g.text(String(v), x + cs / 2, y + cs / 2 + 1, { size: cs * .4, weight: 700, mono: true, align: 'center', color: o.color || C.ink, alpha: a0 * (o.alpha == null ? 1 : o.alpha) }); };
      A.forEach(function (row, i2) { row.forEach(function (v, j2) { var on = active && i2 === ci; cell(ax0 + j2 * cs, cy0 + i2 * cs, v, { fill: on ? g.hexA(C.cyan, .3) : null, stroke: on ? C.cyan : null, glow: on && f * n > j2 && f * n < j2 + 1 ? C.cyan : null }); }); });
      B.forEach(function (row, i2) { row.forEach(function (v, j2) { var on = active && j2 === cj; cell(cx0 + j2 * cs, by0 + i2 * cs, v, { fill: on ? g.hexA(C.pink, .3) : null, stroke: on ? C.pink : null, glow: on && f * n > i2 && f * n < i2 + 1 ? C.pink : null }); }); });
      Cm.forEach(function (row, i2) { row.forEach(function (v, j2) { var idx = i2 * k + j2, done = idx < cur || p >= .86 || (idx === cur && f > .85), on = active && idx === cur; cell(cx0 + j2 * cs, cy0 + i2 * cs, done ? v : '', { fill: on ? g.hexA(C.amber, .3) : done ? g.hexA(C.amber, .12) : 'rgba(30,40,80,.5)', stroke: on ? C.amber : null, glow: on ? C.amber : null, color: C.amber }); }); });
      g.text('A (' + m + '×' + n + ')', ax0 + n * cs / 2, cy0 + m * cs + 28, { size: 19, weight: 700, color: C.cyan, align: 'center', alpha: a0 });
      g.text('B (' + n + '×' + k + ')', cx0 + k * cs + 16, by0 + n * cs / 2, { size: 19, weight: 700, color: C.pink, alpha: a0 });
      g.text('C = AB (' + m + '×' + k + ')', cx0 + k * cs / 2, cy0 + m * cs + 28, { size: 19, weight: 700, color: C.amber, align: 'center', alpha: a0 });
      if (active || p >= .86) {
        var ii = p >= .86 ? m - 1 : ci, jj = p >= .86 ? k - 1 : cj, ff = p >= .86 ? 1 : f, terms = [];
        for (var r2 = 0; r2 < n; r2++) if (ff * n > r2) terms.push(A[ii][r2] + '×' + B[r2][jj]);
        g.text('c' + (ii + 1) + (jj + 1) + ' = row ' + (ii + 1) + ' · column ' + (jj + 1) + ' = ' + terms.join(' + ') + (ff > .85 ? ' = ' + Cm[ii][jj] : ''), 640, 640, { size: 24, weight: 600, mono: true, align: 'center', color: C.ink });
      }
      if (p > .88) g.text('(m×n) · (n×k) → (m×k): the inner sizes must match', 640, 688, { size: 19, color: C.muted, align: 'center', alpha: g.seg(p, .88, .95) });
    }
  });

  /* ---------- derivative: secant → tangent as h → 0 ---------- */
  M.kit('derivative', {
    draw: function (g, p, P, S, t) {
      var fs = P.f || 'x*x', f = M.compile(fs), x0 = P.x0 == null ? 1 : P.x0, xr = P.x || [-1, 3.2], yr = P.y || [-1, 10], bx = 110, by = 176, bw = 620, bh = 450, C = g.C;
      g.heading(P.head || 'The derivative: slope at a point', p, P.sub);
      var X = function (x) { return bx + (x - xr[0]) / (xr[1] - xr[0]) * bw; }, Y = function (y) { return by + bh - (y - yr[0]) / (yr[1] - yr[0]) * bh; }, a0 = g.E.out(g.seg(p, 0, .08));
      g.line(bx, Y(0), bx + bw, Y(0), { color: '#56629c', lw: 2, alpha: a0 }); g.line(X(0), by, X(0), by + bh, { color: '#56629c', lw: 2, alpha: a0 });
      var pts = []; for (var i = 0; i <= 200; i++) { var xv = xr[0] + (xr[1] - xr[0]) * i / 200; pts.push([X(xv), Y(f(xv))]); }
      var hs = P.hs || [2, 1, .5, .1, .01], lh = g.E.inOut(g.seg(p, .24, .8)), h = Math.exp(g.lerp(Math.log(hs[0]), Math.log(hs[hs.length - 1]), lh)), s = (f(x0 + h) - f(x0)) / h, d = (f(x0 + 1e-5) - f(x0 - 1e-5)) / 2e-5, fin = g.seg(p, .82, .9);
      clip(g, bx, by, bw, bh, function () {
        g.path(pts, { color: P.accent || C.cyan, lw: 4, glow: P.accent || C.cyan, p: g.E.out(g.seg(p, .04, .2)) });
        var sa = g.seg(p, .2, .26) * (1 - fin), ta = fin, ln = function (sl, c, a) { g.line(X(xr[0]), Y(f(x0) + sl * (xr[0] - x0)), X(xr[1]), Y(f(x0) + sl * (xr[1] - x0)), { color: c, lw: 3, alpha: a, glow: c }); };
        ln(s, C.pink, sa); ln(d, C.amber, ta);
        g.circle(X(x0 + h), Y(f(x0 + h)), 8, { fill: C.pink, glow: C.pink, alpha: sa });
        g.circle(X(x0), Y(f(x0)), 9, { fill: C.amber, glow: C.amber, alpha: g.seg(p, .12, .2) });
      });
      g.text('f(x) = ' + (P.fl || fs.replace(/\*\*/g, '^').replace(/\*/g, '·')), bx + 10, by + 10, { size: 20, weight: 700, mono: true, color: P.accent || C.cyan, alpha: a0 });
      var x1 = 780;
      g.panel(x1, 170, 440, 500, { alpha: a0 });
      g.text('slope of the secant', x1 + 26, 208, { size: 20, weight: 700, color: C.pink, alpha: a0 });
      g.text('(f(x+h) − f(x)) / h', x1 + 26, 244, { size: 21, mono: true, alpha: a0 });
      g.text('h', x1 + 60, 296, { size: 18, weight: 800, color: C.muted, align: 'center', alpha: a0 }); g.text('slope', x1 + 250, 296, { size: 18, weight: 800, color: C.muted, align: 'center', alpha: a0 });
      hs.forEach(function (hv, k) { var on = h <= hv * 1.0001 && p > .22; if (!on) return; var sv = (f(x0 + hv) - f(x0)) / hv; g.text(String(hv), x1 + 60, 334 + k * 40, { size: 20, mono: true, align: 'center' }); g.text(nf(sv, 4), x1 + 250, 334 + k * 40, { size: 20, mono: true, align: 'center', color: C.pink }); });
      g.text('as h → 0:  f′(' + x0 + ') = ' + nf(d, 3), x1 + 26, 350 + hs.length * 40, { size: 21, weight: 700, mono: true, color: C.amber, alpha: fin });
      g.text('The tangent line (amber) touches the curve with exactly this slope.', x1 + 26, 400 + hs.length * 40, { size: 17, color: C.muted, alpha: fin, maxW: 390, lh: 22 });
    }
  });

  /* ---------- gradient field and descent on a 2-D surface ---------- */
  M.kit('gradient-field', {
    init: function (P) {
      var saddle = P.mode === 'saddle', a = P.a || .25, b = P.b || 2, lr = P.lr || (saddle ? .12 : .4), x = (P.start || (saddle ? [-4.6, .06] : [-5, 2.6]))[0], y = (P.start || (saddle ? [-4.6, .06] : [-5, 2.6]))[1], path = [[x, y]];
      for (var i = 0; i < 40; i++) { var gx = saddle ? 2 * x : 2 * a * x, gy = saddle ? -2 * y : 2 * b * y; x -= lr * gx; y -= lr * gy; if (Math.abs(y) > 6 || Math.abs(x) > 8) break; path.push([x, y]); }
      return { path: path, saddle: saddle, a: a, b: b, lr: lr };
    },
    draw: function (g, p, P, S, t) {
      var cx = 460, cy = 430, u = 58, C = g.C, sd = S.saddle, a = S.a, b = S.b, f = function (x, y) { return sd ? x * x - y * y : a * x * x + b * y * y; }, a0 = g.E.out(g.seg(p, 0, .1));
      g.heading(P.head || (sd ? 'A saddle point' : 'Gradients point uphill'), p, P.sub);
      clip(g, cx - 6 * u, cy - 4 * u, 12 * u, 8 * u, function () {
        g.box(cx - 6 * u, cy - 4 * u, 12 * u, 8 * u, { r: 0, fill: 'rgba(14,20,48,.6)', alpha: a0 });
        var lv = [.5, 1, 2, 3.5, 5.5, 8, 11, 15, 20], ca = g.seg(p, .04, .16);
        lv.forEach(function (L, k) {
          var c = g.mix(C.cyan, C.violet, k / lv.length);
          if (!sd) { var pts = []; for (var i = 0; i <= 80; i++) { var an = i / 80 * Math.PI * 2; pts.push([cx + Math.sqrt(L / a) * Math.cos(an) * u, cy - Math.sqrt(L / b) * Math.sin(an) * u]); } g.path(pts, { color: g.hexA(c, .55), lw: 1.6, alpha: ca }); }
          else [1, -1].forEach(function (sg) { [1, -1].forEach(function (s2) { var pts = []; for (var i = -40; i <= 40; i++) { var sh = i / 40 * 2.6, r = Math.sqrt(L); var X0 = sg > 0 ? r * Math.cosh(sh) : r * Math.sinh(sh), Y0 = sg > 0 ? r * Math.sinh(sh) : r * Math.cosh(sh); pts.push([cx + s2 * X0 * u, cy - (sg > 0 ? Y0 : s2 * Y0) * u]); } g.path(pts, { color: g.hexA(sg > 0 ? C.cyan : C.pink, .5), lw: 1.6, alpha: ca }); }); });
        });
        var fa = g.seg(p, .14, .28);
        for (var gx = -5; gx <= 5; gx++) for (var gy = -3; gy <= 3; gy++) {
          var dx = sd ? 2 * gx : 2 * a * gx, dy = sd ? -2 * gy : 2 * b * gy, mg = Math.hypot(dx, dy); if (mg < 1e-6) continue;
          var L2 = Math.min(26, 6 + mg * 2.4), px = cx + gx * u, py = cy - gy * u, col = g.mix(C.green, C.pink, Math.min(1, mg / 12));
          g.arrow(px, py, px - dx / mg * L2, py + dy / mg * L2, { color: col, lw: 2, head: 7, alpha: fa * .9 });
        }
        var k = Math.floor(g.seg(p, .32, .9) * (S.path.length - 1)), tr = S.path.slice(0, k + 1).map(function (q) { return [cx + q[0] * u, cy - q[1] * u]; });
        if (p > .3) { g.path(tr, { color: C.amber, lw: 3, glow: C.amber }); tr.forEach(function (q) { g.circle(q[0], q[1], 3.5, { fill: C.amber }); }); var cu = tr[tr.length - 1]; g.circle(cu[0], cu[1], 11, { fill: C.white, glow: C.amber, blur: 20 }); }
      });
      var k2 = Math.floor(g.seg(p, .32, .9) * (S.path.length - 1)), q = S.path[k2], gxv = sd ? 2 * q[0] : 2 * a * q[0], gyv = sd ? -2 * q[1] : 2 * b * q[1];
      sidePanel(g, p, 870, 170, 350, 500, [
        ['f(x, y) = ' + (sd ? 'x² − y²' : ni(a, 2) + 'x² + ' + ni(b, 2) + 'y²'), C.ink, { mono: true, size: 20 }],
        ['∇f = [' + (sd ? '2x, −2y' : ni(2 * a, 2) + 'x, ' + ni(2 * b, 2) + 'y') + ']', P.accent || C.cyan, { mono: true, size: 20 }],
        ['Arrows show −∇f: the steepest way down', C.muted, { size: 17, a: g.seg(p, .16, .26), gap: 60 }],
        ['step ' + k2 + ' · learning rate ' + S.lr, C.amber, { mono: true, size: 18, a: g.seg(p, .3, .36) }],
        ['f = ' + nf(f(q[0], q[1]), 3), C.amber, { mono: true, size: 22, a: g.seg(p, .3, .36) }],
        ['|∇f| = ' + nf(Math.hypot(gxv, gyv), 3), C.amber, { mono: true, size: 22, a: g.seg(p, .3, .36) }],
        [sd ? 'The gradient is zero at the centre, but it is not a minimum: the ball slides away along y.' : 'Steep direction (y) zig-zags; gentle direction (x) crawls.', C.muted, { size: 17, a: g.seg(p, .85, .92) }]
      ]);
    }
  });

  /* ---------- the chain rule as a forward and backward pass ---------- */
  M.kit('chain-rule', {
    draw: function (g, p, P, S, t) {
      var ns = P.nodes || [{ l: 'x', v: '2' }, { l: 'u = x²', v: '4', d: 'du/dx = 2x = 4' }, { l: 'y = 3u + 1', v: '13', d: 'dy/du = 3' }], n = ns.length, C = g.C, A = P.accent || C.cyan;
      g.heading(P.head || 'The chain rule', p, P.sub);
      var bw = Math.min(250, (1120 - (n - 1) * 60) / n), gap = n > 1 ? (1120 - n * bw) / (n - 1) : 0, y = 300;
      ns.forEach(function (nd, k) {
        var x = 80 + k * (bw + gap), fa = g.E.back(g.seg(p, .04 + k * (.36 / n), .12 + k * (.36 / n)));
        g.box(x, y - 48, bw, 96, { r: 18, fill: g.hexA(A, .14), stroke: A, lw: 2, alpha: g.clamp(fa) });
        g.text(nd.l, x + bw / 2, y - 12, { size: 23, weight: 700, mono: true, align: 'center', alpha: g.clamp(fa), maxW: bw - 16 });
        g.text('= ' + nd.v, x + bw / 2, y + 22, { size: 20, mono: true, align: 'center', color: C.green, alpha: g.clamp(fa) });
        if (k < n - 1) g.arrow(x + bw + 8, y, x + bw + gap - 8, y, { color: C.green, lw: 3, head: 11, alpha: g.clamp(fa) });
        if (k > 0 && nd.d) {
          var ba = g.E.out(g.seg(p, .45 + (n - 1 - k) * (.3 / n), .55 + (n - 1 - k) * (.3 / n)));
          g.arrow(x + bw * .3, y + 120, x - gap - bw * .3, y + 120, { color: C.pink, lw: 3, head: 11, alpha: ba, glow: C.pink });
          g.text(nd.d, x - gap / 2 + 10, y + 158, { size: 19, weight: 600, mono: true, align: 'center', color: C.pink, alpha: ba, maxW: bw + gap - 10 });
        }
      });
      g.text('forward: compute values →', 80, y - 88, { size: 18, weight: 700, color: C.green, alpha: g.seg(p, .04, .12) });
      g.text('← backward: multiply local derivatives', 1200, y + 210, { size: 18, weight: 700, color: C.pink, align: 'right', alpha: g.seg(p, .45, .52) });
      var ra = g.E.out(g.seg(p, .82, .9));
      g.panel(180, 560, 920, 96, { alpha: ra, stroke: g.hexA(C.amber, .6) });
      g.text(P.result || 'dy/dx = dy/du · du/dx = 3 × 4 = 12', 640, 608, { size: 25, weight: 700, mono: true, align: 'center', color: C.amber, alpha: ra, maxW: 880 });
    }
  });

  /* ---------- probability distributions ---------- */
  M.kit('distribution', {
    init: function (P) { var r = R(P.seed || 17), s = []; for (var i = 0; i < 5000; i++) s.push((P.mu || 0) + (P.sigma || 1) * gauss(r)); return { s: s }; },
    draw: function (g, p, P, S, t) {
      var mode = P.mode || 'normal', C = g.C, A = P.accent || C.cyan, xr = P.x || [-5, 5], bx = 130, by = 200, bw = 1020, bh = 400;
      g.heading(P.head || { normal: 'The normal (Gaussian) distribution', rule: 'The 68–95–99.7 rule', sample: 'Samples fill in the curve', binomial: 'The binomial distribution', families: 'A family of distributions' }[mode] || '', p, P.sub);
      var X = function (x) { return bx + (x - xr[0]) / (xr[1] - xr[0]) * bw; }, a0 = g.E.out(g.seg(p, 0, .08));
      if (mode === 'families') {
        var fam = [['Bernoulli', 'coin flip: yes / no', function (x) { return x < .5 ? .7 : .3; }, 'bar'], ['Uniform', 'every value equally likely', function (x) { return x > .1 && x < .9 ? .8 : 0; }, 'line'], ['Normal', 'sums of many small effects', function (x) { return Math.exp(-Math.pow((x - .5) / .16, 2) / 2); }, 'line'], ['Exponential', 'waiting times', function (x) { return Math.exp(-x * 4); }, 'line']];
        fam.forEach(function (fm, k) {
          var x0 = 80 + k * 285, a = g.E.out(g.seg(p, .06 + k * .12, .2 + k * .12)), c = g.PAL[k];
          g.panel(x0, 190, 265, 400, { alpha: a, stroke: g.hexA(c, .5) });
          g.text(fm[0], x0 + 132, 226, { size: 24, weight: 700, head: true, color: c, align: 'center', alpha: a });
          g.line(x0 + 24, 480, x0 + 241, 480, { color: '#56629c', lw: 2, alpha: a });
          if (fm[3] === 'bar') { [[.25, .7, '0'], [.75, .3, '1']].forEach(function (b) { g.box(x0 + 24 + b[0] * 217 - 30, 480 - b[1] * 200 * a, 60, b[1] * 200 * a, { r: 6, fill: g.hexA(c, .8) }); g.text(b[2], x0 + 24 + b[0] * 217, 500, { size: 16, mono: true, color: C.muted, align: 'center', alpha: a }); }); }
          else { var pts = []; for (var i = 0; i <= 60; i++) pts.push([x0 + 24 + i / 60 * 217, 480 - fm[2](i / 60) * 200]); g.path(pts, { color: c, lw: 4, glow: c, p: a }); }
          g.text(fm[1], x0 + 132, 548, { size: 18, color: C.muted, align: 'center', alpha: a, maxW: 235, vcenter: true, lh: 22 });
        });
        return;
      }
      if (mode === 'binomial') {
        var n = P.n || 10, probs = P.probs || [.5, .2, .8], ns = probs.length, pos = g.seg(p, .08, .95) * ns, k = Math.min(ns - 1, Math.floor(pos)), f = g.E.inOut(g.seg(pos - k, 0, .35)), pr = k ? g.lerp(probs[k - 1], probs[k], f) : probs[0];
        var ch = function (nn, kk) { var r = 1; for (var i = 1; i <= kk; i++) r = r * (nn - kk + i) / i; return r; }, bwd = bw / (n + 1), mx = .45;
        g.line(bx, by + bh, bx + bw, by + bh, { color: '#56629c', lw: 2, alpha: a0 });
        for (var j = 0; j <= n; j++) { var pm = ch(n, j) * Math.pow(pr, j) * Math.pow(1 - pr, n - j), hgt = pm / mx * bh; g.box(bx + j * bwd + bwd * .15, by + bh - hgt, bwd * .7, hgt, { r: 6, fill: g.hexA(A, .85), glow: A, blur: 8, alpha: a0 }); g.text(String(j), bx + j * bwd + bwd / 2, by + bh + 24, { size: 17, mono: true, color: C.muted, align: 'center', alpha: a0 }); if (pm > .02) g.text(nf(pm, 2), bx + j * bwd + bwd / 2, by + bh - hgt - 16, { size: 15, mono: true, align: 'center', alpha: a0 }); }
        var mxp = bx + (n * pr + .5) * bwd; g.line(mxp, by, mxp, by + bh, { color: C.amber, dash: [6, 6], lw: 2, alpha: a0 });
        g.text('n = ' + n + '   p = ' + nf(pr) + '   mean np = ' + nf(n * pr, 1) + '   variance np(1−p) = ' + nf(n * pr * (1 - pr)), 640, by - 16, { size: 20, mono: true, color: C.amber, align: 'center', alpha: a0 });
        g.text('number of successes in ' + n + ' tries', 640, by + bh + 58, { size: 18, color: C.muted, align: 'center', alpha: a0 });
        return;
      }
      var ymax = P.ymax || .8, Y = function (y) { return by + bh - y / ymax * bh; };
      g.line(bx, by + bh, bx + bw, by + bh, { color: '#56629c', lw: 2, alpha: a0 });
      for (var xt = Math.ceil(xr[0]); xt <= xr[1]; xt++) g.text(String(xt).replace('-', '−'), X(xt), by + bh + 24, { size: 16, mono: true, color: C.muted, align: 'center', alpha: a0 });
      var curve = function (mu, s, c, o) { o = o || {}; var pts = []; for (var i = 0; i <= 240; i++) { var x = xr[0] + (xr[1] - xr[0]) * i / 240; pts.push([X(x), Y(pdf(x, mu, s))]); } if (o.fill) g.path(pts.concat([[X(xr[1]), Y(0)], [X(xr[0]), Y(0)]]), { color: 'rgba(0,0,0,0)', lw: 1, fill: g.hexA(c, o.fill), alpha: o.alpha }); g.path(pts, { color: c, lw: o.lw || 4, glow: o.dash ? null : c, dash: o.dash, p: o.p, alpha: o.alpha }); };
      if (mode === 'normal') {
        var ps = P.params || [[0, 1], [2, 1], [0, 2], [0, .6]], np = ps.length, pos2 = g.seg(p, .08, .95) * np, k2 = Math.min(np - 1, Math.floor(pos2)), f2 = g.E.inOut(g.seg(pos2 - k2, 0, .35)), mu = k2 ? g.lerp(ps[k2 - 1][0], ps[k2][0], f2) : ps[0][0], sg = k2 ? g.lerp(ps[k2 - 1][1], ps[k2][1], f2) : ps[0][1];
        if (k2 > 0) curve(0, 1, C.muted, { dash: [6, 6], lw: 2, alpha: .6 });
        curve(mu, sg, A, { fill: .18, p: g.E.out(g.seg(p, .04, .16)) });
        g.line(X(mu), Y(0), X(mu), Y(pdf(mu, mu, sg)), { color: C.amber, lw: 2, dash: [6, 6], alpha: g.seg(p, .12, .18) });
        g.arrow(X(mu), Y(pdf(mu + sg, mu, sg)), X(mu + sg), Y(pdf(mu + sg, mu, sg)), { color: C.pink, lw: 3, head: 10, alpha: g.seg(p, .14, .2) });
        g.text('μ = ' + nf(mu) + '    σ = ' + nf(sg), 1150, 196, { size: 26, weight: 700, mono: true, color: C.amber, align: 'right', alpha: a0 });
        g.text('μ shifts the centre · σ sets the width · area is always 1', 640, 668, { size: 19, color: C.muted, align: 'center', alpha: g.seg(p, .2, .3) });
      } else if (mode === 'rule') {
        [[3, '99.7%', C.violet, .66], [2, '95%', C.blue, .45], [1, '68%', C.green, .22]].forEach(function (r) {
          var a = g.seg(p, r[3], r[3] + .1), pts = [[X(-r[0]), Y(0)]]; for (var i = 0; i <= 80; i++) { var x = -r[0] + 2 * r[0] * i / 80; pts.push([X(x), Y(pdf(x, 0, 1))]); } pts.push([X(r[0]), Y(0)]);
          g.alpha(a, function () { g.path(pts, { color: 'rgba(0,0,0,0)', lw: 1, fill: g.hexA(r[2], .3) }); });
          g.line(X(-r[0]), Y(0) + 8, X(r[0]), Y(0) + 8, { color: r[2], lw: 3, alpha: a });
          g.text(r[1], X(r[0]) + 10, Y(pdf(r[0], 0, 1)) - 26 - (3 - r[0]) * 10, { size: 22, weight: 800, color: r[2], alpha: a });
          g.text('±' + r[0] + 'σ', X(-r[0]) - 10, Y(pdf(r[0], 0, 1)) - 26 - (3 - r[0]) * 10, { size: 18, weight: 700, color: r[2], align: 'right', alpha: a });
        });
        curve(0, 1, A, { p: g.E.out(g.seg(p, .04, .18)) });
        g.text('Beyond 3σ is rare: about 3 in 1,000 — a common rule of thumb for outliers', 640, 668, { size: 19, color: C.muted, align: 'center', alpha: g.seg(p, .8, .9) });
      } else {
        var mu3 = P.mu || 0, sg3 = P.sigma || 1, N = Math.floor(Math.pow(10, g.lerp(1, Math.log10(S.s.length), g.E.inOut(g.seg(p, .08, .88))))), nb = 40, w = (xr[1] - xr[0]) / nb, cnt = new Array(nb).fill(0), sum = 0, sq = 0;
        for (var i = 0; i < N; i++) { var v = S.s[i], bi = Math.floor((v - xr[0]) / w); if (bi >= 0 && bi < nb) cnt[bi]++; sum += v; sq += v * v; }
        cnt.forEach(function (c, bi) { var hgt = c / (N * w); g.box(X(xr[0] + bi * w) + 1, Y(hgt), bw / nb - 2, Y(0) - Y(hgt), { r: 3, fill: g.hexA(A, .75), alpha: a0 }); });
        curve(mu3, sg3, C.amber, { lw: 3, alpha: g.seg(p, .3, .4) });
        var mean = sum / N, sd = Math.sqrt(Math.max(0, sq / N - mean * mean));
        g.text('n = ' + N.toLocaleString('en-US') + '   sample mean = ' + nf(mean) + '   sample std = ' + nf(sd), 640, 190, { size: 22, weight: 700, mono: true, color: C.ink, align: 'center', alpha: a0 });
        g.text('amber: the true density  ·  bars: histogram of samples', 640, 668, { size: 19, color: C.muted, align: 'center', alpha: g.seg(p, .3, .4) });
      }
    }
  });

  /* ---------- central limit theorem with dice ---------- */
  M.kit('clt', {
    init: function (P) {
      var r = R(P.seed || 3), ks = P.ks || [1, 2, 5, 30], nb = 50, res = [];
      ks.forEach(function (k) { var cnt = new Array(nb).fill(0), s = 0, sq = 0; for (var i = 0; i < 4000; i++) { var m = 0; for (var j = 0; j < k; j++) m += 1 + Math.floor(r() * 6); m /= k; s += m; sq += m * m; cnt[Math.min(nb - 1, Math.floor((m - 1) / 5 * nb * .9999))]++; } var mean = s / 4000; res.push({ k: k, cnt: cnt, mean: mean, sd: Math.sqrt(sq / 4000 - mean * mean) }); });
      return { res: res, nb: nb };
    },
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.cyan, n = S.res.length, pos = g.seg(p, .06, .96) * n, k = Math.min(n - 1, Math.floor(pos)), f = g.E.inOut(g.seg(pos - k, 0, .3)), cur = S.res[k], prev = S.res[Math.max(0, k - 1)], bx = 130, by = 210, bw = 820, bh = 380;
      g.heading(P.head || 'The central limit theorem', p, P.sub);
      var X = function (x) { return bx + (x - 1) / 5 * bw; }, bwd = bw / S.nb, mx = function (r) { return Math.max.apply(null, r.cnt); };
      g.line(bx, by + bh, bx + bw, by + bh, { color: '#56629c', lw: 2 });
      for (var d = 1; d <= 6; d++) g.text(String(d), X(d), by + bh + 24, { size: 17, mono: true, color: C.muted, align: 'center' });
      cur.cnt.forEach(function (c, i) { var h0 = prev.cnt[i] / mx(prev), h1 = c / mx(cur), hh = (k ? g.lerp(h0, h1, f) : h1) * bh; g.box(bx + i * bwd + 1, by + bh - hh, bwd - 2, hh, { r: 3, fill: g.hexA(A, .8), alpha: g.seg(p, .04, .1) }); });
      if (cur.k >= 5) { var pts = [], sd = 1.7078 / Math.sqrt(cur.k), pk = pdf(3.5, 3.5, sd); for (var i = 0; i <= 200; i++) { var x = 1 + 5 * i / 200; pts.push([X(x), by + bh - pdf(x, 3.5, sd) / pk * bh]); } g.path(pts, { color: C.amber, lw: 3, glow: C.amber, alpha: g.seg(pos - k, .3, .5) }); }
      sidePanel(g, p, 990, 200, 230, 400, [['Average of', C.muted, { size: 18 }], [cur.k + (cur.k === 1 ? ' die' : ' dice'), A, { size: 34, w: 800, gap: 60 }], ['mean ' + nf(cur.mean), C.ink, { mono: true, size: 19 }], ['std ' + nf(cur.sd), C.ink, { mono: true, size: 19 }], ['1.71/√' + cur.k + ' = ' + nf(1.7078 / Math.sqrt(cur.k)), C.amber, { mono: true, size: 17 }]]);
      g.text(cur.k === 1 ? 'One die: flat (uniform), nothing like a bell' : cur.k < 5 ? 'Averaging a few: a peak starts to form' : 'Average of many: a bell curve appears — whatever the original shape', 540, 668, { size: 20, color: C.muted, align: 'center' });
    }
  });

  /* ---------- entropy, cross-entropy and KL divergence ---------- */
  M.kit('entropy', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.cyan, mode = P.mode || 'entropy', labels = P.labels || ['A', 'B', 'C', 'D'], lg = function (x) { return Math.log(x) / Math.LN2; }, bx = 110, by = 210, bh = 330;
      g.heading(P.head || (mode === 'kl' ? 'Cross-entropy and KL divergence' : 'Entropy: average surprise'), p, P.sub);
      var ds = P.dists || [[.25, .25, .25, .25], [.4, .3, .2, .1], [.7, .1, .1, .1], [.97, .01, .01, .01]];
      if (mode === 'kl') {
        var Pd = P.p || [.5, .3, .15, .05], Q0 = P.q0 || [.1, .2, .3, .4], Q1 = P.q1 || [.45, .3, .17, .08], q = g.E.inOut(g.seg(p, .3, .85)), Q = Q0.map(function (v, i) { return g.lerp(v, Q1[i], q); }), n = Pd.length, gw = 640 / n;
        var H = -Pd.reduce(function (s, v) { return s + (v > 0 ? v * lg(v) : 0); }, 0), CE = -Pd.reduce(function (s, v, i) { return s + (v > 0 ? v * lg(Q[i]) : 0); }, 0);
        g.line(bx, by + bh, bx + 640, by + bh, { color: '#56629c', lw: 2 });
        Pd.forEach(function (v, i) { var x = bx + i * gw, a = g.E.out(g.seg(p, .05 + i * .04, .15 + i * .04)); g.box(x + gw * .12, by + bh - v * bh * a, gw * .34, v * bh * a, { r: 6, fill: g.hexA(C.cyan, .85) }); g.box(x + gw * .5, by + bh - Q[i] * bh * g.seg(p, .18, .28), gw * .34, Q[i] * bh * g.seg(p, .18, .28), { r: 6, fill: g.hexA(C.pink, .85) }); g.text(labels[i], x + gw / 2, by + bh + 26, { size: 19, weight: 700, color: C.muted, align: 'center' }); });
        g.box(bx, 646, 18, 18, { r: 4, fill: C.cyan }); g.text('P: the truth', bx + 28, 656, { size: 18 }); g.box(bx + 200, 646, 18, 18, { r: 4, fill: C.pink }); g.text('Q: the model’s prediction', bx + 228, 656, { size: 18 });
        sidePanel(g, p, 800, 190, 420, 480, [['H(P) = ' + nf(H, 3) + ' bits', C.cyan, { mono: true, size: 21 }], ['entropy of the truth (fixed)', C.muted, { size: 16, gap: 56 }], ['H(P, Q) = ' + nf(CE, 3) + ' bits', C.pink, { mono: true, size: 21, a: g.seg(p, .2, .3) }], ['cross-entropy = −Σ P log Q', C.muted, { size: 16, gap: 56, a: g.seg(p, .2, .3) }], ['KL(P‖Q) = ' + nf(CE - H, 3) + ' bits', C.amber, { mono: true, size: 24, w: 800, a: g.seg(p, .25, .35) }], ['KL = cross-entropy − entropy ≥ 0. It reaches 0 only when Q = P.', C.muted, { size: 17, a: g.seg(p, .25, .35), gap: 72 }], ['Minimising cross-entropy loss = pushing Q towards P', C.green, { size: 18, w: 700, a: g.seg(p, .8, .9) }]]);
        return;
      }
      var nd = ds.length, pos = g.seg(p, .08, .95) * nd, k = Math.min(nd - 1, Math.floor(pos)), f = g.E.inOut(g.seg(pos - k, 0, .35)), D = ds[k].map(function (v, i) { return k ? g.lerp(ds[k - 1][i], v, f) : v; }), n2 = D.length, gw2 = 640 / n2;
      var Hs = -D.reduce(function (s, v) { return s + (v > 0 ? v * lg(v) : 0); }, 0), Hmax = lg(n2);
      g.line(bx, by + bh, bx + 640, by + bh, { color: '#56629c', lw: 2 });
      D.forEach(function (v, i) { var x = bx + i * gw2, a = g.E.out(g.seg(p, .04 + i * .03, .12 + i * .03)); g.box(x + gw2 * .18, by + bh - v * bh * a, gw2 * .64, v * bh * a, { r: 8, fill: g.hexA(g.PAL[i % 8], .85), glow: g.PAL[i % 8], blur: 8 }); g.text(nf(v), x + gw2 / 2, by + bh - v * bh * a - 18, { size: 18, mono: true, align: 'center', alpha: a }); g.text(labels[i], x + gw2 / 2, by + bh + 26, { size: 19, weight: 700, color: C.muted, align: 'center' }); g.text(nf(-lg(Math.max(v, 1e-9)), 1) + ' bits', x + gw2 / 2, by + bh + 56, { size: 15, mono: true, color: C.muted, align: 'center', alpha: g.seg(p, .12, .2) }); });
      g.text('surprise of each outcome = −log₂ p', bx + 320, by + bh + 88, { size: 15, color: g.C.muted, align: 'center', alpha: g.seg(p, .12, .2) });
      g.panel(800, 190, 420, 480);
      g.text('H = −Σ p log₂ p', 826, 232, { size: 24, mono: true, weight: 700 });
      g.text(nf(Hs, 3) + ' bits', 826, 300, { size: 44, weight: 800, mono: true, color: A, glow: g.hexA(A, .5) });
      g.box(826, 350, 368, 22, { r: 11, fill: C.faint }); g.box(826, 350, 368 * Hs / Hmax, 22, { r: 11, fill: A, glow: A });
      g.text('0', 826, 392, { size: 15, mono: true, color: C.muted }); g.text('max ' + nf(Hmax, 0) + ' bits (uniform)', 1194, 392, { size: 15, mono: true, color: C.muted, align: 'right' });
      g.text(Hs > Hmax * .95 ? 'Uniform: maximum uncertainty — every outcome is equally surprising.' : Hs < .4 ? 'Almost certain: little uncertainty, so little information per outcome.' : 'Peaked: more predictable, so lower entropy.', 826, 470, { size: 19, color: C.ink, maxW: 370, lh: 25 });
      g.text('Entropy = the average number of bits needed to encode an outcome', 826, 580, { size: 16, color: C.muted, maxW: 370, lh: 21 });
    }
  });

  /* ---------- maximum likelihood estimation ---------- */
  M.kit('mle', {
    init: function (P) { var r = R(P.seed || 11), xs = []; for (var i = 0; i < (P.n || 12); i++) xs.push(+(3.2 + gauss(r)).toFixed(2)); var m = xs.reduce(function (a, b) { return a + b; }, 0) / xs.length; return { xs: xs, m: m }; },
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.cyan, xs = S.xs, bx = 90, bw = 700, base = 540, X = function (x) { return bx + x / 7 * bw; }, H = 290;
      var LL = function (mu) { return xs.reduce(function (s, x) { return s + Math.log(pdf(x, mu, 1)); }, 0); };
      var mu = p < .1 ? .8 : p < .56 ? g.lerp(.8, 6.2, g.E.inOut(g.seg(p, .1, .56))) : g.lerp(6.2, S.m, g.E.inOut(g.seg(p, .6, .82))), best = p > .84;
      g.heading(P.head || 'Maximum likelihood estimation', p, P.sub);
      g.line(bx, base, bx + bw, base, { color: '#56629c', lw: 2 });
      for (var i = 0; i <= 7; i++) g.text(String(i), X(i), base + 24, { size: 16, mono: true, color: C.muted, align: 'center' });
      var pts = []; for (var j = 0; j <= 200; j++) { var x = 7 * j / 200; pts.push([X(x), base - pdf(x, mu, 1) / .4 * H]); }
      g.path(pts.concat([[X(7), base], [X(0), base]]), { color: 'rgba(0,0,0,0)', lw: 1, fill: g.hexA(A, .14) }); g.path(pts, { color: A, lw: 4, glow: A });
      xs.forEach(function (x, k) { var h = pdf(x, mu, 1) / .4 * H, a = g.E.back(g.seg(p, .02 + k * .006, .06 + k * .006)), c = g.mix(C.red, C.green, Math.min(1, pdf(x, mu, 1) / .4)); g.line(X(x), base, X(x), base - h, { color: c, lw: 3, alpha: g.seg(p, .08, .12) }); g.circle(X(x), base, 7 * g.clamp(a), { fill: C.amber, glow: C.amber }); });
      g.text('μ = ' + nf(mu), X(mu), base - H - 30, { size: 22, weight: 700, mono: true, color: A, align: 'center' });
      var px = 850, py = 200, pw = 360, ph = 250, mus = [], lo = LL(S.m) - 60, hi = LL(S.m) + 4, PX = function (m) { return px + (m - .5) / 6 * pw; }, PY = function (v) { return py + ph - (Math.max(lo, v) - lo) / (hi - lo) * ph; };
      g.panel(px - 20, py - 40, pw + 40, ph + 150);
      g.text('log-likelihood vs μ', px, py - 12, { size: 17, weight: 700, color: C.muted });
      var maxSeen = p < .56 ? mu : 6.2; for (var m = .8; m <= maxSeen + 1e-9; m += .05) mus.push([PX(m), PY(LL(m))]);
      g.path(mus, { color: C.violet, lw: 3 });
      g.circle(PX(mu), PY(LL(mu)), 8, { fill: C.white, glow: C.violet });
      if (best) { g.line(PX(S.m), py, PX(S.m), py + ph, { color: C.green, dash: [6, 6], lw: 2, alpha: g.seg(p, .84, .9) }); }
      g.text('log L = ' + nf(LL(mu), 1), px, py + ph + 40, { size: 22, weight: 700, mono: true, color: C.violet });
      g.text(best ? 'Best μ = sample mean = ' + nf(S.m) : 'Slide μ to make the data most probable', px, py + ph + 80, { size: 18, weight: 700, color: best ? C.green : C.muted, maxW: pw });
      g.text('Each bar = how likely one data point is under the curve. Likelihood = product of all bars.', 440, 650, { size: 18, color: C.muted, align: 'center', maxW: 720, alpha: g.seg(p, .1, .2) });
    }
  });

  /* ---------- Monte Carlo estimate of π ---------- */
  M.kit('montecarlo', {
    init: function (P) { var r = R(P.seed || 21), pts = [], inside = [0]; for (var i = 0; i < 3000; i++) { var x = r(), y = r(), ins = x * x + y * y <= 1; pts.push([x, y, ins]); inside.push(inside[i] + (ins ? 1 : 0)); } return { pts: pts, inside: inside }; },
    draw: function (g, p, P, S, t) {
      var C = g.C, x0 = 110, y0 = 196, s = 460, n = Math.max(1, Math.floor(3000 * Math.pow(g.seg(p, .06, .88), 2.2))), ctx = g.ctx, a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || 'Monte Carlo: estimating π with random points', p, P.sub);
      g.box(x0, y0, s, s, { r: 4, fill: 'rgba(20,28,64,.8)', stroke: '#56629c', lw: 2, alpha: a0 });
      ctx.save(); ctx.globalAlpha *= a0; ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x0, y0 + s, s, -Math.PI / 2, 0); ctx.stroke(); ctx.restore();
      ctx.save(); for (var i = 0; i < n; i++) { var q = S.pts[i]; ctx.fillStyle = q[2] ? C.green : C.pink; ctx.fillRect(x0 + q[0] * s - 2, y0 + (1 - q[1]) * s - 2, 4, 4); } ctx.restore();
      var est = 4 * S.inside[n] / n, px = 640, py = 210, pw = 560, ph = 300, lx = function (k) { return px + Math.log10(k) / Math.log10(3000) * pw; }, ly = function (v) { return py + ph / 2 - (v - Math.PI) / 1.2 * ph / 2; };
      g.line(px, py, px, py + ph, { color: '#56629c', lw: 2 }); g.line(px, py + ph, px + pw, py + ph, { color: '#56629c', lw: 2 });
      g.line(px, ly(Math.PI), px + pw, ly(Math.PI), { color: C.amber, dash: [8, 8], lw: 2 }); g.text('π = 3.14159…', px + pw, ly(Math.PI) - 16, { size: 16, color: C.amber, align: 'right' });
      var tr = []; for (var k = 1; k <= n; k = Math.max(k + 1, Math.floor(k * 1.04))) tr.push([lx(k), ly(Math.max(1.9, Math.min(4.4, 4 * S.inside[k] / k)))]); tr.push([lx(n), ly(Math.max(1.9, Math.min(4.4, est)))]);
      g.path(tr, { color: C.cyan, lw: 3, glow: C.cyan });
      [1, 10, 100, 1000].forEach(function (k) { g.text(String(k), lx(k), py + ph + 22, { size: 15, mono: true, color: C.muted, align: 'center' }); });
      g.text('number of points (log scale)', px + pw, py + ph + 48, { size: 15, color: C.muted, align: 'right' });
      g.text('points: ' + n.toLocaleString('en-US') + '   inside: ' + S.inside[n].toLocaleString('en-US'), px, 580, { size: 21, mono: true });
      g.text('π ≈ 4 × inside / points = ' + est.toFixed(4), px, 622, { size: 24, weight: 700, mono: true, color: C.green });
      g.text('error ≈ ' + Math.abs(est - Math.PI).toFixed(4) + '  (shrinks like 1/√n)', px, 662, { size: 18, mono: true, color: C.muted });
    }
  });

  /* ---------- a Markov chain converging to its stationary distribution ---------- */
  M.kit('markov', {
    init: function (P) {
      var T = P.T || [[.7, .2, .1], [.3, .4, .3], [.2, .3, .5]], n = T.length, pi = T.map(function () { return 1 / n; }), r = R(P.seed || 6), st = [0], cnt = [T.map(function () { return 0; })];
      for (var it = 0; it < 300; it++) pi = pi.map(function (_, j) { return pi.reduce(function (s, v, i) { return s + v * T[i][j]; }, 0); });
      var s = 0; cnt[0][0] = 1;
      for (var k = 1; k < 1500; k++) { var u = r(), c = 0; for (var j = 0; j < n; j++) { c += T[s][j]; if (u < c) { s = j; break; } } st.push(s); var nc = cnt[k - 1].slice(); nc[s]++; cnt.push(nc); }
      return { T: T, pi: pi, st: st, cnt: cnt };
    },
    draw: function (g, p, P, S, t) {
      var C = g.C, names = P.states || ['Sunny', 'Cloudy', 'Rainy'], cols = [C.amber, C.blue, C.violet], pos = [[250, 300], [580, 300], [415, 540]], T = S.T, n = T.length, a0 = g.E.out(g.seg(p, 0, .12));
      g.heading(P.head || 'A Markov chain', p, P.sub);
      var q = g.seg(p, .1, .92), kf = 1499 * Math.pow(q, 2.6), k = Math.floor(kf), f = kf - k, cur = S.st[k], nxt = S.st[Math.min(1499, k + 1)];
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
        if (!T[i][j]) continue;
        var A1 = pos[i], B1 = pos[j];
        if (i === j) { var dir = A1[1] > 400 ? 1 : -1, ly = A1[1] + dir * 78; g.circle(A1[0], ly, 26, { stroke: g.hexA(cols[i], .6), lw: 2.5, alpha: a0 }); g.text(nf(T[i][j], 1), A1[0] + 40, ly + dir * 14, { size: 17, weight: 700, mono: true, color: cols[i], alpha: a0 }); continue; }
        var dx = B1[0] - A1[0], dy = B1[1] - A1[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, off = 14, sx = A1[0] + dx / L * 62 + nx * off, sy = A1[1] + dy / L * 62 + ny * off, ex = B1[0] - dx / L * 62 + nx * off, ey = B1[1] - dy / L * 62 + ny * off, on = cur === i && nxt === j && f < .5;
        g.arrow(sx, sy, ex, ey, { color: on ? cols[j] : g.hexA(cols[i], .45), lw: on ? 4 : 2.2, head: 11, glow: on ? cols[j] : null, alpha: a0 });
        g.text(nf(T[i][j], 1), (sx + ex) / 2 + nx * 18, (sy + ey) / 2 + ny * 18, { size: 16, weight: 700, mono: true, color: g.hexA(cols[i], .95), align: 'center', alpha: a0 });
      }
      names.forEach(function (nm, i) { var on = cur === i; g.circle(pos[i][0], pos[i][1], 56, { fill: g.hexA(cols[i], on ? .38 : .14), stroke: cols[i], lw: on ? 4 : 2, glow: on ? cols[i] : null, alpha: a0 }); g.text(nm, pos[i][0], pos[i][1] + 1, { size: 20, weight: 700, head: true, align: 'center', alpha: a0 }); });
      var cnt = S.cnt[k], tot = k + 1, px = 760;
      g.panel(px, 180, 460, 480, { alpha: a0 });
      g.text('Time spent in each state', px + 26, 216, { size: 20, weight: 700, color: C.ink, alpha: a0 });
      g.text('step ' + (k + 1), px + 434, 216, { size: 18, mono: true, color: C.muted, align: 'right', alpha: a0 });
      names.forEach(function (nm, i) { var y = 280 + i * 110, fr = cnt[i] / tot; g.text(nm, px + 26, y, { size: 18, weight: 700, color: cols[i], alpha: a0 }); g.box(px + 26, y + 18, 400, 26, { r: 8, fill: C.faint, alpha: a0 }); g.box(px + 26, y + 18, 400 * fr, 26, { r: 8, fill: cols[i], glow: cols[i], alpha: a0 }); var sx2 = px + 26 + 400 * S.pi[i]; g.line(sx2, y + 10, sx2, y + 52, { color: C.white, lw: 3, alpha: g.seg(p, .5, .6) }); g.text(nf(fr) + '  (long-run ' + nf(S.pi[i]) + ')', px + 426, y, { size: 16, mono: true, color: C.muted, align: 'right', alpha: a0 }); });
      g.text('White marks: the stationary distribution π = πT', px + 26, 630, { size: 16, color: C.muted, alpha: g.seg(p, .5, .6) });
    }
  });

  /* ---------- norms: unit balls and L1 vs L2 regularisation ---------- */
  M.kit('norms', {
    init: function (P) {
      var w = P.w || [2, .5], h = P.h || [1, 1.6], loss = function (x, y) { return h[0] * (x - w[0]) * (x - w[0]) + h[1] * (y - w[1]) * (y - w[1]); }, best = function (ball) { var b = null, bv = Infinity; for (var i = 0; i < 4000; i++) { var an = i / 4000 * Math.PI * 2, c = Math.cos(an), s = Math.sin(an), k = ball === 1 ? 1 / (Math.abs(c) + Math.abs(s)) : 1, x = c * k, y = s * k, v = loss(x, y); if (v < bv) { bv = v; b = [x, y]; } } return { pt: b, v: bv }; };
      return { w: w, h: h, l1: best(1), l2: best(2) };
    },
    draw: function (g, p, P, S, t) {
      var C = g.C, mode = P.mode || 'balls';
      if (mode === 'balls') {
        g.heading(P.head || 'Norms: different ways to measure length', p, P.sub);
        var cx = 420, cy = 430, u = 170, v = P.v || [.6, .8], a0 = g.E.out(g.seg(p, 0, .08));
        plane(g, cx, cy, u / 2, 4, 2, a0 * .7);
        var shape = function (pp, c, a, lw) { var pts = []; for (var i = 0; i <= 200; i++) { var an = i / 200 * Math.PI * 2, cs = Math.cos(an), sn = Math.sin(an), r = pp >= 50 ? 1 / Math.max(Math.abs(cs), Math.abs(sn)) : Math.pow(Math.pow(Math.abs(cs), pp) + Math.pow(Math.abs(sn), pp), -1 / pp); pts.push([cx + cs * r * u, cy - sn * r * u]); } g.path(pts, { color: c, lw: lw || 4, glow: c, p: a }); };
        shape(1, C.cyan, g.E.inOut(g.seg(p, .08, .24))); shape(2, C.pink, g.E.inOut(g.seg(p, .28, .44))); shape(60, C.amber, g.E.inOut(g.seg(p, .48, .64)));
        var mq = g.seg(p, .7, .95); if (mq > 0) { var pp = Math.pow(8, mq); shape(pp, C.white, 1, 2.5); g.text('p = ' + nf(pp, 1), cx, cy + u + 44, { size: 20, mono: true, color: C.white, align: 'center' }); }
        vec(g, cx, cy, u, 0, 0, v[0], v[1], C.green, { lw: 4, head: 13, alpha: g.seg(p, .1, .2), label: 'v' });
        sidePanel(g, p, 810, 180, 410, 480, [['v = ' + vs(v), C.green, { mono: true }], ['‖v‖₁ = |' + v[0] + '| + |' + v[1] + '| = ' + nf(Math.abs(v[0]) + Math.abs(v[1])), C.cyan, { mono: true, size: 19, a: g.seg(p, .1, .2) }], ['L1 unit ball: a diamond', C.muted, { size: 17, a: g.seg(p, .1, .2) }], ['‖v‖₂ = √(' + v[0] + '² + ' + v[1] + '²) = ' + nf(Math.hypot(v[0], v[1])), C.pink, { mono: true, size: 19, a: g.seg(p, .3, .4) }], ['L2 unit ball: a circle', C.muted, { size: 17, a: g.seg(p, .3, .4) }], ['‖v‖∞ = max(|' + v[0] + '|, |' + v[1] + '|) = ' + nf(Math.max(Math.abs(v[0]), Math.abs(v[1]))), C.amber, { mono: true, size: 19, a: g.seg(p, .5, .6) }], ['L∞ unit ball: a square', C.muted, { size: 17, a: g.seg(p, .5, .6) }]]);
        return;
      }
      g.heading(P.head || 'L1 vs L2 regularisation', p, P.sub);
      var grow = g.E.inOut(g.seg(p, .14, .66));
      [[S.l1, 1, 'L1 (Lasso)', C.cyan], [S.l2, 2, 'L2 (Ridge)', C.pink]].forEach(function (cfg, k) {
        var cx = 300 + k * 600, cy = 440, u = 100, a0 = g.E.out(g.seg(p, 0, .1));
        g.text(cfg[2], cx, 190, { size: 26, weight: 700, head: true, color: cfg[3], align: 'center', alpha: a0 });
        clip(g, cx - 270, 212, 540, 440, function () {
          plane(g, cx, cy, u / 2, 5, 4, a0 * .6);
          if (cfg[1] === 1) g.path([[cx + u, cy], [cx, cy - u], [cx - u, cy], [cx, cy + u], [cx + u, cy]], { color: cfg[3], lw: 3, fill: g.hexA(cfg[3], .2), alpha: a0 });
          else g.circle(cx, cy, u, { fill: g.hexA(cfg[3], .2), stroke: cfg[3], lw: 3, alpha: a0 });
          var wx = cx + S.w[0] * u, wy = cy - S.w[1] * u, lvl = cfg[0].v * grow;
          [.25, .55, 1].forEach(function (fr) { var L = lvl * fr; if (L <= 0) return; g.ctx.save(); g.ctx.globalAlpha *= a0 * (fr === 1 ? 1 : .5); g.ctx.strokeStyle = C.amber; g.ctx.lineWidth = fr === 1 ? 3 : 1.5; g.ctx.beginPath(); g.ctx.ellipse(wx, wy, Math.sqrt(L / S.h[0]) * u, Math.sqrt(L / S.h[1]) * u, 0, 0, Math.PI * 2); g.ctx.stroke(); g.ctx.restore(); });
          g.circle(wx, wy, 7, { fill: C.amber, glow: C.amber, alpha: a0 }); g.text('best without penalty', wx + 20, wy - 24, { size: 15, color: C.amber, align: 'right', alpha: a0 });
          var hit = g.seg(p, .66, .74), pt = cfg[0].pt;
          g.circle(cx + pt[0] * u, cy - pt[1] * u, 11, { fill: C.white, glow: cfg[3], alpha: hit });
        });
        var pt2 = cfg[0].pt, zero = Math.abs(pt2[1]) < .02 || Math.abs(pt2[0]) < .02;
        g.text('w = (' + nf(pt2[0]) + ', ' + nf(pt2[1]) + ')', cx, 612, { size: 21, weight: 700, mono: true, align: 'center', alpha: g.seg(p, .7, .78) });
        g.text(zero ? 'Hits a corner → one weight is exactly 0 (sparse)' : 'Touches the smooth edge → both weights shrink, none is 0', cx, 648, { size: 18, color: zero ? C.green : C.muted, align: 'center', alpha: g.seg(p, .74, .82), maxW: 520 });
      });
    }
  });

  /* ---------- the curse of dimensionality ---------- */
  M.kit('dims', {
    init: function (P) {
      var r = R(P.seed || 8), ds = P.ds || [2, 10, 100, 1000], out = [];
      ds.forEach(function (d) { var pts = []; for (var i = 0; i < 60; i++) { var v = new Float64Array(d); for (var j = 0; j < d; j++) v[j] = r(); pts.push(v); } var dist = []; for (var a = 0; a < 60; a++) for (var b = a + 1; b < 60; b++) { var s = 0; for (var j2 = 0; j2 < d; j2++) { var q = pts[a][j2] - pts[b][j2]; s += q * q; } dist.push(Math.sqrt(s)); } var mn = Math.min.apply(null, dist), mx = Math.max.apply(null, dist), mean = dist.reduce(function (x, y) { return x + y; }, 0) / dist.length, hist = new Array(30).fill(0); dist.forEach(function (x) { hist[Math.min(29, Math.floor(x / mean / 2 * 30))]++; }); out.push({ d: d, hist: hist, spread: (mx - mn) / mn, ratio: mn / mx }); });
      return { out: out };
    },
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.cyan;
      g.heading(P.head || 'The curse of dimensionality', p, P.sub);
      S.out.forEach(function (o, k) {
        var x0 = 80 + k * 285, a = g.E.out(g.seg(p, .06 + k * .16, .2 + k * .16)), mx = Math.max.apply(null, o.hist), c = g.PAL[k];
        g.panel(x0, 190, 265, 380, { alpha: a, stroke: g.hexA(c, .5) });
        g.text('d = ' + o.d, x0 + 132, 224, { size: 26, weight: 800, head: true, color: c, align: 'center', alpha: a });
        o.hist.forEach(function (h, i) { var hh = h / mx * 190; g.box(x0 + 20 + i * 7.5, 470 - hh * a, 6.5, hh * a, { r: 2, fill: g.hexA(c, .85) }); });
        g.line(x0 + 20, 470, x0 + 245, 470, { color: '#56629c', lw: 2, alpha: a });
        g.text('0', x0 + 20, 490, { size: 14, mono: true, color: C.muted, alpha: a }); g.text('1', x0 + 132, 490, { size: 14, mono: true, color: C.muted, align: 'center', alpha: a }); g.text('2', x0 + 245, 490, { size: 14, mono: true, color: C.muted, align: 'right', alpha: a });
        g.text('nearest / farthest', x0 + 132, 524, { size: 15, color: C.muted, align: 'center', alpha: a });
        g.text(nf(o.ratio), x0 + 132, 552, { size: 22, weight: 700, mono: true, color: c, align: 'center', alpha: a });
      });
      g.text('Histograms of distances between 60 random points (÷ mean distance). As d grows, all distances look alike.', 640, 616, { size: 19, color: C.ink, align: 'center', maxW: 1100, alpha: g.seg(p, .7, .8) });
      g.text('When nearest ≈ farthest, "nearest neighbour" stops meaning much.', 640, 660, { size: 19, color: A, weight: 700, align: 'center', alpha: g.seg(p, .78, .88) });
    }
  });

  /* ---------- Bayesian updating of a coin's bias ---------- */
  M.kit('posterior', {
    init: function (P) { var r = R(P.seed || 2), fl = []; for (var i = 0; i < (P.n || 40); i++) fl.push(r() < (P.p || .7) ? 1 : 0); return { fl: fl }; },
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.cyan, pr = P.prior || [2, 2], N = S.fl.length, k = Math.floor(N * Math.pow(g.seg(p, .14, .9), 1.4)), hd = 0; for (var i = 0; i < k; i++) hd += S.fl[i];
      var a = pr[0] + hd, b = pr[1] + k - hd, bx = 110, by = 250, bw = 660, bh = 340, X = function (x) { return bx + x * bw; }, ymax = 6.5, Y = function (y) { return by + bh - Math.min(ymax, y) / ymax * bh; };
      g.heading(P.head || 'Bayesian updating: learning a coin’s bias', p, P.sub);
      S.fl.forEach(function (f, j) { var x = 116 + j * 27.5, on = j < k; g.circle(x, 196, 11, { fill: on ? (f ? C.amber : C.blue) : 'rgba(40,52,100,.6)', alpha: g.seg(p, .02, .08) }); if (on) g.text(f ? 'H' : 'T', x, 197, { size: 12, weight: 800, color: C.bg, align: 'center' }); });
      g.line(bx, by + bh, bx + bw, by + bh, { color: '#56629c', lw: 2 });
      for (var x = 0; x <= 1.0001; x += .2) g.text(nf(x, 1), X(x), by + bh + 24, { size: 16, mono: true, color: C.muted, align: 'center' });
      g.text('possible bias of the coin (probability of heads)', bx + bw / 2, by + bh + 54, { size: 16, color: C.muted, align: 'center' });
      var curve = function (aa, bb, c, o) { var pts = []; for (var j = 1; j < 200; j++) { var xx = j / 200; pts.push([X(xx), Y(betaPdf(xx, aa, bb))]); } if (o.fill) g.path([[X(0), Y(0)]].concat(pts, [[X(1), Y(0)]]), { color: 'rgba(0,0,0,0)', lw: 1, fill: g.hexA(c, o.fill) }); g.path(pts, { color: c, lw: o.lw || 4, dash: o.dash, glow: o.dash ? null : c }); };
      curve(pr[0], pr[1], C.muted, { dash: [6, 6], lw: 2 });
      curve(a, b, A, { fill: .18 });
      var mle = k ? hd / k : null, map = (a - 1) / (a + b - 2);
      if (mle != null) { g.line(X(mle), by, X(mle), by + bh, { color: C.pink, lw: 2, dash: [5, 6] }); g.text('MLE', X(mle), by - 12, { size: 15, weight: 700, color: C.pink, align: 'center' }); }
      g.circle(X(map), Y(betaPdf(map, a, b)), 8, { fill: C.green, glow: C.green });
      sidePanel(g, p, 820, 250, 400, 400, [['prior  Beta(' + pr[0] + ', ' + pr[1] + ')', C.muted, { mono: true, size: 19 }], ['flips ' + k + ':  ' + hd + ' H, ' + (k - hd) + ' T', C.ink, { mono: true, size: 19 }], ['posterior  Beta(' + a + ', ' + b + ')', A, { mono: true, size: 19, w: 700 }], ['MLE  = ' + (mle == null ? '—' : nf(mle)), C.pink, { mono: true, size: 19 }], ['MAP  = ' + nf(map), C.green, { mono: true, size: 19 }], ['More data → a narrower, more confident posterior', C.muted, { size: 17, a: g.seg(p, .6, .7) }]]);
    }
  });
})(window.Motion);
