/* AI in Motion — Reinforcement Learning kits (MDPs, dynamic programming, TD learning, bandits, deep RL, policy gradients). © Janin A Apurba, CSE, AUST */
(function (M) {
  'use strict';
  var R = function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  var nf = function (v, d) { var s = (+v).toFixed(d == null ? 2 : d); if (/^-0\.?0*$/.test(s)) s = s.slice(1); return s.replace('-', '−'); };
  var DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]], ARROW = ['↑', '→', '↓', '←'];
  var side = function (g, p, x, y, w, h, lines) { g.panel(x, y, w, h, { alpha: g.E.out(g.seg(p, .03, .12)) }); var yy = y + 38; lines.forEach(function (l) { if (!l) return; var o = l[2] || {}; if ((o.a == null ? 1 : o.a) > 0) g.text(l[0], x + 24, yy, { size: o.size || 20, weight: o.w || 600, color: l[1] || g.C.ink, mono: !!o.mono, alpha: o.a == null ? 1 : o.a, maxW: w - 44, lh: 25 }); yy += o.gap || 44; }); };
  var vcol = function (g, v) { return v >= 0 ? g.mix('#1b2550', g.C.green, Math.min(1, v)) : g.mix('#1b2550', g.C.red, Math.min(1, -v)); };

  /* ---------- a small grid world: 7 × 5, goal +1, pit −1 ---------- */
  function world(P) {
    var cols = 7, rows = 5, walls = { '1,1': 1, '1,2': 1, '4,1': 1, '3,3': 1 }, term = { '6,0': 1, '6,1': -1 }, step = P.step == null ? -0.04 : P.step, gamma = P.gamma || .9, slip = P.slip == null ? .2 : P.slip;
    var ok = function (x, y) { return x >= 0 && y >= 0 && x < cols && y < rows && !walls[x + ',' + y]; };
    var move = function (s, a) { var n = [s[0] + DIRS[a][0], s[1] + DIRS[a][1]]; return ok(n[0], n[1]) ? n : s; };
    var outs = function (s, a) { return slip ? [[move(s, a), 1 - slip], [move(s, (a + 1) % 4), slip / 2], [move(s, (a + 3) % 4), slip / 2]] : [[move(s, a), 1]]; };
    var rew = function (n) { var k = n[0] + ',' + n[1]; return term[k] != null ? term[k] : step; };
    var states = []; for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) if (ok(x, y) && term[x + ',' + y] == null) states.push([x, y]);
    var q = function (V, s, a) { return outs(s, a).reduce(function (acc, o) { var k = o[0][0] + ',' + o[0][1]; return acc + o[1] * (rew(o[0]) + gamma * (term[k] != null ? 0 : V[k] || 0)); }, 0); };
    return { cols: cols, rows: rows, walls: walls, term: term, ok: ok, move: move, outs: outs, rew: rew, states: states, q: q, gamma: gamma, slip: slip, step: step, start: [0, 4] };
  }
  function drawGrid(g, W, x0, y0, cs, cellFn) {
    for (var y = 0; y < W.rows; y++) for (var x = 0; x < W.cols; x++) {
      var k = x + ',' + y, px = x0 + x * cs, py = y0 + y * cs;
      if (W.walls[k]) { g.box(px + 3, py + 3, cs - 6, cs - 6, { r: 10, fill: '#3a4680' }); continue; }
      if (W.term[k] != null) { var c = W.term[k] > 0 ? g.C.green : g.C.red; g.box(px + 3, py + 3, cs - 6, cs - 6, { r: 10, fill: g.hexA(c, .35), stroke: c, lw: 2.5, glow: c }); g.text((W.term[k] > 0 ? '+' : '−') + Math.abs(W.term[k]), px + cs / 2, py + cs / 2 + 1, { size: 26, weight: 800, align: 'center', color: g.C.white, head: true }); continue; }
      cellFn(x, y, px, py, k);
    }
  }
  M.kit('gridworld', {
    init: function (P) {
      var W = world(P), mode = P.mode || 'values', S = { W: W };
      if (mode === 'values' || mode === 'env') {
        var V = {}, hist = [{}], deltas = [];
        for (var it = 0; it < 60; it++) { var nV = {}, d = 0; W.states.forEach(function (s) { var k = s[0] + ',' + s[1], best = -Infinity; for (var a = 0; a < 4; a++) best = Math.max(best, W.q(V, s, a)); nV[k] = best; d = Math.max(d, Math.abs(best - (V[k] || 0))); }); V = nV; hist.push(V); deltas.push(d); if (d < 1e-4) break; }
        S.hist = hist; S.deltas = deltas;
        S.pol = {}; W.states.forEach(function (s) { var k = s[0] + ',' + s[1], b = 0, bv = -Infinity; for (var a = 0; a < 4; a++) { var v = W.q(V, s, a); if (v > bv + 1e-9) { bv = v; b = a; } } S.pol[k] = b; });
        var r = R(P.seed || 5), eps = [], pos = W.start, path = [pos], ret = 0;
        for (var i = 0; i < 160; i++) { var a2 = Math.floor(r() * 4), u = r(), acc = 0, o = W.outs(pos, a2), n = o[0][0]; for (var j = 0; j < o.length; j++) { acc += o[j][1]; if (u < acc) { n = o[j][0]; break; } } ret += W.rew(n); path.push(n); pos = n; if (W.term[n[0] + ',' + n[1]] != null) { eps.push({ path: path, ret: ret }); pos = W.start; path = [pos]; ret = 0; } }
        if (path.length > 1) eps.push({ path: path, ret: ret });
        S.eps = eps;
      } else if (mode === 'policy') {
        var pol = {}, iters = [], Vp = {}; W.states.forEach(function (s) { pol[s[0] + ',' + s[1]] = 0; });
        for (var pi = 0; pi < 12; pi++) {
          for (var sw = 0; sw < 80; sw++) { var nv = {}; W.states.forEach(function (s) { var k = s[0] + ',' + s[1]; nv[k] = W.q(Vp, s, pol[k]); }); Vp = nv; }
          var np = {}, changed = 0; W.states.forEach(function (s) { var k = s[0] + ',' + s[1], b = pol[k], bv = W.q(Vp, s, b); for (var a = 0; a < 4; a++) { var v = W.q(Vp, s, a); if (v > bv + 1e-6) { bv = v; b = a; } } np[k] = b; if (b !== pol[k]) changed++; });
          iters.push({ pol: pol, V: Vp, changed: changed }); pol = np; if (!changed) break;
        }
        S.iters = iters;
      } else {
        var W0 = world({ slip: 0, gamma: P.gamma || .9, step: P.step }), r2 = R(P.seed || 7), Q = {}, alpha = P.alpha || .5, eps2 = P.eps || .2, snapsAt = P.snaps || [1, 2, 3, 5, 10, 20, 40, 80, 150, 300], snaps = [], steps = [];
        S.W = W0; var qk = function (s) { var k = s[0] + ',' + s[1]; return Q[k] || (Q[k] = [0, 0, 0, 0]); };
        for (var ep = 1; ep <= 300; ep++) {
          var s0 = W0.start, tr = [s0], n2 = 0;
          while (n2 < 200) { var qs = qk(s0), a3; if (r2() < eps2) a3 = Math.floor(r2() * 4); else { var m = Math.max.apply(null, qs), best2 = []; qs.forEach(function (v, i2) { if (v === m) best2.push(i2); }); a3 = best2[Math.floor(r2() * best2.length)]; }
            var s1 = W0.move(s0, a3), rr = W0.rew(s1), k1 = s1[0] + ',' + s1[1], done = W0.term[k1] != null, target = rr + (done ? 0 : W0.gamma * Math.max.apply(null, qk(s1)));
            qs[a3] += alpha * (target - qs[a3]); s0 = s1; tr.push(s1); n2++; if (done) break; }
          steps.push(n2);
          if (snapsAt.indexOf(ep) >= 0) { var cp = {}; for (var kk in Q) cp[kk] = Q[kk].slice(); snaps.push({ ep: ep, Q: cp, path: tr }); }
        }
        S.snaps = snaps; S.steps = steps; S.alpha = alpha; S.epsv = eps2;
      }
      return S;
    },
    draw: function (g, p, P, S, t) {
      var mode = P.mode || 'values', W = S.W, cs = 84, x0 = 70, y0 = 196, C = g.C, A = P.accent || C.orange, a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || { env: 'A grid world', values: 'Value iteration', policy: 'Policy iteration', q: 'Q-learning' }[mode], p, P.sub);
      var st = W.start;
      if (mode === 'env') {
        var total = S.eps.reduce(function (a, e) { return a + e.path.length; }, 0), kk = Math.floor(g.seg(p, .08, .95) * (total - 1)), ei = 0; while (ei < S.eps.length - 1 && kk >= S.eps[ei].path.length) { kk -= S.eps[ei].path.length; ei++; }
        var e = S.eps[ei], pos = e.path[Math.min(kk, e.path.length - 1)], ret = 0; for (var i = 1; i <= Math.min(kk, e.path.length - 1); i++) ret += W.rew(e.path[i]);
        g.alpha(a0, function () { drawGrid(g, W, x0, y0, cs, function (x, y, px, py) { g.box(px + 3, py + 3, cs - 6, cs - 6, { r: 10, fill: 'rgba(40,52,100,.55)' }); if (x === st[0] && y === st[1]) g.text('START', px + cs / 2, py + cs - 14, { size: 12, weight: 800, color: C.muted, align: 'center' }); }); });
        g.path(e.path.slice(0, kk + 1).map(function (q) { return [x0 + q[0] * cs + cs / 2, y0 + q[1] * cs + cs / 2]; }), { color: g.hexA(A, .45), lw: 3 });
        g.circle(x0 + pos[0] * cs + cs / 2, y0 + pos[1] * cs + cs / 2, 22, { fill: A, glow: A });
        g.text('🤖', x0 + pos[0] * cs + cs / 2, y0 + pos[1] * cs + cs / 2 + 2, { size: 22, align: 'center' });
        side(g, p, 700, 186, 520, 460, [['Episode ' + (ei + 1) + ' · step ' + kk, A, { mono: true, size: 22, w: 700 }], ['State: the agent’s cell (x, y)', C.ink], ['Actions: ↑ → ↓ ←', C.ink], ['Reward: −0.04 per step, +1 goal, −1 pit', C.ink], ['Slippery: ' + Math.round((1 - W.slip) * 100) + '% intended move, else sideways', C.muted, { size: 18 }], ['Return so far: ' + nf(ret), ret >= 0 ? C.green : C.red, { mono: true, size: 22, w: 700 }], ['A random policy wanders — learning must do better', C.muted, { size: 18, a: g.seg(p, .5, .6) }]]);
        return;
      }
      if (mode === 'values') {
        var K = S.hist.length - 1, kf = g.seg(p, .08, .8) * K, k = Math.min(K, Math.floor(kf)), V = S.hist[k], showPol = p > .82;
        drawGrid(g, W, x0, y0, cs, function (x, y, px, py, key) { var v = V[key] || 0; g.box(px + 3, py + 3, cs - 6, cs - 6, { r: 10, fill: vcol(g, v), alpha: a0 }); g.text(nf(v), px + cs / 2, py + (showPol ? cs - 16 : cs / 2 + 1), { size: showPol ? 16 : 20, weight: 700, mono: true, align: 'center', alpha: a0 }); if (showPol) g.text(ARROW[S.pol[key]], px + cs / 2, py + cs / 2 - 8, { size: 34, weight: 800, align: 'center', color: C.white, alpha: g.seg(p, .82, .9) }); });
        side(g, p, 700, 186, 520, 460, [['Iteration k = ' + k, A, { mono: true, size: 24, w: 800 }], ['V(s) ← max over a of', C.ink, { mono: true, size: 19, gap: 30 }], ['Σ P(s′|s,a) [ r + γ V(s′) ]', C.ink, { mono: true, size: 19 }], ['γ = ' + W.gamma + ' · step reward ' + W.step + ' · slip ' + W.slip, C.muted, { size: 17 }], ['largest change Δ = ' + (k ? nf(S.deltas[k - 1], 4) : '—'), C.amber, { mono: true, size: 19 }], ['Value flows backwards from the goal, one step per sweep.', C.muted, { size: 18, a: g.seg(p, .2, .3), gap: 60 }], [showPol ? 'Arrows: act greedily on V → the optimal policy' : '', C.green, { size: 19, w: 700, a: g.seg(p, .82, .9) }]]);
        return;
      }
      if (mode === 'policy') {
        var n = S.iters.length, ki = Math.min(n - 1, Math.floor(g.seg(p, .08, .92) * n)), itr = S.iters[ki];
        drawGrid(g, W, x0, y0, cs, function (x, y, px, py, key) { var v = itr.V[key] || 0; g.box(px + 3, py + 3, cs - 6, cs - 6, { r: 10, fill: vcol(g, v), alpha: a0 }); g.text(ARROW[itr.pol[key]], px + cs / 2, py + cs / 2 - 8, { size: 32, weight: 800, align: 'center', color: C.white, alpha: a0 }); g.text(nf(v), px + cs / 2, py + cs - 16, { size: 15, weight: 700, mono: true, align: 'center', alpha: a0 }); });
        side(g, p, 700, 186, 520, 460, [['Policy iteration ' + (ki + 1) + ' of ' + n, A, { mono: true, size: 24, w: 800 }], ['1. Evaluate: compute V for the current policy', C.ink], ['2. Improve: in every cell, pick the action with the best one-step look-ahead', C.ink, { gap: 64 }], ['Actions changed this round: ' + itr.changed, itr.changed ? C.amber : C.green, { mono: true, size: 20, w: 700 }], [itr.changed ? 'Keep going…' : 'No changes → the policy is optimal ✓', itr.changed ? C.muted : C.green, { size: 20, w: 700 }]]);
        return;
      }
      var ns = S.snaps.length, pos2 = g.seg(p, .06, .9) * ns, si = Math.min(ns - 1, Math.floor(pos2)), sn = S.snaps[si], f = g.seg(pos2 - si, .05, .9), Q = sn.Q, pk = Math.min(sn.path.length - 1, Math.floor(f * (sn.path.length - 1))), ag = sn.path[pk];
      drawGrid(g, W, x0, y0, cs, function (x, y, px, py, key) {
        var qv = Q[key] || [0, 0, 0, 0], c = [px + cs / 2, py + cs / 2], corners = [[px + 4, py + 4], [px + cs - 4, py + 4], [px + cs - 4, py + cs - 4], [px + 4, py + cs - 4]];
        for (var a = 0; a < 4; a++) { var c1 = corners[a], c2 = corners[(a + 1) % 4]; g.path([c, c1, c2, c], { color: 'rgba(8,11,28,.9)', lw: 1.5, fill: vcol(g, qv[a]), alpha: a0 }); }
        var mx = Math.max.apply(null, qv); if (mx !== 0 || Math.min.apply(null, qv) !== 0) g.text(ARROW[qv.indexOf(mx)], c[0], c[1] + 1, { size: 22, weight: 800, align: 'center', color: C.white, alpha: a0 * .9 });
      });
      g.path(sn.path.slice(0, pk + 1).map(function (q) { return [x0 + q[0] * cs + cs / 2, y0 + q[1] * cs + cs / 2]; }), { color: g.hexA(A, .5), lw: 3 });
      g.circle(x0 + ag[0] * cs + cs / 2, y0 + ag[1] * cs + cs / 2, 16, { fill: A, glow: A });
      var cx = 720, cy = 470, cw = 480, ch = 150, mxs = 60, pts = []; for (var e2 = 0; e2 < sn.ep; e2++) pts.push([cx + e2 / 299 * cw, cy + ch - Math.min(mxs, S.steps[e2]) / mxs * ch]);
      side(g, p, 700, 186, 520, 470, [['Episode ' + sn.ep, A, { mono: true, size: 24, w: 800 }], ['Q(s,a) ← Q + α [ r + γ maxₐ′ Q(s′,a′) − Q ]', C.ink, { mono: true, size: 16 }], ['α = ' + S.alpha + '   γ = ' + W.gamma + '   ε = ' + S.epsv + ' (explore)', C.muted, { size: 17 }], ['Steps this episode: ' + (sn.path.length - 1), C.amber, { mono: true, size: 19 }]]);
      g.line(cx, cy + ch, cx + cw, cy + ch, { color: '#56629c', lw: 2 }); g.line(cx, cy, cx, cy + ch, { color: '#56629c', lw: 2 });
      g.path(pts, { color: C.amber, lw: 2 });
      g.text('steps per episode (capped at 60)', cx + 6, cy - 12, { size: 14, color: C.muted });
      g.text('Each cell: 4 triangles = Q for ↑ → ↓ ←', 70, 648, { size: 17, color: C.muted });
    }
  });

  /* ---------- the agent–environment loop ---------- */
  M.kit('rl-loop', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.orange, a0 = g.E.out(g.seg(p, 0, .1)), path = [[0, 3], [1, 3], [1, 2], [2, 2], [3, 2], [3, 1], [4, 1], [4, 0]], acts = ['→', '↑', '→', '→', '↑', '→', '↑'], rw = [-1, -1, -1, -1, -1, -1, 10];
      g.heading(P.head || 'The reinforcement learning loop', p, P.sub);
      var n = acts.length, pos = g.seg(p, .1, .92) * n, k = Math.min(n - 1, Math.floor(pos)), f = pos - k;
      g.box(90, 280, 240, 190, { r: 26, fill: g.hexA(A, .16), stroke: A, lw: 2.5, glow: f < .33 ? A : null, alpha: a0 });
      g.text('🧠', 210, 346, { size: 50, align: 'center', alpha: a0 }); g.text('Agent', 210, 420, { size: 28, weight: 700, head: true, align: 'center', alpha: a0 }); g.text('policy π(a | s)', 210, 450, { size: 16, color: C.muted, align: 'center', alpha: a0 });
      var ex = 560, ey = 230, cs = 62;
      g.panel(ex - 20, ey - 20, 5 * cs + 40, 4 * cs + 40, { alpha: a0, stroke: f > .33 && f < .66 ? C.cyan : null });
      for (var y = 0; y < 4; y++) for (var x = 0; x < 5; x++) g.box(ex + x * cs + 3, ey + y * cs + 3, cs - 6, cs - 6, { r: 8, fill: x === 4 && y === 0 ? g.hexA(C.green, .4) : 'rgba(40,52,100,.6)', alpha: a0 });
      g.text('★', ex + 4 * cs + cs / 2, ey + cs / 2 + 1, { size: 26, align: 'center', color: C.amber, alpha: a0 });
      var s0 = path[k], s1 = path[k + 1], mv = g.E.inOut(g.seg(f, .33, .6)), ax = ex + (s0[0] + (s1[0] - s0[0]) * mv) * cs + cs / 2, ay = ey + (s0[1] + (s1[1] - s0[1]) * mv) * cs + cs / 2;
      g.circle(ax, ay, 17, { fill: A, glow: A, alpha: a0 });
      g.text('Environment', ex + 2.5 * cs, ey + 4 * cs + 48, { size: 24, weight: 700, head: true, align: 'center', alpha: a0 });
      var up = g.seg(f, 0, .33), dn = g.seg(f, .6, .95);
      g.arrow(340, 300, ex - 30, 300, { color: C.pink, lw: 4, head: 14, alpha: a0 * .35 }); g.arrow(ex - 30, 450, 340, 450, { color: C.cyan, lw: 4, head: 14, alpha: a0 * .35 });
      if (up > 0 && up < 1) g.pill(g.lerp(350, ex - 40, up) + 60, 300, 'action aₜ = ' + acts[k], { fill: C.pink, align: 'center', size: 16 });
      if (dn > 0 && dn < 1) g.pill(g.lerp(ex - 40, 350, dn) + 20, 450, 's′ = (' + s1[0] + ',' + s1[1] + ')  r = ' + (rw[k] > 0 ? '+' : '') + rw[k], { fill: C.cyan, align: 'center', size: 16 });
      var lx = 930; g.panel(lx, 170, 290, 500, { alpha: a0 });
      g.text('TRAJECTORY', lx + 22, 204, { size: 15, weight: 800, color: C.muted, head: true, alpha: a0 });
      var G = 0;
      for (var i = 0; i <= k; i++) { var done = i < k || f > .6; if (!done) break; G += rw[i]; g.text('t=' + i + '  a=' + acts[i] + '  r=' + (rw[i] > 0 ? '+' : '') + rw[i], lx + 22, 244 + i * 40, { size: 18, mono: true, color: rw[i] > 0 ? C.green : C.ink }); }
      g.text('return G = ' + G, lx + 22, 244 + 7 * 40 + 24, { size: 21, weight: 700, mono: true, color: C.amber, alpha: g.seg(p, .2, .3) });
    }
  });

  /* ---------- discounted return ---------- */
  M.kit('returns', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.orange, rw = P.rewards || [-1, -1, -1, -1, 10], gm = P.gamma == null ? .9 : P.gamma, n = rw.length, w = Math.min(170, 1000 / n), x0 = 640 - n * w / 2 + 40;
      g.heading(P.head || 'Discounted return', p, P.sub);
      rw.forEach(function (r, k) {
        var x = x0 + k * w, a = g.E.back(g.seg(p, .05 + k * .05, .15 + k * .05)), b = g.E.out(g.seg(p, .35 + k * .05, .45 + k * .05)), c = g.E.out(g.seg(p, .6 + k * .04, .7 + k * .04)), df = Math.pow(gm, k), v = r * df;
        g.text('t = ' + k, x + w / 2, 196, { size: 17, mono: true, color: C.muted, align: 'center', alpha: g.clamp(a) });
        g.box(x + 10, 216, w - 20, 70, { r: 14, fill: g.hexA(r >= 0 ? C.green : C.red, .22), stroke: r >= 0 ? C.green : C.red, lw: 2, alpha: g.clamp(a) });
        g.text((r > 0 ? '+' : '') + r, x + w / 2, 252, { size: 28, weight: 800, mono: true, align: 'center', alpha: g.clamp(a) });
        g.text('× ' + nf(df, 3), x + w / 2, 330, { size: 18, mono: true, color: C.amber, align: 'center', alpha: b });
        g.box(x + w / 2 - 12, 470 - 100 * df * b, 24, 100 * df * b, { r: 6, fill: g.hexA(C.amber, .8) });
        g.text(nf(v, 2), x + w / 2, 520, { size: 21, weight: 700, mono: true, align: 'center', color: v >= 0 ? C.green : C.red, alpha: c });
      });
      g.text('reward rₜ', x0 - 16, 252, { size: 17, color: C.muted, align: 'right', alpha: g.seg(p, .05, .15) });
      g.text('weight γᵗ', x0 - 16, 400, { size: 17, color: C.amber, align: 'right', alpha: g.seg(p, .35, .45) });
      g.text('γᵗ · rₜ', x0 - 16, 520, { size: 17, color: C.muted, align: 'right', alpha: g.seg(p, .6, .7) });
      var fa = g.E.out(g.seg(p, .86, .94)), Gt = rw.reduce(function (s, r, k) { return s + r * Math.pow(gm, k); }, 0);
      g.panel(200, 570, 880, 90, { alpha: fa, stroke: g.hexA(A, .6) });
      g.text('G = r₀ + γr₁ + γ²r₂ + …  = ' + nf(Gt, 2) + '   (γ = ' + gm + ')', 640, 615, { size: 25, weight: 700, mono: true, align: 'center', color: A, alpha: fa });
    }
  });

  /* ---------- multi-armed bandits ---------- */
  function gammaS(r, k) { var d = k - 1 / 3, c = 1 / Math.sqrt(9 * d); for (;;) { var x, v; do { var u1 = 0; while (!u1) u1 = r(); x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * r()); v = 1 + c * x; } while (v <= 0); v = v * v * v; var u = r(); if (u < 1 - .0331 * x * x * x * x || Math.log(u) < .5 * x * x + d * (1 - v + Math.log(v))) return d * v; } }
  function runBandit(arms, strat, T, r, eps, keep) {
    var n = arms.length, cnt = arms.map(function () { return 0; }), sum = cnt.slice(), hist = [], tot = 0;
    for (var t = 0; t < T; t++) {
      var a = 0;
      if (strat === 'ucb') { var un = cnt.indexOf(0); if (un >= 0) a = un; else { var bu = -1; for (var i = 0; i < n; i++) { var u = sum[i] / cnt[i] + Math.sqrt(2 * Math.log(t + 1) / cnt[i]); if (u > bu) { bu = u; a = i; } } } }
      else if (strat === 'thompson') { var bs = -1; for (var j = 0; j < n; j++) { var x = gammaS(r, 1 + sum[j]), y = gammaS(r, 1 + cnt[j] - sum[j]), s = x / (x + y); if (s > bs) { bs = s; a = j; } } }
      else { var e = strat === 'greedy' ? 0 : eps; if (r() < e) a = Math.floor(r() * n); else { var m = -1; for (var k = 0; k < n; k++) { var est = cnt[k] ? sum[k] / cnt[k] : 1; if (est > m) { m = est; a = k; } } } }
      var rw = r() < arms[a] ? 1 : 0; cnt[a]++; sum[a] += rw; tot += rw;
      hist.push(keep ? { a: a, r: rw, cnt: cnt.slice(), est: cnt.map(function (c, i) { return c ? sum[i] / c : 0; }), tot: tot } : a);
    }
    return hist;
  }
  M.kit('bandit', {
    init: function (P) {
      var arms = P.arms || [.25, .5, .8, .35, .6], r = R(P.seed || 9), mode = P.mode || 'egreedy';
      if (mode === 'compare') {
        var strats = P.strats || ['greedy', 'egreedy', 'ucb', 'thompson'], T = 500, runs = 100, bi = arms.indexOf(Math.max.apply(null, arms)), curves = strats.map(function () { return new Float64Array(T); });
        strats.forEach(function (s, si) { for (var run = 0; run < runs; run++) { var h = runBandit(arms, s, T, r, .1, false); for (var t = 0; t < T; t++) if (h[t] === bi) curves[si][t] += 1 / runs; } });
        return { arms: arms, curves: curves, strats: strats, T: T };
      }
      return { arms: arms, hist: runBandit(arms, mode, 300, r, P.eps || .1, true) };
    },
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.orange, mode = P.mode || 'egreedy', names = { greedy: 'Greedy', egreedy: 'ε-greedy (ε = 0.1)', ucb: 'UCB', thompson: 'Thompson sampling' }, arms = S.arms, best = arms.indexOf(Math.max.apply(null, arms));
      g.heading(P.head || (mode === 'compare' ? 'Exploration strategies compared' : 'Multi-armed bandit: ' + names[mode]), p, P.sub);
      if (mode === 'compare') {
        var x0 = 120, y0 = 190, w = 780, h = 420, a0 = g.E.out(g.seg(p, 0, .08));
        g.line(x0, y0 + h, x0 + w, y0 + h, { color: '#56629c', lw: 2, alpha: a0 }); g.line(x0, y0, x0, y0 + h, { color: '#56629c', lw: 2, alpha: a0 });
        [0, .25, .5, .75, 1].forEach(function (v) { g.text(Math.round(v * 100) + '%', x0 - 10, y0 + h - v * h, { size: 15, mono: true, color: C.muted, align: 'right', alpha: a0 }); g.line(x0, y0 + h - v * h, x0 + w, y0 + h - v * h, { color: 'rgba(120,140,220,.1)', lw: 1, alpha: a0 }); });
        g.text('% of 100 runs choosing the best arm', x0, y0 - 18, { size: 16, color: C.muted, alpha: a0 }); g.text('pull number →  500', x0 + w, y0 + h + 26, { size: 15, color: C.muted, align: 'right', alpha: a0 });
        S.strats.forEach(function (s, k) { var c = { greedy: C.red, egreedy: C.cyan, ucb: C.amber, thompson: C.green }[s] || g.PAL[k], pts = [], cv = S.curves[k]; for (var i = 0; i < S.T; i += 10) { var m = 0; for (var j = i; j < Math.min(S.T, i + 10); j++) m += cv[j]; pts.push([x0 + (i + 5) / S.T * w, y0 + h - m / 10 * h]); } var a = g.seg(p, .08 + k * .18, .26 + k * .18); g.path(pts, { color: c, lw: 3.5, glow: c, p: g.E.inOut(a) }); var fin = 0; for (var q = S.T - 50; q < S.T; q++) fin += cv[q] / 50; g.box(950, 230 + k * 76, 24, 24, { r: 6, fill: c, alpha: a }); g.text(names[s], 986, 242 + k * 76, { size: 20, weight: 700, color: c, alpha: a }); g.text(Math.round(fin * 100) + '% best arm by the end', 986, 268 + k * 76, { size: 15, color: C.muted, alpha: a }); });
        return;
      }
      var T = S.hist.length, k2 = Math.min(T - 1, Math.floor(T * Math.pow(g.seg(p, .08, .9), 1.6))), hs = S.hist[k2], cw = 146, x1 = 80;
      arms.forEach(function (pr, i) {
        var x = x1 + i * (cw + 14), on = hs.a === i, a = g.clamp(g.E.back(g.seg(p, .02 + i * .03, .1 + i * .03))), c = g.PAL[i % 8];
        g.box(x, 190, cw, 410, { r: 18, fill: on ? g.hexA(c, .16) : 'rgba(22,30,66,.6)', stroke: on ? c : 'rgba(120,140,220,.22)', lw: on ? 3 : 1.5, glow: on ? c : null, alpha: a });
        g.text('🎰', x + cw / 2, 236, { size: 36, align: 'center', alpha: a }); g.text('arm ' + (i + 1), x + cw / 2, 282, { size: 17, weight: 700, color: C.muted, align: 'center', alpha: a });
        var bh = 190, by = 520; g.box(x + 40, by - bh, cw - 80, bh, { r: 8, fill: 'rgba(40,52,100,.6)', alpha: a });
        g.box(x + 40, by - bh * hs.est[i], cw - 80, bh * hs.est[i], { r: 8, fill: g.hexA(c, .85), alpha: a });
        var tr = g.seg(p, .9, .96); g.line(x + 30, by - bh * pr, x + cw - 30, by - bh * pr, { color: C.white, lw: 3, dash: [6, 5], alpha: tr });
        g.text(nf(hs.est[i]), x + cw / 2, by + 26, { size: 19, weight: 700, mono: true, align: 'center', alpha: a });
        g.text(hs.cnt[i] + ' pulls', x + cw / 2, by + 56, { size: 16, mono: true, color: C.muted, align: 'center', alpha: a });
        if (on && k2 < T - 1) g.text(hs.r ? '+1 🎉' : '0', x + cw / 2, 312, { size: 20, weight: 800, color: hs.r ? C.green : C.muted, align: 'center' });
      });
      var regret = (k2 + 1) * arms[best] - hs.tot;
      side(g, p, 900, 190, 320, 410, [['pull ' + (k2 + 1), A, { mono: true, size: 24, w: 800 }], ['total reward ' + hs.tot, C.ink, { mono: true, size: 19 }], ['regret ≈ ' + nf(regret, 1), C.red, { mono: true, size: 19 }], ['bars: estimated win rate', C.muted, { size: 16, gap: 30 }], ['white dashes: true win rate', C.muted, { size: 16, a: g.seg(p, .9, .96) }], [mode === 'greedy' ? 'Greedy can lock onto a mediocre arm forever.' : mode === 'ucb' ? 'UCB adds a bonus to rarely tried arms: optimism under uncertainty.' : mode === 'thompson' ? 'Samples a plausible win rate for each arm and plays the best sample.' : 'Mostly exploit the best estimate; 10% of the time, explore at random.', C.ink, { size: 17, gap: 80 }]]);
    }
  });

  /* ---------- TD(0) vs Monte Carlo on the 5-state random walk ---------- */
  M.kit('random-walk', {
    init: function (P) {
      var alpha = P.alpha || .1, EP = 100, r = R(P.seed || 12), truth = [1, 2, 3, 4, 5].map(function (i) { return i / 6; });
      var rm = function (v) { return Math.sqrt(v.reduce(function (acc, x, q) { return acc + (x - truth[q]) * (x - truth[q]); }, 0) / 5); };
      var runOnce = function (rr, keep) { var td = [.5, .5, .5, .5, .5], mc = td.slice(), snaps = [], errs = [[], []], eps = [];
        for (var e = 0; e < EP; e++) { var s = 2, tr = [2]; while (s >= 0 && s <= 4) { s += rr() < .5 ? -1 : 1; tr.push(s); } var rew = s === 5 ? 1 : 0;
          for (var i = 0; i < tr.length - 1; i++) { var a = tr[i], b = tr[i + 1], tgt = b === 5 ? 1 : b < 0 ? 0 : td[b]; td[a] += alpha * (tgt - td[a]); }
          for (var j = 0; j < tr.length - 1; j++) mc[tr[j]] += alpha * (rew - mc[tr[j]]);
          errs[0].push(rm(td)); errs[1].push(rm(mc));
          if (keep) { snaps.push({ td: td.slice(), mc: mc.slice() }); eps.push(tr); } }
        return { snaps: snaps, errs: errs, eps: eps }; };
      var main = runOnce(r, true), avg = [new Float64Array(EP), new Float64Array(EP)];
      for (var run = 0; run < 100; run++) { var o = runOnce(r, false); for (var e2 = 0; e2 < EP; e2++) { avg[0][e2] += o.errs[0][e2] / 100; avg[1][e2] += o.errs[1][e2] / 100; } }
      return { main: main, avg: avg, truth: truth, EP: EP, alpha: alpha };
    },
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.orange, EP = S.EP, ef = EP * Math.pow(g.seg(p, .1, .9), 2), e = Math.min(EP - 1, Math.floor(ef)), sn = S.main.snaps[e], tr = S.main.eps[e], names = ['A', 'B', 'C', 'D', 'E'], a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || 'TD learning vs Monte Carlo', p, P.sub);
      var y = 222, x0 = 300, dx = 130;
      g.box(x0 - dx - 10, y - 28, 60, 56, { r: 12, fill: g.hexA(C.red, .25), stroke: C.red, alpha: a0 }); g.text('0', x0 - dx + 20, y + 1, { size: 20, weight: 800, align: 'center', alpha: a0 });
      g.box(x0 + 5 * dx - 10, y - 28, 60, 56, { r: 12, fill: g.hexA(C.green, .25), stroke: C.green, alpha: a0 }); g.text('+1', x0 + 5 * dx + 20, y + 1, { size: 20, weight: 800, align: 'center', alpha: a0 });
      names.forEach(function (nm, i) { var x = x0 + i * dx; g.circle(x + 20, y, 30, { fill: 'rgba(40,52,100,.8)', stroke: i === 2 ? C.amber : C.line, lw: 2, alpha: a0 }); g.text(nm, x + 20, y + 1, { size: 22, weight: 700, align: 'center', alpha: a0 }); g.line(x - dx + 52 + (i ? 0 : 20), y, x - 12, y, { color: C.line, lw: 2, alpha: a0 }); });
      g.line(x0 + 4 * dx + 52, y, x0 + 5 * dx - 12, y, { color: C.line, lw: 2, alpha: a0 });
      var ks = Math.min(tr.length - 1, Math.floor((ef - e) * tr.length)), ps = tr[ks], px = x0 + ps * dx + 20;
      if (p > .1 && p < .9) g.circle(px, y - 46, 10, { fill: A, glow: A });
      var bx = 110, by = 330, bw = 480, bh = 250, X = function (i) { return bx + 40 + i * (bw - 80) / 4; }, Y = function (v) { return by + bh - v * bh; };
      g.panel(bx - 30, by - 40, bw + 60, bh + 100, { alpha: a0 });
      g.line(bx, by + bh, bx + bw, by + bh, { color: '#56629c', lw: 2, alpha: a0 });
      names.forEach(function (nm, i) { g.text(nm, X(i), by + bh + 24, { size: 17, weight: 700, color: C.muted, align: 'center', alpha: a0 }); });
      g.path(S.truth.map(function (v, i) { return [X(i), Y(v)]; }), { color: C.white, lw: 2, dash: [6, 6], alpha: a0 });
      [[sn.td, C.cyan], [sn.mc, C.pink]].forEach(function (q) { var pts = q[0].map(function (v, i) { return [X(i), Y(v)]; }); g.path(pts, { color: q[1], lw: 3.5, glow: q[1], alpha: a0 }); pts.forEach(function (pt) { g.circle(pt[0], pt[1], 5, { fill: q[1], alpha: a0 }); }); });
      g.text('value estimates after episode ' + (e + 1) + '  (white: true values)', bx, by - 14, { size: 16, color: C.muted, alpha: a0 });
      var cx = 720, cy = 330, cw2 = 460, ch = 250, mx = .25;
      g.panel(cx - 30, cy - 40, cw2 + 60, ch + 100, { alpha: a0 });
      g.line(cx, cy + ch, cx + cw2, cy + ch, { color: '#56629c', lw: 2, alpha: a0 }); g.line(cx, cy, cx, cy + ch, { color: '#56629c', lw: 2, alpha: a0 });
      [[S.avg[0], C.cyan, 'TD(0)'], [S.avg[1], C.pink, 'Monte Carlo']].forEach(function (q, k) { var pts = []; for (var i = 0; i <= e; i++) pts.push([cx + i / (EP - 1) * cw2, cy + ch - Math.min(mx, q[0][i]) / mx * ch]); g.path(pts, { color: q[1], lw: 3, glow: q[1] }); g.box(cx + 230, cy + 10 + k * 30, 16, 16, { r: 4, fill: q[1] }); g.text(q[2] + '  ' + nf(q[0][e], 3), cx + 254, cy + 18 + k * 30, { size: 16, mono: true, color: q[1] }); });
      g.text('RMS error, average of 100 runs (α = ' + S.alpha + ')', cx, cy - 14, { size: 16, color: C.muted, alpha: a0 });
      g.text('episodes →', cx + cw2, cy + ch + 24, { size: 15, color: C.muted, align: 'right', alpha: a0 });
    }
  });

  /* ---------- cliff walking: SARSA vs Q-learning ---------- */
  M.kit('cliff', {
    init: function (P) {
      var cols = 12, rows = 4, r = R(P.seed || 3), EP = 500, alpha = .5, eps = .1;
      var step = function (s, a) { var x = Math.max(0, Math.min(cols - 1, s[0] + DIRS[a][0])), y = Math.max(0, Math.min(rows - 1, s[1] + DIRS[a][1])); if (y === 3 && x > 0 && x < 11) return [[0, 3], -100, false]; return [[x, y], -1, x === 11 && y === 3]; };
      var train = function (algo) { var Q = {}, rets = [], qk = function (s) { var k = s[0] + ',' + s[1]; return Q[k] || (Q[k] = [0, 0, 0, 0]); }, pick = function (s, e) { var q = qk(s); if (r() < e) return Math.floor(r() * 4); var m = Math.max.apply(null, q), b = []; q.forEach(function (v, i) { if (v === m) b.push(i); }); return b[Math.floor(r() * b.length)]; };
        for (var ep = 0; ep < EP; ep++) { var s = [0, 3], a = pick(s, eps), tot = 0; for (var n = 0; n < 500; n++) { var o = step(s, a), s2 = o[0], rw = o[1], done = o[2], a2 = pick(s2, eps); tot += rw; var tgt = rw + (done ? 0 : algo === 'sarsa' ? qk(s2)[a2] : Math.max.apply(null, qk(s2))); qk(s)[a] += alpha * (tgt - qk(s)[a]); s = s2; a = a2; if (done) break; } rets.push(tot); }
        var path = [[0, 3]], s3 = [0, 3], seen = { '0,3': 1 }; for (var k = 0; k < 40; k++) { var q = qk(s3), best = -Infinity, o2 = null; for (var a4 = 0; a4 < 4; a4++) { var o3 = step(s3, a4); if (seen[o3[0][0] + ',' + o3[0][1]] || o3[1] < -1) continue; if (q[a4] > best) { best = q[a4]; o2 = o3; } } if (!o2) break; s3 = o2[0]; seen[s3[0] + ',' + s3[1]] = 1; path.push(s3); if (o2[2]) break; }
        var sm = rets.map(function (_, i) { var lo = Math.max(0, i - 24), s4 = 0; for (var j = lo; j <= i; j++) s4 += rets[j]; return s4 / (i - lo + 1); });
        return { path: path, sm: sm }; };
      return { sarsa: train('sarsa'), ql: train('q'), cols: cols, rows: rows };
    },
    draw: function (g, p, P, S, t) {
      var C = g.C, cs = 60, x0 = 80, y0 = 200, a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || 'Cliff walking: SARSA vs Q-learning', p, P.sub);
      for (var y = 0; y < 4; y++) for (var x = 0; x < 12; x++) { var cliff = y === 3 && x > 0 && x < 11; g.box(x0 + x * cs + 2, y0 + y * cs + 2, cs - 4, cs - 4, { r: 8, fill: cliff ? g.hexA(C.red, .35) : 'rgba(40,52,100,.55)', alpha: a0 }); }
      g.text('THE CLIFF  (−100, back to start)', x0 + 6 * cs, y0 + 3.5 * cs + 1, { size: 17, weight: 800, color: C.red, align: 'center', alpha: a0, head: true });
      g.text('S', x0 + cs / 2, y0 + 3.5 * cs + 1, { size: 22, weight: 800, align: 'center', color: C.green, alpha: a0 }); g.text('G', x0 + 11.5 * cs, y0 + 3.5 * cs + 1, { size: 22, weight: 800, align: 'center', color: C.amber, alpha: a0 });
      [[S.sarsa, C.cyan, .1, -6], [S.ql, C.pink, .38, 6]].forEach(function (q) { var pts = q[0].path.map(function (s) { return [x0 + s[0] * cs + cs / 2 + q[3], y0 + s[1] * cs + cs / 2 + q[3]]; }); g.path(pts, { color: q[1], lw: 5, glow: q[1], p: g.E.inOut(g.seg(p, q[2], q[2] + .22)) }); });
      var cx = 880, cy = 210, cw = 320, ch = 220, lo = -100, hi = 0, Y = function (v) { return cy + ch - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * ch; };
      g.panel(cx - 44, cy - 34, cw + 64, ch + 74, { alpha: a0 });
      g.text('reward per episode (moving avg)', cx, cy - 12, { size: 15, color: C.muted, alpha: a0 });
      [-100, -75, -50, -25, 0].forEach(function (v) { g.text(String(v).replace('-', '−'), cx - 8, Y(v), { size: 13, mono: true, color: C.muted, align: 'right', alpha: a0 }); g.line(cx, Y(v), cx + cw, Y(v), { color: 'rgba(120,140,220,.1)', lw: 1, alpha: a0 }); });
      [[S.sarsa, C.cyan], [S.ql, C.pink]].forEach(function (q) { var pts = q[0].sm.map(function (v, i) { return [cx + i / 499 * cw, Y(v)]; }); g.path(pts, { color: q[1], lw: 2.5, p: g.seg(p, .1, .7) }); });
      g.text('episode 500', cx + cw, cy + ch + 20, { size: 13, color: C.muted, align: 'right', alpha: a0 });
      var la = g.E.out(g.seg(p, .6, .72)), sAvg = S.sarsa.sm[499], qAvg = S.ql.sm[499];
      g.panel(80, 480, 540, 180, { alpha: la, stroke: g.hexA(C.cyan, .6) }); g.panel(660, 480, 540, 180, { alpha: la, stroke: g.hexA(C.pink, .6) });
      g.text('SARSA (on-policy)', 104, 514, { size: 22, weight: 700, head: true, color: C.cyan, alpha: la }); g.text('Learns the value of the policy it actually follows, exploration included → prefers the safe path away from the edge. Avg reward ≈ ' + nf(sAvg, 0), 104, 584, { size: 18, alpha: la, maxW: 490, lh: 24, vcenter: true });
      g.text('Q-learning (off-policy)', 684, 514, { size: 22, weight: 700, head: true, color: C.pink, alpha: la }); g.text('Learns the optimal greedy path right along the edge — but random exploratory steps knock it off the cliff while training. Avg reward ≈ ' + nf(qAvg, 0), 684, 584, { size: 18, alpha: la, maxW: 490, lh: 24, vcenter: true });
    }
  });

  /* ---------- REINFORCE on a 4-action problem ---------- */
  M.kit('policy-grad', {
    init: function (P) {
      var means = P.means || [.2, .5, .9, .4], r = R(P.seed || 14), th = [0, 0, 0, 0], b = 0, lr = P.lr || .4, hist = [];
      var sm = function (v) { var m = Math.max.apply(null, v), e = v.map(function (x) { return Math.exp(x - m); }), s = e.reduce(function (a, x) { return a + x; }, 0); return e.map(function (x) { return x / s; }); };
      for (var i = 0; i < 160; i++) { var pi = sm(th), u = r(), a = 3, acc = 0; for (var k = 0; k < 4; k++) { acc += pi[k]; if (u < acc) { a = k; break; } } var u1 = 0; while (!u1) u1 = r(); var rw = means[a] + .25 * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * r()), adv = rw - b; hist.push({ pi: pi, a: a, r: rw, adv: adv }); for (var j = 0; j < 4; j++) th[j] += lr * adv * ((j === a ? 1 : 0) - pi[j]); b += .1 * (rw - b); }
      return { hist: hist, means: means };
    },
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.orange, H = S.hist, n = H.length, k = Math.min(n - 1, Math.floor(n * Math.pow(g.seg(p, .08, .92), 1.5))), h = H[k], names = P.actions || ['a₁', 'a₂', 'a₃', 'a₄'], a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || 'Policy gradient (REINFORCE)', p, P.sub);
      var x0 = 90, bw = 120, gap = 30, by = 540, bh = 300;
      h.pi.forEach(function (pr, i) { var x = x0 + i * (bw + gap), on = h.a === i, c = g.PAL[i]; g.box(x, by - bh, bw, bh, { r: 12, fill: 'rgba(40,52,100,.5)', alpha: a0 }); g.box(x, by - bh * pr, bw, bh * pr, { r: 12, fill: g.hexA(c, .85), glow: on ? c : null, alpha: a0 }); g.text(nf(pr), x + bw / 2, by - bh * pr - 18, { size: 19, weight: 700, mono: true, align: 'center', alpha: a0 }); g.text(names[i], x + bw / 2, by + 24, { size: 20, weight: 700, align: 'center', color: on ? c : C.muted, alpha: a0 }); g.text('avg reward ' + S.means[i], x + bw / 2, by + 50, { size: 14, color: C.muted, align: 'center', alpha: g.seg(p, .85, .92) }); if (on) { var up = h.adv > 0; g.text(up ? '▲' : '▼', x + bw / 2, by + 84, { size: 26, color: up ? C.green : C.red, align: 'center' }); } });
      g.text('π(a | s): probability of each action', x0, 214, { size: 17, color: C.muted, alpha: a0 });
      var cx = 720, cy = 200, cw = 490, ch = 190;
      g.panel(cx - 20, cy - 20, cw + 40, ch + 50, { alpha: a0 });
      for (var i = 0; i < 4; i++) { var pts = []; for (var j = 0; j <= k; j++) pts.push([cx + j / (n - 1) * cw, cy + ch - H[j].pi[i] * ch]); g.path(pts, { color: g.PAL[i], lw: 3 }); }
      g.text('probabilities over ' + n + ' updates', cx, cy + ch + 20, { size: 15, color: C.muted, alpha: a0 });
      side(g, p, 700, 450, 530, 220, [['update ' + (k + 1) + ':  took ' + names[h.a] + ', reward ' + nf(h.r), C.ink, { mono: true, size: 18 }], ['advantage = r − baseline = ' + nf(h.adv), h.adv > 0 ? C.green : C.red, { mono: true, size: 18 }], ['θ ← θ + α · (r − b) · ∇ log π(a)', A, { mono: true, size: 18, w: 700 }], ['Better than expected → make that action more likely', C.muted, { size: 16 }]]);
    }
  });

  /* ---------- cart-pole balancing ---------- */
  M.kit('cartpole', {
    init: function (P) {
      var r = R(P.seed || 2), trained = P.mode !== 'random', frames = [], ep = 1, st = 0, w = [.1, .3, 3, 1], reset = function () { return [(r() - .5) * .1, (r() - .5) * .1, (r() - .5) * .1, (r() - .5) * .1]; }, s = reset(), falls = [];
      for (var i = 0; i < 900; i++) {
        var a = trained ? ((w[0] * s[0] + w[1] * s[1] + w[2] * s[2] + w[3] * s[3]) > 0 ? 1 : -1) : (r() < .5 ? 1 : -1), f = a * 10, ct = Math.cos(s[2]), sn = Math.sin(s[2]), tmp = (f + .05 * s[3] * s[3] * sn) / 1.1, tha = (9.8 * sn - ct * tmp) / (.5 * (4 / 3 - .1 * ct * ct / 1.1)), xa = tmp - .05 * tha * ct / 1.1;
        s = [s[0] + .02 * s[1], s[1] + .02 * xa, s[2] + .02 * s[3], s[3] + .02 * tha]; st++;
        frames.push({ s: s.slice(), a: a, ep: ep, st: st });
        if (Math.abs(s[0]) > 2.4 || Math.abs(s[2]) > .2095) { falls.push(st); ep++; st = 0; s = reset(); }
      }
      return { frames: frames, falls: falls, trained: trained };
    },
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.orange, k = Math.min(S.frames.length - 1, Math.floor(g.seg(p, .04, .98) * (S.frames.length - 1))), fr = S.frames[k], s = fr.s, a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || (S.trained ? 'A trained policy balancing a pole' : 'A random policy on cart-pole'), p, P.sub);
      var tx0 = 110, tx1 = 830, ty = 540, sc = (tx1 - tx0) / 4.8, cx = (tx0 + tx1) / 2 + s[0] * sc;
      g.line(tx0, ty + 26, tx1, ty + 26, { color: '#56629c', lw: 4, alpha: a0 }); [-2.4, 2.4].forEach(function (b) { var bx = (tx0 + tx1) / 2 + b * sc; g.line(bx, ty - 10, bx, ty + 40, { color: C.red, lw: 3, alpha: a0 }); });
      g.box(cx - 55, ty - 10, 110, 36, { r: 10, fill: '#3b4a8a', stroke: C.blue, lw: 2, alpha: a0 }); g.circle(cx - 32, ty + 28, 9, { fill: '#1b2550', stroke: C.muted, alpha: a0 }); g.circle(cx + 32, ty + 28, 9, { fill: '#1b2550', stroke: C.muted, alpha: a0 });
      var L = 250, px = cx + Math.sin(s[2]) * L, py = ty - 10 - Math.cos(s[2]) * L, danger = Math.abs(s[2]) > .15;
      g.line(cx, ty - 10, px, py, { color: danger ? C.red : A, lw: 12, glow: danger ? C.red : A, alpha: a0 }); g.circle(cx, ty - 10, 8, { fill: C.white, alpha: a0 });
      g.arrow(cx + fr.a * 60, ty + 8, cx + fr.a * 130, ty + 8, { color: C.cyan, lw: 5, head: 14, glow: C.cyan, alpha: a0 });
      side(g, p, 880, 180, 340, 480, [['episode ' + fr.ep + ' · step ' + fr.st, A, { mono: true, size: 21, w: 800 }], ['state s:', C.muted, { size: 16, gap: 34 }], ['x  = ' + nf(s[0]) + ' m', C.ink, { mono: true, size: 18, gap: 32 }], ['ẋ  = ' + nf(s[1]) + ' m/s', C.ink, { mono: true, size: 18, gap: 32 }], ['θ  = ' + nf(s[2] * 180 / Math.PI, 1) + '°', danger ? C.red : C.ink, { mono: true, size: 18, gap: 32 }], ['θ̇  = ' + nf(s[3]) + ' rad/s', C.ink, { mono: true, size: 18 }], ['action: push ' + (fr.a > 0 ? 'right →' : '← left'), C.cyan, { size: 18, w: 700 }], ['reward: +1 for every step upright', C.green, { size: 17 }], [S.trained ? 'Balanced ' + fr.st + ' steps and counting' : 'Falls after ' + (S.falls.length ? Math.round(S.falls.reduce(function (a, b) { return a + b; }, 0) / S.falls.length) : '—') + ' steps on average', S.trained ? C.green : C.red, { size: 18, w: 700 }]]);
    }
  });

  /* ---------- DQN: network, replay buffer, target network ---------- */
  M.kit('dqn', {
    draw: function (g, p, P, S, t) {
      var C = g.C, A = P.accent || C.orange, mode = P.mode || 'net', a0 = g.E.out(g.seg(p, 0, .08));
      g.heading(P.head || { net: 'Deep Q-Network', replay: 'Experience replay', target: 'The target network' }[mode], p, P.sub);
      if (mode === 'net') {
        for (var f = 0; f < 4; f++) { var x = 70 + f * 18, y = 230 + f * 18, a = g.E.out(g.seg(p, .04 + f * .04, .12 + f * .04)); g.box(x, y, 170, 170, { r: 8, fill: '#0d1330', stroke: C.muted, lw: 1.5, alpha: a }); g.box(x + 16, y + 40 + f * 6, 8, 40, { r: 2, fill: C.white, alpha: a }); g.box(x + 146, y + 70 - f * 4, 8, 40, { r: 2, fill: C.white, alpha: a }); g.circle(x + 60 + f * 14, y + 60 + f * 10, 6, { fill: C.amber, alpha: a }); }
        g.text('4 stacked frames = the state', 190, 480, { size: 17, color: C.muted, align: 'center', alpha: a0 });
        var layers = [['conv', 150, C.cyan], ['conv', 120, C.cyan], ['conv', 96, C.cyan], ['dense 512', 200, C.violet]], lp = g.seg(p, .2, .6) * 4;
        layers.forEach(function (l, k) { var x = 380 + k * 125, h = l[1], on = lp > k; g.box(x, 330 - h / 2, 70, h, { r: 10, fill: g.hexA(l[2], on ? .3 : .08), stroke: l[2], lw: 2, glow: on && lp < k + 1 ? l[2] : null, alpha: a0 }); g.text(l[0], x + 35, 330 + h / 2 + 22, { size: 15, color: C.muted, align: 'center', alpha: a0 }); if (k < 3) g.arrow(x + 76, 330, x + 119, 330, { color: on ? l[2] : C.line, lw: 3, head: 9, alpha: a0 }); });
        g.arrow(300, 330, 372, 330, { color: C.cyan, lw: 3, head: 9, alpha: a0 });
        var q = P.q || [1.2, 2.7, .4], acts = P.actions || ['stay', 'up', 'down'], qa = g.E.out(g.seg(p, .6, .72)), best = q.indexOf(Math.max.apply(null, q));
        g.arrow(831, 330, 900, 330, { color: C.violet, lw: 3, head: 9, alpha: qa });
        q.forEach(function (v, i) { var y = 250 + i * 80, on = i === best && p > .76; g.box(910, y, 280, 60, { r: 12, fill: on ? g.hexA(C.green, .25) : 'rgba(30,40,84,.6)', stroke: on ? C.green : null, glow: on ? C.green : null, alpha: qa }); g.text('Q(s, ' + acts[i] + ')', 930, y + 30, { size: 19, mono: true, alpha: qa }); g.text(nf(v, 1), 1170, y + 30, { size: 22, weight: 800, mono: true, color: on ? C.green : C.ink, align: 'right', alpha: qa }); });
        g.text('One forward pass scores every action; the agent picks the argmax', 640, 620, { size: 21, color: C.ink, align: 'center', alpha: g.seg(p, .76, .86) });
        return;
      }
      if (mode === 'replay') {
        var N = 18, cx = 640, cy = 420, R0 = 190, fill = Math.min(N, Math.floor(g.seg(p, .05, .5) * 30)), mb = [2, 7, 11, 15], ms = g.seg(p, .55, .9);
        g.box(50, 250, 200, 140, { r: 20, fill: g.hexA(C.cyan, .14), stroke: C.cyan, lw: 2, alpha: a0 }); g.text('Environment', 150, 320, { size: 22, weight: 700, head: true, align: 'center', alpha: a0 });
        g.box(1030, 250, 200, 140, { r: 20, fill: g.hexA(A, .14), stroke: A, lw: 2, alpha: a0 }); g.text('Learner', 1130, 306, { size: 22, weight: 700, head: true, align: 'center', alpha: a0 }); g.text('Q-network', 1130, 338, { size: 16, color: C.muted, align: 'center', alpha: a0 });
        for (var i = 0; i < N; i++) { var an = -Math.PI / 2 + i / N * Math.PI * 2, x2 = cx + Math.cos(an) * R0 * 1.3, y2 = cy + Math.sin(an) * R0 * .75, has = i < fill || fill >= N, sel = ms > 0 && mb.indexOf(i) >= 0; g.box(x2 - 27, y2 - 17, 54, 34, { r: 8, fill: sel ? g.hexA(C.amber, .5) : has ? g.hexA(C.cyan, .3) : 'rgba(30,40,84,.6)', stroke: sel ? C.amber : null, glow: sel ? C.amber : null, alpha: a0 }); if (has) g.text('s,a,r,s′', x2, y2 + 1, { size: 11, mono: true, align: 'center', alpha: a0 }); }
        g.text('Replay buffer', cx, cy - 10, { size: 24, weight: 700, head: true, align: 'center', alpha: a0 }); g.text(fill >= N ? 'up to 1,000,000 transitions' : fill + ' transitions', cx, cy + 24, { size: 16, mono: true, color: C.muted, align: 'center', alpha: a0 });
        var ph = (t * .7) % 1; if (p < .55) g.circle(g.lerp(260, cx - 80, ph), g.lerp(320, cy - 60, ph), 9, { fill: C.cyan, glow: C.cyan });
        if (ms > 0) { mb.forEach(function (i, k) { var an = -Math.PI / 2 + i / N * Math.PI * 2, x3 = cx + Math.cos(an) * R0 * 1.3, y3 = cy + Math.sin(an) * R0 * .75, f2 = g.E.inOut(g.clamp(ms * 1.4 - k * .1)); if (f2 < 1) g.circle(g.lerp(x3, 1020, f2), g.lerp(y3, 320, f2), 8, { fill: C.amber, glow: C.amber }); }); g.text('a random minibatch breaks the correlation between consecutive steps', 640, 680, { size: 19, color: C.amber, align: 'center', alpha: ms }); }
        else g.text('every step: store (state, action, reward, next state)', 640, 680, { size: 19, color: C.cyan, align: 'center', alpha: a0 });
        return;
      }
      var C2 = P.every || 1000, stepN = Math.floor(g.seg(p, .05, .95) * 3.2 * C2), syncs = Math.floor(stepN / C2), sinceSync = stepN - syncs * C2, flash = sinceSync < C2 * .08 && syncs > 0;
      [[260, 'Online network', 'θ — updated every step', A], [1020, 'Target network', 'θ⁻ — frozen copy', C.violet]].forEach(function (nw, k) {
        g.box(nw[0] - 170, 220, 340, 220, { r: 24, fill: g.hexA(nw[3], .12), stroke: nw[3], lw: 2.5, glow: k && flash ? nw[3] : null, alpha: a0 });
        g.text(nw[1], nw[0], 262, { size: 24, weight: 700, head: true, align: 'center', alpha: a0 }); g.text(nw[2], nw[0], 296, { size: 17, color: C.muted, align: 'center', alpha: a0 });
        for (var l = 0; l < 4; l++) for (var j = 0; j < 4; j++) { var jitter = k ? syncs * .7 : stepN * .004; g.circle(nw[0] - 105 + l * 70, 340 + j * 22, 7, { fill: g.hexA(nw[3], .45 + .4 * Math.abs(Math.sin(jitter + l * 1.3 + j))), alpha: a0 }); }
      });
      g.arrow(440, 330, 840, 330, { color: flash ? C.white : C.line, lw: flash ? 5 : 3, head: 14, glow: flash ? C.violet : null, alpha: a0 }); g.text(flash ? 'copy θ → θ⁻' : 'copy every ' + C2.toLocaleString('en-US') + ' steps', 640, 306, { size: 18, weight: 700, color: flash ? C.white : C.muted, align: 'center', alpha: a0 });
      g.text('step ' + stepN.toLocaleString('en-US'), 640, 480, { size: 22, mono: true, align: 'center', color: C.amber, alpha: a0 });
      g.panel(140, 520, 1000, 120, { alpha: a0 });
      g.text('loss = ( r + γ · maxₐ′ Q(s′, a′; θ⁻) − Q(s, a; θ) )²', 640, 562, { size: 23, weight: 700, mono: true, align: 'center', alpha: a0 });
      g.text('The target uses the frozen θ⁻, so it does not shift with every update — training stays stable.', 640, 604, { size: 18, color: C.muted, align: 'center', alpha: a0 });
    }
  });
})(window.Motion);
