/* AI in Motion — MLOps & ML engineering kits (pipelines, containers, serving, monitoring, experiments). © Janin A Apurba, CSE, AUST */
(function (M) {
  'use strict';
  var R = function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  var nf = function (v, d) { var s = (+v).toFixed(d == null ? 2 : d); if (/^-0\.?0*$/.test(s)) s = s.slice(1); return s.replace('-', '−'); };
  var erf = function (x) { var s = x < 0 ? -1 : 1; x = Math.abs(x); var t = 1 / (1 + .3275911 * x), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-x * x); return s * y; };
  var Phi = function (z) { return .5 * (1 + erf(z / Math.SQRT2)); };
  var side = function (g, p, x, y, w, h, lines) { g.panel(x, y, w, h, { alpha: g.E.out(g.seg(p, .03, .12)) }); var yy = y + 38; lines.forEach(function (l) { if (!l) return; var o = l[2] || {}; if ((o.a == null ? 1 : o.a) > 0) g.text(l[0], x + 24, yy, { size: o.size || 20, weight: o.w || 600, color: l[1] || g.C.ink, mono: !!o.mono, alpha: o.a == null ? 1 : o.a, maxW: w - 44, lh: 25 }); yy += o.gap || 44; }); };
  var chart = function (g, x, y, w, h, a) { g.line(x, y + h, x + w, y + h, { color: '#56629c', lw: 2, alpha: a }); g.line(x, y, x, y + h, { color: '#56629c', lw: 2, alpha: a }); };

  /* ---------- CI/CD pipeline with quality gates ---------- */
  M.kit('ci', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.green, stages = P.stages || [['Commit', ['git push to main']], ['Test', ['unit tests: 142 passed', 'data schema check ✓']], ['Train', ['train on data v12', '38 min on 1 GPU']], ['Evaluate', ['accuracy 0.93 ≥ 0.90 ✓', 'no fairness regression ✓']], ['Register', ['model v12 → registry', 'tagged: staging']], ['Deploy', ['canary 5% of traffic', 'health checks ✓']]], n = stages.length, fail = P.fail == null ? -1 : P.fail, failMsg = P.failMsg || 'accuracy 0.87 < 0.90 ✗ — blocked';
      g.heading(P.head || 'CI/CD for machine learning', p, P.sub);
      var d = .84 / n, gap = 16, w = (1120 - (n - 1) * gap) / n, prog = (p - .06) / d, cur = Math.floor(prog), stopped = fail >= 0 && cur > fail;
      stages.forEach(function (s, k) {
        var x = 80 + k * (w + gap), state = fail >= 0 && k > fail ? 'wait' : k < cur ? (k === fail ? 'fail' : 'ok') : k === cur ? 'run' : 'wait', a = g.E.out(g.seg(p, .02 + k * .02, .08 + k * .02));
        if (state === 'run' && k === fail && g.seg(prog - k, 0, 1) > .7) state = 'fail';
        var c = state === 'ok' ? C.green : state === 'fail' ? C.red : state === 'run' ? C.amber : C.line;
        g.box(x, 196, w, 200, { r: 18, fill: g.hexA(c === C.line ? '#2d3868' : c, .14), stroke: c, lw: state === 'run' ? 3 : 2, glow: state === 'run' || state === 'fail' ? c : null, alpha: a });
        g.text(String(k + 1).padStart(2, '0'), x + 18, 222, { size: 14, weight: 700, mono: true, color: C.muted, alpha: a });
        g.text(s[0], x + w / 2, 300, { size: 22, weight: 700, head: true, align: 'center', alpha: a });
        var icon = state === 'ok' ? '✓' : state === 'fail' ? '✗' : state === 'run' ? '' : '○';
        if (state === 'run') { var ctx = g.ctx; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = C.amber; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x + w / 2, 350, 16, t * 5, t * 5 + 4.2); ctx.stroke(); ctx.restore(); }
        else g.text(icon, x + w / 2, 352, { size: 30, weight: 800, align: 'center', color: c, alpha: a });
        if (k < n - 1) g.arrow(x + w + 2, 296, x + w + gap - 2, 296, { color: k < cur && !(fail >= 0 && k >= fail) ? C.green : C.line, lw: 2.5, head: 7, alpha: a });
      });
      g.panel(80, 420, 1120, 250, { fill: 'rgba(8,11,28,.92)' });
      g.text('$ pipeline log', 104, 450, { size: 15, mono: true, color: C.muted });
      var lines = []; for (var k2 = 0; k2 <= Math.min(cur, n - 1); k2++) { if (fail >= 0 && k2 > fail) break; var fr = k2 < cur ? 1 : g.seg(prog - k2, 0, .8), ls = k2 === fail ? ['evaluating on the hold-out set…', failMsg] : stages[k2][1]; ls.forEach(function (l, j) { if (fr * ls.length > j) lines.push(['[' + stages[k2][0].toLowerCase() + '] ' + l, k2 === fail && j === ls.length - 1 ? C.red : /✓/.test(l) ? C.green : '#c9d0f0']); }); }
      lines.slice(-7).forEach(function (l, i) { g.text(l[0], 104, 486 + i * 26, { size: 16, mono: true, color: l[1] }); });
      if (stopped || (fail >= 0 && p > .95)) g.text('Quality gate failed → the model is never deployed. Fix, commit, and the pipeline runs again.', 640, 690, { size: 18, weight: 700, color: C.red, align: 'center' });
      else if (p > .92 && fail < 0) g.text('Every change is tested, trained, evaluated and deployed the same way — automatically.', 640, 690, { size: 18, weight: 700, color: C.green, align: 'center' });
    }
  });

  /* ---------- data drift: training vs live distribution, PSI over time ---------- */
  M.kit('drift', {
    init: function (P) {
      var mu0 = P.mu0 || 40, sd0 = P.sd0 || 10, weeks = P.weeks || 10, shift = P.shift == null ? 8 : P.shift, edges = [-Infinity];
      for (var b = 1; b < 10; b++) { var lo = -5, hi = 5; for (var it = 0; it < 50; it++) { var mid = (lo + hi) / 2; if (Phi(mid) < b / 10) lo = mid; else hi = mid; } edges.push(mu0 + sd0 * lo); } edges.push(Infinity);
      var psi = [], mus = []; for (var w = 0; w < weeks; w++) { var mu = mu0 + shift * Math.pow(w / (weeks - 1), 1.5), sd = sd0 * (1 + .1 * w / (weeks - 1)), s = 0; for (var k = 0; k < 10; k++) { var e = .1, a = Phi((edges[k + 1] - mu) / sd) - Phi((edges[k] - mu) / sd); a = Math.max(a, 1e-4); s += (a - e) * Math.log(a / e); } psi.push(s); mus.push([mu, sd]); }
      return { psi: psi, mus: mus, mu0: mu0, sd0: sd0, weeks: weeks };
    },
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.green, W = S.weeks, wf = g.seg(p, .1, .88) * (W - 1), w = Math.min(W - 1, Math.floor(wf)), fr = wf - w, mu = w < W - 1 ? g.lerp(S.mus[w][0], S.mus[w + 1][0], fr) : S.mus[w][0], sd = w < W - 1 ? g.lerp(S.mus[w][1], S.mus[w + 1][1], fr) : S.mus[w][1], a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || 'Data drift', p, P.sub);
      var x0 = 90, y0 = 200, bw = 620, bh = 330, xr = [0, 100], X = function (x) { return x0 + (x - xr[0]) / (xr[1] - xr[0]) * bw; }, pdf = function (x, m, s) { return Math.exp(-(x - m) * (x - m) / (2 * s * s)) / (s * 2.5066); }, Y = function (v) { return y0 + bh - v / .045 * bh; };
      chart(g, x0, y0, bw, bh, a0);
      [0, 20, 40, 60, 80, 100].forEach(function (v) { g.text(String(v), X(v), y0 + bh + 22, { size: 15, mono: true, color: C.muted, align: 'center', alpha: a0 }); });
      g.text(P.feature || 'feature: customer age', x0 + bw, y0 + bh + 50, { size: 16, color: C.muted, align: 'right', alpha: a0 });
      var curve = function (m, s, c, f) { var pts = []; for (var i = 0; i <= 160; i++) { var x = xr[0] + (xr[1] - xr[0]) * i / 160; pts.push([X(x), Y(pdf(x, m, s))]); } g.path(pts.concat([[X(xr[1]), Y(0)], [X(xr[0]), Y(0)]]), { color: 'rgba(0,0,0,0)', lw: 1, fill: g.hexA(c, f), alpha: a0 }); g.path(pts, { color: c, lw: 3.5, glow: c, alpha: a0 }); };
      curve(S.mu0, S.sd0, C.cyan, .15); curve(mu, sd, C.pink, .15);
      g.box(x0 + 10, y0 + 6, 16, 16, { r: 4, fill: C.cyan, alpha: a0 }); g.text('training data', x0 + 34, y0 + 14, { size: 16, alpha: a0 }); g.box(x0 + 180, y0 + 6, 16, 16, { r: 4, fill: C.pink, alpha: a0 }); g.text('live traffic, week ' + (w + 1), x0 + 204, y0 + 14, { size: 16, alpha: a0 });
      var cx = 790, cy = 210, cw = 410, ch = 300, pm = Math.max(.4, Math.max.apply(null, S.psi) * 1.1), PY = function (v) { return cy + ch - Math.min(pm, v) / pm * ch; };
      g.panel(cx - 30, cy - 30, cw + 50, ch + 90, { alpha: a0 }); chart(g, cx, cy, cw, ch, a0);
      g.text('PSI (population stability index)', cx, cy - 12, { size: 15, color: C.muted, alpha: a0 });
      [[.1, C.amber, 'watch'], [.25, C.red, 'alert']].forEach(function (th) { g.line(cx, PY(th[0]), cx + cw, PY(th[0]), { color: th[1], dash: [6, 6], lw: 2, alpha: a0 }); g.text(th[2] + ' ' + th[0], cx + cw - 4, PY(th[0]) - 12, { size: 14, color: th[1], align: 'right', alpha: a0 }); });
      var pts2 = []; for (var i = 0; i <= w; i++) pts2.push([cx + i / (W - 1) * cw, PY(S.psi[i])]); g.path(pts2, { color: A, lw: 3.5, glow: A }); pts2.forEach(function (q, i) { g.circle(q[0], q[1], 5, { fill: S.psi[i] > .25 ? C.red : S.psi[i] > .1 ? C.amber : A }); });
      g.text('weeks →', cx + cw, cy + ch + 22, { size: 14, color: C.muted, align: 'right', alpha: a0 });
      var cur = S.psi[w], lvl = cur > .25 ? ['🚨 Alert: significant drift — investigate and retrain', C.red] : cur > .1 ? ['⚠ Moderate shift — keep watching', C.amber] : ['✓ Stable', C.green];
      g.text('week ' + (w + 1) + ': PSI = ' + nf(cur, 3), cx, cy + ch + 56, { size: 19, weight: 700, mono: true, color: lvl[1] });
      g.panel(90, 590, 620, 80, { alpha: a0, stroke: g.hexA(lvl[1], .6) }); g.text(lvl[0], 400, 630, { size: 20, weight: 700, color: lvl[1], align: 'center', alpha: a0 });
    }
  });

  /* ---------- a Docker image built from layers ---------- */
  M.kit('docker', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.green, layers = P.layers || [['FROM python:3.11-slim', 'base OS + Python', '130 MB'], ['COPY requirements.txt .', 'dependency list', '1 KB'], ['RUN pip install -r requirements.txt', 'libraries', '410 MB'], ['COPY model.joblib app.py ./', 'model + serving code', '25 MB'], ['CMD ["uvicorn", "app:api"]', 'start command', '0 B']], n = layers.length;
      g.heading(P.head || 'Packaging a model with Docker', p, P.sub);
      var lh = 64, y0 = 600;
      layers.forEach(function (l, k) { var a = g.E.back(g.seg(p, .05 + k * .08, .14 + k * .08)), y = y0 - (k + 1) * lh + (1 - g.clamp(a)) * -40, c = g.PAL[k % 8]; g.box(80, y, 560, lh - 8, { r: 12, fill: g.hexA(c, .2), stroke: c, lw: 2, alpha: g.clamp(a) }); g.text(l[0], 100, y + 22, { size: 16, weight: 700, mono: true, alpha: g.clamp(a), maxW: 520 }); g.text(l[1] + ' · ' + l[2], 100, y + 44, { size: 14, color: C.muted, alpha: g.clamp(a) }); });
      g.text('Dockerfile → image layers (cached, reused)', 80, y0 + 26, { size: 16, color: C.muted, alpha: g.seg(p, .05, .12) });
      var ia = g.E.out(g.seg(p, .5, .6));
      g.arrow(660, 420, 760, 420, { color: A, lw: 4, head: 14, alpha: ia }); g.text('docker build', 710, 396, { size: 15, mono: true, color: A, align: 'center', alpha: ia });
      g.box(780, 360, 150, 120, { r: 18, fill: g.hexA(A, .2), stroke: A, lw: 3, glow: A, alpha: ia }); g.text('📦', 855, 405, { size: 38, align: 'center', alpha: ia }); g.text('image', 855, 452, { size: 18, weight: 700, align: 'center', alpha: ia });
      [['💻', 'laptop'], ['☁️', 'cloud VM'], ['⎈', 'Kubernetes']].forEach(function (h, k) { var a = g.E.out(g.seg(p, .66 + k * .08, .76 + k * .08)), y = 230 + k * 150; g.arrow(936, 420, 1020, y + 40, { color: C.muted, lw: 2, head: 9, alpha: a }); g.box(1030, y, 180, 90, { r: 14, fill: 'rgba(30,40,84,.7)', stroke: g.hexA(A, .6), lw: 2, alpha: a }); g.text(h[0] + ' ' + h[1], 1120, y + 30, { size: 18, weight: 700, align: 'center', alpha: a }); g.text('container ✓ same result', 1120, y + 62, { size: 14, color: C.green, align: 'center', alpha: a }); });
      g.text('“Works on my machine” → works on every machine', 640, 672, { size: 20, weight: 700, color: A, align: 'center', alpha: g.seg(p, .88, .95) });
    }
  });

  /* ---------- online serving with autoscaling ---------- */
  M.kit('serving', {
    init: function (P) {
      var cap = P.cap || 50, hrs = 24, steps = 240, out = [], reps = 2;
      for (var i = 0; i <= steps; i++) { var h = i / steps * hrs, rps = 40 + 160 * Math.max(0, Math.sin((h - 6) / 24 * Math.PI * 2)) + (h > 12 && h < 13.5 ? 90 * Math.sin((h - 12) / 1.5 * Math.PI) : 0), need = Math.max(2, Math.ceil(rps / (cap * .7))); if (i % 6 === 0) reps = need > reps ? reps + Math.min(2, need - reps) : need < reps - 1 ? reps - 1 : reps; var rho = Math.min(.97, rps / (reps * cap)), lat = 40 / (1 - rho); out.push({ h: h, rps: rps, reps: reps, lat: lat }); }
      return { out: out, cap: cap };
    },
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.green, O = S.out, n = O.length, k = Math.min(n - 1, Math.floor(g.seg(p, .06, .92) * (n - 1))), cur = O[k], a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || 'Serving a model under real traffic', p, P.sub);
      var x0 = 90, y0 = 200, w = 700, h = 200, mx = 320, X = function (i) { return x0 + i / (n - 1) * w; }, Y = function (v) { return y0 + h - v / mx * h; };
      chart(g, x0, y0, w, h, a0); g.text('requests / second', x0, y0 - 14, { size: 15, color: C.muted, alpha: a0 });
      var tr = [], cp = []; for (var i = 0; i <= k; i++) { tr.push([X(i), Y(O[i].rps)]); cp.push([X(i), Y(O[i].reps * S.cap)]); }
      if (tr.length > 1) { g.path(tr.concat([[X(k), Y(0)], [X(0), Y(0)]]), { color: 'rgba(0,0,0,0)', lw: 1, fill: g.hexA(C.cyan, .18) }); g.path(tr, { color: C.cyan, lw: 3 }); g.path(cp, { color: A, lw: 2.5, dash: [6, 5] }); }
      g.box(x0 + w - 300, y0 - 22, 14, 14, { r: 3, fill: C.cyan, alpha: a0 }); g.text('traffic', x0 + w - 280, y0 - 14, { size: 14, color: C.cyan, alpha: a0 }); g.line(x0 + w - 200, y0 - 15, x0 + w - 176, y0 - 15, { color: A, lw: 2.5, dash: [6, 5], alpha: a0 }); g.text('capacity (replicas × ' + S.cap + ')', x0 + w - 168, y0 - 14, { size: 14, color: A, alpha: a0 });
      var ly0 = 450, lh = 150, LY = function (v) { return ly0 + lh - Math.min(400, v) / 400 * lh; };
      chart(g, x0, ly0, w, lh, a0); g.text('p95 latency (ms)', x0, ly0 - 14, { size: 15, color: C.muted, alpha: a0 });
      g.line(x0, LY(200), x0 + w, LY(200), { color: C.red, dash: [6, 6], lw: 2, alpha: a0 }); g.text('SLO 200 ms', x0 + w, LY(200) - 12, { size: 14, color: C.red, align: 'right', alpha: a0 });
      var lp = []; for (var j = 0; j <= k; j++) lp.push([X(j), LY(O[j].lat)]); if (lp.length > 1) g.path(lp, { color: C.amber, lw: 3 });
      g.text('hour ' + Math.floor(cur.h) + ':00', x0 + w, ly0 + lh + 24, { size: 15, mono: true, color: C.muted, align: 'right', alpha: a0 });
      g.panel(830, 190, 390, 470, { alpha: a0 });
      g.text('Replicas: ' + cur.reps, 856, 228, { size: 24, weight: 800, mono: true, color: A, alpha: a0 });
      for (var r = 0; r < 10; r++) { var on = r < cur.reps, bx = 856 + (r % 5) * 70, by = 262 + Math.floor(r / 5) * 80; g.box(bx, by, 58, 64, { r: 10, fill: on ? g.hexA(A, .25) : 'rgba(30,40,84,.4)', stroke: on ? A : null, glow: on ? A : null, blur: 8, alpha: a0 }); if (on) g.text('⚙', bx + 29, by + 33, { size: 24, align: 'center', color: A, alpha: a0 }); }
      [['traffic', Math.round(cur.rps) + ' req/s'], ['utilisation', Math.round(Math.min(97, cur.rps / (cur.reps * S.cap) * 100)) + '%'], ['p95 latency', Math.round(cur.lat) + ' ms']].forEach(function (q, i) { g.text(q[0], 856, 450 + i * 44, { size: 17, color: C.muted, alpha: a0 }); g.text(q[1], 1196, 450 + i * 44, { size: 19, weight: 700, mono: true, align: 'right', color: i === 2 && cur.lat > 200 ? C.red : C.ink, alpha: a0 }); });
      g.text('Autoscaler adds replicas when load rises and removes them when it falls — busy servers queue requests and latency explodes.', 1025, 610, { size: 14, color: C.muted, align: 'center', maxW: 350, lh: 19, alpha: g.seg(p, .5, .6) });
    }
  });

  /* ---------- an A/B test ---------- */
  M.kit('abtest', {
    init: function (P) {
      var r = R(P.seed || 2), pa = P.pa || .10, pb = P.pb || .11, days = P.days || 14, per = P.per || 700, ca = 0, cb = 0, na = 0, nb = 0, out = [];
      for (var d = 0; d < days; d++) { for (var i = 0; i < per; i++) { na++; nb++; if (r() < pa) ca++; if (r() < pb) cb++; } var ra = ca / na, rb = cb / nb, pp = (ca + cb) / (na + nb), se = Math.sqrt(pp * (1 - pp) * (1 / na + 1 / nb)), z = (rb - ra) / se, pv = 2 * (1 - Phi(Math.abs(z))); out.push({ d: d + 1, ra: ra, rb: rb, na: na, nb: nb, ea: 1.96 * Math.sqrt(ra * (1 - ra) / na), eb: 1.96 * Math.sqrt(rb * (1 - rb) / nb), pv: pv }); }
      return { out: out, days: days };
    },
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.green, D = S.days, k = Math.min(D - 1, Math.floor(g.seg(p, .08, .86) * D)), o = S.out[k], a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || 'A/B testing a new model', p, P.sub);
      var base = 560, sc = 2200, bars = [['A: current model', o.ra, o.ea, C.cyan, o.na], ['B: new model', o.rb, o.eb, C.pink, o.nb]];
      bars.forEach(function (b, i) { var x = 150 + i * 240, hgt = b[1] * sc; g.box(x, base - hgt, 120, hgt, { r: 10, fill: g.hexA(b[3], .75), alpha: a0 }); g.line(x + 60, base - (b[1] + b[2]) * sc, x + 60, base - (b[1] - b[2]) * sc, { color: C.white, lw: 3, alpha: a0 }); [b[1] + b[2], b[1] - b[2]].forEach(function (v) { g.line(x + 44, base - v * sc, x + 76, base - v * sc, { color: C.white, lw: 3, alpha: a0 }); }); g.text(nf(b[1] * 100, 1) + '%', x + 60, base - hgt - 60, { size: 24, weight: 800, mono: true, align: 'center', color: b[3], alpha: a0 }); g.text(b[0], x + 60, base + 26, { size: 17, weight: 700, align: 'center', alpha: a0 }); g.text(b[4].toLocaleString('en-US') + ' users', x + 60, base + 52, { size: 15, mono: true, color: C.muted, align: 'center', alpha: a0 }); });
      g.line(110, base, 560, base, { color: '#56629c', lw: 2, alpha: a0 }); g.text('conversion rate ± 95% interval', 110, 196, { size: 15, color: C.muted, alpha: a0 });
      var cx = 680, cy = 210, cw = 520, ch = 300, LY = function (v) { var l = Math.log10(Math.max(1e-4, v)); return cy + (-l) / 4 * ch; };
      g.panel(cx - 30, cy - 30, cw + 50, ch + 80, { alpha: a0 }); chart(g, cx, cy, cw, ch, a0);
      g.text('p-value (log scale)', cx, cy - 12, { size: 15, color: C.muted, alpha: a0 });
      [1, .1, .01, .001].forEach(function (v) { g.text(String(v), cx - 8, LY(v), { size: 13, mono: true, color: C.muted, align: 'right', alpha: a0 }); });
      g.line(cx, LY(.05), cx + cw, LY(.05), { color: C.amber, dash: [6, 6], lw: 2, alpha: a0 }); g.text('0.05', cx + cw, LY(.05) - 12, { size: 14, color: C.amber, align: 'right', alpha: a0 });
      var pts = []; for (var i = 0; i <= k; i++) pts.push([cx + i / (D - 1) * cw, LY(S.out[i].pv)]); if (pts.length > 1) g.path(pts, { color: A, lw: 3.5, glow: A }); pts.forEach(function (q) { g.circle(q[0], q[1], 4.5, { fill: A }); });
      g.text('day ' + o.d + ' of ' + D, cx + cw, cy + ch + 24, { size: 15, mono: true, color: C.muted, align: 'right', alpha: a0 });
      var done = k === D - 1, sig = o.pv < .05, msg = !done ? (sig ? 'p < 0.05 already — but the test was planned for ' + D + ' days: don’t stop early' : 'Collecting data… p = ' + nf(o.pv, 3)) : sig ? 'Planned end: B wins (p ' + (o.pv < 1e-4 ? '< 0.0001' : '= ' + nf(o.pv, 4)) + ') → roll out B' : 'Planned end: no significant difference → keep A';
      g.panel(110, 610, 1090, 64, { alpha: a0, stroke: g.hexA(done && sig ? C.green : C.amber, .6) }); g.text(msg, 655, 643, { size: 19, weight: 700, color: done && sig ? C.green : C.amber, align: 'center', alpha: a0 });
    }
  });

  /* ---------- canary rollout (optionally rolling back) ---------- */
  M.kit('rollout', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.green, steps = P.steps || [1, 5, 25, 50, 100], bad = P.mode === 'rollback', badAt = P.badAt == null ? 2 : P.badAt, n = steps.length, pos = g.seg(p, .06, .9) * n, k = Math.min(n - 1, Math.floor(pos)), f = pos - k, a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || (bad ? 'Canary rollout with automatic rollback' : 'Canary rollout'), p, P.sub);
      var rolled = bad && (k > badAt || (k === badAt && f > .6)), pct = rolled ? 0 : (k ? g.lerp(steps[k - 1], steps[k], g.E.inOut(g.seg(f, 0, .3))) : steps[0] * g.E.out(g.seg(f, 0, .3)));
      if (bad && k > badAt) { pct = 0; k = badAt; }
      g.text('traffic split', 90, 200, { size: 16, color: C.muted, alpha: a0 });
      g.box(90, 216, 1100, 60, { r: 14, fill: g.hexA(C.blue, .6), alpha: a0 }); g.box(90 + 1100 * (1 - pct / 100), 216, 1100 * pct / 100, 60, { r: 14, fill: g.hexA(rolled ? C.red : A, .85), glow: A, alpha: a0 });
      g.text('v1 (current)  ' + nf(100 - pct, 0) + '%', 110, 247, { size: 19, weight: 700, alpha: a0 }); if (pct > 8) g.text('v2  ' + nf(pct, 0) + '%', 1170, 247, { size: 19, weight: 700, align: 'right', color: C.bg, alpha: a0 });
      var cx = 90, cy = 330, cw = 700, ch = 230, mx = 5, Y = function (v) { return cy + ch - Math.min(mx, v) / mx * ch; }, N = 60, now = Math.floor(g.seg(p, .06, .9) * N);
      chart(g, cx, cy, cw, ch, a0); g.text('error rate (%)', cx, cy - 14, { size: 15, color: C.muted, alpha: a0 });
      g.line(cx, Y(2), cx + cw, Y(2), { color: C.red, dash: [6, 6], lw: 2, alpha: a0 }); g.text('rollback threshold 2%', cx + cw, Y(2) - 12, { size: 14, color: C.red, align: 'right', alpha: a0 });
      var v1 = [], v2 = [], badStart = (badAt + .3) / n * N;
      for (var i = 0; i <= now; i++) { v1.push([cx + i / N * cw, Y(.8 + .15 * Math.sin(i * .9))]); if (!(bad && i > (badAt + .62) / n * N)) v2.push([cx + i / N * cw, Y(bad && i > badStart ? .9 + (i - badStart) * .55 : .75 + .15 * Math.cos(i * .7))]); }
      if (v1.length > 1) g.path(v1, { color: C.blue, lw: 3 }); if (v2.length > 1) g.path(v2, { color: bad && now > badStart ? C.red : A, lw: 3 });
      side(g, p, 830, 320, 360, 250, [['step ' + (k + 1) + ' of ' + n + ': ' + steps[k] + '% to v2', A, { mono: true, size: 20, w: 800 }], [rolled ? '🚨 errors above threshold' : 'health checks passing ✓', rolled ? C.red : C.green, { size: 18, w: 700 }], [rolled ? '↩ automatic rollback to v1' : 'wait, watch metrics, then widen', rolled ? C.red : C.muted, { size: 18 }], [rolled ? 'Only ' + steps[badAt] + '% of users saw the bad version, briefly.' : 'A bad release reaches only a few users.', C.ink, { size: 16 }]]);
      steps.forEach(function (s, i) { var x = 150 + i * 240, on = i <= k, c = bad && i === badAt && rolled ? C.red : on ? A : C.line; g.circle(x, 630, 14, { fill: on ? g.hexA(c, .8) : 'rgba(30,40,84,.8)', stroke: c, lw: 2, alpha: a0 }); g.text(s + '%', x, 664, { size: 16, weight: 700, mono: true, align: 'center', color: on ? C.ink : C.muted, alpha: a0 }); if (i < n - 1) g.line(x + 16, 630, x + 224, 630, { color: i < k ? A : C.line, lw: 2, alpha: a0 }); });
    }
  });

  /* ---------- lineage: code + data + params → model ---------- */
  M.kit('lineage', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.green, a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || 'Versioning code, data and models together', p, P.sub);
      var lanes = [['Code (git)', C.cyan, ['a1f3', '7c2e', '9b41', 'e05d']], ['Data (DVC)', C.violet, ['v1', 'v2', 'v3']], ['Experiments', C.amber, ['run 17', 'run 18', 'run 19', 'run 20']], ['Models (registry)', A, ['model v1', 'model v2', 'model v3']]], ys = [230, 330, 450, 570];
      var pos = { c: [260, 470, 700, 930], d: [300, 620, 900], r: [380, 560, 760, 990], m: [420, 800, 1060] };
      lanes.forEach(function (ln, k) { var a = g.E.out(g.seg(p, .04 + k * .06, .12 + k * .06)), key = 'cdrm'[k]; g.text(ln[0], 70, ys[k] - 36, { size: 16, weight: 800, color: ln[1], head: true, alpha: a }); g.line(200, ys[k], 1210, ys[k], { color: g.hexA(ln[1], .3), lw: 3, alpha: a }); ln[2].forEach(function (lab, i) { var x = pos[key][i]; g.box(x - 48, ys[k] - 20, 96, 40, { r: 10, fill: g.hexA(ln[1], .2), stroke: ln[1], lw: 2, alpha: a }); g.text(lab, x, ys[k] + 1, { size: 15, weight: 700, mono: true, align: 'center', alpha: a }); }); });
      var links = [['c', 0, 'r', 0], ['d', 0, 'r', 0], ['r', 0, 'm', 0], ['c', 1, 'r', 1], ['d', 1, 'r', 1], ['c', 2, 'r', 2], ['d', 1, 'r', 2], ['r', 2, 'm', 1], ['c', 3, 'r', 3], ['d', 2, 'r', 3], ['r', 3, 'm', 2]], la = g.seg(p, .3, .5), hi = g.seg(p, .6, .7), hot = [8, 9, 10];
      var Yk = { c: 0, d: 1, r: 2, m: 3 };
      links.forEach(function (l, i) { var x1 = pos[l[0]][l[1]], y1 = ys[Yk[l[0]]] + 20, x2 = pos[l[2]][l[3]], y2 = ys[Yk[l[2]]] - 20, on = hot.indexOf(i) >= 0 && hi > 0; g.line(x1, y1, x2, y2, { color: on ? C.white : 'rgba(170,180,230,.35)', lw: on ? 3.5 : 1.5, glow: on ? A : null, alpha: la, dash: on ? null : [5, 5] }); });
      g.text('run 18: data v2 + code 7c2e → accuracy 0.89 (not registered)', 560, 500, { size: 13, color: C.muted, align: 'center', alpha: g.seg(p, .5, .6) });
      g.panel(640, 620, 580, 70, { alpha: hi, stroke: g.hexA(A, .7) });
      g.text('model v3 = code e05d + data v3 + params from run 20 → reproducible on demand', 930, 655, { size: 16, weight: 700, align: 'center', maxW: 550, alpha: hi, color: A });
    }
  });

  /* ---------- experiment tracking ---------- */
  M.kit('tracking', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.green, runs = P.runs || [['run 1', 'lr 0.1', .84, 6, .004], ['run 2', 'lr 0.01', .91, 12, .0008], ['run 3', 'lr 0.001', .86, 30, 0], ['run 4', 'lr 0.01 + dropout', .93, 13, 0], ['run 5', 'lr 0.03', .9, 8, .002]], E = 40, a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || 'Experiment tracking', p, P.sub);
      var acc = function (r, e) { return Math.max(.3, r[2] * (1 - Math.exp(-e / r[3])) + .3 * Math.exp(-e / r[3]) - r[4] * Math.max(0, e - 15) * Math.max(0, e - 15) / 10); };
      var x0 = 100, y0 = 200, w = 560, h = 380, X = function (e) { return x0 + e / E * w; }, Y = function (v) { return y0 + h - (v - .3) / .7 * h; };
      chart(g, x0, y0, w, h, a0); [.4, .6, .8, 1].forEach(function (v) { g.text(v.toFixed(1), x0 - 10, Y(v), { size: 14, mono: true, color: C.muted, align: 'right', alpha: a0 }); });
      g.text('validation accuracy', x0, y0 - 14, { size: 15, color: C.muted, alpha: a0 }); g.text('epoch 40', x0 + w, y0 + h + 22, { size: 14, color: C.muted, align: 'right', alpha: a0 });
      var best = 0, finals = runs.map(function (r) { return acc(r, E); }); finals.forEach(function (v, i) { if (v > finals[best]) best = i; });
      runs.forEach(function (r, i) { var a = g.seg(p, .08 + i * .1, .3 + i * .1), pts = []; for (var e = 0; e <= E * a; e += .5) pts.push([X(e), Y(acc(r, e))]); var on = i === best && p > .7; if (pts.length > 1) g.path(pts, { color: g.PAL[i], lw: on ? 5 : 2.5, glow: on ? g.PAL[i] : null }); });
      var tx = 720, cols = ['run', 'config', 'val acc'];
      g.panel(tx, 190, 490, 390, { alpha: a0 });
      cols.forEach(function (c, k) { g.text(c, tx + 24 + [0, 110, 380][k], 226, { size: 15, weight: 800, color: A, head: true, alpha: a0 }); });
      runs.forEach(function (r, i) { var a = g.E.out(g.seg(p, .1 + i * .1, .2 + i * .1)), y = 272 + i * 58, on = i === best && p > .7; g.box(tx + 12, y - 22, 466, 44, { r: 10, fill: on ? g.hexA(C.green, .2) : 'rgba(30,40,84,.4)', stroke: on ? C.green : null, alpha: a }); g.box(tx + 24, y - 6, 12, 12, { r: 3, fill: g.PAL[i], alpha: a }); g.text(r[0], tx + 44, y, { size: 16, weight: 700, alpha: a }); g.text(r[1], tx + 134, y, { size: 15, mono: true, color: C.muted, alpha: a }); g.text(nf(finals[i], 3), tx + 404, y, { size: 17, weight: 700, mono: true, color: on ? C.green : C.ink, alpha: a }); });
      g.text('Every run logs parameters, metrics, code version and artefacts — so the best one can be found and reproduced.', 640, 640, { size: 18, color: C.muted, align: 'center', maxW: 1100, alpha: g.seg(p, .75, .85) });
    }
  });

  /* ---------- hidden technical debt in ML systems ---------- */
  M.kit('debt', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.green;
      g.heading(P.head || 'The ML code is the small box', p, P.sub || 'After Sculley et al., “Hidden Technical Debt in Machine Learning Systems” (2015)');
      var boxes = P.boxes || [['Configuration', 80, 200, 300, 120], ['Data collection', 80, 330, 190, 230], ['Feature extraction', 280, 330, 200, 110], ['Data verification', 280, 450, 200, 110], ['Machine resource management', 390, 200, 330, 120], ['ML code', 560, 400, 110, 60, true], ['Analysis tools', 490, 470, 150, 90], ['Process management tools', 730, 200, 240, 120], ['Serving infrastructure', 700, 330, 270, 230], ['Monitoring', 980, 200, 230, 360]];
      boxes.forEach(function (b, k) { var a = g.E.back(g.seg(p, .04 + k * .06, .12 + k * .06)), ml = !!b[5], c = ml ? C.pink : g.PAL[k % 8], hl = ml && p > .7; g.box(b[1], b[2], b[3], b[4], { r: 12, fill: g.hexA(c, ml ? .45 : .14), stroke: c, lw: hl ? 4 : 2, glow: hl ? c : null, alpha: g.clamp(a) }); g.text(b[0], b[1] + b[3] / 2, b[2] + b[4] / 2, { size: ml ? 17 : 18, weight: 700, align: 'center', maxW: b[3] - 16, vcenter: true, lh: 22, alpha: g.clamp(a) }); });
      g.text('Most of the work — and most of the failures — live in the infrastructure around the model.', 640, 620, { size: 20, weight: 700, color: A, align: 'center', maxW: 1100, alpha: g.seg(p, .75, .85) });
    }
  });

  /* ---------- a monitoring dashboard with an incident ---------- */
  M.kit('monitor', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.green, D = 30, inc = P.incident || 18, now = g.seg(p, .06, .9) * D, a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || 'Monitoring a model in production', p, P.sub);
      var r = function (d, s) { return Math.sin(d * 1.7 + s) * .5 + Math.sin(d * .6 + s * 2) * .5; };
      var panels = [['p95 latency (ms)', function (d) { return 120 + 12 * r(d, 1); }, 0, 250, C.cyan, 200], ['error rate (%)', function (d) { return .4 + .1 * r(d, 2); }, 0, 2, C.violet, 1], ['mean prediction score', function (d) { return (d >= inc ? .62 : .31) + .02 * r(d, 3); }, 0, 1, C.amber, null], ['accuracy (labels arrive 3 days late)', function (d) { return d > now - 3 ? NaN : (d >= inc ? .74 : .91) + .01 * r(d, 4); }, .5, 1, A, .85]];
      panels.forEach(function (pn, k) {
        var x0 = 80 + (k % 2) * 570, y0 = 196 + Math.floor(k / 2) * 230, w = 520, h = 150, Y = function (v) { return y0 + h - (v - pn[2]) / (pn[3] - pn[2]) * h; }, alert = (k === 2 && now > inc + .5) || (k === 3 && now - 3 > inc + .5);
        g.panel(x0 - 16, y0 - 40, w + 32, h + 70, { alpha: a0, stroke: alert ? g.hexA(C.red, .8) : null });
        g.text(pn[0], x0, y0 - 16, { size: 16, weight: 700, color: alert ? C.red : C.muted, alpha: a0 });
        if (pn[5] != null) { g.line(x0, Y(pn[5]), x0 + w, Y(pn[5]), { color: C.red, dash: [5, 5], lw: 1.5, alpha: a0 }); }
        var pts = []; for (var d = 0; d <= now; d += .25) { var v = pn[1](d); if (isFinite(v)) pts.push([x0 + d / D * w, Y(v)]); } if (pts.length > 1) g.path(pts, { color: alert ? C.red : pn[4], lw: 2.5 });
        g.line(x0 + inc / D * w, y0, x0 + inc / D * w, y0 + h, { color: C.red, lw: 1.5, dash: [3, 4], alpha: now > inc ? .7 : 0 });
        if (alert) g.text('🚨 ALERT', x0 + w, y0 - 16, { size: 15, weight: 800, color: C.red, align: 'right' });
      });
      g.text('day ' + Math.floor(now) + ' of ' + D, 640, 668, { size: 16, mono: true, color: C.muted, align: 'center', alpha: a0 });
      if (now > inc) g.text('Day ' + inc + ': an upstream pipeline change breaks a feature. System metrics look fine — the prediction distribution catches it first.', 640, 692, { size: 16, color: C.amber, align: 'center', maxW: 1150, alpha: g.seg(now, inc, inc + 1.5) });
    }
  });
})(window.Motion);
