/* AI in Motion — generative AI and LLM kits. © Janin A Apurba, CSE, AUST */
(function (M) {
  'use strict';
  var mk = function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  var gs = function (r) { var u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };

  /* ---------- generative vs discriminative ---------- */
  M.kit('gen-disc', {
    init: function () {
      var r = mk(4), A = [], B = []; for (var i = 0; i < 40; i++) { A.push([3.3 + gs(r) * .9, 6.3 + gs(r) * 1.2]); B.push([6.8 + gs(r) * 1.1, 3.6 + gs(r) * .8]); }
      var stats = function (pts) { var mx = 0, my = 0; pts.forEach(function (q) { mx += q[0]; my += q[1]; }); mx /= pts.length; my /= pts.length; var sx = 0, sy = 0; pts.forEach(function (q) { sx += (q[0] - mx) * (q[0] - mx); sy += (q[1] - my) * (q[1] - my); }); return [mx, my, Math.sqrt(sx / pts.length), Math.sqrt(sy / pts.length)]; };
      var sA = stats(A), sB = stats(B), gen = []; for (i = 0; i < 12; i++) gen.push([sA[0] + gs(r) * sA[2], sA[1] + gs(r) * sA[3]]);
      return { A: A, B: B, sA: sA, sB: sB, gen: gen };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Discriminative vs generative models', p, P.sub);
      [['Discriminative: learns the boundary', 90, g.C.cyan], ['Generative: learns what each class looks like', 670, g.C.violet]].forEach(function (pn, k) {
        var a = g.seg(p, .05 + k * .35, .15 + k * .35); if (a <= 0) return; var x0 = pn[1], y0 = 200, w = 520, h = 400, X = function (x) { return x0 + x / 10 * w; }, Y = function (y) { return y0 + h - y / 10 * h; };
        g.panel(x0 - 10, y0 - 50, w + 20, h + 60, { alpha: a }); g.text(pn[0], x0 + 10, y0 - 22, { size: 18, weight: 700, color: pn[2], alpha: a });
        if (k === 1) [S.sA, S.sB].forEach(function (s, j) { [2, 1].forEach(function (m) { g.ctx.save(); g.ctx.globalAlpha *= a * .5; g.ctx.strokeStyle = j ? g.C.cyan : g.C.pink; g.ctx.fillStyle = g.hexA(j ? g.C.cyan : g.C.pink, .06); g.ctx.lineWidth = 2; g.ctx.beginPath(); g.ctx.ellipse(X(s[0]), Y(s[1]), s[2] * m * w / 10, s[3] * m * h / 10, 0, 0, 7); g.ctx.fill(); g.ctx.stroke(); g.ctx.restore(); }); });
        S.A.forEach(function (q) { g.circle(X(q[0]), Y(q[1]), 5, { fill: g.C.pink, alpha: a }); }); S.B.forEach(function (q) { g.circle(X(q[0]), Y(q[1]), 5, { fill: g.C.cyan, alpha: a }); });
        if (k === 0) g.line(X(1), Y(1.5), X(9.5), Y(9), { color: g.C.white, lw: 4, glow: g.C.white, p: g.seg(p, .12, .3) });
        if (k === 1) { var ga = g.seg(p, .6, .85); S.gen.forEach(function (q, i) { var b = g.clamp(ga * 12 - i); if (b > 0) { g.circle(X(q[0]), Y(q[1]), 8 * b, { stroke: g.C.amber, lw: 2.5, glow: g.C.amber }); } }); if (ga > 0) g.text('✦ new samples drawn from the pink model', x0 + 10, y0 + h - 10, { size: 16, color: g.C.amber, alpha: ga }); }
      });
    }
  });

  /* ---------- VAE latent space ---------- */
  var shape = function (g, cx, cy, R, u, v, a) { // u: circle→square, v: hue
    var n = 2 + u * 8, pts = []; for (var k = 0; k <= 64; k++) { var th = k / 64 * Math.PI * 2, c = Math.cos(th), s = Math.sin(th); pts.push([cx + R * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), cy + R * Math.sign(s) * Math.pow(Math.abs(s), 2 / n)]); }
    var col = g.mix('#f472b6', '#22d3ee', v); g.path(pts, { color: col, lw: 2, fill: g.hexA(col, .55), alpha: a });
  };
  M.kit('vae-latent', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'A smooth latent space', p, P.sub || 'illustrative decoder: shape and colour change smoothly');
      var n = 6, cs = 80, x0 = 110, y0 = 180, ga = g.seg(p, .05, .35);
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) { var a = g.clamp(ga * n * n - (i * n + j)); if (a > 0) shape(g, x0 + j * cs + cs / 2, y0 + i * cs + cs / 2, 26, j / (n - 1), i / (n - 1), a); }
      g.text('latent dimension 1 →', x0, y0 + n * cs + 26, { size: 16, color: g.C.muted }); g.text('dim 2 ↓', x0 + n * cs + 12, y0 + 20, { size: 16, color: g.C.muted });
      var pa = g.seg(p, .4, .95); if (pa <= 0) return;
      var tt = pa * Math.PI * 2, u = .5 + .45 * Math.cos(tt), v = .5 + .45 * Math.sin(tt * 1.5);
      g.circle(x0 + u * (n - 1) * cs + cs / 2, y0 + v * (n - 1) * cs + cs / 2, 12, { stroke: g.C.white, lw: 3, glow: g.C.white });
      g.panel(720, 180, 460, 440); g.text('decoder output', 950, 216, { size: 18, align: 'center', color: g.C.muted });
      shape(g, 950, 400, 130, u, v, 1);
      g.text('z = (' + u.toFixed(2) + ', ' + v.toFixed(2) + ')', 950, 590, { size: 22, mono: true, align: 'center', color: g.C.amber });
    }
  });

  /* ---------- diffusion noise schedule (linear β, T = 1000) ---------- */
  M.kit('noise-schedule', {
    init: function (P, g) {
      var T = 1000, ab = [], cur = 1; for (var t2 = 1; t2 <= T; t2++) { var beta = 1e-4 + (0.02 - 1e-4) * (t2 - 1) / (T - 1); cur *= 1 - beta; ab.push(cur); }
      var N = 20, r = mk(3), noise = []; for (var i = 0; i < N * N; i++) noise.push(gs(r));
      var heart = function (x, y) { var u = (x - N / 2 + .5) / (N * .38), v = -(y - N / 2 + .5) / (N * .38); return Math.pow(u * u + v * v - 1, 3) - u * u * v * v * v <= 0 ? 1 : -1; };
      var strips = [0, 100, 250, 500, 999].map(function (tt) { var a = Math.sqrt(tt === 0 ? 1 : ab[tt]), b = Math.sqrt(1 - (tt === 0 ? 1 : ab[tt])); return { t: tt, img: g.pixels(N, N, function (x, y) { var v = a * heart(x, y) + b * noise[y * N + x], q = Math.max(0, Math.min(1, (v + 2) / 4)); return [Math.round(30 + q * 225), Math.round(20 + q * 120), Math.round(60 + q * 130)]; }) }; });
      return { ab: ab, strips: strips };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'The forward process: adding noise on a schedule', p, P.sub || 'linear β schedule, T = 1000 steps');
      var x0 = 110, y0 = 190, w = 520, h = 260, a = g.seg(p, .05, .5);
      g.axes(x0, y0, w, h, { xl: 'timestep t', alpha: 1 });
      var sig = [], noi = []; for (var tt = 0; tt < 1000; tt += 5) { sig.push([x0 + tt / 999 * w, y0 + h - Math.sqrt(S.ab[tt]) * h]); noi.push([x0 + tt / 999 * w, y0 + h - Math.sqrt(1 - S.ab[tt]) * h]); }
      g.path(sig, { color: g.C.green, lw: 4, p: a, glow: g.C.green }); g.path(noi, { color: g.C.red, lw: 4, p: a, glow: g.C.red });
      g.text('signal √ᾱₜ', x0 + 20, y0 + 20, { size: 17, color: g.C.green }); g.text('noise √(1−ᾱₜ)', x0 + 20, y0 + 46, { size: 17, color: g.C.red });
      g.text('xₜ = √ᾱₜ · x₀ + √(1−ᾱₜ) · ε', 720, 250, { size: 28, mono: true, weight: 700, color: g.C.amber, alpha: g.seg(p, .2, .3) });
      g.text('Jump straight to any timestep during training', 720, 295, { size: 18, color: g.C.muted, alpha: g.seg(p, .25, .35) });
      S.strips.forEach(function (s, i) { var b = g.seg(p, .45 + i * .08, .53 + i * .08); g.img(s.img, 110 + i * 220, 500, 150, 150, { alpha: b }); g.text('t = ' + s.t, 185 + i * 220, 672, { size: 17, mono: true, align: 'center', alpha: b }); });
    }
  });

  /* ---------- classifier-free guidance as vector arithmetic ---------- */
  M.kit('cfg', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Classifier-free guidance', p, P.sub || 'ε̂ = ε_uncond + w · (ε_cond − ε_uncond)');
      var o = [130, 640], U = [40, -150], Cc = [110, -180], sc = 1, ws = [1, 3, 7.5], cur = Math.min(2, Math.floor(g.seg(p, .35, .95) * 3));
      var A = function (v, col, lab, a) { g.arrow(o[0], o[1], o[0] + v[0], o[1] + v[1], { color: col, lw: 5, head: 16, glow: col, alpha: a }); var right = o[0] + v[0] > 560; g.text(lab, o[0] + v[0] + (right ? -14 : 12), o[1] + v[1] - (right ? 22 : 10), { size: 19, weight: 700, color: col, alpha: a, align: right ? 'right' : 'left' }); };
      g.circle(o[0], o[1], 6, { fill: g.C.white });
      A(U, g.C.muted, 'unconditional (no prompt)', g.seg(p, .05, .15)); A(Cc, g.C.cyan, 'conditional (with prompt)', g.seg(p, .15, .25));
      var d = [Cc[0] - U[0], Cc[1] - U[1]]; g.line(o[0] + U[0], o[1] + U[1], o[0] + Cc[0], o[1] + Cc[1], { color: g.C.amber, lw: 2, dash: [6, 5], alpha: g.seg(p, .25, .35) });
      ws.forEach(function (w, i) { if (i > cur) return; var v = [U[0] + w * d[0] * sc, U[1] + w * d[1] * sc]; A(v, i === cur ? g.C.pink : g.hexA(g.C.pink, .35), i === cur ? 'guided, w = ' + w : '', i === cur ? 1 : .5); });
      g.panel(800, 200, 380, 400);
      var w2 = ws[cur]; g.text('Guidance scale w = ' + w2, 830, 240, { size: 22, weight: 700, color: g.C.pink });
      [['w = 1', 'plain conditional: follows the prompt loosely'], ['w ≈ 3–8', 'stronger prompt adherence, the usual range'], ['w too high', 'over-saturated, less variety']].forEach(function (r2, i) { g.text(r2[0], 830, 300 + i * 90, { size: 19, weight: 700, mono: true, color: i === Math.min(cur, 1) ? g.C.ink : g.C.muted }); g.text(r2[1], 830, 330 + i * 90, { size: 17, color: g.C.muted, maxW: 330 }); });
    }
  });

  /* ---------- scaling laws (illustrative power law) ---------- */
  M.kit('scaling', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Scaling laws', p, P.sub || 'illustrative power-law curve');
      var x0 = 150, y0 = 190, w = 700, h = 420, L = function (c) { return 1.7 + 6 * Math.pow(10, -.12 * c); };
      g.axes(x0, y0, w, h, { xl: 'training compute (log scale) →', yl: 'loss', alpha: 1 });
      var pts = []; for (var c = 0; c <= 10; c += .1) pts.push([x0 + c / 10 * w, y0 + h - (L(c) - 1.2) / 6.6 * h]);
      g.path(pts, { color: g.C.violet, lw: 4, glow: g.C.violet, p: g.seg(p, .1, .7) });
      ['small', 'medium', 'large', 'x-large'].forEach(function (s, i) { var c = 1.5 + i * 2.5, a = g.seg(p, .2 + i * .12, .3 + i * .12); g.circle(x0 + c / 10 * w, y0 + h - (L(c) - 1.2) / 6.6 * h, 11, { fill: g.PAL[i], glow: g.PAL[i], alpha: a }); g.text(s, x0 + c / 10 * w, y0 + h - (L(c) - 1.2) / 6.6 * h - 26, { size: 16, align: 'center', alpha: a }); });
      g.line(x0, y0 + h - (1.7 - 1.2) / 6.6 * h, x0 + w, y0 + h - (1.7 - 1.2) / 6.6 * h, { color: g.C.muted, dash: [6, 6], lw: 1.5 }); g.text('irreducible loss', x0 + w, y0 + h - (1.7 - 1.2) / 6.6 * h - 14, { size: 15, color: g.C.muted, align: 'right' });
      g.panel(900, 220, 300, 330, { alpha: g.seg(p, .6, .7) });
      ['Bigger models', 'More data', 'More compute'].forEach(function (s, i) { g.text('↑ ' + s, 930, 270 + i * 50, { size: 21, weight: 700, color: g.PAL[i], alpha: g.seg(p, .62 + i * .05, .7 + i * .05) }); });
      g.text('→ predictably lower loss, with diminishing returns', 930, 440, { size: 18, maxW: 250, lh: 24, alpha: g.seg(p, .8, .9) });
    }
  });

  /* ---------- RLHF: human preferences ---------- */
  M.kit('rlhf', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Learning from human feedback', p, P.sub);
      var ph = g.seg(p, .05, .95);
      g.panel(90, 170, 1100, 80); g.text('Prompt: “Explain photosynthesis to a 10-year-old.”', 120, 210, { size: 22, weight: 600 });
      var A = ['Plants make food from sunlight! They take in', 'water and air, and use light energy to turn', 'them into sugar — and give out oxygen.'], B = ['Photosynthesis is the process by which', 'chlorophyll-containing organisms convert', 'electromagnetic radiation into chemical…'];
      [[A, 'Response A', 90], [B, 'Response B', 660]].forEach(function (r, k) { var a = g.seg(ph, k * .08, .12 + k * .08), win = k === 0 && ph > .35; g.box(r[2], 280, 530, 200, { r: 18, fill: 'rgba(20,28,64,.8)', stroke: win ? g.C.green : g.C.line, lw: win ? 3 : 1.5, glow: win ? g.C.green : null, alpha: a }); g.text(r[1], r[2] + 24, 312, { size: 18, weight: 700, color: g.C.muted, alpha: a }); r[0].forEach(function (l, i) { g.text(l, r[2] + 24, 350 + i * 32, { size: 18, alpha: a }); }); if (win) g.pill(r[2] + 430, 312, '👍 preferred', { fill: g.C.green, align: 'center', size: 15 }); });
      var st = [['1', 'People compare pairs of answers', .35], ['2', 'A reward model learns to predict their preferences', .55], ['3', 'The LLM is tuned to earn higher reward (e.g. PPO or DPO)', .75]];
      st.forEach(function (s, i) { var a = g.seg(ph, s[2], s[2] + .1); g.circle(120, 540 + i * 50, 16, { fill: g.PAL[i], alpha: a }); g.text(s[0], 120, 541 + i * 50, { size: 16, weight: 800, color: g.C.bg, align: 'center', alpha: a }); g.text(s[1], 150, 540 + i * 50, { size: 20, alpha: a }); });
      var ra = g.seg(ph, .55, .7); g.text('reward', 1000, 540, { size: 16, color: g.C.muted, alpha: ra }); g.box(1000, 556, 170 * .82 * ra, 22, { r: 6, fill: g.C.green }); g.box(1000, 590, 170 * .31 * ra, 22, { r: 6, fill: g.C.red }); g.text('A', 985, 567, { size: 15, align: 'right', alpha: ra }); g.text('B', 985, 601, { size: 15, align: 'right', alpha: ra });
    }
  });

  /* ---------- sampling: temperature, top-k, top-p ---------- */
  M.kit('sampling', {
    draw: function (g, p, P, S, t) {
      var toks = P.tokens || ['blue', 'clear', 'grey', 'dark', 'purple', 'falling'], logits = P.logits || [3.2, 2.6, 2.1, 1.5, .6, -.4], mode = P.mode || 'temp';
      var sm = function (T) { var e = logits.map(function (l) { return Math.exp(l / T); }), s = e.reduce(function (a, b) { return a + b; }, 0); return e.map(function (v) { return v / s; }); };
      g.heading(P.head || (mode === 'temp' ? 'Temperature: sharpen or flatten the choices' : 'Top-k and top-p (nucleus) sampling'), p, P.sub || 'next word after “The sky is …” · illustrative logits');
      var T = mode === 'temp' ? (p < .35 ? g.lerp(1, .4, g.seg(p, .1, .35)) : p < .65 ? g.lerp(.4, 1, g.seg(p, .35, .5)) : g.lerp(1, 2, g.seg(p, .65, .9))) : 1;
      var pr = sm(T), x0 = 330, bw = 700;
      var cum = 0, inP = pr.map(function (v) { var ok = cum < .9; cum += v; return ok; }), k = 3;
      toks.forEach(function (tk, i) {
        var y = 220 + i * 66, out = mode === 'topk' ? (p > .3 && p < .6 && i >= k) : mode === 'topp' || (mode !== 'temp' && p >= .6) ? !inP[i] : false;
        g.text(tk, x0 - 20, y, { size: 24, weight: 700, mono: true, align: 'right', color: out ? '#4a5286' : g.C.ink });
        g.box(x0, y - 18, bw * pr[i], 36, { r: 8, fill: out ? '#2a3260' : g.PAL[i % g.PAL.length], glow: out ? null : g.PAL[i % g.PAL.length], blur: 8 });
        g.text((pr[i] * 100).toFixed(1) + '%', x0 + bw * pr[i] + 12, y, { size: 19, mono: true, color: out ? '#4a5286' : g.C.muted });
      });
      if (mode === 'temp') { g.panel(900, 600, 300, 70); g.text('T = ' + T.toFixed(2), 1050, 635, { size: 30, weight: 700, mono: true, align: 'center', color: T < .9 ? g.C.cyan : T > 1.1 ? g.C.pink : g.C.ink }); g.text(T < .9 ? 'low T: safer, more predictable' : T > 1.1 ? 'high T: more random, more creative' : 'T = 1: the model’s own probabilities', 640, 630, { size: 19, align: 'center', color: g.C.muted }); }
      else { var lab = p < .3 ? 'All candidates' : p < .6 ? 'Top-k (k = 3): keep only the 3 most likely' : 'Top-p (p = 0.9): keep the smallest set covering 90%'; g.text(lab, 640, 640, { size: 21, weight: 700, align: 'center', color: g.C.amber }); }
    }
  });

  /* ---------- chat transcript (with tool calls) ---------- */
  M.kit('chat', {
    draw: function (g, p, P, S, t) {
      var msgs = P.msgs || [['user', 'Hello!'], ['assistant', 'Hi — how can I help?']], n = msgs.length;
      g.heading(P.head || 'A conversation', p, P.sub);
      var cnt = g.seg(p, .05, .9) * n, y = 170, shown = [];
      for (var i = 0; i < n; i++) if (cnt > i) shown.push(i);
      var hts = shown.map(function (i) { g.setFont({ size: 19 }); return g.wrap(msgs[i][1], 640).length * 26 + 26; }), total = hts.reduce(function (a, b) { return a + b + 14; }, 0), skip = 0;
      while (total > 500 && skip < shown.length - 1) { total -= hts[skip] + 14; skip++; }
      shown.slice(skip).forEach(function (i, k) {
        var m = msgs[i], role = m[0], hgt = hts[k + skip], a = g.E.out(g.clamp((cnt - i) * 1.5)), tool = role === 'tool' || role === 'call';
        var partial = i === Math.floor(cnt) || cnt - i < 1 ? String(m[1]).slice(0, Math.ceil(m[1].length * g.clamp((cnt - i) * 1.3))) : m[1];
        var w = 700, x = role === 'user' ? 1190 - w : role === 'assistant' ? 90 : 190, fill = role === 'user' ? 'rgba(96,165,250,.25)' : tool ? 'rgba(251,191,36,.12)' : 'rgba(167,139,250,.18)', col = role === 'user' ? g.C.blue : tool ? g.C.amber : g.C.violet;
        g.box(x, y, w, hgt, { r: 16, fill: fill, stroke: col, lw: 1.5, alpha: a });
        g.text(role === 'call' ? 'TOOL CALL' : role.toUpperCase(), x + 18, y + 2 - 12 + 12, { size: 12, weight: 800, color: col, alpha: a, base: 'top' });
        g.text(partial, x + 18, y + 38, { size: tool ? 17 : 19, mono: tool, maxW: w - 40, lh: 26, alpha: a });
        y += hgt + 14;
      });
    }
  });

  /* ---------- retrieval-augmented generation ---------- */
  M.kit('rag', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Retrieval-augmented generation (RAG)', p, P.sub || 'Answer from your own documents, with sources');
      var ph = g.seg(p, .04, .96), r = mk(9), q = P.question || 'How many days of annual leave do I get?';
      g.panel(80, 170, 1120, 60); g.text('❓ ' + q, 110, 200, { size: 22, weight: 600 });
      var st = [[180, 'Embed the question', g.C.cyan, .05], [460, 'Search the vector store', g.C.blue, .2], [760, 'Top chunks retrieved', g.C.amber, .38], [1060, 'LLM writes the answer', g.C.green, .6]];
      st.forEach(function (s, i) { var a = g.seg(ph, s[3], s[3] + .08); g.text(s[1], s[0], 270, { size: 18, weight: 700, align: 'center', color: s[2], alpha: a }); if (i < 3) g.arrow(s[0] + 110, 380, st[i + 1][0] - 110, 380, { color: g.C.muted, lw: 2.5, alpha: g.seg(ph, s[3] + .08, s[3] + .14) }); });
      var ea = g.seg(ph, .05, .15); for (var i = 0; i < 8; i++) g.box(120 + i * 15, 330 + (i % 3) * 12, 11, 60 - (i % 3) * 20, { r: 3, fill: g.C.cyan, alpha: ea });
      var va = g.seg(ph, .2, .3); for (i = 0; i < 40; i++) { var x = 380 + r() * 160, y = 310 + r() * 150, near = i < 3; g.circle(x, y, near && ph > .3 ? 7 : 4, { fill: near && ph > .3 ? g.C.amber : g.C.blue, alpha: va }); }
      var chunks = P.chunks || ['[1] Leave policy §2: full-time staff receive 20 days of paid annual leave.', '[2] §2.3: up to 5 unused days carry over to next year.', '[3] Holidays calendar 2026'];
      chunks.forEach(function (c, i) { var a = g.seg(ph, .38 + i * .06, .46 + i * .06); g.box(640, 300 + i * 70, 240, 58, { r: 10, fill: 'rgba(251,191,36,.12)', stroke: g.C.amber, alpha: a }); g.text(c, 652, 329 + i * 70, { size: 12.5, maxW: 220, vcenter: true, lh: 15, alpha: a }); });
      var aa = g.seg(ph, .62, .9); g.box(930, 300, 270, 200, { r: 16, fill: 'rgba(52,211,153,.12)', stroke: g.C.green, lw: 2, alpha: aa });
      var ans = P.answer || 'You get 20 days of paid annual leave per year [1], and up to 5 unused days can carry over [2].';
      g.text(ans.slice(0, Math.ceil(ans.length * g.seg(ph, .66, .9))), 950, 340, { size: 16.5, maxW: 235, lh: 23, alpha: aa });
      g.text('Grounded in retrieved text → fewer hallucinations, answers cite their sources.', 640, 620, { size: 20, align: 'center', color: g.C.muted, alpha: g.seg(ph, .9, .96) });
    }
  });

  /* ---------- LoRA: low-rank adaptation ---------- */
  M.kit('lora', {
    draw: function (g, p, P, S, t) {
      var d = P.d || 4096, rk = P.r || 8, full = d * d, lo = 2 * d * rk;
      g.heading(P.head || 'LoRA: fine-tune with tiny matrices', p, P.sub || 'W′ = W + B·A,  with B: d×r and A: r×d');
      var a1 = g.seg(p, .05, .15), a2 = g.seg(p, .2, .35), a3 = g.seg(p, .35, .5);
      g.box(110, 200, 300, 300, { r: 10, fill: 'rgba(96,165,250,.18)', stroke: g.C.blue, lw: 2.5, alpha: a1 });
      for (var i = 1; i < 12; i++) { g.line(110 + i * 25, 200, 110 + i * 25, 500, { color: g.hexA(g.C.blue, .2), lw: 1, alpha: a1 }); g.line(110, 200 + i * 25, 410, 200 + i * 25, { color: g.hexA(g.C.blue, .2), lw: 1, alpha: a1 }); }
      g.text('W  (' + d + ' × ' + d + ')', 260, 530, { size: 20, weight: 700, mono: true, align: 'center', color: g.C.blue, alpha: a1 }); g.text('🔒 frozen', 260, 560, { size: 17, align: 'center', color: g.C.muted, alpha: a1 });
      g.text('+', 460, 350, { size: 48, weight: 700, align: 'center', alpha: a2 });
      g.box(510, 200, 26, 300, { r: 6, fill: 'rgba(251,146,60,.3)', stroke: g.C.orange, lw: 2.5, alpha: a2, glow: g.C.orange }); g.text('B', 523, 530, { size: 20, weight: 700, mono: true, align: 'center', color: g.C.orange, alpha: a2 });
      g.text('×', 568, 350, { size: 36, align: 'center', alpha: a2 });
      g.box(600, 337, 300, 26, { r: 6, fill: 'rgba(251,146,60,.3)', stroke: g.C.orange, lw: 2.5, alpha: a2, glow: g.C.orange }); g.text('A', 750, 400, { size: 20, weight: 700, mono: true, align: 'center', color: g.C.orange, alpha: a2 });
      g.text('rank r = ' + rk + ' · trainable', 700, 450, { size: 17, align: 'center', color: g.C.orange, alpha: a2 });
      g.panel(930, 200, 270, 330, { alpha: a3 });
      g.text('Trainable parameters', 955, 236, { size: 17, color: g.C.muted, alpha: a3 });
      g.text('Full fine-tune', 955, 290, { size: 17, weight: 700, alpha: a3 }); g.text(full.toLocaleString('en-US'), 955, 320, { size: 24, weight: 700, mono: true, color: g.C.blue, alpha: a3 });
      g.text('LoRA', 955, 380, { size: 17, weight: 700, alpha: a3 }); g.text(lo.toLocaleString('en-US'), 955, 410, { size: 24, weight: 700, mono: true, color: g.C.orange, alpha: a3 });
      g.text((lo / full * 100).toFixed(2) + '% of the matrix', 955, 470, { size: 20, weight: 700, color: g.C.green, alpha: g.seg(p, .5, .6) });
      g.text('Per weight matrix. Swap small LoRA adapters for different tasks on one base model.', 640, 640, { size: 19, align: 'center', color: g.C.muted, alpha: g.seg(p, .6, .7) });
    }
  });

  /* ---------- quantisation ---------- */
  M.kit('quantize', {
    init: function () { var r = mk(12), w = []; for (var i = 0; i < 400; i++) w.push(Math.max(-1, Math.min(1, gs(r) * .32))); return { w: w }; },
    draw: function (g, p, P, S, t) {
      var params = P.params || 7;
      g.heading(P.head || 'Quantisation: fewer bits per weight', p, P.sub);
      var x0 = 110, w = 620, X = function (v) { return x0 + (v + 1) / 2 * w; }, bits = p < .45 ? 32 : p < .7 ? 8 : 4, levels = Math.pow(2, bits), step = 2 / (levels - 1), snap = g.E.inOut(g.seg(p, .35, .5)) + (bits === 4 ? 0 : 0);
      g.line(x0, 330, x0 + w, 330, { color: '#4a5690', lw: 2 });
      if (bits <= 8) for (var l = 0; l < levels && levels <= 16; l++) g.line(X(-1 + l * step), 300, X(-1 + l * step), 360, { color: g.hexA(g.C.amber, .5), lw: 1.5 });
      if (bits === 8) g.text('256 levels', x0 + w, 290, { size: 16, align: 'right', color: g.C.amber });
      S.w.forEach(function (v, i) { var q = bits >= 32 ? v : Math.round((v + 1) / step) * step - 1, s = bits === 8 ? snap : bits === 4 ? 1 : 0, x = X(g.lerp(v, q, s)), y = 330 + ((i * 37) % 41 - 20) * (1 - (bits === 4 ? g.seg(p, .7, .8) * .8 : 0)); g.circle(x, y, 2.6, { fill: g.C.cyan, alpha: .8 }); });
      g.text('weights (−1 … 1)', x0, 390, { size: 16, color: g.C.muted });
      g.text(bits === 32 ? 'float32: every value stored exactly' : bits === 8 ? 'int8: snap to 256 levels' : 'int4: snap to just 16 levels', x0, 440, { size: 22, weight: 700, color: g.C.amber });
      var rows = [['FP32', 4, g.C.red], ['FP16', 2, g.C.orange], ['INT8', 1, g.C.amber], ['INT4', .5, g.C.green]];
      g.panel(800, 180, 400, 330); g.text(params + 'B-parameter model · weights only', 825, 214, { size: 17, color: g.C.muted });
      rows.forEach(function (r2, i) { var gb = params * r2[1], a = g.seg(p, .1 + i * .15, .2 + i * .15); g.text(r2[0], 825, 268 + i * 60, { size: 18, weight: 700, mono: true, alpha: a }); g.box(900, 256 + i * 60, 220 * gb / (params * 4) * a, 26, { r: 6, fill: r2[2] }); g.text(gb + ' GB', 900 + 220 * gb / (params * 4) + 10, 269 + i * 60, { size: 17, mono: true, alpha: a }); });
      g.text('Smaller and faster, usually with a small loss in quality.', 640, 620, { size: 20, align: 'center', color: g.C.muted, alpha: g.seg(p, .8, .9) });
    }
  });

  /* ---------- mixture of experts ---------- */
  M.kit('moe', {
    draw: function (g, p, P, S, t) {
      var E2 = 8, k = 2, toks = P.tokens || ['The', 'integral', 'of', 'sin', 'x', 'is'];
      g.heading(P.head || 'Mixture of experts', p, P.sub || 'A router sends each token to its top-2 of 8 experts');
      var ti = Math.min(toks.length - 1, Math.floor(g.seg(p, .08, .92) * toks.length)), f = g.seg(p, .08, .92) * toks.length - ti, r = mk(ti * 7 + 3), sc = []; for (var i = 0; i < E2; i++) sc.push(r());
      var top = sc.map(function (v, i) { return [v, i]; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, k).map(function (x) { return x[1]; });
      toks.forEach(function (tk, i) { g.pill(110 + i * 90, 200, tk, { fill: i === ti ? g.C.amber : i < ti ? '#3c4a86' : '#262f5e', align: 'center', size: 17, color: i === ti ? g.C.bg : g.C.ink }); });
      g.box(90, 290, 200, 260, { r: 18, fill: 'rgba(251,191,36,.12)', stroke: g.C.amber, lw: 2 }); g.text('Router', 190, 320, { size: 20, weight: 700, align: 'center', color: g.C.amber });
      sc.forEach(function (v, i) { var on = top.indexOf(i) >= 0; g.box(115, 345 + i * 24, 150 * v, 16, { r: 4, fill: on ? g.C.amber : '#39457e' }); });
      for (i = 0; i < E2; i++) {
        var y = 190 + i * 60, on = top.indexOf(i) >= 0 && f > .25, x = 620;
        g.box(x, y, 200, 48, { r: 12, fill: on ? g.hexA(g.PAL[i % g.PAL.length], .3) : 'rgba(40,52,100,.6)', stroke: on ? g.PAL[i % g.PAL.length] : g.C.line, lw: on ? 3 : 1.5, glow: on ? g.PAL[i % g.PAL.length] : null });
        g.text('Expert ' + (i + 1), x + 100, y + 25, { size: 18, weight: 700, align: 'center', color: on ? g.C.ink : g.C.muted });
        if (on) { g.line(290, 420, x, y + 24, { color: g.PAL[i % g.PAL.length], lw: 3, p: g.seg(f, .25, .6), glow: g.PAL[i % g.PAL.length] }); g.line(x + 200, y + 24, 960, 420, { color: g.PAL[i % g.PAL.length], lw: 3, p: g.seg(f, .6, .9) }); }
      }
      g.circle(1000, 420, 38, { fill: 'rgba(52,211,153,.2)', stroke: g.C.green, lw: 3 }); g.text('Σ', 1000, 421, { size: 28, weight: 700, align: 'center', color: g.C.green }); g.text('weighted sum', 1000, 480, { size: 16, align: 'center', color: g.C.muted });
      g.text('Only 2 of 8 experts run per token: a large model at a fraction of the compute.', 640, 680, { size: 19, align: 'center', color: g.C.muted, alpha: g.seg(p, .5, .6) });
    }
  });

  /* ---------- CLIP: matching images and captions ---------- */
  M.kit('clip', {
    draw: function (g, p, P, S, t) {
      var caps = P.captions || ['a red car', 'a sleepy cat', 'a pink heart', 'a small house'], n = caps.length;
      g.heading(P.head || 'CLIP: images and text in one space', p, P.sub || 'illustrative similarities');
      var icon = function (i, x, y, s) { var c = g.ctx; c.save(); if (i === 0) { g.box(x - s * .4, y - s * .05, s * .8, s * .25, { r: 6, fill: '#e2554f' }); g.box(x - s * .2, y - s * .22, s * .4, s * .2, { r: 6, fill: '#e2554f' }); g.circle(x - s * .22, y + s * .22, s * .09, { fill: '#111' }); g.circle(x + s * .22, y + s * .22, s * .09, { fill: '#111' }); } if (i === 1) { g.circle(x, y, s * .32, { fill: '#fbbf24' }); g.path([[x - s * .3, y - s * .12], [x - s * .22, y - s * .42], [x - s * .05, y - s * .28]], { color: '#fbbf24', fill: '#fbbf24', lw: 1 }); g.path([[x + s * .3, y - s * .12], [x + s * .22, y - s * .42], [x + s * .05, y - s * .28]], { color: '#fbbf24', fill: '#fbbf24', lw: 1 }); g.line(x - s * .16, y - s * .02, x - s * .06, y - s * .02, { color: '#111', lw: 3 }); g.line(x + s * .06, y - s * .02, x + s * .16, y - s * .02, { color: '#111', lw: 3 }); } if (i === 2) { var pts = []; for (var k = 0; k <= 60; k++) { var th = k / 60 * Math.PI * 2; pts.push([x + s * .02 * 16 * Math.pow(Math.sin(th), 3), y - s * .02 * (13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th))]); } g.path(pts, { color: '#f472b6', fill: '#f472b6', lw: 1 }); } if (i === 3) { g.box(x - s * .28, y - s * .05, s * .56, s * .38, { r: 3, fill: '#e6cda0' }); g.path([[x - s * .36, y - s * .03], [x, y - s * .38], [x + s * .36, y - s * .03]], { color: '#c84040', fill: '#c84040', lw: 1 }); } c.restore(); };
      var cs = 104, x0 = 380, y0 = 220, tr = g.E.inOut(g.seg(p, .35, .85)), r = mk(5);
      caps.forEach(function (cp, j) { g.text(cp, x0 + j * cs + cs / 2, y0 - 26, { size: 16, align: 'center', weight: 600, color: g.C.cyan }); });
      for (var i = 0; i < n; i++) { icon(i, x0 - 70, y0 + i * cs + cs / 2, 80); for (var j = 0; j < n; j++) { var start = .2 + r() * .5, target = i === j ? .31 : .06 + r() * .06, v = g.lerp(start * .35, target, tr), a = g.seg(p, .05 + (i * n + j) * .012, .1 + (i * n + j) * .012); g.box(x0 + j * cs + 3, y0 + i * cs + 3, cs - 6, cs - 6, { r: 10, fill: i === j && tr > .5 ? g.hexA(g.C.green, .2 + v * 2) : g.hexA(g.C.violet, .1 + v * 1.6), alpha: a }); g.text(v.toFixed(2), x0 + j * cs + cs / 2, y0 + i * cs + cs / 2, { size: 17, mono: true, align: 'center', alpha: a }); } }
      g.panel(830, 220, 360, 330, { alpha: g.seg(p, .3, .4) });
      g.text(tr < .5 ? 'Before training: similarities are random' : 'After contrastive training: matching pairs (diagonal) score highest', 855, 260, { size: 19, weight: 700, maxW: 310, lh: 26, alpha: g.seg(p, .3, .4) });
      g.text('Pull matching image–text pairs together, push mismatched pairs apart.', 855, 400, { size: 18, color: g.C.muted, maxW: 310, lh: 25, alpha: g.seg(p, .5, .6) });
    }
  });
})(window.Motion);
