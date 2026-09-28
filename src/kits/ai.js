/* AI in Motion — AI kits (search, agents, games, optimisation, probability, language, generation). © Janin A Apurba, CSE, AUST */
(function (M) {
  'use strict';
  var ACC = function (P, g) { return P.accent || g.C.cyan; };

  /* ---------- grid search: BFS, DFS, A*, greedy ---------- */
  M.kit('grid-search', {
    init: function (P) {
      var cols = 22, rows = 12, walls = {};
      var wall = function (c, r) { walls[c + ',' + r] = 1; };
      for (var r = 0; r < 9; r++) wall(6, r); for (r = 3; r < 12; r++) wall(11, r); for (r = 0; r < 8; r++) wall(16, r);
      [[2, 3], [3, 3], [8, 9], [9, 9], [13, 2], [14, 2], [18, 9], [19, 9], [20, 9]].forEach(function (w) { wall(w[0], w[1]); });
      var start = [2, 6], goal = [19, 4], key = function (c) { return c[0] + ',' + c[1]; }, h = function (c) { return Math.abs(c[0] - goal[0]) + Math.abs(c[1] - goal[1]); };
      var algo = P.algo || 'bfs', disc = {}, exp = {}, prev = {}, gco = {}, open = [start], step = 0, order = [];
      disc[key(start)] = 0; gco[key(start)] = 0;
      while (open.length) {
        var cur;
        if (algo === 'dfs') cur = open.pop();
        else { if (algo === 'astar') open.sort(function (a, b) { return (gco[key(a)] + h(a)) - (gco[key(b)] + h(b)) || h(a) - h(b); }); if (algo === 'greedy') open.sort(function (a, b) { return h(a) - h(b); }); cur = open.shift(); }
        var kc = key(cur); if (exp[kc] != null) continue;
        exp[kc] = ++step; order.push(cur);
        if (kc === key(goal)) break;
        var nb = [[1, 0], [0, 1], [-1, 0], [0, -1]]; if (algo === 'dfs') nb = [[0, -1], [-1, 0], [0, 1], [1, 0]];
        nb.forEach(function (d) {
          var n = [cur[0] + d[0], cur[1] + d[1]], kn = key(n);
          if (n[0] < 0 || n[1] < 0 || n[0] >= cols || n[1] >= rows || walls[kn] || exp[kn] != null) return;
          if (algo === 'dfs') { prev[kn] = kc; disc[kn] = step; open.push(n); return; }
          if (disc[kn] != null && gco[kn] <= gco[kc] + 1) return;
          disc[kn] = step; prev[kn] = kc; gco[kn] = gco[kc] + 1; open.push(n);
        });
      }
      var path = [], k = key(goal); while (k) { path.unshift(k.split(',').map(Number)); k = prev[k]; }
      return { cols: cols, rows: rows, walls: walls, start: start, goal: goal, disc: disc, exp: exp, total: step, path: path, h: h, gco: gco, order: order };
    },
    draw: function (g, p, P, S, t) {
      var cs = 44, x0 = 156, y0 = 172, names = { bfs: 'Breadth-first search', dfs: 'Depth-first search', astar: 'A* search', greedy: 'Greedy best-first search' };
      g.heading(P.head || names[P.algo || 'bfs'], p, P.sub);
      var k = Math.floor(g.seg(p, .06, .8) * S.total), done = p > .8, A = ACC(P, g);
      for (var r = 0; r < S.rows; r++) for (var c = 0; c < S.cols; c++) {
        var kc = c + ',' + r, x = x0 + c * cs, y = y0 + r * cs;
        if (S.walls[kc]) { g.box(x + 2, y + 2, cs - 4, cs - 4, { r: 6, fill: '#39457e' }); continue; }
        var e = S.exp[kc], d = S.disc[kc], fill = 'rgba(40,52,100,.55)';
        if (e != null && e <= k) fill = g.hexA(A, .18 + .5 * (1 - e / S.total));
        else if (d != null && d <= k) fill = g.hexA(g.C.amber, .55);
        g.box(x + 2, y + 2, cs - 4, cs - 4, { r: 6, fill: fill });
      }
      if (!done && k > 0) { var cur = S.order[k - 1]; g.box(x0 + cur[0] * cs, y0 + cur[1] * cs, cs, cs, { r: 8, stroke: g.C.white, lw: 3, glow: g.C.white });
        if (P.algo === 'astar') { var gg = S.gco[cur[0] + ',' + cur[1]], hh = S.h(cur); g.text('f = g + h = ' + gg + ' + ' + hh + ' = ' + (gg + hh), 1124, 136, { size: 20, mono: true, color: g.C.amber, align: 'right' }); } }
      if (done) g.path(S.path.map(function (q) { return [x0 + q[0] * cs + cs / 2, y0 + q[1] * cs + cs / 2]; }), { color: g.C.pink, lw: 6, glow: g.C.pink, p: g.E.out(g.seg(p, .8, .95)) });
      [[S.start, 'S', g.C.green], [S.goal, 'G', g.C.pink]].forEach(function (q) { g.box(x0 + q[0][0] * cs + 5, y0 + q[0][1] * cs + 5, cs - 10, cs - 10, { r: 8, fill: q[2], glow: q[2] }); g.text(q[1], x0 + q[0][0] * cs + cs / 2, y0 + q[0][1] * cs + cs / 2 + 1, { size: 20, weight: 800, align: 'center', color: g.C.bg }); });
      var shown = done ? S.total : k;
      g.text('Explored: ' + shown + ' cells' + (done ? '   ·   Path: ' + (S.path.length - 1) + ' moves' : ''), 156, 712 - 18, { size: 20, mono: true, color: g.C.ink });
      g.box(890, 684, 16, 16, { r: 4, fill: g.hexA(g.C.amber, .55) }); g.text('frontier', 914, 692, { size: 17, color: g.C.muted });
      g.box(1010, 684, 16, 16, { r: 4, fill: g.hexA(A, .5) }); g.text('explored', 1034, 692, { size: 17, color: g.C.muted });
    }
  });

  /* ---------- a vacuum-cleaner agent in a grid world ---------- */
  M.kit('agent', {
    init: function () {
      var cols = 9, rows = 5, r = M.rngOf ? null : null, dirt = {}, rnd = (function (a) { return function () { a = (a * 1103515245 + 12345) & 0x7fffffff; return a / 0x7fffffff; }; })(7);
      for (var i = 0; i < 14; i++) dirt[Math.floor(rnd() * cols) + ',' + Math.floor(rnd() * rows)] = 1;
      var path = []; for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) path.push([y % 2 ? cols - 1 - x : x, y]);
      var cleanAt = {}, count = 0; path.forEach(function (c, k) { if (dirt[c[0] + ',' + c[1]] && cleanAt[c[0] + ',' + c[1]] == null) { cleanAt[c[0] + ',' + c[1]] = k; count++; } });
      void r; return { cols: cols, rows: rows, dirt: dirt, path: path, cleanAt: cleanAt, total: count };
    },
    draw: function (g, p, P, S, t) {
      var cs = 78, x0 = 90, y0 = 190, A = ACC(P, g);
      g.heading(P.head || 'An agent: perceive → decide → act', p, P.sub);
      var pos = g.seg(p, .08, .92) * (S.path.length - 1), k = Math.floor(pos), f = pos - k, cleaned = 0;
      for (var y = 0; y < S.rows; y++) for (var x = 0; x < S.cols; x++) {
        var kc = x + ',' + y; g.box(x0 + x * cs + 3, y0 + y * cs + 3, cs - 6, cs - 6, { r: 10, fill: 'rgba(40,52,100,.5)' });
        if (S.dirt[kc]) { if (S.cleanAt[kc] > k) { for (var d = 0; d < 5; d++) g.circle(x0 + x * cs + 22 + (d * 13) % 36, y0 + y * cs + 24 + (d * 17) % 32, 5, { fill: '#a07a4a' }); } else cleaned++; }
      }
      var a = S.path[k], b = S.path[Math.min(k + 1, S.path.length - 1)], rx = x0 + (g.lerp(a[0], b[0], f) + .5) * cs, ry = y0 + (g.lerp(a[1], b[1], f) + .5) * cs, dir = Math.atan2(b[1] - a[1], b[0] - a[0] || (k % 2 ? -1 : 1));
      g.ctx.save(); g.ctx.globalAlpha *= .22; g.ctx.fillStyle = A; g.ctx.beginPath(); g.ctx.moveTo(rx, ry); g.ctx.arc(rx, ry, 110, dir - .5, dir + .5); g.ctx.closePath(); g.ctx.fill(); g.ctx.restore();
      g.circle(rx, ry, 28, { fill: '#e8ecff', glow: A }); g.circle(rx, ry, 20, { fill: '#27305e' }); g.circle(rx + Math.cos(dir) * 12, ry + Math.sin(dir) * 12, 6, { fill: A, glow: A });
      var here = S.path[k][0] + ',' + S.path[k][1], dirty = S.dirt[here] && S.cleanAt[here] === k && f < .6;
      var px = 830; g.panel(px, 190, 400, 390);
      [['PERCEPT', dirty ? 'Location: dirty' : 'Location: clean', g.C.cyan], ['DECISION', dirty ? 'Rule: if dirty → suck' : 'Rule: if clean → move on', g.C.violet], ['ACTION', dirty ? 'SUCK' : 'MOVE', dirty ? g.C.amber : g.C.green], ['PERFORMANCE', cleaned + ' / ' + S.total + ' squares cleaned', g.C.pink]].forEach(function (q, i) {
        g.text(q[0], px + 28, 232 + i * 88, { size: 15, weight: 800, color: q[2], head: true });
        g.text(q[1], px + 28, 264 + i * 88, { size: 24, weight: 600 });
      });
    }
  });

  /* ---------- minimax game tree with optional alpha-beta pruning ---------- */
  M.kit('game-tree', {
    draw: function (g, p, P, S, t) {
      var leaves = P.leaves || [3, 12, 8, 2, 4, 6, 14, 5, 2], prune = !!P.prune;
      g.heading(P.head || (prune ? 'Alpha–beta pruning' : 'Minimax'), p, P.sub);
      var mins = [0, 1, 2].map(function (i) { return Math.min.apply(null, leaves.slice(i * 3, i * 3 + 3)); }), root = Math.max.apply(null, mins);
      var pruned = {}; if (prune) { var alpha = -Infinity; for (var i = 0; i < 3; i++) { var m = Infinity; for (var j = 0; j < 3; j++) { m = Math.min(m, leaves[i * 3 + j]); if (m <= alpha) { for (var q = j + 1; q < 3; q++) pruned[i * 3 + q] = 1; break; } } alpha = Math.max(alpha, m); } }
      var rootP = [640, 210], mid = [0, 1, 2].map(function (i) { return [300 + i * 340, 380]; }), lf = leaves.map(function (v, i) { return [170 + i * 117.5, 560]; });
      var phase = g.seg(p, .05, .95);
      mid.forEach(function (m, i) { g.line(rootP[0], rootP[1] + 34, m[0], m[1] - 34, { color: g.C.line, lw: 3 }); for (var j = 0; j < 3; j++) { var L = lf[i * 3 + j]; g.line(m[0], m[1] + 34, L[0], L[1] - 30, { color: pruned[i * 3 + j] && phase > .55 ? g.hexA(g.C.red, .5) : g.C.line, lw: 3, dash: pruned[i * 3 + j] && phase > .55 ? [6, 6] : null }); } });
      leaves.forEach(function (v, i) {
        var L = lf[i], a = g.E.out(g.seg(phase, i * .04, .08 + i * .04)), pr = pruned[i] && phase > .55;
        g.box(L[0] - 36, L[1] - 30, 72, 60, { r: 12, fill: pr ? 'rgba(80,40,60,.5)' : 'rgba(40,52,100,.8)', stroke: pr ? g.C.red : g.C.blue, lw: 2 });
        g.text(pr ? '✂' : v, L[0], L[1] + 1, { size: 26, weight: 800, mono: true, align: 'center', alpha: pr ? 1 : a, color: pr ? g.C.red : g.C.ink });
      });
      mid.forEach(function (m, i) {
        var a = g.E.back(g.seg(phase, .45 + i * .08, .55 + i * .08));
        g.circle(m[0], m[1], 36, { fill: 'rgba(90,40,90,.7)', stroke: g.C.pink, lw: 3 });
        g.text('MIN', m[0], m[1] - 52, { size: 15, weight: 800, color: g.C.pink, align: 'center', head: true });
        if (a > 0) g.text(String(mins[i]), m[0], m[1] + 1, { size: 28, weight: 800, mono: true, align: 'center', alpha: a });
      });
      var ra = g.E.back(g.seg(phase, .78, .9));
      g.circle(rootP[0], rootP[1], 40, { fill: 'rgba(20,80,90,.7)', stroke: g.C.cyan, lw: 3, glow: ra > .5 ? g.C.cyan : null });
      g.text('MAX', rootP[0], rootP[1] - 58, { size: 15, weight: 800, color: g.C.cyan, align: 'center', head: true });
      if (ra > 0) { g.text(String(root), rootP[0], rootP[1] + 1, { size: 30, weight: 800, mono: true, align: 'center', alpha: ra }); var best = mins.indexOf(root); g.line(rootP[0], rootP[1] + 40, mid[best][0], mid[best][1] - 36, { color: g.C.cyan, lw: 5, glow: g.C.cyan, p: g.seg(phase, .85, .95) }); }
      if (prune && phase > .55) g.text(Object.keys(pruned).length + ' leaves never evaluated — same answer, less work', 640, 650, { size: 21, color: g.C.red, align: 'center', alpha: g.seg(phase, .55, .65) });
    }
  });

  /* ---------- hill climbing vs simulated annealing on a landscape ---------- */
  var land = function (x) { return 2.2 * Math.exp(-Math.pow(x - 2.2, 2) / .8) + 3.6 * Math.exp(-Math.pow(x - 7.4, 2) / 1.1) + 1.4 * Math.exp(-Math.pow(x - 4.8, 2) / .25) + .5; };
  M.kit('landscape', {
    init: function (P) {
      var hill = [4.2], x = 4.2; for (var i = 0; i < 40; i++) { var best = x, bv = land(x); [-.12, .12].forEach(function (d) { var n = Math.max(0, Math.min(10, x + d)); if (land(n) > bv) { bv = land(n); best = n; } }); x = best; hill.push(x); }
      var r = (function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })(P.seed || 5);
      var sa = [4.2], temps = [], y = 4.2, T = 2.5; for (i = 0; i < 160; i++) { var n2 = Math.max(0, Math.min(10, y + (r() - .5) * 1.6)), dv = land(n2) - land(y); if (dv > 0 || r() < Math.exp(dv / T)) y = n2; T *= .972; sa.push(y); temps.push(T); }
      for (i = 0; i < 30; i++) { var b2 = y, bv2 = land(y); [-.08, .08].forEach(function (d) { var n = Math.max(0, Math.min(10, y + d)); if (land(n) > bv2) { bv2 = land(n); b2 = n; } }); y = b2; sa.push(y); temps.push(T); }
      return { hill: hill, sa: sa, temps: temps };
    },
    draw: function (g, p, P, S, t) {
      var mode = P.mode || 'hill', x0 = 110, x1 = 1170, yb = 640, sc = 95, X = function (x) { return x0 + x / 10 * (x1 - x0); }, Y = function (v) { return yb - v * sc; };
      g.heading(P.head || (mode === 'hill' ? 'Hill climbing' : 'Simulated annealing'), p, P.sub);
      var pts = []; for (var x = 0; x <= 10.001; x += .05) pts.push([X(x), Y(land(x))]);
      g.path(pts.concat([[X(10), yb], [X(0), yb]]), { color: g.hexA(g.C.violet, .0), lw: 0, fill: 'rgba(90,70,190,.18)' });
      g.path(pts, { color: g.C.violet, lw: 4, glow: g.C.violet, p: g.E.out(g.seg(p, 0, .15)) });
      g.text('global maximum', X(7.4), Y(land(7.4)) - 40, { size: 18, color: g.C.green, align: 'center', alpha: g.seg(p, .1, .2) });
      g.text('local maximum', X(4.8), Y(land(4.8)) - 40, { size: 18, color: g.C.amber, align: 'center', alpha: g.seg(p, .1, .2) });
      var traj = mode === 'hill' ? S.hill : S.sa, k = Math.floor(g.seg(p, .15, .9) * (traj.length - 1)), cur = traj[k];
      var trail = traj.slice(Math.max(0, k - 25), k + 1).map(function (v) { return [X(v), Y(land(v)) - 16]; });
      g.path(trail, { color: g.hexA(g.C.pink, .5), lw: 3 });
      g.circle(X(cur), Y(land(cur)) - 16, 15, { fill: g.C.pink, glow: g.C.pink });
      if (mode !== 'hill') { var T = S.temps[Math.min(k, S.temps.length - 1)] || 0; g.text('Temperature', 1020, 170, { size: 18, color: g.C.muted }); g.box(1020, 186, 160, 16, { r: 8, fill: g.C.faint }); g.box(1020, 186, 160 * Math.min(1, T / 2.5), 16, { r: 8, fill: g.C.orange, glow: g.C.orange }); }
      if (p > .9) { var ok = land(cur) > 3.5; g.text(ok ? 'Reached the global maximum ✓' : 'Stuck on a local maximum ✗', 640, 690, { size: 24, weight: 700, align: 'center', color: ok ? g.C.green : g.C.amber, alpha: g.seg(p, .9, .95) }); }
    }
  });

  /* ---------- genetic algorithm solving OneMax ---------- */
  M.kit('genetic', {
    init: function (P) {
      var L = 16, N = 8, G = 18, r = (function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })(P.seed || 6);
      var fit = function (b) { return b.reduce(function (a, x) { return a + x; }, 0); };
      var pop = []; for (var i = 0; i < N; i++) { var b = []; for (var j = 0; j < L; j++) b.push(r() < .3 ? 1 : 0); pop.push(b); }
      var gens = [pop.map(function (b) { return b.slice(); })], best = [Math.max.apply(null, pop.map(fit))];
      for (var gen = 1; gen < G; gen++) {
        var sorted = pop.slice().sort(function (a, b) { return fit(b) - fit(a); }), next = [sorted[0].slice()];
        var pick = function () { var a = pop[Math.floor(r() * N)], b = pop[Math.floor(r() * N)]; return fit(a) >= fit(b) ? a : b; };
        while (next.length < N) { var p1 = pick(), p2 = pick(), cut = 1 + Math.floor(r() * (L - 1)), child = p1.slice(0, cut).concat(p2.slice(cut)); for (var m = 0; m < L; m++) if (r() < 1 / L) child[m] = 1 - child[m]; next.push(child); }
        pop = next; gens.push(pop.map(function (b) { return b.slice(); })); best.push(Math.max.apply(null, pop.map(fit)));
      }
      return { gens: gens, best: best, L: L, fit: fit };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'A genetic algorithm evolving solutions', p, P.sub);
      var G = S.gens.length, pos = g.seg(p, .06, .92) * (G - 1), gi = Math.floor(pos), f = pos - gi, pop = S.gens[gi], cs = 30, x0 = 90, y0 = 200;
      var bestIdx = 0; pop.forEach(function (b, i) { if (S.fit(b) > S.fit(pop[bestIdx])) bestIdx = i; });
      g.text('Generation ' + (gi + 1), x0, 166, { size: 22, weight: 700, mono: true, color: g.C.cyan });
      var phase = ['Selection: fitter individuals are more likely to be parents', 'Crossover: children mix their parents’ genes', 'Mutation: random flips keep diversity'][Math.min(2, Math.floor(f * 3))];
      g.text(phase, x0 + 240, 166, { size: 19, color: g.C.muted });
      pop.forEach(function (b, i) {
        var y = y0 + i * 52, fv = S.fit(b);
        b.forEach(function (bit, j) { g.box(x0 + j * cs, y, cs - 4, 40, { r: 5, fill: bit ? g.C.green : '#2f3a6e', glow: bit && i === bestIdx ? g.C.green : null, blur: 8 }); });
        g.box(x0 + S.L * cs + 16, y + 8, fv / S.L * 160, 24, { r: 6, fill: i === bestIdx ? g.C.amber : g.hexA(g.C.cyan, .6) });
        g.text(fv + '/' + S.L, x0 + S.L * cs + 186, y + 21, { size: 17, mono: true, color: g.C.muted });
      });
      var cx = 880, cy = 200, cw = 330, ch = 390; g.panel(cx - 20, cy - 20, cw + 50, ch + 60);
      g.text('Best fitness', cx, cy + 6, { size: 18, color: g.C.muted });
      var pts = S.best.slice(0, gi + 1).map(function (v, i) { return [cx + i / (G - 1) * cw, cy + ch - v / S.L * (ch - 40)]; });
      g.path(pts, { color: g.C.amber, lw: 4, glow: g.C.amber });
      pts.forEach(function (q) { g.circle(q[0], q[1], 4, { fill: g.C.amber }); });
      g.text(S.best[gi] + ' / ' + S.L + ' ones', cx + cw, cy + 6, { size: 20, weight: 700, mono: true, color: g.C.amber, align: 'right' });
    }
  });

  /* ---------- Bayes' theorem with a population of 200 people ---------- */
  M.kit('bayes', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Bayes’ theorem: what does a positive test mean?', p, P.sub);
      var cols = 20, rows = 10, cs = 34, x0 = 90, y0 = 190, sick = {}, pos = {};
      for (var i = 0; i < 10; i++) sick[i * 20 + (i * 7) % 20] = 1;
      var sk = Object.keys(sick).map(Number); sk.slice(0, 9).forEach(function (k) { pos[k] = 1; });
      var healthy = []; for (i = 0; i < 200; i++) if (!sick[i]) healthy.push(i); for (i = 0; i < 19; i++) pos[healthy[(i * 37 + 5) % healthy.length]] = 1;
      var ph = g.seg(p, .04, .96), showSick = ph > .15, showTest = ph > .4, focus = ph > .68;
      for (i = 0; i < 200; i++) {
        var x = x0 + (i % cols) * cs + cs / 2, y = y0 + Math.floor(i / cols) * cs + cs / 2, a = g.E.out(g.seg(ph, i / 200 * .12, i / 200 * .12 + .05));
        var c = showSick && sick[i] ? g.C.red : '#6b78b0', dim = focus && !pos[i] ? .15 : 1;
        g.circle(x, y - 5, 6, { fill: c, alpha: a * dim }); g.box(x - 7, y + 2, 14, 10, { r: 5, fill: c, alpha: a * dim });
        if (showTest && pos[i]) g.circle(x, y, 15, { stroke: g.C.amber, lw: 2.5, alpha: g.seg(ph, .4, .5) });
      }
      var px = 820; g.panel(px, 190, 400, 360);
      var lines = [['Population', '200 people', '#9aa6d6', 0], ['Actually sick (5%)', '10', g.C.red, .15], ['Test catches 90% of sick', '9 positive', g.C.amber, .4], ['False alarms (10% of 190)', '19 positive', g.C.amber, .5], ['Sick among all positives', '9 / 28 ≈ 32%', g.C.green, .68]];
      lines.forEach(function (l, k) { var a = g.seg(ph, l[3], l[3] + .08); g.text(l[0], px + 24, 232 + k * 66, { size: 17, color: g.C.muted, alpha: a }); g.text(l[1], px + 24, 258 + k * 66, { size: 24, weight: 700, color: l[2], alpha: a, mono: true }); });
      g.text('P(sick | positive) = P(positive | sick) · P(sick) / P(positive)', 640, 640, { size: 21, mono: true, align: 'center', color: g.C.ink, alpha: g.seg(ph, .8, .9) });
    }
  });

  /* ---------- a language model generating text token by token ---------- */
  M.kit('llm', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'How a language model writes', p, P.sub);
      var steps = P.steps && P.steps.length ? P.steps : [['next', [['next', 1]]]], n = steps.length, pos = g.seg(p, .08, .95) * n, k = Math.min(n - 1, Math.floor(pos)), f = pos - k;
      var text = P.prompt || '', gen = []; for (var i = 0; i < k; i++) gen.push(steps[i][0]); if (f > .7) gen.push(steps[k][0]);
      g.panel(80, 170, 1120, 110);
      g.text('PROMPT', 110, 200, { size: 14, weight: 800, color: g.C.muted, head: true });
      var w = g.text(text, 110, 240, { size: 30, weight: 500 }), x = 110 + w;
      gen.forEach(function (tok, j) { var ww = g.text(' ' + tok, x, 240, { size: 30, weight: 700, color: j === gen.length - 1 && f > .7 ? g.C.pink : g.C.cyan }); x += ww; });
      if (Math.floor(t * 2.5) % 2) g.box(x + 4, 222, 3, 36, { r: 1, fill: g.C.ink });
      var cands = steps[k] ? steps[k][1] : [], maxP = 1;
      g.text('Next-token probabilities (step ' + (k + 1) + ' of ' + n + ')', 110, 330, { size: 20, color: g.C.muted });
      cands.forEach(function (c, j) {
        var y = 380 + j * 62, a = g.E.out(g.seg(f, j * .08, .3 + j * .08)), chosen = c[0] === steps[k][0] && f > .6;
        g.text(c[0], 110, y, { size: 26, weight: 700, mono: true, color: chosen ? g.C.pink : g.C.ink });
        g.box(300, y - 16, 760 * c[1] / maxP * a, 32, { r: 8, fill: chosen ? g.C.pink : g.hexA(g.C.cyan, .55), glow: chosen ? g.C.pink : null });
        g.text(Math.round(c[1] * 100 * a) + '%', 300 + 760 * c[1] * a + 14, y, { size: 20, mono: true, color: g.C.muted });
      });
    }
  });

  /* ---------- self-attention: arcs and an attention matrix ---------- */
  M.kit('attention', {
    draw: function (g, p, P, S, t) {
      var words = P.words || ['The', 'animal', 'didn’t', 'cross', 'the', 'street', 'because', 'it', 'was', 'tired'], n = words.length;
      g.heading(P.head || 'Self-attention: which words matter?', p, P.sub);
      var focus = P.focus != null ? P.focus : 7, att = P.att || [.05, .52, .02, .04, .02, .12, .03, .1, .04, .06];
      if (P.mode === 'matrix') {
        var cs = Math.min(46, 460 / n), x0 = 640 - n * cs / 2 + 60, y0 = 190, rowsShown = g.seg(p, .1, .85) * n;
        words.forEach(function (wd, i) { g.text(wd, x0 - 14, y0 + i * cs + cs / 2, { size: 17, align: 'right', color: g.C.muted }); g.ctx.save(); g.ctx.translate(x0 + i * cs + cs / 2, y0 - 12); g.ctx.rotate(-Math.PI / 4); g.text(wd, 0, 0, { size: 17, color: g.C.muted }); g.ctx.restore(); });
        for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
          var w = (P.matrix && P.matrix[i]) ? P.matrix[i][j] : (i === j ? .45 : Math.max(.02, .35 - Math.abs(i - j) * .06));
          var a = g.clamp(rowsShown - i); g.box(x0 + j * cs + 2, y0 + i * cs + 2, cs - 4, cs - 4, { r: 5, fill: g.hexA(g.C.cyan, .08 + w * .9 * a) });
        }
        g.text('Each row: how much one word attends to every other word. Rows sum to 1.', 640, 680, { size: 19, color: g.C.muted, align: 'center', alpha: g.seg(p, .5, .6) });
        return;
      }
      var y1 = 290, y2 = 560, sp = 1120 / n, X = function (i) { return 80 + sp * i + sp / 2; }, a0 = g.E.out(g.seg(p, 0, .15));
      words.forEach(function (wd, i) {
        var c = i === focus ? g.C.pink : g.C.ink;
        g.pill(X(i), y1, wd, { fill: i === focus ? g.C.pink : 'rgba(60,72,130,.9)', color: i === focus ? g.C.bg : g.C.ink, align: 'center', size: 19, alpha: a0 });
        g.pill(X(i), y2, wd, { fill: g.hexA(g.C.cyan, .15 + att[i] * 1.4), color: g.C.ink, align: 'center', size: 19, alpha: a0, stroke: g.hexA(g.C.cyan, .6) });
        void c;
      });
      var la = g.E.out(g.seg(p, .2, .6));
      words.forEach(function (wd, i) {
        var w = att[i], cx1 = X(focus), cx2 = X(i);
        g.ctx.save(); g.ctx.globalAlpha *= la * (.25 + w * 1.4); g.ctx.strokeStyle = g.C.pink; g.ctx.lineWidth = 1 + w * 22; g.ctx.lineCap = 'round';
        g.ctx.beginPath(); g.ctx.moveTo(cx1, y1 + 22); g.ctx.bezierCurveTo(cx1, (y1 + y2) / 2, cx2, (y1 + y2) / 2, cx2, y2 - 22); g.ctx.stroke(); g.ctx.restore();
        g.text(Math.round(w * 100) + '%', X(i), y2 + 44, { size: 16, mono: true, color: g.C.muted, align: 'center', alpha: g.seg(p, .5, .6) });
      });
      if (P.note) g.text(P.note, 640, 660, { size: 21, align: 'center', color: g.C.ink, alpha: g.seg(p, .6, .7), maxW: 1100 });
    }
  });

  /* ---------- diffusion: noise to image ---------- */
  M.kit('diffusion', {
    init: function (P, g) {
      var N = 28, shape = P.shape || 'heart', r = g.rng(9), noise = [];
      var inside = function (x, y) {
        var u = (x - N / 2 + .5) / (N * .38), v = -(y - N / 2 + .5) / (N * .38);
        if (shape === 'heart') return Math.pow(u * u + v * v - 1, 3) - u * u * v * v * v <= 0;
        var d = Math.hypot(u, v); if (d > 1.05) return false; if (Math.hypot(u + .38, v - .3) < .15 || Math.hypot(u - .38, v - .3) < .15) return 'eye'; if (v < -.15 && v > -.55 && d > .45 && d < .7) return 'eye'; return true;
      };
      for (var i = 0; i < N * N * 3; i++) noise.push(r());
      return { N: N, inside: inside, noise: noise };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Diffusion: removing noise step by step', p, P.sub);
      var N = S.N, cs = 17, x0 = 110, y0 = 170, s = g.E.inOut(g.seg(p, .1, .85)), nz = 1 - s, pal = P.shape === 'smiley' ? ['#fbbf24', '#1f2547'] : ['#f472b6', '#1d2350'];
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var inn = S.inside(x, y), base = inn === 'eye' ? '#1f2547' : inn ? pal[0] : pal[1], k = (y * N + x) * 3;
        var rc = '#' + [0, 1, 2].map(function (c) { return Math.floor(S.noise[k + c] * 255).toString(16).padStart(2, '0'); }).join('');
        g.ctx.fillStyle = g.mix(base, rc, nz * .95); g.ctx.fillRect(x0 + x * cs, y0 + y * cs, cs - 1, cs - 1);
      }
      g.arrow(620, 408, 700, 408, { color: g.C.muted, lw: 3 });
      g.panel(730, 190, 470, 440);
      g.text('Prompt', 760, 232, { size: 17, color: g.C.muted }); g.text('“' + (P.prompt || 'a pink heart icon') + '”', 760, 268, { size: 26, weight: 600, maxW: 410 });
      g.text('Denoising step', 760, 340, { size: 17, color: g.C.muted }); g.text(Math.round(s * 50) + ' / 50', 760, 376, { size: 34, weight: 700, mono: true, color: g.C.cyan });
      g.text('Noise remaining', 760, 440, { size: 17, color: g.C.muted }); g.box(760, 460, 400, 18, { r: 9, fill: g.C.faint }); g.box(760, 460, 400 * nz, 18, { r: 9, fill: g.C.red, glow: g.C.red });
      g.text('At each step the model predicts the noise and subtracts a little of it.', 760, 540, { size: 19, color: g.C.ink, maxW: 410, lh: 25 });
    }
  });

  /* ---------- word embeddings: clusters and analogies ---------- */
  M.kit('embedding', {
    init: function (P, g) {
      var r = g.rng(4), W0 = [
        ['king', 760, 250, 'violet'], ['queen', 760, 390, 'violet'], ['man', 470, 250, 'cyan'], ['woman', 470, 390, 'cyan'], ['prince', 860, 230, 'violet'], ['princess', 860, 400, 'violet'],
        ['apple', 1010, 560, 'green'], ['mango', 1080, 610, 'green'], ['banana', 1000, 640, 'green'], ['cat', 230, 560, 'amber'], ['dog', 300, 610, 'amber'], ['tiger', 200, 640, 'amber']];
      return { words: W0.map(function (w) { return { w: w[0], x: w[1], y: w[2], c: w[3], sx: 100 + r() * 1080, sy: 180 + r() * 480 }; }) };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Embeddings: meaning as position', p, P.sub);
      var m = g.E.inOut(g.seg(p, .1, .5));
      S.words.forEach(function (w) { var x = g.lerp(w.sx, w.x, m), y = g.lerp(w.sy, w.y, m), c = g.C[w.c]; g.circle(x, y, 9, { fill: c, glow: c }); g.text(w.w, x + 16, y, { size: 21, weight: 600 }); });
      if (P.mode === 'analogy') {
        var a = g.seg(p, .55, .75), b = g.seg(p, .72, .9);
        g.arrow(470, 262, 470, 378, { color: g.C.pink, lw: 4, head: 14, p: a, glow: g.C.pink });
        g.arrow(760, 262, 760, 378, { color: g.C.pink, lw: 4, head: 14, p: b, glow: g.C.pink });
        g.text('same direction = “female” offset', 615, 322, { size: 18, color: g.C.pink, align: 'center', alpha: b });
        g.text('king − man + woman ≈ queen', 640, 680, { size: 28, weight: 700, mono: true, align: 'center', alpha: g.seg(p, .85, .95), color: g.C.amber });
      } else {
        [['royalty', 810, 315, 'violet'], ['people', 470, 320, 'cyan'], ['fruit', 1030, 600, 'green'], ['animals', 245, 600, 'amber']].forEach(function (c) { g.circle(c[1], c[2], 120, { stroke: g.C[c[3]], lw: 2, dash: [6, 6], alpha: g.seg(p, .55, .7) }); g.text(c[0], c[1], c[2] - 136, { size: 18, weight: 700, color: g.C[c[3]], align: 'center', alpha: g.seg(p, .55, .7) }); });
      }
    }
  });
})(window.Motion);
