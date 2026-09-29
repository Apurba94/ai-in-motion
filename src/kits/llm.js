/* AI in Motion — Large Language Model kits (architecture, attention maths, training objectives, inference engineering). © Janin A Apurba, CSE, AUST */
(function (M) {
  'use strict';
  var nf = function (v, d) { var s = (+v).toFixed(d == null ? 2 : d); if (/^-0\.?0*$/.test(s)) s = s.slice(1); return s.replace('-', '−'); };
  var softmax = function (v) { var m = Math.max.apply(null, v), e = v.map(function (x) { return Math.exp(x - m); }), s = e.reduce(function (a, b) { return a + b; }, 0); return e.map(function (x) { return x / s; }); };
  var side = function (g, p, x, y, w, h, lines) { g.panel(x, y, w, h, { alpha: g.E.out(g.seg(p, .03, .12)) }); var yy = y + 38; lines.forEach(function (l) { if (!l) return; var o = l[2] || {}; if ((o.a == null ? 1 : o.a) > 0) g.text(l[0], x + 24, yy, { size: o.size || 20, weight: o.w || 600, color: l[1] || g.C.ink, mono: !!o.mono, alpha: o.a == null ? 1 : o.a, maxW: w - 44, lh: 25 }); yy += o.gap || 44; }); };
  var tokBox = function (g, x, y, s, o) { o = o || {}; var w = Math.max(o.minW || 0, g.measure(s, { size: o.size || 19, weight: 600, mono: true }) + 22), h = o.h || 40; g.box(x - (o.center ? w / 2 : 0), y - h / 2, w, h, { r: 9, fill: o.fill || 'rgba(40,52,100,.75)', stroke: o.stroke, lw: o.lw || 2, glow: o.glow, alpha: o.alpha }); g.text(s, x - (o.center ? w / 2 : 0) + w / 2, y + 1, { size: o.size || 19, weight: 600, mono: true, align: 'center', color: o.color || g.C.ink, alpha: o.alpha }); return w; };

  /* ---------- the full forward pass of a decoder-only transformer ---------- */
  M.kit('transformer', {
    draw: function (g, p, P, S, t) {
      var toks = P.tokens || ['The', ' cat', ' sat', ' on', ' the'], nxt = P.next || [[' mat', .62], [' floor', .18], [' sofa', .09], [' bed', .05]], n = toks.length, C = g.C, A = P.accent || C.red;
      g.heading(P.head || 'Inside a transformer language model', p, P.sub);
      var X = function (i) { return 190 + i * (560 / Math.max(1, n - 1)); }, st = g.seg(p, .04, .9) * 6, yT = 650, yE = 585, blocks = [505, 420, 335], yU = 250;
      toks.forEach(function (tk, i) { tokBox(g, X(i), yT, JSON.stringify(tk).slice(1, -1).replace(/ /g, '·'), { center: true, alpha: g.clamp(st * 2 - i * .2), minW: 70 }); });
      g.text('tokens', 70, yT, { size: 16, weight: 700, color: C.muted, alpha: g.seg(p, .04, .1) });
      var ea = g.clamp(st - 1);
      toks.forEach(function (tk, i) { for (var d = 0; d < 6; d++) g.box(X(i) - 30 + d * 10, yE - 12, 8, 24, { r: 2, fill: g.PAL[(i * 3 + d) % 8], alpha: ea * (.5 + .5 * Math.abs(Math.sin(i * 1.7 + d))) }); g.line(X(i), yE - 16, X(i), yU + 24, { color: g.hexA(A, .35), lw: 3, alpha: ea }); });
      g.text('embeddings', 70, yE, { size: 16, weight: 700, color: C.muted, alpha: ea });
      g.text('residual stream ↑', X(0) - 20, yE - 34, { size: 14, color: g.hexA(A, .9), align: 'right', alpha: ea });
      blocks.forEach(function (by, b) {
        var ba = g.clamp(st - 1.6 - b * .2), act = st - 2 - b, on = act >= 0 && act < 1, half = act < .5;
        g.box(150, by - 34, 640, 68, { r: 16, fill: g.hexA(A, on ? .16 : .06), stroke: on ? A : 'rgba(120,140,220,.3)', lw: on ? 2.5 : 1.5, glow: on ? A : null, alpha: ba });
        g.text(b === 2 ? 'block N' : 'block ' + (b + 1), 70, by, { size: 16, weight: 700, color: on ? A : C.muted, alpha: ba });
        if (b === 1) g.text('⋮', 470, by - 46, { size: 20, color: C.muted, align: 'center', alpha: ba });
        g.text('attention', 812, by - 12, { size: 16, weight: 700, color: on && half ? C.cyan : C.muted, alpha: ba }); g.text('→ MLP', 812, by + 12, { size: 16, weight: 700, color: on && !half ? C.amber : C.muted, alpha: ba });
        if (on && half) { var f = g.seg(act, 0, .5); for (var j = 0; j < n; j++) for (var i2 = 0; i2 < j; i2++) { var x1 = X(i2), x2 = X(j), h = 14 + (x2 - x1) * .12, ctx = g.ctx; ctx.save(); ctx.globalAlpha *= f * (j === n - 1 ? .9 : .25); ctx.strokeStyle = C.cyan; ctx.lineWidth = j === n - 1 ? 2.5 : 1.2; ctx.beginPath(); ctx.moveTo(x1, by - 6); ctx.quadraticCurveTo((x1 + x2) / 2, by - 6 - h, x2, by - 6); ctx.stroke(); ctx.restore(); } }
        if (on && !half) toks.forEach(function (tk, i) { g.box(X(i) - 26, by - 10, 52, 22, { r: 6, fill: g.hexA(C.amber, .5), glow: C.amber, blur: 10 }); });
      });
      var ua = g.clamp(st - 5);
      g.box(X(n - 1) - 60, yU - 24, 120, 48, { r: 12, fill: g.hexA(C.violet, .25), stroke: C.violet, lw: 2, alpha: ua }); g.text('unembed', X(n - 1), yU + 1, { size: 17, weight: 700, align: 'center', alpha: ua });
      g.text('logits → softmax', 70, yU, { size: 16, weight: 700, color: C.muted, alpha: ua });
      g.arrow(X(n - 1) + 64, yU, 880, yU, { color: C.violet, lw: 3, head: 10, alpha: ua });
      var px = 890; g.panel(px, 180, 330, 300, { alpha: ua });
      g.text('next token after “' + toks.join('').trim() + '”', px + 20, 212, { size: 15, weight: 700, color: C.muted, alpha: ua, maxW: 290 });
      nxt.forEach(function (q, k) { var y = 256 + k * 52, w = 180 * q[1] / nxt[0][1] * g.E.out(g.seg(p, .9, .98)); g.text(JSON.stringify(q[0]).slice(1, -1).replace(/ /g, '·'), px + 20, y, { size: 18, mono: true, alpha: ua }); g.box(px + 120, y - 12, w, 24, { r: 6, fill: k ? g.hexA(C.cyan, .6) : C.green, alpha: ua }); g.text(Math.round(q[1] * 100) + '%', px + 128 + w, y + 1, { size: 16, mono: true, alpha: ua * g.seg(p, .92, .98) }); });
      g.text(P.note || 'Only the last position’s vector is used to predict the next token', px + 20, 530, { size: 16, color: C.muted, maxW: 300, lh: 21, alpha: ua });
    }
  });

  /* ---------- scaled dot-product attention, computed for one query ---------- */
  M.kit('qkv', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.red, words = P.words || ['The', 'animal', 'was', 'tired', 'it'], K = P.keys || [[.1, 0, .9], [.9, .9, .1], [.2, .1, .3], [.5, .6, .2], [.6, .5, .3]], V = P.values || [[.2, .1, .1], [.9, .2, .8], [.1, .3, .1], [.4, .7, .2], [.3, .3, .4]], q = P.q || [1, .8, .1], n = words.length, d = q.length, qi = P.qi == null ? n - 1 : P.qi;
      var sc = K.map(function (k) { return k.reduce(function (s, v, i) { return s + v * q[i]; }, 0) / Math.sqrt(d); }), w = softmax(sc), out = q.map(function (_, j) { return V.reduce(function (s, v, i) { return s + w[i] * v[j]; }, 0); });
      g.heading(P.head || 'Attention, step by step', p, P.sub);
      var vecCells = function (x, y, v, c, a) { v.forEach(function (val, i) { g.box(x + i * 62, y - 17, 58, 34, { r: 7, fill: g.hexA(c, .15 + .6 * Math.min(1, Math.abs(val))), alpha: a }); g.text(nf(val, 1), x + i * 62 + 29, y + 1, { size: 16, weight: 700, mono: true, align: 'center', alpha: a }); }); };
      var y0 = 250, rh = Math.min(66, 330 / n), a0 = g.E.out(g.seg(p, 0, .1));
      g.text('query q  (“' + words[qi] + '”)', 90, 188, { size: 18, weight: 700, color: C.pink, alpha: a0 }); vecCells(330, 188, q, C.pink, a0);
      ['word', 'key k', 'score q·k/√' + d, 'softmax weight', 'value v'].forEach(function (h, k) { g.text(h, [90, 230, 470, 660, 960][k], y0 - 34, { size: 15, weight: 800, color: C.muted, head: true, alpha: a0 }); });
      words.forEach(function (wd, i) {
        var y = y0 + i * rh, ra = g.E.out(g.seg(p, .05 + i * .03, .15 + i * .03)), sa = g.E.out(g.seg(p, .25 + i * .04, .33 + i * .04)), wa = g.E.out(g.seg(p, .5, .62)), va = g.E.out(g.seg(p, .64, .76)), top = w[i] === Math.max.apply(null, w);
        g.text(wd, 90, y, { size: 20, weight: 700, color: i === qi ? C.pink : C.ink, alpha: ra });
        vecCells(230, y, K[i], C.cyan, ra);
        g.text(nf(sc[i]), 470, y, { size: 19, weight: 700, mono: true, color: C.cyan, alpha: sa });
        g.box(660, y - 12, 220, 24, { r: 6, fill: C.faint, alpha: wa }); g.box(660, y - 12, 220 * w[i] * wa, 24, { r: 6, fill: top ? C.green : g.hexA(C.amber, .8), glow: top ? C.green : null });
        g.text(Math.round(w[i] * 100) + '%', 890, y, { size: 17, weight: 700, mono: true, alpha: wa, color: top ? C.green : C.ink });
        vecCells(960, y, V[i], C.violet, ra * (1 - .6 * va * (1 - w[i] / Math.max.apply(null, w))));
      });
      var oa = g.E.out(g.seg(p, .78, .88)), yo = y0 + n * rh + 18;
      g.panel(560, yo - 30, 640, 60, { alpha: oa, stroke: g.hexA(C.green, .6) });
      g.text('output = Σ weight × value =', 580, yo, { size: 18, weight: 700, alpha: oa }); vecCells(960, yo, out, C.green, oa);
    }
  });

  /* ---------- the KV cache ---------- */
  M.kit('kv-cache', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.red, toks = P.tokens || ['The', 'cat', 'sat', 'on', 'the', 'mat', 'and', 'purred'], n = toks.length, st = Math.min(n, 1 + Math.floor(g.seg(p, .06, .8) * n)), fl = (g.seg(p, .06, .8) * n) % 1, flash = fl < .5 && p < .8;
      g.heading(P.head || 'The KV cache', p, P.sub);
      [[80, 'Without cache: recompute K and V for every token, every step', false], [680, 'With a KV cache: compute only the newest token', true]].forEach(function (pn) {
        var x0 = pn[0], cache = pn[2], rh = Math.min(34, 236 / n);
        g.panel(x0, 176, 520, 400, { stroke: cache ? g.hexA(C.green, .5) : g.hexA(C.red, .4) });
        g.text(pn[1], x0 + 24, 210, { size: 17, weight: 700, color: cache ? C.green : C.red, maxW: 470, lh: 21 });
        g.text('K', x0 + 250, 256, { size: 16, weight: 800, color: C.cyan, align: 'center' }); g.text('V', x0 + 400, 256, { size: 16, weight: 800, color: C.violet, align: 'center' });
        for (var i = 0; i < st; i++) {
          var y = 282 + i * rh, isNew = i === st - 1, hot = flash && (!cache || isNew);
          g.text(toks[i], x0 + 30, y, { size: 17, mono: true });
          [[x0 + 180, C.cyan], [x0 + 330, C.violet]].forEach(function (k) { g.box(k[0], y - rh * .36, 140, rh * .72, { r: 5, fill: hot ? k[1] : g.hexA(k[1], cache ? .35 : .25), glow: hot ? k[1] : null, blur: 10 }); });
          if (cache && !isNew) g.text('cached', x0 + 480, y, { size: 13, color: C.green, align: 'right' });
        }
        var work = cache ? st : st * (st + 1) / 2;
        g.text('K/V computations so far: ' + work, x0 + 24, 552, { size: 18, weight: 700, mono: true, color: cache ? C.green : C.red });
      });
      var ma = g.E.out(g.seg(p, .84, .92)), L = P.layers || 32, D = P.dim || 4096, B = P.bytes || 2, per = 2 * L * D * B, ctxN = P.ctx || 4096;
      g.panel(80, 596, 1120, 84, { alpha: ma });
      g.text('Memory: 2 (K, V) × ' + L + ' layers × ' + D.toLocaleString('en-US') + ' dims × ' + B + ' bytes = ' + (per / 1048576).toFixed(1) + ' MB per token', 640, 624, { size: 18, weight: 600, mono: true, align: 'center', alpha: ma }); g.text('× ' + ctxN.toLocaleString('en-US') + ' tokens of context = ' + (per * ctxN / 1073741824).toFixed(1) + ' GB of GPU memory for one sequence', 640, 654, { size: 18, weight: 700, mono: true, align: 'center', color: C.amber, alpha: ma });
    }
  });

  /* ---------- multi-head attention: different heads, different patterns ---------- */
  M.kit('heads', {
    draw: function (g, p, P, S, t) {
      var C = g.C, words = P.words || ['The', 'cat', 'sat', 'because', 'it', 'purred'], n = words.length, ref = P.ref || { 4: 1, 5: 1 };
      g.heading(P.head || 'Multi-head attention', p, P.sub);
      var pats = [['Previous token', function (i, j) { return j === i - 1 ? 3 : j === i ? 1 : 0; }], ['Refers back', function (i, j) { return ref[i] === j ? 3.2 : j === i ? 1 : 0; }], ['First token (sink)', function (i, j) { return j === 0 ? 2.4 : j === i ? .8 : 0; }], ['Broad context', function () { return 0; }]];
      pats.forEach(function (pt, h) {
        var x0 = 70 + h * 290, cs = Math.min(38, 230 / n), y0 = 250, a = g.E.out(g.seg(p, .06 + h * .14, .2 + h * .14)), c = g.PAL[h];
        g.text('head ' + (h + 1), x0 + 130, 190, { size: 15, weight: 800, color: C.muted, align: 'center', head: true, alpha: a }); g.text(pt[0], x0 + 130, 216, { size: 19, weight: 700, color: c, align: 'center', alpha: a });
        for (var i = 0; i < n; i++) { var row = []; for (var j = 0; j <= i; j++) row.push(pt[1](i, j)); var w = softmax(row); for (var j2 = 0; j2 < n; j2++) { var v = j2 <= i ? w[j2] : 0; g.box(x0 + 40 + j2 * cs, y0 + i * cs, cs - 3, cs - 3, { r: 4, fill: j2 <= i ? g.hexA(c, .08 + .9 * v) : 'rgba(20,26,56,.6)', alpha: a }); } g.text(words[i], x0 + 34, y0 + i * cs + cs / 2, { size: 13, color: C.muted, align: 'right', alpha: a }); }
      });
      g.text('Each head has its own Wq, Wk, Wv, so it can learn its own notion of “relevant”. Outputs are concatenated and mixed by Wo.', 640, 580, { size: 20, color: C.ink, align: 'center', maxW: 1100, vcenter: true, lh: 26, alpha: g.seg(p, .66, .76) });
      g.text('rows: the word that is looking · columns: the words it looks at (upper triangle masked: no peeking ahead)', 640, 650, { size: 16, color: C.muted, align: 'center', alpha: g.seg(p, .7, .8) });
    }
  });

  /* ---------- rotary position embeddings ---------- */
  M.kit('rope', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.red, th = .35, pairs = P.pairs || [[1, 3], [4, 6], [9, 11]], np = pairs.length, pos = g.seg(p, .1, .7) * (np - 1), k = Math.min(np - 2, Math.floor(pos)), f = g.E.inOut(pos - k), m = g.lerp(pairs[k][0], pairs[k + 1][0], k >= np - 1 ? 1 : f), nn = g.lerp(pairs[k][1], pairs[k + 1][1], f), q0 = .5, k0 = 1.3;
      g.heading(P.head || 'Rotary position embeddings (RoPE)', p, P.sub);
      var cx = 330, cy = 430, R0 = 190, a0 = g.E.out(g.seg(p, 0, .1));
      g.circle(cx, cy, R0, { stroke: 'rgba(120,140,220,.3)', lw: 2, alpha: a0 }); g.line(cx - R0 - 20, cy, cx + R0 + 20, cy, { color: '#56629c', alpha: a0 }); g.line(cx, cy - R0 - 20, cx, cy + R0 + 20, { color: '#56629c', alpha: a0 });
      var aq = q0 + m * th, ak = k0 + nn * th, dot = Math.cos(aq - ak);
      g.arrow(cx, cy, cx + Math.cos(aq) * R0, cy - Math.sin(aq) * R0, { color: C.pink, lw: 6, head: 16, glow: C.pink, alpha: a0 }); g.text('q at position ' + nf(m, 0), cx + Math.cos(aq) * (R0 + 34), cy - Math.sin(aq) * (R0 + 34), { size: 18, weight: 700, color: C.pink, align: 'center', alpha: a0 });
      g.arrow(cx, cy, cx + Math.cos(ak) * R0, cy - Math.sin(ak) * R0, { color: C.cyan, lw: 6, head: 16, glow: C.cyan, alpha: a0 }); g.text('k at position ' + nf(nn, 0), cx + Math.cos(ak) * (R0 + 34), cy - Math.sin(ak) * (R0 + 34), { size: 18, weight: 700, color: C.cyan, align: 'center', alpha: a0 });
      var ctx = g.ctx; ctx.save(); ctx.globalAlpha *= a0; ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 60, -Math.max(aq, ak), -Math.min(aq, ak)); ctx.stroke(); ctx.restore();
      side(g, p, 600, 190, 300, 330, [['q rotated by m·θ', C.pink, { size: 18 }], ['k rotated by n·θ', C.cyan, { size: 18 }], ['m − n = ' + nf(m - nn, 0), C.amber, { mono: true, size: 22, w: 800 }], ['q · k = ' + nf(dot, 3), C.green, { mono: true, size: 22, w: 800 }], ['Shift both positions: the angle between them — and the score — stays the same.', C.muted, { size: 16, gap: 70 }]]);
      var fa = g.seg(p, .55, .65), mpos = g.seg(p, .6, 1) * 40;
      g.text('Different dimension pairs rotate at different speeds', 1070, 200, { size: 16, weight: 700, color: C.muted, align: 'center', alpha: fa, maxW: 300 });
      [1, .3, .09, .027].forEach(function (fr, i) { var dx = 990 + (i % 2) * 160, dy = 290 + Math.floor(i / 2) * 170, an = mpos * fr; g.circle(dx, dy, 56, { stroke: 'rgba(120,140,220,.4)', lw: 2, alpha: fa }); g.line(dx, dy, dx + Math.cos(Math.PI / 2 - an) * 48, dy - Math.sin(Math.PI / 2 - an) * 48, { color: g.PAL[i], lw: 4, glow: g.PAL[i], alpha: fa }); g.text('θ = ' + fr, dx, dy + 76, { size: 14, mono: true, color: C.muted, align: 'center', alpha: fa }); });
      g.text('position ' + Math.round(mpos), 1070, 640, { size: 18, mono: true, color: C.amber, align: 'center', alpha: fa });
    }
  });

  /* ---------- static vs continuous batching ---------- */
  M.kit('batching', {
    init: function (P) {
      var L = P.lengths || [6, 2, 4, 3, 7, 2, 5, 3, 4, 6, 2, 3], slots = P.slots || 4, st = [], t0 = 0;
      for (var b = 0; b < L.length; b += slots) { var grp = L.slice(b, b + slots), mx = Math.max.apply(null, grp); grp.forEach(function (l, i) { st.push({ slot: i, s: t0, e: t0 + l, id: b + i }); }); t0 += mx; }
      var free = []; for (var s = 0; s < slots; s++) free.push(0); var co = [];
      L.forEach(function (l, i) { var k = free.indexOf(Math.min.apply(null, free)); co.push({ slot: k, s: free[k], e: free[k] + l, id: i }); free[k] += l; });
      var tot = L.reduce(function (a, b2) { return a + b2; }, 0), ms1 = t0, ms2 = Math.max.apply(null, free);
      return { st: st, co: co, ms1: ms1, ms2: ms2, util1: tot / (slots * ms1), util2: tot / (slots * ms2), slots: slots, n: L.length };
    },
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.red, T = Math.max(S.ms1, S.ms2), now = g.seg(p, .08, .88) * T, x0 = 190, w = 1000, u = w / T, a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || 'Static vs continuous batching', p, P.sub);
      [[S.st, 206, 'Static batching', '— wait for the longest request in the batch', S.ms1, S.util1, C.red], [S.co, 452, 'Continuous batching', '— a finished slot immediately takes the next request', S.ms2, S.util2, C.green]].forEach(function (cfg) {
        var y0 = cfg[1], rh = 42;
        var tw = g.text(cfg[2], 80, y0 - 18, { size: 21, weight: 700, head: true, color: cfg[6], alpha: a0 }); g.text(cfg[3], 90 + tw, y0 - 18, { size: 16, color: C.muted, alpha: a0 });
        for (var s = 0; s < S.slots; s++) { g.box(x0, y0 + s * rh, w, rh - 6, { r: 6, fill: 'rgba(30,40,84,.45)', alpha: a0 }); g.text('slot ' + (s + 1), x0 - 10, y0 + s * rh + rh / 2 - 3, { size: 14, color: C.muted, align: 'right', alpha: a0 }); }
        cfg[0].forEach(function (r) { if (r.s >= now) return; var e = Math.min(r.e, now); g.box(x0 + r.s * u + 2, y0 + r.slot * rh, (e - r.s) * u - 4, rh - 6, { r: 6, fill: g.hexA(g.PAL[r.id % 8], .75) }); if (e - r.s > .8) g.text('R' + (r.id + 1), x0 + r.s * u + 12, y0 + r.slot * rh + rh / 2 - 3, { size: 14, weight: 700, color: C.bg }); });
        var done = now >= cfg[4];
        g.text(done ? 'finished at step ' + cfg[4] + ' · GPU utilisation ' + Math.round(cfg[5] * 100) + '%' : '', x0, y0 + S.slots * rh + 10, { size: 17, weight: 700, mono: true, color: cfg[6] });
      });
      g.line(x0 + now * u, 190, x0 + now * u, 640, { color: C.white, lw: 2, dash: [5, 5], alpha: p < .9 ? a0 : 0 });
      g.text('Same ' + S.n + ' requests, same GPU — continuous batching finishes in ' + S.ms2 + ' steps instead of ' + S.ms1 + '.', 640, 684, { size: 19, color: C.ink, align: 'center', alpha: g.seg(p, .88, .95) });
    }
  });

  /* ---------- speculative decoding ---------- */
  M.kit('speculative', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.red, ctx0 = P.context || ['The', 'quick', 'brown'], rounds = P.rounds || [{ draft: ['fox', 'jumps', 'over', 'a'], ok: 3, fix: 'the' }, { draft: ['lazy', 'dog', 'and', 'then'], ok: 2, fix: '.' }, { draft: ['It', 'was', 'very', 'fast'], ok: 4, fix: '!' }];
      g.heading(P.head || 'Speculative decoding', p, P.sub);
      var nr = rounds.length, pos = g.seg(p, .06, .9) * nr, r = Math.min(nr - 1, Math.floor(pos)), f = pos - r, out = ctx0.slice(), passes = 0;
      for (var i = 0; i < r; i++) { out = out.concat(rounds[i].draft.slice(0, rounds[i].ok), [rounds[i].fix]); passes++; }
      var R0 = rounds[r], ph = f < .35 ? 0 : f < .7 ? 1 : 2; if (ph === 2 || p >= .9) { out = out.concat(R0.draft.slice(0, R0.ok), [R0.fix]); passes++; }
      var x = 80; g.text('OUTPUT', 80, 196, { size: 15, weight: 800, color: C.muted, head: true });
      out.forEach(function (tk, i) { var w = tokBox(g, x, 236, tk, { fill: i < ctx0.length ? 'rgba(40,52,100,.75)' : g.hexA(C.green, .22), size: 18 }); x += w + 8; if (x > 1150) x = 1150; });
      var y1 = 360, y2 = 520;
      g.box(60, y1 - 50, 250, 100, { r: 18, fill: g.hexA(C.cyan, .12), stroke: C.cyan, lw: 2, glow: ph === 0 ? C.cyan : null }); g.text('Draft model', 185, y1 - 12, { size: 21, weight: 700, head: true, align: 'center' }); g.text('small · fast', 185, y1 + 18, { size: 15, color: C.muted, align: 'center' });
      g.box(60, y2 - 50, 250, 100, { r: 18, fill: g.hexA(A, .12), stroke: A, lw: 2, glow: ph === 1 ? A : null }); g.text('Target model', 185, y2 - 12, { size: 21, weight: 700, head: true, align: 'center' }); g.text('large · one pass checks all', 185, y2 + 18, { size: 15, color: C.muted, align: 'center' });
      var x2 = 350, da = g.E.out(g.seg(f, 0, .3));
      R0.draft.forEach(function (tk, i) { var vis = g.clamp(da * 4 - i), verdict = ph >= 1 && g.seg(f, .35 + i * .07, .42 + i * .07) > 0, ok = i < R0.ok; var w = tokBox(g, x2, y1, tk, { alpha: vis, fill: verdict ? g.hexA(ok ? C.green : C.red, .25) : 'rgba(40,52,100,.75)', stroke: verdict ? (ok ? C.green : C.red) : g.hexA(C.cyan, .6), size: 19 }); if (verdict) g.text(ok ? '✓' : '✗', x2 + w / 2, y1 + 44, { size: 22, weight: 800, color: ok ? C.green : C.red, align: 'center' }); x2 += w + 14; });
      if (ph >= 1) g.arrow(185, y1 + 54, 185, y2 - 54, { color: A, lw: 3, head: 10, p: g.seg(f, .35, .45) });
      if (ph >= 1 && g.seg(f, .6, .7) > 0) { tokBox(g, 350, y2, (R0.ok === R0.draft.length ? 'bonus: ' : 'correction: ') + R0.fix, { fill: g.hexA(C.amber, .25), stroke: C.amber, alpha: g.seg(f, .6, .7) }); }
      var gen = out.length - ctx0.length;
      side(g, p, 900, 330, 320, 250, [['round ' + (r + 1) + ' of ' + nr, A, { mono: true, size: 20, w: 800 }], ['target passes: ' + passes, C.ink, { mono: true, size: 19 }], ['tokens generated: ' + gen, C.ink, { mono: true, size: 19 }], ['≈ ' + (passes ? nf(gen / passes, 1) : '—') + ' tokens per expensive pass', C.green, { mono: true, size: 18, w: 700 }]]);
      g.text('Output is identical to what the large model alone would produce — just faster.', 640, 668, { size: 19, color: C.muted, align: 'center', alpha: g.seg(p, .85, .92) });
    }
  });

  /* ---------- the context window ---------- */
  M.kit('context-window', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.red, words = (P.text || 'Once upon a time a small robot lived in a quiet town . Every morning it watered the garden and greeted the baker . One day a storm knocked out the power and the robot had to remember where it had hidden the spare battery').split(' '), W = P.window || 14, n = words.length, k = Math.max(1, Math.floor(g.seg(p, .06, .8) * n)), a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || 'The context window', p, P.sub);
      var shown = words.slice(0, k), start = Math.max(0, k - W), x = 80, y = 210, rows = [];
      shown.forEach(function (wd, i) { var w = g.measure(wd, { size: 18, weight: 600, mono: true }) + 18; if (x + w > 1200) { x = 80; y += 50; } rows.push([x, y, w, i]); x += w + 6; });
      rows.forEach(function (r) { var inWin = r[3] >= start; g.box(r[0], r[1] - 18, r[2], 36, { r: 8, fill: inWin ? g.hexA(A, .25) : 'rgba(30,38,70,.5)', stroke: inWin ? g.hexA(A, .7) : null, lw: 1.5, alpha: a0 }); g.text(shown[r[3]], r[0] + r[2] / 2, r[1] + 1, { size: 18, weight: 600, mono: true, align: 'center', color: inWin ? C.ink : '#4b5582', alpha: a0 }); });
      g.text('window = last ' + W + ' tokens  ·  greyed tokens have fallen out — the model cannot see them at all', 640, 480, { size: 18, color: C.muted, align: 'center', alpha: g.seg(p, .3, .4) });
      var ca = g.E.out(g.seg(p, .8, .9)), sizes = [[4, '4k'], [32, '32k'], [128, '128k'], [1000, '1M']];
      g.panel(80, 520, 1120, 150, { alpha: ca });
      g.text('Attention compares every token with every other: cost grows with n²', 110, 556, { size: 19, weight: 700, alpha: ca });
      sizes.forEach(function (s, i) { var rel = Math.pow(s[0] / 4, 2), x2 = 130 + i * 270; g.text(s[1] + ' tokens', x2, 604, { size: 20, weight: 800, mono: true, color: g.PAL[i], alpha: ca }); g.text(rel >= 1000 ? Math.round(rel).toLocaleString('en-US') + '× the work' : rel + '× the work', x2, 638, { size: 17, mono: true, color: C.muted, alpha: ca }); });
    }
  });

  /* ---------- next-token prediction loss ---------- */
  M.kit('next-token', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.red, toks = P.tokens || ['The', 'cat', 'sat', 'on', 'the', 'mat'], pr = P.probs || [.04, .21, .55, .72, .81], n = pr.length, a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || 'Pre-training: predict the next token', p, P.sub);
      var X = function (i) { return 150 + i * 170; };
      g.text('input', 70, 220, { size: 16, weight: 700, color: C.muted, alpha: a0 }); g.text('target', 70, 310, { size: 16, weight: 700, color: C.muted, alpha: a0 });
      toks.forEach(function (tk, i) { if (i < n) tokBox(g, X(i), 220, tk, { center: true, minW: 90, alpha: g.E.out(g.seg(p, .04 + i * .03, .12 + i * .03)) }); if (i > 0) { var ta = g.E.out(g.seg(p, .2 + i * .03, .28 + i * .03)); tokBox(g, X(i - 1), 310, tk, { center: true, minW: 90, fill: g.hexA(C.green, .2), stroke: C.green, alpha: ta }); g.arrow(X(i - 1), 244, X(i - 1), 284, { color: C.muted, lw: 2, head: 8, alpha: ta }); } });
      var losses = pr.map(function (q) { return -Math.log(q); }), base = 600, sc = 34;
      pr.forEach(function (q, i) { var la = g.E.out(g.seg(p, .42 + i * .06, .52 + i * .06)), L = losses[i]; g.text('p = ' + nf(q), X(i), 370, { size: 17, mono: true, color: C.cyan, align: 'center', alpha: la }); g.box(X(i) - 30, base - L * sc * la, 60, L * sc * la, { r: 8, fill: g.mix(C.green, C.red, Math.min(1, L / 3.2)) }); g.text(nf(L), X(i), base - L * sc * la - 16, { size: 17, weight: 700, mono: true, align: 'center', alpha: la }); });
      g.line(90, base, 1000, base, { color: '#56629c', lw: 2, alpha: a0 }); g.text('loss = −ln p(correct token)', 90, 416, { size: 16, color: C.muted, alpha: g.seg(p, .42, .5) });
      var mean = losses.reduce(function (a, b) { return a + b; }, 0) / n, fa = g.E.out(g.seg(p, .8, .9));
      g.line(90, base - mean * sc, 1000, base - mean * sc, { color: C.amber, dash: [8, 6], lw: 2, alpha: fa });
      side(g, p, 1010, 380, 210, 240, [['mean loss', C.muted, { size: 16, gap: 30, a: fa }], [nf(mean, 3), C.amber, { mono: true, size: 28, w: 800, a: fa }], ['perplexity', C.muted, { size: 16, gap: 30, a: fa }], ['e^' + nf(mean, 2) + ' = ' + nf(Math.exp(mean), 1), C.pink, { mono: true, size: 20, w: 700, a: fa }]]);
      g.text('Every position is a training example. Trillions of tokens → trillions of predictions.', 640, 672, { size: 18, color: C.muted, align: 'center', alpha: g.seg(p, .85, .92) });
    }
  });

  /* ---------- token → id → embedding row ---------- */
  M.kit('embed-lookup', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.red, toks = P.tokens || ['The', ' cat', ' sat'], ids = P.ids || [464, 3797, 3332], V = P.vocab || 50257, D = P.dim || 768, a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || 'From token ids to embedding vectors', p, P.sub);
      var mx = 520, my = 180, mw = 240, mh = 430, rows = 56;
      g.box(mx, my, mw, mh, { r: 10, fill: 'rgba(20,28,64,.8)', stroke: '#56629c', lw: 2, alpha: a0 });
      for (var r = 0; r < rows; r++) g.line(mx + 8, my + 6 + r * (mh - 12) / rows, mx + mw - 8, my + 6 + r * (mh - 12) / rows, { color: 'rgba(120,140,220,.12)', lw: 1, alpha: a0 });
      g.text('embedding matrix', mx + mw / 2, my - 18, { size: 16, weight: 700, color: C.muted, align: 'center', alpha: a0 });
      g.text(V.toLocaleString('en-US') + ' rows × ' + D + ' columns', mx + mw / 2, my + mh + 22, { size: 15, mono: true, color: C.muted, align: 'center', alpha: a0 });
      toks.forEach(function (tk, i) {
        var y = 250 + i * 150, a = g.E.out(g.seg(p, .08 + i * .18, .18 + i * .18)), b = g.E.out(g.seg(p, .16 + i * .18, .3 + i * .18)), ry = my + (.18 + .3 * i) * mh, c = g.PAL[i];
        tokBox(g, 80, y, JSON.stringify(tk).slice(1, -1).replace(/ /g, '·'), { alpha: a, minW: 90 });
        g.arrow(200, y, 260, y, { color: C.muted, lw: 2, head: 8, alpha: a }); g.text('id ' + ids[i], 330, y + 1, { size: 20, weight: 700, mono: true, color: c, align: 'center', alpha: a });
        g.arrow(400, y, 510, ry, { color: c, lw: 2.5, head: 10, alpha: b, glow: c });
        g.box(mx + 4, ry - 5, mw - 8, 10, { r: 3, fill: c, glow: c, alpha: b });
        for (var d = 0; d < 10; d++) { var v = Math.sin(ids[i] * .37 + d * 1.9) * .5 + .5; g.box(800 + d * 32, y - 16, 28, 32, { r: 5, fill: g.hexA(c, .15 + .75 * v), alpha: b }); }
        g.text('… ' + D + ' numbers', 1124, y + 1, { size: 14, color: C.muted, alpha: b });
        g.arrow(mx + mw + 10, ry, 790, y, { color: c, lw: 2, head: 8, alpha: b * .8, dash: [5, 5] });
      });
      g.text('Looking up a row = multiplying a one-hot vector by the matrix. The rows are learned during training.', 640, 684, { size: 18, color: C.muted, align: 'center', alpha: g.seg(p, .75, .85) });
    }
  });

  /* ---------- direct preference optimisation ---------- */
  M.kit('dpo', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.red, beta = P.beta || .1, a0 = g.E.out(g.seg(p, 0, .1));
      g.heading(P.head || 'Direct Preference Optimisation (DPO)', p, P.sub);
      g.panel(70, 180, 520, 480, { alpha: a0 });
      g.text('PROMPT', 96, 214, { size: 14, weight: 800, color: C.muted, head: true, alpha: a0 }); g.text(P.prompt || 'Explain overfitting to a beginner.', 96, 248, { size: 19, weight: 600, maxW: 470, alpha: a0 });
      var ca = g.E.out(g.seg(p, .08, .18)), ra = g.E.out(g.seg(p, .16, .26));
      g.box(90, 290, 480, 160, { r: 14, fill: g.hexA(C.green, .12), stroke: C.green, lw: 2, alpha: ca }); g.text('✓ chosen', 110, 316, { size: 16, weight: 800, color: C.green, alpha: ca }); g.text(P.chosen || 'Overfitting is when a model memorises its training examples instead of learning the general pattern, so it fails on new data — like a student who memorises answers.', 110, 380, { size: 17, maxW: 440, lh: 22, vcenter: true, alpha: ca });
      g.box(90, 470, 480, 160, { r: 14, fill: g.hexA(C.red, .12), stroke: C.red, lw: 2, alpha: ra }); g.text('✗ rejected', 110, 496, { size: 16, weight: 800, color: C.red, alpha: ra }); g.text(P.rejected || 'Overfitting occurs when variance dominates the bias–variance decomposition of expected generalisation error.', 110, 560, { size: 17, maxW: 440, lh: 22, vcenter: true, alpha: ra });
      var cx = 680, cy = 200, cw = 520, ch = 250, T = 200, now = g.seg(p, .3, .9) * T, rc = function (s) { return 1.2 * (1 - Math.exp(-s / 40)); }, rr = function (s) { return -1.6 * (1 - Math.exp(-s / 40)); }, loss = function (s) { return Math.log(1 + Math.exp(-(rc(s) - rr(s)))); };
      var Y = function (v) { return cy + ch / 2 - v / 2 * (ch / 2); };
      g.panel(cx - 30, cy - 30, cw + 50, ch + 70, { alpha: a0 });
      g.line(cx, Y(0), cx + cw, Y(0), { color: '#56629c', lw: 1.5, alpha: a0 });
      [[rc, C.green, 'chosen: β·log π/π_ref ↑'], [rr, C.red, 'rejected: β·log π/π_ref ↓'], [loss, C.amber, 'DPO loss ↓']].forEach(function (c, k) { var pts = []; for (var s = 0; s <= now; s += 2) pts.push([cx + s / T * cw, Y(c[0](s))]); if (pts.length > 1) g.path(pts, { color: c[1], lw: 3.5, glow: c[1] }); g.box(cx + k * 180, cy + ch + 20, 14, 14, { r: 3, fill: c[1], alpha: a0 }); g.text(c[2], cx + 20 + k * 180, cy + ch + 28, { size: 13, color: C.muted, alpha: a0 }); });
      var fa = g.E.out(g.seg(p, .3, .4));
      g.text('loss = −log σ( β[ log π(y✓)/π_ref(y✓) − log π(y✗)/π_ref(y✗) ] )', 940, 548, { size: 15, weight: 700, mono: true, align: 'center', alpha: fa, maxW: 560, vcenter: true, lh: 22 });
      g.text('step ' + Math.round(now) + ' · loss ' + nf(loss(now), 3) + ' (starts at ln 2 = 0.693)', 940, 602, { size: 17, mono: true, color: C.amber, align: 'center', alpha: fa });
      g.text('No reward model and no RL loop — just a classification-style loss on preference pairs.', 940, 640, { size: 16, color: C.muted, align: 'center', maxW: 540, alpha: g.seg(p, .8, .9) });
    }
  });
})(window.Motion);
