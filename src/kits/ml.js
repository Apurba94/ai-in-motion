/* AI in Motion — machine learning kits. © Janin A Apurba, CSE, AUST */
(function (M) {
  'use strict';
  var PL = { x: 110, y: 170, w: 640, h: 470 };
  var mk = function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  var gs = function (r) { var u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
  var X = function (x) { return PL.x + x / 10 * PL.w; }, Y = function (y) { return PL.y + PL.h - y / 10 * PL.h; };
  var frame = function (g, p, o) { g.axes(PL.x, PL.y, PL.w, PL.h, { xl: o && o.xl, yl: o && o.yl, alpha: g.seg(p, 0, .1) }); };
  var side = function (g, h) { g.panel(800, 170, 400, h || 470); };
  var blobs = function (seed, centers, n, sd) { var r = mk(seed), pts = []; centers.forEach(function (c, k) { for (var i = 0; i < n; i++) pts.push([c[0] + gs(r) * sd, c[1] + gs(r) * sd, k]); }); return pts; };
  var sig = function (z) { return 1 / (1 + Math.exp(-z)); };

  /* ---------- linear regression fitted by gradient descent ---------- */
  M.kit('scatter-fit', {
    init: function () {
      var r = mk(21), pts = []; for (var i = 0; i < 22; i++) { var x = .4 + i * .43 + r() * .2; pts.push([x, 1.4 + .62 * x + gs(r) * .7]); }
      var w = -.3, b = 7, hist = [], lr = .012;
      for (var it = 0; it <= 400; it++) {
        var mse = 0, gw = 0, gb = 0; pts.forEach(function (q) { var e = w * q[0] + b - q[1]; mse += e * e; gw += 2 * e * q[0]; gb += 2 * e; });
        hist.push([w, b, mse / pts.length]); w -= lr * gw / pts.length; b -= lr * gb / pts.length;
      }
      return { pts: pts, hist: hist };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Fitting a line with gradient descent', p, P.sub); frame(g, p, { xl: P.xl || 'hours studied', yl: P.yl || 'exam score' });
      var it = Math.floor(Math.pow(g.seg(p, .12, .9), 1.6) * (S.hist.length - 1)), h = S.hist[it], w = h[0], b = h[1];
      S.pts.forEach(function (q, i) { var a = g.E.out(g.seg(p, i * .004, .06 + i * .004)); if (P.residuals !== false && p > .12) g.line(X(q[0]), Y(q[1]), X(q[0]), Y(w * q[0] + b), { color: g.C.red, lw: 2, alpha: .55 * a }); g.circle(X(q[0]), Y(q[1]), 7, { fill: g.C.cyan, alpha: a, glow: g.C.cyan, blur: 8 }); });
      if (p > .1) { var xa = 0, xb = 10; g.ctx.save(); g.ctx.beginPath(); g.ctx.rect(PL.x, PL.y, PL.w, PL.h); g.ctx.clip(); g.line(X(xa), Y(w * xa + b), X(xb), Y(w * xb + b), { color: g.C.pink, lw: 5, glow: g.C.pink }); g.ctx.restore(); }
      side(g);
      g.text('Model', 830, 212, { size: 17, color: g.C.muted }); g.text('ŷ = ' + w.toFixed(2) + '·x + ' + b.toFixed(2), 830, 248, { size: 26, weight: 700, mono: true });
      g.text('Iteration', 830, 302, { size: 17, color: g.C.muted }); g.text(String(it), 830, 336, { size: 28, weight: 700, mono: true, color: g.C.cyan });
      g.text('Mean squared error', 830, 390, { size: 17, color: g.C.muted }); g.text(h[2].toFixed(2), 830, 424, { size: 28, weight: 700, mono: true, color: g.C.red });
      var pts = S.hist.slice(0, it + 1).filter(function (_, i) { return i % 4 === 0; }).map(function (q, i, arr) { return [830 + (i / Math.max(1, (S.hist.length - 1) / 4)) * 340, 610 - Math.min(1, q[2] / S.hist[0][2]) * 150]; });
      g.axes(830, 460, 340, 150, { alpha: .8 }); g.path(pts, { color: g.C.red, lw: 3 }); g.text('error ↓ as training runs', 1170, 470, { size: 15, color: g.C.muted, align: 'right' });
    }
  });

  /* ---------- 1-D gradient descent on a loss curve ---------- */
  M.kit('loss-curve', {
    init: function (P) { var lr = P.lr || .25, xs = [P.x0 || .8], f = function (x) { return .35 * Math.pow(x - 5.5, 2) + 1; }, df = function (x) { return .7 * (x - 5.5); }; for (var i = 0; i < (P.steps || 14); i++) { var x = xs[xs.length - 1]; xs.push(Math.max(-.5, Math.min(10.5, x - lr * df(x)))); } return { xs: xs, f: f, df: df, lr: lr }; },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Gradient descent: walking downhill', p, P.sub);
      var LX = function (x) { return 110 + x / 10 * 640; }, LY = function (v) { return 640 - v / 12 * 460; };
      g.axes(110, 170, 640, 470, { xl: 'weight w', yl: 'loss', alpha: g.seg(p, 0, .1) });
      var curve = []; for (var x = -.3; x <= 10.3; x += .05) if (S.f(x) < 12) curve.push([LX(x), LY(S.f(x))]);
      g.path(curve, { color: g.C.violet, lw: 4, glow: g.C.violet, p: g.E.out(g.seg(p, 0, .12)) });
      var pos = g.seg(p, .15, .92) * (S.xs.length - 1), k = Math.floor(pos), f = g.E.inOut(pos - k), cur = g.lerp(S.xs[k], S.xs[Math.min(k + 1, S.xs.length - 1)], f);
      for (var i = 1; i <= k; i++) g.arrow(LX(S.xs[i - 1]), LY(S.f(S.xs[i - 1])) - 18, LX(S.xs[i]), LY(S.f(S.xs[i])) - 18, { color: g.hexA(g.C.pink, .7), lw: 2, head: 8 });
      var sl = S.df(cur); g.line(LX(cur - 1.3), LY(S.f(cur) - 1.3 * sl), LX(cur + 1.3), LY(S.f(cur) + 1.3 * sl), { color: g.C.amber, lw: 3, dash: [8, 6] });
      g.circle(LX(cur), LY(S.f(cur)) - 14, 14, { fill: g.C.pink, glow: g.C.pink });
      side(g);
      g.text('Update rule', 830, 212, { size: 17, color: g.C.muted }); g.text('w ← w − η · slope', 830, 248, { size: 24, weight: 700, mono: true });
      g.text('Learning rate η', 830, 306, { size: 17, color: g.C.muted }); g.text(String(S.lr), 830, 340, { size: 28, weight: 700, mono: true, color: g.C.cyan });
      g.text('Step ' + k + ' · w = ' + cur.toFixed(2), 830, 400, { size: 24, weight: 700, mono: true });
      g.text('slope = ' + sl.toFixed(2), 830, 440, { size: 24, weight: 700, mono: true, color: g.C.amber });
      g.text('minimum at w = 5.50', 830, 500, { size: 20, color: g.C.green });
      if (P.verdict) g.text(P.verdict, 830, 570, { size: 20, color: g.C.ink, maxW: 350, lh: 26, alpha: g.seg(p, .85, .95) });
    }
  });

  /* ---------- 2-D loss contours with several optimisers ---------- */
  M.kit('contour', {
    init: function (P) {
      var a = .3, b = 10, grad = function (x, y) { return [a * x, b * y]; }, start = [-5.5, 2.4], N = P.steps || 60, out = {};
      (P.opts || ['gd']).forEach(function (name) {
        var x = start[0], y = start[1], vx = 0, vy = 0, mx = 0, my = 0, sx = 0, sy = 0, path = [[x, y]], r = mk(3);
        for (var i = 1; i <= N; i++) {
          var gr = grad(x, y);
          if (name === 'gd') { x -= .19 * gr[0]; y -= .19 * gr[1]; }
          else if (name === 'sgd') { x -= .12 * (gr[0] + gs(r) * 1.6); y -= .12 * (gr[1] + gs(r) * 3); }
          else if (name === 'momentum') { vx = .85 * vx + gr[0]; vy = .85 * vy + gr[1]; x -= .03 * vx; y -= .03 * vy; }
          else if (name === 'adam') { mx = .9 * mx + .1 * gr[0]; my = .9 * my + .1 * gr[1]; sx = .999 * sx + .001 * gr[0] * gr[0]; sy = .999 * sy + .001 * gr[1] * gr[1]; var mh = 1 - Math.pow(.9, i), sh = 1 - Math.pow(.999, i); x -= .35 * (mx / mh) / (Math.sqrt(sx / sh) + 1e-8); y -= .35 * (my / mh) / (Math.sqrt(sy / sh) + 1e-8); }
          path.push([x, y]);
        }
        out[name] = path;
      });
      return { paths: out, a: a, b: b };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Descending a loss surface', p, P.sub);
      var cx = 560, cy = 410, sx = 80, sy = 80, T = function (q) { return [cx + q[0] * sx, cy - q[1] * sy]; };
      [.5, 2, 5, 10, 18, 30, 45, 62].forEach(function (L, i) { var rx = Math.sqrt(2 * L / S.a) * sx, ry = Math.sqrt(2 * L / S.b) * sy; g.ctx.save(); g.ctx.globalAlpha *= g.seg(p, 0, .12); g.ctx.strokeStyle = g.hexA(g.C.violet, .18 + .05 * (8 - i)); g.ctx.lineWidth = 2; g.ctx.beginPath(); g.ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.ctx.stroke(); g.ctx.restore(); });
      g.circle(cx, cy, 8, { fill: g.C.green, glow: g.C.green }); g.text('minimum', cx + 14, cy + 22, { size: 16, color: g.C.green });
      var cols = { gd: g.C.cyan, sgd: g.C.amber, momentum: g.C.pink, adam: g.C.green }, names = { gd: 'Gradient descent', sgd: 'SGD (noisy mini-batches)', momentum: 'Momentum', adam: 'Adam' };
      var names2 = Object.keys(S.paths), pp = g.seg(p, .12, .92);
      names2.forEach(function (n, i) {
        var path = S.paths[n], k = Math.max(1, Math.floor(pp * (path.length - 1))), pts = path.slice(0, k + 1).map(T), c = cols[n];
        g.path(pts, { color: c, lw: 3, glow: c, blur: 8 }); var last = pts[pts.length - 1]; g.circle(last[0], last[1], 9, { fill: c, glow: c });
        g.box(1010, 190 + i * 44, 18, 18, { r: 5, fill: c }); g.text(names[n], 1038, 199 + i * 44, { size: 18 });
      });
      var st = T([-5.5, 2.4]); g.text('start', st[0] - 10, st[1] - 18, { size: 16, color: g.C.muted });
    }
  });

  /* ---------- a linear classifier learning its decision boundary ---------- */
  M.kit('classify-boundary', {
    init: function (P) {
      var pts = blobs(P.seed || 14, [[3.3, 6.6], [6.8, 3.4]], 22, 1.25), model = P.model || 'logistic', w1 = .1, w2 = .9, b = -3, snaps = [];
      var r = mk(2);
      for (var it = 0; it < 60; it++) {
        snaps.push([w1, w2, b]);
        if (model === 'perceptron') { for (var k = 0; k < 4; k++) { var q = pts[Math.floor(r() * pts.length)], yv = q[2] ? -1 : 1, s = w1 * q[0] + w2 * q[1] + b; if (yv * s <= 0) { w1 += .08 * yv * q[0]; w2 += .08 * yv * q[1]; b += .08 * yv; } } }
        else { var g1 = 0, g2 = 0, gb = 0; pts.forEach(function (q) { var yv = q[2] ? 0 : 1, pr = sig(w1 * q[0] + w2 * q[1] + b), e = pr - yv; g1 += e * q[0]; g2 += e * q[1]; gb += e; }); w1 -= .08 * g1 / pts.length * 3; w2 -= .08 * g2 / pts.length * 3; b -= .08 * gb / pts.length * 3; }
      }
      snaps.push([w1, w2, b]);
      return { pts: pts, snaps: snaps, model: model };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || (S.model === 'perceptron' ? 'The perceptron learning rule' : 'Logistic regression learning a boundary'), p, P.sub); frame(g, p);
      var k = Math.floor(g.seg(p, .1, .9) * (S.snaps.length - 1)), sn = S.snaps[k], w1 = sn[0], w2 = sn[1], b = sn[2];
      if (S.model !== 'perceptron') for (var gx = 0; gx < 32; gx++) for (var gy = 0; gy < 24; gy++) { var x = (gx + .5) / 32 * 10, y = (gy + .5) / 24 * 10, pr = sig(w1 * x + w2 * y + b); g.ctx.fillStyle = pr > .5 ? g.hexA(g.C.pink, (pr - .5) * .5) : g.hexA(g.C.cyan, (.5 - pr) * .5); g.ctx.fillRect(X(x) - PL.w / 64, Y(y) - PL.h / 48, PL.w / 32 + 1, PL.h / 24 + 1); }
      var correct = 0;
      S.pts.forEach(function (q) { var s = w1 * q[0] + w2 * q[1] + b, predPink = s > 0, ok = predPink === (q[2] === 0); if (ok) correct++; g.circle(X(q[0]), Y(q[1]), 7, { fill: q[2] ? g.C.cyan : g.C.pink }); if (!ok) g.circle(X(q[0]), Y(q[1]), 13, { stroke: g.C.amber, lw: 2.5 }); });
      if (Math.abs(w2) > 1e-6) { g.ctx.save(); g.ctx.beginPath(); g.ctx.rect(PL.x, PL.y, PL.w, PL.h); g.ctx.clip(); var ya = -(w1 * 0 + b) / w2, yb = -(w1 * 10 + b) / w2; g.line(X(0), Y(ya), X(10), Y(yb), { color: g.C.ink, lw: 4, glow: g.C.white }); g.ctx.restore(); }
      side(g);
      g.text('Iteration', 830, 212, { size: 17, color: g.C.muted }); g.text(String(k), 830, 246, { size: 30, weight: 700, mono: true, color: g.C.cyan });
      g.text('Accuracy', 830, 300, { size: 17, color: g.C.muted }); g.text(Math.round(correct / S.pts.length * 100) + '%', 830, 336, { size: 34, weight: 700, mono: true, color: g.C.green });
      g.text(S.model === 'perceptron' ? 'Rule: if a point is misclassified, nudge the line towards it.' : 'Shading shows the predicted probability of each class.', 830, 410, { size: 20, maxW: 350, lh: 27 });
      g.circle(846, 540, 12, { stroke: g.C.amber, lw: 2.5 }); g.text('misclassified', 868, 540, { size: 18, color: g.C.muted });
    }
  });

  /* ---------- k-nearest neighbours ---------- */
  M.kit('knn', {
    init: function (P) { return { pts: blobs(P.seed || 9, [[3, 6.3], [7, 4]], 16, 1.5), q: [P.qx || 5.3, P.qy || 5.4], k: P.k || 5 }; },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'k-nearest neighbours (k = ' + S.k + ')', p, P.sub); frame(g, p);
      var q = S.q, d = S.pts.map(function (a, i) { return [Math.hypot(a[0] - q[0], a[1] - q[1]), i]; }).sort(function (a, b) { return a[0] - b[0]; }), near = {}; d.slice(0, S.k).forEach(function (x) { near[x[1]] = 1; });
      var votes = [0, 0]; d.slice(0, S.k).forEach(function (x) { votes[S.pts[x[1]][2]]++; }); var win = votes[0] >= votes[1] ? 0 : 1, cols = [g.C.pink, g.C.cyan];
      var aIn = g.E.out(g.seg(p, .12, .25)), aLine = g.seg(p, .28, .45), aCirc = g.E.out(g.seg(p, .45, .62)), aVote = g.seg(p, .66, .8);
      if (aLine > 0) S.pts.forEach(function (a, i) { g.line(X(q[0]), Y(q[1]), X(a[0]), Y(a[1]), { color: near[i] && aCirc > .5 ? g.C.ink : g.C.line, lw: near[i] && aCirc > .5 ? 2.5 : 1, p: aLine, alpha: near[i] && aCirc > .5 ? .9 : .5 }); });
      if (aCirc > 0) g.circle(X(q[0]), Y(q[1]), (d[S.k - 1][0] / 10 * PL.w + 10) * aCirc, { stroke: g.C.amber, lw: 3, dash: [8, 6], glow: g.C.amber });
      S.pts.forEach(function (a, i) { g.circle(X(a[0]), Y(a[1]), near[i] && aCirc > .5 ? 10 : 7, { fill: cols[a[2]], glow: near[i] && aCirc > .5 ? cols[a[2]] : null }); });
      var qx = g.lerp(X(9.6), X(q[0]), aIn), qy = g.lerp(Y(9.2), Y(q[1]), aIn);
      if (aIn > 0) { g.circle(qx, qy, 13, { fill: aVote > .9 ? cols[win] : g.C.white, stroke: g.C.bg, lw: 3, glow: g.C.white }); if (aVote < .9) g.text('?', qx, qy + 1, { size: 16, weight: 800, color: g.C.bg, align: 'center' }); }
      side(g);
      g.text('Votes from the ' + S.k + ' nearest', 830, 212, { size: 18, color: g.C.muted });
      [0, 1].forEach(function (c) { var n = Math.round(votes[c] * aVote); g.text(c ? 'Blue' : 'Pink', 830, 262 + c * 60, { size: 24, weight: 700, color: cols[c] }); for (var i = 0; i < n; i++) g.circle(930 + i * 34, 262 + c * 60, 12, { fill: cols[c] }); });
      if (aVote > .9) g.text('Prediction: ' + (win ? 'Blue' : 'Pink'), 830, 420, { size: 30, weight: 700, color: cols[win], head: true });
    }
  });

  /* ---------- decision tree splitting space (and a forest voting) ---------- */
  M.kit('tree-split', {
    init: function () {
      var r = mk(31), pts = []; for (var i = 0; i < 70; i++) { var x = .3 + r() * 9.4, y = .3 + r() * 9.4, c = x < 5.5 ? (y < 3 ? 1 : 0) : (y > 7.5 ? 0 : 1); pts.push([x, y, c]); } return { pts: pts };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'A decision tree splitting the data', p, P.sub); frame(g, p, { xl: 'feature 1', yl: 'feature 2' });
      var st = Math.floor(g.seg(p, .1, .85) * 4), cols = [g.C.pink, g.C.cyan];
      var pred = function (x, y) { if (st === 0) return 0; if (st === 1) return x < 5.5 ? 0 : 1; if (st === 2) return x < 5.5 ? (y < 3 ? 1 : 0) : 1; return x < 5.5 ? (y < 3 ? 1 : 0) : (y > 7.5 ? 0 : 1); };
      for (var gx = 0; gx < 40; gx++) for (var gy = 0; gy < 30; gy++) { var x = (gx + .5) / 4, y = (gy + .5) / 3; g.ctx.fillStyle = g.hexA(cols[pred(x, y)], .12); g.ctx.fillRect(X(gx / 4), Y((gy + 1) / 3), PL.w / 40 + .5, PL.h / 30 + .5); }
      var acc = 0; S.pts.forEach(function (q) { if (pred(q[0], q[1]) === q[2]) acc++; g.circle(X(q[0]), Y(q[1]), 6.5, { fill: cols[q[2]] }); });
      if (st >= 1) g.line(X(5.5), Y(0), X(5.5), Y(10), { color: g.C.white, lw: 3.5, glow: g.C.white, p: st === 1 ? g.seg(p, .1, .3) * 4 % 1 + (g.seg(p, .1, .3) >= .999 ? 1 : 0) : 1 });
      if (st >= 2) g.line(X(0), Y(3), X(5.5), Y(3), { color: g.C.white, lw: 3.5, glow: g.C.white });
      if (st >= 3) g.line(X(5.5), Y(7.5), X(10), Y(7.5), { color: g.C.white, lw: 3.5, glow: g.C.white });
      side(g);
      var node = function (x, y, s, fill) { var w = g.measure(s, { size: 17, weight: 700 }) + 24; g.box(x - w / 2, y - 18, w, 36, { r: 10, fill: fill || '#34407a' }); g.text(s, x, y + 1, { size: 17, weight: 700, align: 'center' }); };
      if (st === 0) node(1000, 230, 'Predict: pink'); else node(1000, 230, 'feature 1 < 5.5 ?');
      if (st >= 1) { g.line(990, 248, 900, 320, { color: g.C.line }); g.line(1010, 248, 1100, 320, { color: g.C.line }); node(900, 336, st >= 2 ? 'feature 2 < 3 ?' : 'pink', st >= 2 ? null : g.hexA(g.C.pink, .5)); node(1100, 336, st >= 3 ? 'feature 2 > 7.5 ?' : 'blue', st >= 3 ? null : g.hexA(g.C.cyan, .5)); }
      if (st >= 2) { g.line(890, 354, 860, 420, { color: g.C.line }); g.line(910, 354, 945, 420, { color: g.C.line }); node(855, 436, 'blue', g.hexA(g.C.cyan, .5)); node(950, 436, 'pink', g.hexA(g.C.pink, .5)); }
      if (st >= 3) { g.line(1090, 354, 1060, 420, { color: g.C.line }); g.line(1110, 354, 1145, 420, { color: g.C.line }); node(1055, 436, 'pink', g.hexA(g.C.pink, .5)); node(1150, 436, 'blue', g.hexA(g.C.cyan, .5)); }
      g.text('Accuracy: ' + Math.round(acc / S.pts.length * 100) + '%', 830, 560, { size: 30, weight: 700, mono: true, color: g.C.green });
    }
  });

  /* ---------- random forest voting ---------- */
  M.kit('forest', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'A random forest: many trees vote', p, P.sub);
      var votes = P.votes || ['Cat', 'Cat', 'Dog', 'Cat', 'Cat'], n = votes.length, cols = { Cat: g.C.pink, Dog: g.C.cyan };
      g.panel(90, 190, 200, 140); g.text('New example', 190, 230, { size: 18, color: g.C.muted, align: 'center' }); g.text('🐾', 190, 285, { size: 44, align: 'center' });
      votes.forEach(function (v, i) {
        var x = 390 + i * 150, y = 230, a = g.E.back(g.seg(p, .08 + i * .06, .18 + i * .06));
        g.arrow(290, 260, x - 40, y + 40, { color: g.C.line, lw: 2, p: a, head: 8 });
        g.line(x, y + 110, x, y + 160, { color: '#8a6a4a', lw: 10, alpha: a });
        [[0, 30, 44], [-26, 70, 36], [26, 70, 36], [0, 100, 30]].forEach(function (b) { g.circle(x + b[0], y + b[1], b[2] * a, { fill: g.hexA(g.C.green, .75) }); });
        var va = g.seg(p, .4 + i * .05, .5 + i * .05); g.pill(x, y + 200, v, { fill: cols[v], align: 'center', alpha: va, size: 18 });
        g.text('Tree ' + (i + 1), x, y - 20, { size: 15, color: g.C.muted, align: 'center', alpha: a });
      });
      var tally = {}; votes.forEach(function (v) { tally[v] = (tally[v] || 0) + 1; }); var win = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; })[0];
      var fa = g.E.out(g.seg(p, .75, .88));
      g.panel(390, 520, 610, 110, { alpha: fa }); g.text('Majority vote: ' + Object.keys(tally).map(function (k) { return k + ' ' + tally[k]; }).join(' · ') + '  →  ' + win, 695, 575, { size: 26, weight: 700, align: 'center', alpha: fa, color: cols[win] });
    }
  });

  /* ---------- support vector machine: the widest street ---------- */
  M.kit('svm', {
    draw: function (g, p, P, S, t) {
      if (P.mode === 'kernel') {
        g.heading(P.head || 'The kernel trick: lift the data', p, P.sub);
        var xs = [-3.2, -2.7, -2.3, 2.2, 2.6, 3.1, -1, -.6, -.2, .3, .7, 1.1], cls = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0], lift = g.E.inOut(g.seg(p, .3, .65));
        var KX = function (x) { return 640 + x * 150; }, KY = function (x) { return 590 - lift * x * x * 38; };
        g.line(120, 590, 1160, 590, { color: g.C.line, lw: 3 });
        if (lift > .05) { var pts = []; for (var x = -3.4; x <= 3.4; x += .05) pts.push([KX(x), 590 - lift * x * x * 38]); g.path(pts, { color: g.hexA(g.C.violet, .5), lw: 2, dash: [6, 6] }); }
        xs.forEach(function (x, i) { g.circle(KX(x), KY(x), 11, { fill: cls[i] ? g.C.cyan : g.C.pink, glow: cls[i] ? g.C.cyan : g.C.pink }); });
        g.text(lift < .1 ? 'In 1-D: no single threshold separates pink from blue' : 'New feature x² lifts the blue points up', 640, 660, { size: 22, align: 'center', color: g.C.muted });
        if (p > .7) { var a = g.seg(p, .7, .85); g.line(160, 590 - 2.8 * 38, 1120, 590 - 2.8 * 38, { color: g.C.green, lw: 4, glow: g.C.green, p: a }); g.text('now a straight line separates them', 1120, 590 - 2.8 * 38 - 26, { size: 20, color: g.C.green, align: 'right', alpha: a }); }
        return;
      }
      g.heading(P.head || 'Support vector machine: maximum margin', p, P.sub); frame(g, p);
      var A = [[4, 6], [6, 8], [2, 7], [3, 8.8], [1.4, 5.2], [4.6, 9.2], [1, 8.4], [2.6, 5.6]], B = [[6, 4], [8, 5], [7.2, 2.4], [8.8, 3.6], [5.2, 1.2], [9, 1.8], [6.6, 1], [9.2, 6.2]];
      var ph = g.seg(p, .1, .95), cands = [[.35, 3.4], [1.9, -4.2], [.9, .9]], ci = Math.min(2, Math.floor(ph / .15));
      var clipLine = function (m, c, o) { g.ctx.save(); g.ctx.beginPath(); g.ctx.rect(PL.x, PL.y, PL.w, PL.h); g.ctx.clip(); g.line(X(0), Y(c), X(10), Y(m * 10 + c), o); g.ctx.restore(); };
      if (ph < .45) clipLine(cands[ci][0], cands[ci][1], { color: g.C.muted, lw: 3, dash: [10, 8] });
      var fin = g.E.out(g.seg(ph, .45, .7));
      if (fin > 0) {
        g.ctx.save(); g.ctx.beginPath(); g.ctx.rect(PL.x, PL.y, PL.w, PL.h); g.ctx.clip(); g.ctx.globalAlpha *= fin * .18; g.ctx.fillStyle = g.C.green; g.ctx.beginPath(); g.ctx.moveTo(X(0), Y(2)); g.ctx.lineTo(X(10), Y(12)); g.ctx.lineTo(X(10), Y(8)); g.ctx.lineTo(X(0), Y(-2)); g.ctx.closePath(); g.ctx.fill(); g.ctx.restore();
        clipLine(1, 2, { color: g.C.green, lw: 2, dash: [8, 6], alpha: fin }); clipLine(1, -2, { color: g.C.green, lw: 2, dash: [8, 6], alpha: fin }); clipLine(1, 0, { color: g.C.white, lw: 4, glow: g.C.white, alpha: fin });
      }
      A.forEach(function (q, i) { g.circle(X(q[0]), Y(q[1]), 8, { fill: g.C.pink }); if (i < 2 && ph > .7) g.circle(X(q[0]), Y(q[1]), 15, { stroke: g.C.amber, lw: 3, glow: g.C.amber }); });
      B.forEach(function (q, i) { g.circle(X(q[0]), Y(q[1]), 8, { fill: g.C.cyan }); if (i < 1 && ph > .7) g.circle(X(q[0]), Y(q[1]), 15, { stroke: g.C.amber, lw: 3, glow: g.C.amber }); });
      side(g);
      g.text(ph < .45 ? 'Many lines separate the classes…' : 'The SVM picks the widest street', 830, 220, { size: 22, weight: 700, maxW: 350, lh: 28 });
      if (ph > .7) { g.circle(846, 330, 12, { stroke: g.C.amber, lw: 3 }); g.text('support vectors', 868, 330, { size: 19 }); g.text('Only these points decide where the boundary goes.', 830, 390, { size: 19, color: g.C.muted, maxW: 350, lh: 25 }); }
    }
  });

  /* ---------- k-means with gliding centroids ---------- */
  M.kit('kmeans', {
    init: function (P) {
      var pts = blobs(P.seed || 5, [[2.6, 7], [7.2, 7.3], [5, 2.6]], 18, .95).map(function (q) { return [Math.max(.3, Math.min(9.7, q[0])), Math.max(.3, Math.min(9.7, q[1]))]; });
      var cent = [[1.2, 1.6], [2.2, 2.6], [9, 3.2]], states = [{ cent: cent.map(function (c) { return c.slice(); }), asg: null }];
      for (var it = 0; it < 5; it++) {
        var asg = pts.map(function (q) { var b = 0, bd = 1e9; cent.forEach(function (c, k) { var d = Math.pow(q[0] - c[0], 2) + Math.pow(q[1] - c[1], 2); if (d < bd) { bd = d; b = k; } }); return b; });
        states.push({ cent: cent.map(function (c) { return c.slice(); }), asg: asg });
        cent = cent.map(function (c, k) { var m = pts.filter(function (_, j) { return asg[j] === k; }); return m.length ? [m.reduce(function (a, q) { return a + q[0]; }, 0) / m.length, m.reduce(function (a, q) { return a + q[1]; }, 0) / m.length] : c; });
        states.push({ cent: cent.map(function (c) { return c.slice(); }), asg: asg });
      }
      return { pts: pts, states: states };
    },
    draw: function (g, p, P, S, t) {
      var n = S.states.length, pos = g.seg(p, .08, .92) * (n - 1), k = Math.floor(pos), f = g.E.inOut(g.clamp((pos - k) * 1.6)), A = S.states[k], B = S.states[Math.min(k + 1, n - 1)], cols = [g.C.pink, g.C.cyan, g.C.amber];
      var label = k === 0 ? 'Place k = 3 random centroids' : (k % 2 === 1 ? 'Step 1 · assign each point to its nearest centroid' : 'Step 2 · move each centroid to the mean of its points');
      g.heading(P.head || 'k-means clustering', p, label); frame(g, p);
      var cent = A.cent.map(function (c, i) { return [g.lerp(c[0], B.cent[i][0], f), g.lerp(c[1], B.cent[i][1], f)]; }), asg = (f > .5 ? B.asg : A.asg);
      S.pts.forEach(function (q, j) { var c = asg ? cols[asg[j]] : '#8f99be'; if (asg) g.line(X(q[0]), Y(q[1]), X(cent[asg[j]][0]), Y(cent[asg[j]][1]), { color: c, lw: 1, alpha: .25 }); g.circle(X(q[0]), Y(q[1]), 7, { fill: c }); });
      cent.forEach(function (c, i) { g.circle(X(c[0]), Y(c[1]), 18, { fill: g.C.bg, stroke: cols[i], lw: 4, glow: cols[i] }); g.text('×', X(c[0]), Y(c[1]) + 1, { size: 24, weight: 800, color: cols[i], align: 'center' }); });
      side(g);
      g.text('Round', 830, 212, { size: 17, color: g.C.muted }); g.text(String(Math.ceil(k / 2)), 830, 248, { size: 32, weight: 700, mono: true, color: g.C.cyan });
      var inertia = 0; if (asg) S.pts.forEach(function (q, j) { inertia += Math.pow(q[0] - cent[asg[j]][0], 2) + Math.pow(q[1] - cent[asg[j]][1], 2); });
      g.text('Within-cluster distance', 830, 312, { size: 17, color: g.C.muted }); g.text(asg ? inertia.toFixed(1) : '—', 830, 348, { size: 32, weight: 700, mono: true, color: g.C.amber });
      g.text('It drops every round until the centroids stop moving.', 830, 420, { size: 19, color: g.C.ink, maxW: 350, lh: 25 });
    }
  });

  /* ---------- PCA: find the direction of maximum variance ---------- */
  M.kit('pca', {
    init: function () {
      var r = mk(12), pts = []; for (var i = 0; i < 60; i++) { var u = gs(r) * 2.1, v = gs(r) * .55, a = .52; pts.push([5 + u * Math.cos(a) - v * Math.sin(a), 5 + u * Math.sin(a) + v * Math.cos(a)]); }
      var mx = 0, my = 0; pts.forEach(function (q) { mx += q[0]; my += q[1]; }); mx /= pts.length; my /= pts.length;
      var sxx = 0, syy = 0, sxy = 0; pts.forEach(function (q) { var dx = q[0] - mx, dy = q[1] - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }); sxx /= pts.length; syy /= pts.length; sxy /= pts.length;
      var ang = .5 * Math.atan2(2 * sxy, sxx - syy), tr = sxx + syy, det = sxx * syy - sxy * sxy, l1 = tr / 2 + Math.sqrt(tr * tr / 4 - det);
      return { pts: pts, mx: mx, my: my, ang: ang, ratio: l1 / tr, varAt: function (a) { var c = Math.cos(a), s = Math.sin(a); return c * c * sxx + 2 * c * s * sxy + s * s * syy; }, tr: tr };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Principal component analysis', p, P.sub); frame(g, p);
      var sweep = g.seg(p, .1, .55), a = sweep < 1 ? S.ang - Math.PI / 2 + E(sweep) * Math.PI / 2 : S.ang; function E(v) { return g.E.inOut(v); }
      var proj = g.E.inOut(g.seg(p, .62, .85)), c = Math.cos(a), s = Math.sin(a);
      g.ctx.save(); g.ctx.beginPath(); g.ctx.rect(PL.x, PL.y, PL.w, PL.h); g.ctx.clip();
      g.line(X(S.mx - c * 8), Y(S.my - s * 8), X(S.mx + c * 8), Y(S.my + s * 8), { color: g.C.amber, lw: 4, glow: g.C.amber });
      S.pts.forEach(function (q) { var d = (q[0] - S.mx) * c + (q[1] - S.my) * s, px2 = S.mx + d * c, py2 = S.my + d * s; if (sweep >= 1 && proj < 1) g.line(X(q[0]), Y(q[1]), X(px2), Y(py2), { color: g.C.muted, lw: 1, alpha: .4 }); g.circle(X(g.lerp(q[0], px2, proj)), Y(g.lerp(q[1], py2, proj)), 6.5, { fill: g.C.cyan }); });
      g.ctx.restore();
      side(g);
      var v = S.varAt(a) / S.tr;
      g.text('Variance captured along the line', 830, 214, { size: 18, color: g.C.muted }); g.box(830, 236, 340, 22, { r: 11, fill: g.C.faint }); g.box(830, 236, 340 * v, 22, { r: 11, fill: g.C.amber, glow: g.C.amber });
      g.text(Math.round(v * 100) + '%', 1170, 280, { size: 26, weight: 700, mono: true, align: 'right', color: g.C.amber });
      g.text(sweep < 1 ? 'Rotating the line to find the direction where the data spreads the most…' : proj < .05 ? 'Found it: the first principal component.' : 'Projecting onto PC1: 2 dimensions become 1, keeping ' + Math.round(S.ratio * 100) + '% of the variance.', 830, 360, { size: 21, maxW: 350, lh: 28 });
    }
  });

  /* ---------- under-, good and over-fitting ---------- */
  M.kit('fit-compare', {
    init: function () {
      var r = mk(17), truth = function (x) { return .16 * Math.pow(x - 5, 2) + 2.2; }, tr = [], va = [];
      for (var i = 0; i < 10; i++) { var x = .7 + i * .95; tr.push([x, truth(x) + gs(r) * .75]); } for (i = 0; i < 8; i++) { var x2 = 1.1 + i * 1.08; va.push([x2, truth(x2) + gs(r) * .75]); }
      var n = tr.length, sx = 0, sy = 0, sxx = 0, sxy = 0; tr.forEach(function (q) { sx += q[0]; sy += q[1]; sxx += q[0] * q[0]; sxy += q[0] * q[1]; });
      var m = (n * sxy - sx * sy) / (n * sxx - sx * sx), c = (sy - m * sx) / n, lin = function (x) { return m * x + c; };
      var Sm = function (k) { return tr.reduce(function (a, q) { return a + Math.pow(q[0], k); }, 0); }, Sy = function (k) { return tr.reduce(function (a, q) { return a + Math.pow(q[0], k) * q[1]; }, 0); };
      var A = [[n, Sm(1), Sm(2), Sy(0)], [Sm(1), Sm(2), Sm(3), Sy(1)], [Sm(2), Sm(3), Sm(4), Sy(2)]];
      for (var col = 0; col < 3; col++) { for (var row = 0; row < 3; row++) if (row !== col) { var fct = A[row][col] / A[col][col]; for (var k = col; k < 4; k++) A[row][k] -= fct * A[col][k]; } }
      var q0 = A[0][3] / A[0][0], q1 = A[1][3] / A[1][1], q2 = A[2][3] / A[2][2], quad = function (x) { return q0 + q1 * x + q2 * x * x; };
      var poly = function (x) { var s = 0; for (var i = 0; i < n; i++) { var l = 1; for (var j = 0; j < n; j++) if (j !== i) l *= (x - tr[j][0]) / (tr[i][0] - tr[j][0]); s += l * tr[i][1]; } return s; };
      var mse = function (f, d) { return d.reduce(function (a, q) { return a + Math.pow(f(q[0]) - q[1], 2); }, 0) / d.length; };
      var models = [['Underfit (straight line)', lin, '#fbbf24'], ['Good fit (gentle curve)', quad, '#34d399'], ['Overfit (degree-9 polynomial)', poly, '#f87171']].map(function (mm) { return { name: mm[0], f: mm[1], c: mm[2], tr: mse(mm[1], tr), va: mse(mm[1], va) }; });
      return { tr: tr, va: va, models: models };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Underfitting vs overfitting', p, P.sub); frame(g, p);
      var ph = g.seg(p, .08, .95), mi = Math.min(2, Math.floor(ph / .22)), showVal = ph > .66;
      g.ctx.save(); g.ctx.beginPath(); g.ctx.rect(PL.x, PL.y, PL.w, PL.h); g.ctx.clip();
      S.models.forEach(function (m, i) { if (i > mi) return; var pts = []; for (var x = .3; x <= 9.7; x += .03) pts.push([X(x), Y(Math.max(-1, Math.min(11, m.f(x))))]); g.path(pts, { color: m.c, lw: i === mi && !showVal ? 5 : 3, alpha: i === mi || showVal ? 1 : .3, glow: i === mi ? m.c : null, p: i === mi && !showVal ? g.E.out(g.seg(ph - i * .22, 0, .16)) : 1 }); });
      g.ctx.restore();
      S.tr.forEach(function (q) { g.circle(X(q[0]), Y(q[1]), 8, { fill: g.C.cyan }); });
      if (showVal) S.va.forEach(function (q) { g.box(X(q[0]) - 7, Y(q[1]) - 7, 14, 14, { r: 3, fill: g.C.violet, alpha: g.seg(ph, .66, .72) }); });
      side(g);
      g.circle(846, 204, 7, { fill: g.C.cyan }); g.text('training data', 862, 204, { size: 16, color: g.C.muted });
      g.box(1000, 197, 14, 14, { r: 3, fill: g.C.violet, alpha: showVal ? 1 : .3 }); g.text('validation data', 1022, 204, { size: 16, color: g.C.muted });
      S.models.forEach(function (m, i) {
        if (i > mi) return; var y = 250 + i * 118;
        g.text(m.name, 830, y, { size: 19, weight: 700, color: m.c });
        g.text('train error  ' + m.tr.toFixed(2), 830, y + 34, { size: 18, mono: true });
        if (showVal) g.text('validation   ' + (m.va > 99 ? '>99' : m.va.toFixed(2)), 830, y + 64, { size: 18, mono: true, color: m.va > 2 ? g.C.red : g.C.green, alpha: g.seg(ph, .7, .78) });
      });
    }
  });

  /* ---------- bias and variance as darts ---------- */
  M.kit('darts', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Bias and variance', p, P.sub);
      var r = mk(8), cfg = [['Low bias · low variance', 0, 0, .25, g.C.green], ['Low bias · high variance', 0, 0, .9, g.C.amber], ['High bias · low variance', .9, -.6, .25, g.C.amber], ['High bias · high variance', .8, -.7, .9, g.C.red]];
      cfg.forEach(function (c, i) {
        var cx = 250 + (i % 2) * 380 + (i >= 2 ? 0 : 0), cy = 300 + Math.floor(i / 2) * 250, cx2 = i % 2 ? 900 : 380; cx = i % 2 ? 900 : 380; void cx2;
        [110, 80, 50, 22].forEach(function (R, j) { g.circle(cx, cy, R * .95, { fill: j % 2 ? '#1b2350' : '#2a3570', stroke: g.C.line, lw: 1 }); });
        g.text(c[0], cx, cy - 122, { size: 19, weight: 700, color: c[4], align: 'center' });
        for (var k = 0; k < 12; k++) { var dx = (c[1] + gs(r) * c[3]) * 55, dy = (c[2] + gs(r) * c[3]) * 55, a = g.E.back(g.seg(p, .08 + i * .14 + k * .008, .14 + i * .14 + k * .008)); if (a > 0) g.circle(cx + dx, cy + dy, 6 * a, { fill: g.C.white, glow: c[4] }); }
      });
      g.text('Bias = aiming off-centre (too simple).   Variance = scattered throws (too sensitive).', 640, 685, { size: 20, align: 'center', color: g.C.muted, alpha: g.seg(p, .7, .8) });
    }
  });

  /* ---------- train / validation / test split and k-fold cross-validation ---------- */
  M.kit('split-folds', {
    draw: function (g, p, P, S, t) {
      var k = P.k || 5, kfold = P.mode === 'kfold';
      g.heading(P.head || (kfold ? k + '-fold cross-validation' : 'Train, validation and test sets'), p, P.sub);
      var r = mk(4), N = 50, order = []; for (var i = 0; i < N; i++) order.push(i); order.sort(function () { return r() - .5; });
      if (!kfold) {
        var sh = g.E.inOut(g.seg(p, .1, .3)), sp = g.E.inOut(g.seg(p, .38, .6));
        for (i = 0; i < N; i++) {
          var slot = order.indexOf(i), from = i, to = sh > .5 ? slot : i, pos = g.lerp(from, slot, sh), part = pos < 35 ? 0 : pos < 43 ? 1 : 2, x = 110 + pos * 21 + sp * part * 40, c = (i * 7) % 3 === 0 ? g.C.pink : g.C.cyan;
          g.box(x, 280, 17, 90, { r: 5, fill: c }); void to;
        }
        [['Training 70%', 0, 35, g.C.green, 'the model learns from these'], ['Validation 15%', 35, 8, g.C.amber, 'tune settings, compare models'], ['Test 15%', 43, 7, g.C.pink, 'final, one-time check']].forEach(function (s, j) {
          var x = 110 + s[1] * 21 + j * 40 * sp, w = s[2] * 21 - 4, a = g.seg(p, .6 + j * .08, .7 + j * .08);
          g.line(x, 390, x + w, 390, { color: s[3], lw: 5, alpha: a }); g.text(s[0], x, 420, { size: 21, weight: 700, color: s[3], alpha: a }); g.text(s[4], x, 452, { size: 17, color: g.C.muted, alpha: a, maxW: Math.max(160, w), lh: 21 });
        });
        g.text('Shuffle first, then split. Never train on the test set.', 640, 600, { size: 23, align: 'center', alpha: g.seg(p, .85, .92) });
        return;
      }
      var scores = P.scores || [.84, .87, .82, .86, .85], cur = Math.min(k - 1, Math.floor(g.seg(p, .1, .85) * k));
      for (var f = 0; f < k; f++) {
        var y = 190 + f * 78, shown = f <= cur;
        g.text('Round ' + (f + 1), 110, y + 28, { size: 19, color: shown ? g.C.ink : g.C.muted });
        for (var j = 0; j < k; j++) { var val = j === f; g.box(250 + j * 150, y, 140, 56, { r: 10, fill: shown ? (val ? g.hexA(g.C.amber, .8) : g.hexA(g.C.green, .45)) : 'rgba(40,52,100,.5)' }); if (shown) g.text(val ? 'validate' : 'train', 320 + j * 150, y + 29, { size: 17, weight: 700, align: 'center', color: val ? g.C.bg : g.C.ink }); }
        if (shown) g.text(scores[f].toFixed(2), 1040, y + 28, { size: 24, weight: 700, mono: true, color: g.C.amber });
      }
      var avg = scores.slice(0, k).reduce(function (a, b) { return a + b; }, 0) / k;
      g.text('Average score: ' + avg.toFixed(3), 640, 650, { size: 26, weight: 700, mono: true, align: 'center', color: g.C.green, alpha: g.seg(p, .86, .94) });
    }
  });

  /* ---------- confusion matrix, and a moving decision threshold with ROC ---------- */
  M.kit('confusion', {
    init: function () {
      var r = mk(6), pos = [], neg = []; for (var i = 0; i < 200; i++) { pos.push(Math.max(0, Math.min(1, .66 + gs(r) * .13))); neg.push(Math.max(0, Math.min(1, .36 + gs(r) * .13))); }
      var roc = []; for (var th = 1.001; th >= -.001; th -= .01) { var tp = pos.filter(function (v) { return v >= th; }).length, fp = neg.filter(function (v) { return v >= th; }).length; roc.push([fp / 200, tp / 200]); }
      var auc = 0; for (i = 1; i < roc.length; i++) auc += (roc[i][0] - roc[i - 1][0]) * (roc[i][1] + roc[i - 1][1]) / 2;
      return { pos: pos, neg: neg, roc: roc, auc: auc };
    },
    draw: function (g, p, P, S, t) {
      if (P.mode === 'threshold') {
        g.heading(P.head || 'Moving the decision threshold', p, P.sub);
        var th = g.lerp(.2, .8, g.E.inOut(g.seg(p, .12, .9))), hx = 110, hy = 190, hw = 560, hh = 300, bins = 25;
        var hist = function (arr) { var h = new Array(bins).fill(0); arr.forEach(function (v) { h[Math.min(bins - 1, Math.floor(v * bins))]++; }); return h; }, hp = hist(S.pos), hn = hist(S.neg), mx = Math.max.apply(null, hp.concat(hn));
        for (var i = 0; i < bins; i++) { var bw = hw / bins; g.box(hx + i * bw + 1, hy + hh - hn[i] / mx * hh, bw - 2, hn[i] / mx * hh, { r: 3, fill: g.hexA(g.C.cyan, .55) }); g.box(hx + i * bw + 1, hy + hh - hp[i] / mx * hh, bw - 2, hp[i] / mx * hh, { r: 3, fill: g.hexA(g.C.pink, .55) }); }
        g.axes(hx, hy, hw, hh, { xl: 'model score', alpha: 1 });
        g.line(hx + th * hw, hy - 10, hx + th * hw, hy + hh + 10, { color: g.C.amber, lw: 4, glow: g.C.amber }); g.text('threshold ' + th.toFixed(2), hx + th * hw, hy - 26, { size: 18, mono: true, color: g.C.amber, align: 'center' });
        g.box(hx, hy + hh + 44, 14, 14, { r: 3, fill: g.C.pink }); g.text('positive (spam)', hx + 22, hy + hh + 51, { size: 16, color: g.C.muted }); g.box(hx + 200, hy + hh + 44, 14, 14, { r: 3, fill: g.C.cyan }); g.text('negative (not spam)', hx + 222, hy + hh + 51, { size: 16, color: g.C.muted });
        var tp = S.pos.filter(function (v) { return v >= th; }).length, fp = S.neg.filter(function (v) { return v >= th; }).length, fn = 200 - tp, prec = tp / Math.max(1, tp + fp), rec = tp / 200;
        g.text('Precision ' + (prec * 100).toFixed(0) + '%', hx, 620, { size: 24, weight: 700, mono: true, color: g.C.green }); g.text('Recall ' + (rec * 100).toFixed(0) + '%', hx + 300, 620, { size: 24, weight: 700, mono: true, color: g.C.violet }); void fn;
        var rx = 790, ry = 190, rs = 360; g.panel(rx - 20, ry - 20, rs + 60, rs + 90); g.axes(rx, ry, rs, rs, { xl: 'false positive rate', yl: 'true positive rate' });
        g.line(rx, ry + rs, rx + rs, ry, { color: g.C.muted, dash: [6, 6], lw: 1.5 });
        var upto = S.roc.filter(function (q, j) { return 1.001 - j * .01 >= th; }).map(function (q) { return [rx + q[0] * rs, ry + rs - q[1] * rs]; });
        g.path(upto, { color: g.C.pink, lw: 4, glow: g.C.pink }); var last = upto[upto.length - 1]; if (last) g.circle(last[0], last[1], 8, { fill: g.C.amber, glow: g.C.amber });
        g.text('ROC curve · AUC ≈ ' + S.auc.toFixed(2), rx + rs, ry + rs + 60, { size: 18, mono: true, color: g.C.muted, align: 'right', alpha: g.seg(p, .85, .92) });
        return;
      }
      var cm = P.cm || [42, 8, 6, 44], lab = P.labels || ['Spam', 'Not spam'];
      g.heading(P.head || 'The confusion matrix', p, P.sub);
      var cells = [['True positive', cm[0], g.C.green, 0, 0], ['False positive', cm[1], g.C.red, 1, 0], ['False negative', cm[2], g.C.red, 0, 1], ['True negative', cm[3], g.C.green, 1, 1]], x0 = 230, y0 = 220, cw = 230, ch = 170;
      g.text('ACTUAL', x0 + cw, 170, { size: 16, weight: 800, color: g.C.muted, align: 'center', head: true }); g.text(lab[0], x0 + cw / 2, 198, { size: 18, align: 'center' }); g.text(lab[1], x0 + cw * 1.5, 198, { size: 18, align: 'center' });
      g.text('PREDICTED', 110, y0 + ch, { size: 16, weight: 800, color: g.C.muted, head: true }); g.text(lab[0], x0 - 14, y0 + ch / 2, { size: 18, align: 'right' }); g.text(lab[1], x0 - 14, y0 + ch * 1.5, { size: 18, align: 'right' });
      cells.forEach(function (c, i) { var a = g.E.back(g.seg(p, .1 + i * .12, .22 + i * .12)), x = x0 + c[3] * cw, y = y0 + c[4] * ch; g.box(x + 5, y + 5, cw - 10, ch - 10, { r: 16, fill: g.hexA(c[2], .25 + .5 * a), stroke: c[2], lw: 2 }); if (a > 0) { g.text(String(Math.round(c[1] * g.clamp(a))), x + cw / 2, y + ch / 2 - 10, { size: 48, weight: 700, mono: true, align: 'center' }); g.text(c[0], x + cw / 2, y + ch / 2 + 40, { size: 18, align: 'center', alpha: a }); } });
      var tp = cm[0], fp = cm[1], fn = cm[2], tn = cm[3], acc = (tp + tn) / (tp + fp + fn + tn), prec = tp / (tp + fp), rec = tp / (tp + fn), f1 = 2 * prec * rec / (prec + rec);
      g.panel(800, 190, 400, 420, { alpha: g.seg(p, .6, .7) });
      [['Accuracy', acc, '(TP+TN) / all'], ['Precision', prec, 'TP / (TP+FP)'], ['Recall', rec, 'TP / (TP+FN)'], ['F1 score', f1, 'balance of both']].forEach(function (m, i) { var a = g.seg(p, .62 + i * .07, .7 + i * .07); g.text(m[0], 830, 236 + i * 96, { size: 19, color: g.C.muted, alpha: a }); g.text((m[1] * 100).toFixed(1) + '%', 830, 272 + i * 96, { size: 32, weight: 700, mono: true, alpha: a }); g.text(m[2], 1170, 272 + i * 96, { size: 16, mono: true, color: g.C.muted, align: 'right', alpha: a }); });
    }
  });

  /* ---------- learning curves: training vs validation loss ---------- */
  M.kit('learning-curve', {
    draw: function (g, p, P, S, t) {
      var mode = P.mode || 'overfit', E2 = 60;
      g.heading(P.head || 'Training and validation loss', p, P.sub);
      var tr = function (e) { return .12 + 1.7 * Math.exp(-e / 9); }, va = function (e) { return mode === 'overfit' ? .45 + 1.45 * Math.exp(-e / 8) + Math.max(0, e - 18) * .018 : .2 + 1.6 * Math.exp(-e / 9.5); };
      var LX = function (e) { return 110 + e / E2 * 700; }, LY = function (v) { return 640 - v / 2.1 * 460; };
      g.axes(110, 170, 700, 470, { xl: 'epoch', yl: 'loss', alpha: g.seg(p, 0, .1) });
      var ep = g.seg(p, .1, .85) * E2, a = [], b = []; for (var e = 0; e <= ep; e += .5) { a.push([LX(e), LY(tr(e))]); b.push([LX(e), LY(va(e))]); }
      g.path(a, { color: g.C.cyan, lw: 4, glow: g.C.cyan }); g.path(b, { color: g.C.pink, lw: 4, glow: g.C.pink });
      side(g); g.text('Epoch ' + Math.floor(ep), 830, 214, { size: 28, weight: 700, mono: true });
      g.line(830, 270, 870, 270, { color: g.C.cyan, lw: 4 }); g.text('training loss ' + tr(ep).toFixed(2), 884, 270, { size: 19, mono: true });
      g.line(830, 310, 870, 310, { color: g.C.pink, lw: 4 }); g.text('validation loss ' + va(ep).toFixed(2), 884, 310, { size: 19, mono: true });
      if (mode === 'overfit' && ep > 22) {
        var best = 0, bv = 9; for (e = 0; e <= E2; e += .5) if (va(e) < bv) { bv = va(e); best = e; }
        g.line(LX(best), 170, LX(best), 640, { color: g.C.amber, lw: 2.5, dash: [8, 6] }); g.text('early stopping', LX(best) + 10, 200, { size: 18, color: g.C.amber });
        g.text('The gap widens: the model is memorising the training data.', 830, 400, { size: 20, maxW: 350, lh: 27, color: g.C.ink, alpha: g.seg(p, .5, .6) });
      } else if (mode !== 'overfit') g.text('Both curves fall together: the model generalises.', 830, 400, { size: 20, maxW: 350, lh: 27, alpha: g.seg(p, .5, .6) });
    }
  });
})(window.Motion);
