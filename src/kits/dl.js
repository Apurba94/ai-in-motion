/* AI in Motion — deep learning kits. © Janin A Apurba, CSE, AUST */
(function (M) {
  'use strict';
  var mk = function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  var sig = function (z) { return 1 / (1 + Math.exp(-z)); };
  var ACTS = {
    step: [function (x) { return x >= 0 ? 1 : 0; }, 'Step'], sigmoid: [sig, 'Sigmoid'], tanh: [Math.tanh, 'Tanh'],
    relu: [function (x) { return Math.max(0, x); }, 'ReLU'], leaky: [function (x) { return x > 0 ? x : .1 * x; }, 'Leaky ReLU'],
    gelu: [function (x) { return .5 * x * (1 + Math.tanh(.7978845608 * (x + .044715 * x * x * x))); }, 'GELU']
  };

  /* ---------- a single artificial neuron ---------- */
  M.kit('neuron', {
    draw: function (g, p, P, S, t) {
      var xs = P.x || [.8, .3, .5], ws = P.w || [1.2, -.7, .9], b = P.b == null ? -.4 : P.b, act = P.act || 'sigmoid', f = ACTS[act][0];
      var z = b; xs.forEach(function (x, i) { z += x * ws[i]; }); var out = f(z);
      g.heading(P.head || 'Inside a single neuron', p, P.sub);
      var nx = 640, ny = 400, ph = g.seg(p, .05, .95);
      xs.forEach(function (x, i) {
        var y = 250 + i * 150, a = g.E.out(g.seg(ph, i * .05, .1 + i * .05)), pa = g.seg(ph, .15 + i * .1, .28 + i * .1);
        g.circle(170, y, 38, { fill: 'rgba(34,211,238,.15)', stroke: g.C.cyan, lw: 3, alpha: a }); g.text('x' + (i + 1), 170, y - 58, { size: 18, color: g.C.muted, align: 'center', alpha: a }); g.text(x.toFixed(1), 170, y + 1, { size: 24, weight: 700, mono: true, align: 'center', alpha: a });
        g.line(208, y, nx - 70, ny, { color: ws[i] >= 0 ? g.C.green : g.C.red, lw: 2 + Math.abs(ws[i]) * 4, alpha: a * .8 });
        var mx = g.lerp(208, nx - 70, .45), my = g.lerp(y, ny, .45) - 26;
        g.text('w=' + ws[i].toFixed(1), mx, my, { size: 17, mono: true, color: ws[i] >= 0 ? g.C.green : g.C.red, align: 'center', alpha: a });
        if (pa > 0) { var px = g.lerp(208, nx - 70, pa), py = g.lerp(y, ny, pa); g.circle(px, py, 8, { fill: g.C.amber, glow: g.C.amber, alpha: pa < 1 ? 1 : 0 }); g.text(x.toFixed(1) + ' × ' + ws[i].toFixed(1) + ' = ' + (x * ws[i]).toFixed(2), 330, y + 44, { size: 18, mono: true, color: g.C.amber, alpha: g.seg(pa, .6, 1) }); }
      });
      var sa = g.seg(ph, .45, .55);
      g.circle(nx, ny, 70, { fill: 'rgba(167,139,250,.18)', stroke: g.C.violet, lw: 4, glow: sa > 0 ? g.C.violet : null });
      g.text('Σ', nx, ny - 24, { size: 36, weight: 700, align: 'center', color: g.C.violet });
      g.text('z = ' + (sa > 0 ? z.toFixed(2) : '…'), nx, ny + 22, { size: 22, weight: 700, mono: true, align: 'center', alpha: .4 + .6 * sa });
      g.text('+ bias ' + b.toFixed(1), nx, ny + 104, { size: 18, mono: true, align: 'center', color: g.C.muted });
      var aa = g.seg(ph, .58, .72), gx = 790, gy = 290, gw = 220, gh = 200;
      g.arrow(nx + 70, ny, gx - 10, ny, { color: g.C.violet, lw: 3, p: aa });
      g.panel(gx, gy, gw, gh, { alpha: aa }); g.text(ACTS[act][1], gx + gw / 2, gy + 24, { size: 17, weight: 700, align: 'center', color: g.C.pink, alpha: aa });
      var pts = []; for (var x = -4; x <= 4; x += .1) pts.push([gx + 20 + (x + 4) / 8 * (gw - 40), gy + gh - 24 - Math.max(-1, Math.min(1.2, f(x))) / 1.2 * (gh - 70)]);
      g.path(pts, { color: g.C.pink, lw: 3, alpha: aa });
      var dx = gx + 20 + (Math.max(-4, Math.min(4, z)) + 4) / 8 * (gw - 40), dy = gy + gh - 24 - Math.min(1.2, out) / 1.2 * (gh - 70);
      g.circle(dx, dy, 7, { fill: g.C.amber, glow: g.C.amber, alpha: g.seg(ph, .7, .78) });
      var oa = g.seg(ph, .78, .9); g.arrow(gx + gw + 6, ny, 1100, ny, { color: g.C.pink, lw: 3, p: oa });
      g.circle(1150, ny, 46, { fill: 'rgba(244,114,182,.18)', stroke: g.C.pink, lw: 3, alpha: oa }); g.text(out.toFixed(2), 1150, ny + 1, { size: 24, weight: 700, mono: true, align: 'center', alpha: oa }); g.text('output', 1150, ny - 64, { size: 17, color: g.C.muted, align: 'center', alpha: oa });
    }
  });

  /* ---------- a network with signals flowing forward or backward ---------- */
  M.kit('network', {
    init: function (P) { var L = P.layers || [4, 6, 6, 3], r = mk(3), wts = []; for (var l = 0; l < L.length - 1; l++) { var m = []; for (var i = 0; i < L[l]; i++) { var row = []; for (var j = 0; j < L[l + 1]; j++) row.push(r() * 2 - 1); m.push(row); } wts.push(m); } var acts = L.map(function (n) { var a = []; for (var i = 0; i < n; i++) a.push(r()); return a; }); return { L: L, wts: wts, acts: acts }; },
    draw: function (g, p, P, S, t) {
      var L = S.L, n = L.length, mode = P.mode || 'forward';
      g.heading(P.head || (mode === 'backward' ? 'Backpropagation: errors flow backwards' : 'A forward pass through a network'), p, P.sub);
      var pos = L.map(function (m, l) { var a = []; for (var i = 0; i < m; i++) a.push([170 + l * (760 / (n - 1)), 420 + (i - (m - 1) / 2) * Math.min(76, 400 / m)]); return a; });
      var fw = mode === 'backward' ? 0 : g.seg(p, .08, mode === 'both' ? .5 : .85) * (n - 1), bw = mode === 'forward' ? 0 : g.seg(p, mode === 'both' ? .55 : .08, .92) * (n - 1);
      for (var l = 0; l < n - 1; l++) pos[l].forEach(function (a, i) { pos[l + 1].forEach(function (b, j) {
        var w = S.wts[l][i][j], on = fw >= l + .02, bon = bw >= (n - 2 - l) + .02;
        g.line(a[0], a[1], b[0], b[1], { color: bon ? g.hexA(g.C.red, .5) : on ? (w > 0 ? g.hexA(g.C.cyan, .45) : g.hexA(g.C.pink, .4)) : 'rgba(80,95,160,.28)', lw: .8 + Math.abs(w) * 2.2 });
        if (fw > l && fw < l + 1) { var f = fw - l; g.circle(g.lerp(a[0], b[0], f), g.lerp(a[1], b[1], f), 3, { fill: g.C.cyan, glow: g.C.cyan, alpha: .8 }); }
        var bl = (n - 2 - l); if (bw > bl && bw < bl + 1) { var f2 = bw - bl; g.circle(g.lerp(b[0], a[0], f2), g.lerp(b[1], a[1], f2), 3, { fill: g.C.red, glow: g.C.red, alpha: .8 }); }
      }); });
      pos.forEach(function (lay, l) { lay.forEach(function (q, i) { var on = fw >= l - .02 || mode === 'backward', act = S.acts[l][i], bon = bw >= (n - 1 - l) - .02 && mode !== 'forward';
        g.circle(q[0], q[1], 19, { fill: on ? g.mix('#1a2250', l === n - 1 ? '#f472b6' : '#22d3ee', .25 + act * .75) : '#1a2250', stroke: bon ? g.C.red : g.C.line, lw: bon ? 3 : 2, glow: on && act > .7 ? g.C.cyan : null }); }); });
      var labels = ['Input'].concat(L.slice(1, -1).map(function (_, i) { return 'Hidden ' + (i + 1); })).concat(['Output']);
      labels.forEach(function (s, l) { g.text(s, pos[l][0][0], 690, { size: 17, color: g.C.muted, align: 'center' }); });
      if (P.out && mode !== 'backward') { var oa = g.seg(fw, n - 1.2, n - 1), probs = P.probs || [.81, .14, .05]; P.out.forEach(function (o, i) { var q = pos[n - 1][i]; if (!q) return; g.text(o, q[0] + 34, q[1] - 10, { size: 18, weight: 700, alpha: oa }); g.box(q[0] + 34, q[1] + 4, 150 * probs[i] * oa, 12, { r: 6, fill: g.C.pink }); g.text(Math.round(probs[i] * 100) + '%', q[0] + 44 + 150 * probs[i], q[1] + 10, { size: 15, mono: true, color: g.C.muted, alpha: oa }); }); }
      if (mode !== 'forward') g.text('Each weight gets a gradient: how much the loss changes if it changes.', 640, 150, { size: 20, color: g.C.red, align: 'center', alpha: g.seg(p, .5, .6) });
    }
  });

  /* ---------- activation functions ---------- */
  M.kit('activation', {
    draw: function (g, p, P, S, t) {
      var names = P.fns || ['sigmoid', 'tanh', 'relu', 'leaky'], n = names.length, k = Math.min(n - 1, Math.floor(g.seg(p, .05, .95) * n)), f = g.seg(p, .05, .95) * n - k;
      g.heading(P.head || 'Activation functions', p, ACTS[names[k]][1]);
      var X = function (x) { return 110 + (x + 4) / 8 * 700; }, Y = function (y) { return 420 - y * 115; };
      g.line(110, Y(0), 810, Y(0), { color: '#4a5690', lw: 2 }); g.line(X(0), 170, X(0), 660, { color: '#4a5690', lw: 2 });
      [-1, 1, 2].forEach(function (v) { g.text(String(v), X(0) - 12, Y(v), { size: 15, color: g.C.muted, align: 'right' }); g.line(X(0) - 5, Y(v), X(0) + 5, Y(v), { color: '#4a5690' }); });
      names.forEach(function (nm, i) {
        if (i > k) return; var fn = ACTS[nm][0], pts = []; for (var x = -4; x <= 4.001; x += .04) pts.push([X(x), Y(Math.max(-2, Math.min(2.2, fn(x))))]);
        var c = g.PAL[i % g.PAL.length]; g.path(pts, { color: c, lw: i === k ? 5 : 2.5, alpha: i === k ? 1 : .35, glow: i === k ? c : null, p: i === k ? g.E.out(g.clamp(f * 2.2)) : 1 });
        g.box(850, 200 + i * 50, 18, 18, { r: 5, fill: c }); g.text(ACTS[nm][1], 880, 209 + i * 50, { size: 20, weight: i === k ? 700 : 500, color: i === k ? g.C.ink : g.C.muted });
      });
      var fn2 = ACTS[names[k]][0], px = -4 + 8 * g.clamp((f - .45) / .55), py = fn2(px);
      if (f > .45) { g.circle(X(px), Y(Math.max(-2, Math.min(2.2, py))), 9, { fill: g.C.white, glow: g.C.white }); g.text('f(' + px.toFixed(1) + ') = ' + py.toFixed(2), 850, 470, { size: 24, weight: 700, mono: true, color: g.C.amber }); }
      if (P.notes && P.notes[k]) g.text(P.notes[k], 850, 540, { size: 19, maxW: 380, lh: 25, color: g.C.ink, alpha: g.seg(f, .2, .4) });
    }
  });

  /* ---------- backpropagation on a tiny computational graph: f = (x + y) · z ---------- */
  M.kit('backprop-graph', {
    draw: function (g, p, P, S, t) {
      var x = -2, y = 5, z = -4, q = x + y, f = q * z;
      g.heading(P.head || 'Backpropagation on a tiny graph', p, 'f = (x + y) · z');
      var N = { x: [180, 280], y: [180, 440], z: [180, 600], q: [560, 360], f: [940, 460] }, fwd = g.seg(p, .08, .45), bwd = g.seg(p, .5, .92);
      var edge = function (a, b, on, back) { g.line(N[a][0] + 44, N[a][1], N[b][0] - 50, N[b][1], { color: back ? g.C.red : on ? g.C.green : g.C.line, lw: 3 }); };
      edge('x', 'q', fwd > .1, bwd > .7); edge('y', 'q', fwd > .1, bwd > .7); edge('q', 'f', fwd > .5, bwd > .3); edge('z', 'f', fwd > .5, bwd > .3);
      var node = function (k, label, val, grad, showV, showG, op) {
        var c = N[k]; g.circle(c[0], c[1], op ? 50 : 44, { fill: op ? 'rgba(167,139,250,.2)' : 'rgba(34,211,238,.14)', stroke: op ? g.C.violet : g.C.cyan, lw: 3 });
        g.text(label, c[0], c[1] + 1, { size: op ? 34 : 26, weight: 700, align: 'center', head: true });
        if (showV) g.text(k + ' = ' + val, c[0], c[1] - (op ? 76 : 68), { size: 21, weight: 700, mono: true, color: g.C.green, align: 'center', alpha: showV });
        if (showG) g.text('∂f/∂' + k + ' = ' + grad, c[0], c[1] + (op ? 80 : 72), { size: 21, weight: 700, mono: true, color: g.C.red, align: 'center', alpha: showG });
      };
      node('x', 'x', x, -4, g.seg(fwd, 0, .15), g.seg(bwd, .7, .85)); node('y', 'y', y, -4, g.seg(fwd, 0, .15), g.seg(bwd, .75, .9)); node('z', 'z', z, q, g.seg(fwd, 0, .15), g.seg(bwd, .35, .5));
      node('q', '+', q, z, g.seg(fwd, .3, .45), g.seg(bwd, .3, .45), true); node('f', '×', f, 1, g.seg(fwd, .7, .9), g.seg(bwd, 0, .15), true);
      g.panel(760, 150, 450, 130, { alpha: g.seg(p, .5, .56) });
      var rule = bwd < .3 ? 'Start at the output: ∂f/∂f = 1' : bwd < .7 ? 'Multiply node: ∂f/∂z = q = 3,  ∂f/∂q = z = −4' : 'Add node passes the gradient through: ∂f/∂x = ∂f/∂y = −4';
      g.text(p < .5 ? 'Forward pass: compute values left → right' : rule, 985, 215, { size: 20, align: 'center', maxW: 410, vcenter: true, lh: 26, alpha: p < .5 ? g.seg(p, .1, .16) : 1 });
    }
  });

  /* ---------- vanishing gradients and skip connections ---------- */
  M.kit('gradient-flow', {
    draw: function (g, p, P, S, t) {
      var n = 8; g.heading(P.head || 'Vanishing gradients — and the fix', p, P.sub);
      var rows = [['Plain deep network (sigmoid)', function (k) { return Math.pow(.25, k); }, g.C.red, 250], ['With skip connections (ResNet)', function (k) { return Math.pow(.93, k); }, g.C.green, 490]];
      var sweep = g.seg(p, .1, .8) * n;
      rows.forEach(function (row, ri) {
        if (ri === 1 && p < .45 && !P.both) return;
        var y = row[3], a = ri === 1 ? g.seg(p, .45, .5) : 1;
        g.text(row[0], 110, y - 70, { size: 21, weight: 700, color: row[2], alpha: a });
        for (var i = 0; i < n; i++) {
          var x = 130 + i * 128, k = n - 1 - i, mag = row[1](k), shown = sweep >= k;
          g.box(x, y - 30, 88, 60, { r: 12, fill: 'rgba(40,52,100,.8)', stroke: g.C.line, alpha: a }); g.text('L' + (i + 1), x + 44, y + 1, { size: 18, weight: 700, align: 'center', alpha: a });
          if (i < n - 1) g.arrow(x + 90, y, x + 126, y, { color: g.C.line, lw: 2, head: 7, alpha: a });
          if (ri === 1 && i < n - 2) { g.ctx.save(); g.ctx.globalAlpha *= a * .8; g.ctx.strokeStyle = g.C.green; g.ctx.lineWidth = 2; g.ctx.setLineDash([6, 5]); g.ctx.beginPath(); g.ctx.moveTo(x + 44, y - 32); g.ctx.quadraticCurveTo(x + 172, y - 90, x + 300, y - 32); g.ctx.stroke(); g.ctx.restore(); }
          if (shown) { var hgt = Math.max(2, mag * 90); g.box(x + 24, y + 44, 40, hgt, { r: 5, fill: row[2], glow: row[2], blur: 8, alpha: a }); g.text(mag < .001 ? mag.toExponential(0) : mag.toFixed(3), x + 44, y + 58 + hgt + 10, { size: 14, mono: true, color: g.C.muted, align: 'center', alpha: a }); }
        }
      });
      g.text('gradient size reaching each layer (flowing backward ←)', 640, 694, { size: 18, color: g.C.muted, align: 'center', alpha: g.seg(p, .1, .2) });
    }
  });

  /* ---------- dropout ---------- */
  M.kit('dropout', {
    draw: function (g, p, P, S, t) {
      var L = [4, 7, 7, 2], n = L.length, test = p > .78;
      g.heading(P.head || 'Dropout: randomly switching neurons off', p, test ? 'At test time: every neuron is used' : 'During training: a new random half is dropped each step');
      var step = Math.floor(g.seg(p, .05, .78) * 8), r = mk(step * 13 + 7), off = {};
      if (!test) for (var l = 1; l < n - 1; l++) for (var i = 0; i < L[l]; i++) if (r() < .5) off[l + ',' + i] = 1;
      var pos = L.map(function (m, l) { var a = []; for (var i = 0; i < m; i++) a.push([230 + l * 270, 420 + (i - (m - 1) / 2) * 62]); return a; });
      for (l = 0; l < n - 1; l++) pos[l].forEach(function (a, i) { pos[l + 1].forEach(function (b, j) { var dead = off[l + ',' + i] || off[(l + 1) + ',' + j]; g.line(a[0], a[1], b[0], b[1], { color: dead ? 'rgba(80,95,160,.12)' : g.hexA(g.C.cyan, .35), lw: 1.5 }); }); });
      pos.forEach(function (lay, l) { lay.forEach(function (q, i) { var dead = off[l + ',' + i]; g.circle(q[0], q[1], 20, { fill: dead ? '#1a2040' : g.hexA(g.C.cyan, .35), stroke: dead ? '#39406a' : g.C.cyan, lw: 2 }); if (dead) g.text('×', q[0], q[1] + 1, { size: 26, weight: 700, color: g.C.red, align: 'center' }); }); });
      g.text(test ? 'All neurons on' : 'Training step ' + (step + 1), 1080, 200, { size: 24, weight: 700, mono: true, align: 'center', color: test ? g.C.green : g.C.amber });
      g.text(test ? 'Outputs are scaled so the expected signal matches training.' : 'No neuron can rely on any single partner — the network learns robust features.', 1080, 600, { size: 18, align: 'center', maxW: 300, lh: 24, color: g.C.muted });
    }
  });

  /* ---------- recurrent network unrolled through time (optionally LSTM) ---------- */
  M.kit('rnn', {
    draw: function (g, p, P, S, t) {
      var words = P.words || ['I', 'love', 'deep', 'learning', '!'], n = words.length, lstm = !!P.lstm;
      g.heading(P.head || (lstm ? 'LSTM: gated memory' : 'A recurrent network unrolled in time'), p, P.sub);
      var prog = g.seg(p, .08, .9) * n, sp = 1000 / n;
      words.forEach(function (w, i) {
        var x = 140 + i * sp + sp / 2 - 70, on = prog >= i, a = on ? 1 : .35, cy = 400;
        g.box(x, cy - 55, 140, 110, { r: 18, fill: on ? 'rgba(167,139,250,.2)' : 'rgba(40,52,100,.6)', stroke: on ? g.C.violet : g.C.line, lw: 2.5, glow: on && prog < i + 1 ? g.C.violet : null });
        g.text(lstm ? 'LSTM' : 'RNN', x + 70, cy + 1, { size: 20, weight: 700, head: true, align: 'center', alpha: a });
        g.pill(x + 70, cy + 150, w, { fill: on ? g.C.cyan : '#34407a', align: 'center', size: 19, color: on ? g.C.bg : g.C.ink });
        g.arrow(x + 70, cy + 128, x + 70, cy + 60, { color: on ? g.C.cyan : g.C.line, lw: 2.5, head: 9 });
        g.arrow(x + 70, cy - 58, x + 70, cy - 118, { color: on ? g.C.pink : g.C.line, lw: 2.5, head: 9 }); g.text('h' + (i + 1), x + 70, cy - 138, { size: 18, mono: true, align: 'center', color: on ? g.C.pink : g.C.muted });
        if (i < n - 1) { var hx1 = x + 142, hx2 = x + sp - 2; g.arrow(hx1, cy, hx2, cy, { color: prog > i + .5 ? g.C.amber : g.C.line, lw: 3, head: 10 }); if (prog > i + .3 && prog < i + 1) g.circle(g.lerp(hx1, hx2, (prog - i - .3) / .7), cy, 7, { fill: g.C.amber, glow: g.C.amber }); }
        if (lstm && on) { var gp = g.pulse(t + i, 3); ['f', 'i', 'o'].forEach(function (gt, j) { g.circle(x + 30 + j * 40, cy + 34, 12, { fill: g.hexA([g.C.red, g.C.green, g.C.blue][j], .3 + .5 * gp), stroke: [g.C.red, g.C.green, g.C.blue][j], lw: 1.5 }); g.text(gt, x + 30 + j * 40, cy + 35, { size: 13, weight: 800, align: 'center' }); }); }
      });
      if (lstm) { g.line(140, 322, 140 + (n - .2) * sp, 322, { color: g.C.green, lw: 5, glow: g.C.green, p: g.seg(p, .08, .9) }); g.text('cell state: the long-term memory highway', 150, 300, { size: 17, color: g.C.green }); g.text('f = forget  ·  i = input  ·  o = output gates', 640, 670, { size: 19, color: g.C.muted, align: 'center' }); }
      else g.text('The hidden state h carries memory from one word to the next.', 640, 670, { size: 20, color: g.C.muted, align: 'center', alpha: g.seg(p, .3, .4) });
    }
  });

  /* ---------- autoencoder: compress and reconstruct ---------- */
  M.kit('autoencoder', {
    init: function (P, g) {
      var N = 14, face = function (x, y) { var u = (x - 6.5) / 6, v = (y - 6.5) / 6, d = Math.hypot(u, v); if (d > 1) return 0; if (Math.hypot(u + .38, v + .3) < .16 || Math.hypot(u - .38, v + .3) < .16) return .1; if (v > .2 && v < .55 && Math.abs(u) < .55 && d > .45) return .1; return .95; };
      var r = g.rng(5), clean = [], noisy = [], recon = [];
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) { var c = face(x, y); clean.push(c); noisy.push(Math.max(0, Math.min(1, c + (r() - .5) * .9))); }
      for (y = 0; y < N; y++) for (x = 0; x < N; x++) { var s = 0, k = 0; for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { var xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < N && yy < N) { s += clean[yy * N + xx] * (dx || dy ? .5 : 2); k += dx || dy ? .5 : 2; } } recon.push(s / k); }
      var toC = function (arr) { return g.pixels(N, N, function (x, y) { var v = arr[y * N + x]; return [Math.round(40 + v * 211), Math.round(40 + v * 180), Math.round(80 + v * 60)]; }); };
      return { inp: toC(P.denoise ? noisy : clean), out: toC(recon) };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || (P.denoise ? 'A denoising autoencoder' : 'Autoencoder: compress, then reconstruct'), p, P.sub);
      var ph = g.seg(p, .06, .95), y = 420;
      g.img(S.inp, 90, y - 110, 220, 220, { alpha: g.seg(ph, 0, .1) }); g.text(P.denoise ? 'noisy input' : 'input · 196 pixels', 200, y + 140, { size: 18, color: g.C.muted, align: 'center' });
      var enc = g.seg(ph, .12, .38);
      g.path([[350, y - 130], [560, y - 50], [560, y + 50], [350, y + 130]], { color: g.C.cyan, lw: 3, fill: 'rgba(34,211,238,.12)', p: enc }); g.text('Encoder', 455, y + 170, { size: 20, weight: 700, color: g.C.cyan, align: 'center', alpha: enc });
      var lat = g.seg(ph, .38, .55), vals = [.72, .18, .9, .41];
      vals.forEach(function (v, i) { g.box(600, y - 80 + i * 42, 80, 32, { r: 8, fill: g.hexA(g.C.amber, .2 + v * .6), stroke: g.C.amber, alpha: lat }); g.text(v.toFixed(2), 640, y - 63 + i * 42, { size: 16, mono: true, align: 'center', alpha: lat }); });
      g.text('latent code · 4 numbers', 640, y + 140, { size: 18, color: g.C.amber, align: 'center', alpha: lat });
      var dec = g.seg(ph, .55, .8);
      g.path([[720, y - 50], [930, y - 130], [930, y + 130], [720, y + 50]], { color: g.C.pink, lw: 3, fill: 'rgba(244,114,182,.12)', p: dec }); g.text('Decoder', 825, y + 170, { size: 20, weight: 700, color: g.C.pink, align: 'center', alpha: dec });
      g.img(S.out, 970, y - 110, 220, 220, { alpha: g.seg(ph, .8, .9) }); g.text(P.denoise ? 'clean reconstruction' : 'reconstruction', 1080, y + 140, { size: 18, color: g.C.muted, align: 'center', alpha: g.seg(ph, .8, .9) });
      g.text('Trained to make the output match the ' + (P.denoise ? 'clean original' : 'input') + ' — the bottleneck forces it to keep only what matters.', 640, 670, { size: 19, align: 'center', color: g.C.ink, alpha: g.seg(ph, .85, .95), maxW: 1100 });
    }
  });

  /* ---------- GAN: generator vs discriminator ---------- */
  M.kit('gan', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'GANs: a forger versus a detective', p, P.sub);
      var ph = g.seg(p, .08, .95), round = Math.floor(ph * 30), m = g.lerp(2.2, 6, g.E.inOut(ph)), sd = g.lerp(.45, 1, g.E.inOut(ph));
      var X = function (x) { return 110 + x / 10 * 700; }, Y = function (v) { return 640 - v * 330; }, nrm = function (x, mu, s) { return Math.exp(-.5 * Math.pow((x - mu) / s, 2)); };
      g.axes(110, 290, 700, 350, { xl: 'data space', alpha: 1 });
      var real = [], fake = [], disc = []; for (var x = 0; x <= 10; x += .05) { real.push([X(x), Y(nrm(x, 6, 1) * .9)]); fake.push([X(x), Y(nrm(x, m, sd) * .9)]); var pr = nrm(x, 6, 1), pf = nrm(x, m, sd) * (1 / sd) * .9; disc.push([X(x), Y(pr / (pr + pf + 1e-6) * .9)]); }
      g.path(real, { color: g.C.green, lw: 4, glow: g.C.green }); g.path(fake, { color: g.C.pink, lw: 4, glow: g.C.pink }); g.path(disc, { color: g.C.amber, lw: 2.5, dash: [8, 6] });
      [['real data', g.C.green], ['generator’s fakes', g.C.pink], ['discriminator: P(real)', g.C.amber]].forEach(function (l, i) { g.line(870, 330 + i * 40, 910, 330 + i * 40, { color: l[1], lw: 4, dash: i === 2 ? [8, 6] : null }); g.text(l[0], 924, 330 + i * 40, { size: 19 }); });
      g.panel(860, 480, 350, 150); g.text('Training round ' + round, 885, 520, { size: 22, weight: 700, mono: true, color: g.C.cyan });
      g.text(ph < .85 ? 'Generator learns to fool; discriminator learns to catch.' : 'Equilibrium: fakes match reality, D(x) ≈ 0.5.', 885, 575, { size: 18, maxW: 310, lh: 24 });
      g.box(110, 170, 250, 80, { r: 16, fill: 'rgba(244,114,182,.15)', stroke: g.C.pink }); g.text('Generator', 235, 200, { size: 22, weight: 700, color: g.C.pink, align: 'center' }); g.text('noise → fake sample', 235, 228, { size: 16, color: g.C.muted, align: 'center' });
      g.box(460, 170, 280, 80, { r: 16, fill: 'rgba(251,191,36,.12)', stroke: g.C.amber }); g.text('Discriminator', 600, 200, { size: 22, weight: 700, color: g.C.amber, align: 'center' }); g.text('real or fake?', 600, 228, { size: 16, color: g.C.muted, align: 'center' });
      g.arrow(362, 210, 456, 210, { color: g.C.muted, lw: 3 });
    }
  });

  /* ---------- the training loop ---------- */
  M.kit('train-loop', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'The training loop', p, P.sub);
      var steps = ['Mini-batch', 'Forward pass', 'Compute loss', 'Backward pass', 'Update weights'], cx = 330, cy = 420, R = 180, spin = g.seg(p, .08, .95) * 6 * steps.length, k = Math.floor(spin) % steps.length;
      g.circle(cx, cy, R, { stroke: g.C.line, lw: 2, dash: [6, 8] });
      steps.forEach(function (s, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / steps.length, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), on = i === k, c = g.PAL[i]; g.circle(x, y, on ? 58 : 50, { fill: on ? g.hexA(c, .35) : 'rgba(30,40,80,.9)', stroke: on ? c : g.C.line, lw: on ? 3 : 2, glow: on ? c : null }); g.text(s, x, y, { size: 16, weight: 700, align: 'center', maxW: 90, vcenter: true, lh: 19, color: on ? g.C.ink : g.C.muted }); });
      var iter = Math.floor(spin / steps.length * 50); g.text('step ' + iter, cx, cy, { size: 26, weight: 700, mono: true, align: 'center', color: g.C.cyan });
      var r = mk(1), pts = [], lx = 640, ly = 190, lw = 560, lh = 420; for (var i = 0; i <= iter; i++) { var v = .15 + 1.9 * Math.exp(-i / 70) + (r() - .5) * .18 * Math.exp(-i / 200); pts.push([lx + i / 300 * lw, ly + lh - v / 2.2 * lh]); }
      g.axes(lx, ly, lw, lh, { xl: 'training step', yl: 'loss' }); g.path(pts, { color: g.C.pink, lw: 3, glow: g.C.pink });
    }
  });

  /* ---------- transfer learning: frozen layers and a new head ---------- */
  M.kit('transfer', {
    draw: function (g, p, P, S, t) {
      var fine = P.mode === 'finetune';
      g.heading(P.head || 'Transfer learning', p, fine ? 'Fine-tuning: unfreeze the last layers too' : 'Reuse a network trained on millions of images');
      var blocks = ['edges', 'textures', 'parts', 'objects'], ph = g.seg(p, .06, .95);
      blocks.forEach(function (b, i) {
        var x = 110 + i * 190, a = g.E.out(g.seg(ph, i * .06, .1 + i * .06)), unl = fine && i === 3 && ph > .5, h = 300 - i * 40;
        g.box(x, 420 - h / 2, 150, h, { r: 16, fill: unl ? 'rgba(251,146,60,.2)' : 'rgba(96,165,250,.16)', stroke: unl ? g.C.orange : g.C.blue, lw: 2.5, alpha: a });
        g.text(b, x + 75, 420, { size: 20, weight: 700, align: 'center', alpha: a }); g.text(unl ? '🔓 trainable' : '🔒 frozen', x + 75, 420 + h / 2 - 24, { size: 16, align: 'center', color: unl ? g.C.orange : g.C.blue, alpha: a });
        if (i < 3) g.arrow(x + 152, 420, x + 188, 420, { color: g.C.line, lw: 2.5, head: 8, alpha: a });
      });
      g.text('pretrained on ImageNet (1.2M+ images)', 440, 230, { size: 18, color: g.C.blue, align: 'center', alpha: g.seg(ph, .2, .3) });
      var ha = g.E.back(g.seg(ph, .35, .5)); g.arrow(872, 420, 918, 420, { color: g.C.orange, lw: 3, alpha: ha });
      g.box(930, 330, 220, 180, { r: 18, fill: 'rgba(251,146,60,.2)', stroke: g.C.orange, lw: 3, glow: g.C.orange, alpha: ha });
      g.text('New head', 1040, 390, { size: 24, weight: 700, align: 'center', color: g.C.orange, alpha: ha }); g.text(P.task || 'your 3 classes', 1040, 426, { size: 18, align: 'center', alpha: ha }); g.text('trainable', 1040, 470, { size: 16, color: g.C.orange, align: 'center', alpha: ha });
      g.text('Only a few hundred labelled images of your own are often enough.', 640, 660, { size: 21, align: 'center', color: g.C.ink, alpha: g.seg(ph, .6, .7) });
    }
  });
})(window.Motion);
