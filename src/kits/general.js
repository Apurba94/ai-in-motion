/* AI in Motion — general scene kits. © Janin A Apurba, CSE, AUST */
(function (M) {
  'use strict';
  var hash = function (s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  var ACC = function (P, g) { return P.accent || g.C.cyan; };
  var col = function (g, c, k) { return c ? (g.C[c] || c) : g.PAL[k % g.PAL.length]; };
  var splitTerm = function (s) { var m = String(s).split(/\s+—\s+/); return m.length > 1 ? [m[0], m.slice(1).join(' — ')] : [null, s]; };

  /* Title card with a living neural-network backdrop */
  M.kit('title', {
    init: function (P, g) {
      var r = g.rng(hash(P.title)), nodes = [], edges = [];
      for (var i = 0; i < 34; i++) nodes.push([700 + r() * 540, 80 + r() * 560, 2 + r() * 4, r() * 6.28]);
      nodes.forEach(function (a, i) { nodes.forEach(function (b, j) { if (j > i && Math.hypot(a[0] - b[0], a[1] - b[1]) < 150) edges.push([i, j, r()]); }); });
      return { nodes: nodes, edges: edges };
    },
    draw: function (g, p, P, S, t) {
      var A = ACC(P, g), a = g.E.out(g.seg(p, 0, .3));
      S.edges.forEach(function (e) {
        var n1 = S.nodes[e[0]], n2 = S.nodes[e[1]];
        g.line(n1[0], n1[1], n2[0], n2[1], { color: g.hexA(A, .22), lw: 1.2, alpha: a });
        var f = (t * .35 + e[2]) % 1; g.circle(g.lerp(n1[0], n2[0], f), g.lerp(n1[1], n2[1], f), 2.4, { fill: A, alpha: a * .8, glow: A, blur: 10 });
      });
      S.nodes.forEach(function (n) { g.circle(n[0], n[1] + Math.sin(t + n[3]) * 4, n[2] + 1.5, { fill: A, alpha: a * (.5 + .5 * Math.sin(t * 1.5 + n[3])), glow: A }); });
      var ta = g.E.out(g.seg(p, .04, .22));
      if (P.track) g.pill(96, 232, P.track.toUpperCase(), { fill: A, size: 16, alpha: ta });
      var h = g.text(P.title, 96, 316 + (1 - ta) * 40, { size: P.size || 64, weight: 700, head: true, alpha: ta, maxW: 760, lh: (P.size || 64) * 1.12 });
      var ua = g.E.out(g.seg(p, .18, .4)); g.box(96, 316 + h - 18, 180 * ua, 6, { r: 3, fill: A, glow: A });
      if (P.sub) g.text(P.sub, 98, 316 + h + 34, { size: 25, color: g.C.muted, alpha: g.E.out(g.seg(p, .24, .45)), maxW: 700, lh: 34 });
    }
  });

  /* Bullet points appearing one by one; style 'recap' uses check marks */
  M.kit('bullets', {
    draw: function (g, p, P, S, t) {
      var A = ACC(P, g), items = P.items || [], n = items.length, recap = P.style === 'recap';
      g.heading(P.head || (recap ? 'Key takeaways' : ''), p, P.sub);
      var top = P.sub ? 190 : 168, rowH = Math.min(92, (660 - top) / Math.max(1, n));
      items.forEach(function (it, k) {
        var st = .1 + k * (.62 / Math.max(1, n)), a = g.E.out(g.seg(p, st, st + .12)); if (a <= 0) return;
        var y = top + k * rowH + rowH / 2, x = 96 + (1 - a) * 40, c = recap ? g.C.green : col(g, null, k);
        g.panel(x - 8, y - rowH / 2 + 6, 1070, rowH - 12, { alpha: a * .9, r: 16 });
        if (recap) { g.circle(x + 30, y, 17, { fill: c, alpha: a }); g.path([[x + 22, y], [x + 28, y + 7], [x + 39, y - 7]], { color: g.C.bg, lw: 4, alpha: a }); }
        else { g.circle(x + 30, y, 19, { fill: g.hexA(c, .18), stroke: c, lw: 2, alpha: a }); g.text(String(k + 1), x + 30, y + 1, { size: 18, weight: 800, color: c, align: 'center', alpha: a, head: true }); }
        var parts = splitTerm(it), tx = x + 66;
        if (parts[0]) { var w = g.text(parts[0], tx, y, { size: 26, weight: 700, color: c, alpha: a, head: true }); tx += w + 14; g.text(parts[1], tx, y, { size: 23, color: g.C.ink, alpha: a, maxW: 1040 - (tx - x), vcenter: true, lh: 28 }); }
        else g.text(parts[1], tx, y, { size: 25, color: g.C.ink, alpha: a, maxW: 970, vcenter: true, lh: 30 });
      });
    }
  });

  /* Two columns compared side by side */
  M.kit('compare', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || '', p, P.sub);
      [P.left, P.right].forEach(function (side, s) {
        if (!side) return;
        var x = s ? 668 : 72, c = col(g, side.color, s ? 1 : 0), a = g.E.out(g.seg(p, .06 + s * .08, .24 + s * .08));
        g.panel(x, 170 + (1 - a) * 30, 540, 500, { alpha: a, stroke: g.hexA(c, .5) });
        g.box(x, 170 + (1 - a) * 30, 540, 64, { r: 20, fill: g.hexA(c, .2), alpha: a });
        g.text(side.title, x + 30, 202 + (1 - a) * 30, { size: 28, weight: 700, head: true, color: c, alpha: a });
        (side.items || []).forEach(function (it, k) {
          var st = .25 + k * .1 + s * .05, b = g.E.out(g.seg(p, st, st + .1)); if (b <= 0) return;
          var y = 280 + k * 76;
          g.circle(x + 36, y, 6, { fill: c, alpha: b, glow: c });
          g.text(it, x + 58, y, { size: 22, alpha: b, maxW: 460, vcenter: true, lh: 27 });
        });
      });
      if (P.vs !== false) g.text('VS', 640, 420, { size: 30, weight: 800, head: true, color: g.C.muted, align: 'center', alpha: g.seg(p, .2, .3) });
    }
  });

  /* A pipeline of steps with a travelling packet */
  M.kit('pipeline', {
    draw: function (g, p, P, S, t) {
      var A = ACC(P, g), steps = P.steps || [], n = steps.length, gap = 34, w = Math.min(210, (1136 - (n - 1) * gap) / n), x0 = (1280 - (n * w + (n - 1) * gap)) / 2, y = P.desc ? 300 : 360, h = 120;
      g.heading(P.head || '', p, P.sub);
      var prog = g.seg(p, .08, .9) * n, active = Math.min(n - 1, Math.floor(prog));
      steps.forEach(function (s, k) {
        var x = x0 + k * (w + gap), on = prog >= k, cur = k === active, c = col(g, null, k), a = g.E.back(g.seg(p, .04 + k * .04, .14 + k * .04));
        g.box(x, y - h / 2 + (1 - a) * 20, w, h, { r: 20, fill: on ? g.hexA(c, cur ? .3 : .16) : 'rgba(30,40,80,.6)', stroke: on ? c : g.C.line, lw: cur ? 3 : 1.5, glow: cur ? c : null, alpha: a });
        g.text(String(k + 1).padStart(2, '0'), x + 18, y - h / 2 + 24, { size: 15, weight: 700, mono: true, color: on ? c : g.C.muted, alpha: a });
        g.text(s, x + w / 2, y + 10, { size: w < 170 ? 19 : 22, weight: 700, head: true, align: 'center', color: on ? g.C.ink : g.C.muted, maxW: w - 24, vcenter: true, lh: 25, alpha: a });
        if (k < n - 1) g.arrow(x + w + 4, y, x + w + gap - 4, y, { color: prog > k + .5 ? c : g.C.line, lw: 3, head: 9, alpha: a });
      });
      if (prog > 0 && prog < n) { var f = prog - Math.floor(prog), kx = x0 + active * (w + gap); g.circle(kx + w / 2 + (f > .75 ? (f - .75) * 4 * (w / 2 + gap) : 0), y + h / 2 + 22, 7, { fill: A, glow: A }); }
      if (P.desc && P.desc[active]) {
        var da = g.E.out(g.seg(prog - active, 0, .25));
        g.panel(140, 470, 1000, 150, { alpha: da });
        g.text(steps[active], 180, 510, { size: 24, weight: 700, head: true, color: col(g, null, active), alpha: da });
        g.text(P.desc[active], 180, 560, { size: 23, alpha: da, maxW: 920, lh: 30 });
      }
    }
  });

  /* Circular process with a rotating highlight */
  M.kit('cycle', {
    draw: function (g, p, P, S, t) {
      var steps = P.steps || ['Step 1', 'Step 2', 'Step 3'], n = steps.length, cx = 640, cy = 410, R = 215;
      g.heading(P.head || '', p, P.sub);
      var prog = g.seg(p, .1, .92) * n, active = Math.min(n - 1, Math.floor(prog)), a0 = g.E.out(g.seg(p, 0, .15));
      g.circle(cx, cy, R, { stroke: g.C.line, lw: 2, dash: [8, 10], alpha: a0 });
      var ang = -Math.PI / 2 + (prog / n) * Math.PI * 2;
      g.ctx.save(); g.ctx.globalAlpha *= a0; g.ctx.strokeStyle = ACC(P, g); g.ctx.lineWidth = 5; g.ctx.shadowColor = ACC(P, g); g.ctx.shadowBlur = 16;
      g.ctx.beginPath(); g.ctx.arc(cx, cy, R, -Math.PI / 2, ang); g.ctx.stroke(); g.ctx.restore();
      steps.forEach(function (s, k) {
        var a = -Math.PI / 2 + k * Math.PI * 2 / n, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), c = col(g, null, k), on = prog >= k, cur = k === active;
        var b = g.E.back(g.seg(p, .02 + k * .03, .12 + k * .03));
        g.circle(x, y, (cur ? 62 : 54) * b, { fill: on ? g.hexA(c, cur ? .35 : .18) : 'rgba(30,40,80,.9)', stroke: on ? c : g.C.line, lw: cur ? 3 : 2, glow: cur ? c : null });
        g.text(s, x, y, { size: 18, weight: 700, head: true, align: 'center', maxW: 104, vcenter: true, lh: 21, alpha: b, color: on ? g.C.ink : g.C.muted });
      });
      var c2 = col(g, null, active), ca = g.E.out(g.seg(prog - active, 0, .3));
      g.text(steps[active] || '', cx, cy - 20, { size: 30, weight: 700, head: true, align: 'center', color: c2, alpha: ca, maxW: 300, vcenter: true, lh: 34 });
      if (P.desc && P.desc[active]) g.text(P.desc[active], cx, cy + 40, { size: 18, color: g.C.muted, align: 'center', alpha: ca, maxW: 300, lh: 23 });
    }
  });

  /* Nested circles: AI ⊃ ML ⊃ DL ... */
  M.kit('nested', {
    draw: function (g, p, P, S, t) {
      var rings = P.rings || [], n = rings.length;
      g.heading(P.head || '', p, P.sub);
      rings.forEach(function (r, k) {
        var st = .06 + k * (.6 / n), a = g.E.back(g.seg(p, st, st + .14)); if (a <= 0) return;
        var R = (250 - k * (200 / n)) * a, cy = 690 - 250 + (250 - 250 + k * (200 / n)) - 0, c = col(g, r.color, k);
        var cyk = 440 + k * (200 / n) * .55;
        g.circle(640, cyk, R, { fill: g.hexA(c, .1), stroke: c, lw: 2.5, glow: c, blur: 12 });
        g.text(r.label || r, 640, cyk - R + 32, { size: 22, weight: 700, head: true, align: 'center', color: c, alpha: a });
        if (r.note) g.text(r.note, 1000, 250 + k * 90, { size: 20, color: g.C.ink, alpha: g.seg(p, st + .1, st + .2), maxW: 250, lh: 25 });
        void cy;
      });
    }
  });

  /* Timeline of events */
  M.kit('timeline', {
    draw: function (g, p, P, S, t) {
      var ev = P.events || [], n = ev.length, x0 = 110, x1 = 1170, y = 420;
      g.heading(P.head || '', p, P.sub);
      var lp = g.E.inOut(g.seg(p, .04, .9));
      g.line(x0, y, x1, y, { color: g.C.line, lw: 4 });
      g.line(x0, y, x0 + (x1 - x0) * lp, y, { color: ACC(P, g), lw: 4, glow: ACC(P, g) });
      ev.forEach(function (e, k) {
        var x = x0 + (n === 1 ? .5 : k / (n - 1)) * (x1 - x0), on = lp * (n - 1) >= k - .02, up = k % 2 === 0, c = col(g, null, k);
        var cur = on && (k === n - 1 || lp * (n - 1) < k + 1);
        g.circle(x, y, cur ? 13 : 9, { fill: on ? c : g.C.faint, glow: on ? c : null, stroke: on ? null : g.C.line });
        if (!on) return;
        var a = g.E.out(g.seg(lp * (n - 1) - k, 0, .5)), dy = up ? -1 : 1;
        g.line(x, y + dy * 14, x, y + dy * 60, { color: c, lw: 2, alpha: a });
        g.text(e[0], x, y + dy * 84, { size: 24, weight: 800, head: true, color: c, align: 'center', alpha: a });
        g.text(e[1], x, y + dy * (up ? 150 : 124), { size: 17, align: 'center', alpha: a, maxW: 150, vcenter: up, lh: 21, color: cur ? g.C.ink : g.C.muted });
      });
    }
  });

  /* An equation assembled piece by piece, with notes */
  M.kit('equation', {
    draw: function (g, p, P, S, t) {
      var parts = P.parts || [], n = parts.length, size = P.size || 60;
      g.heading(P.head || '', p, P.sub);
      var widths = parts.map(function (q) { return g.measure(q.t, { size: size, weight: 600, mono: true }); }), total = widths.reduce(function (a, b) { return a + b; }, 0);
      var x = 640 - total / 2, y = P.y || 330, rev = g.seg(p, .05, .5) * n, notes = [];
      parts.forEach(function (q, k) {
        var a = g.E.out(g.clamp(rev - k)), c = col(g, q.c, k);
        if (q.note) notes.push({ k: k, x: x + widths[k] / 2, c: c, note: q.note, at: k });
        g.text(q.t, x, y - (1 - a) * 20, { size: size, weight: 600, mono: true, color: q.c ? c : g.C.ink, alpha: a, glow: q.c && a > .9 ? g.hexA(c, .6) : null, blur: 10 });
        x += widths[k];
      });
      var noted = notes.filter(function (q) { return rev >= q.at + .5; });
      if (noted.length) {
        var cyc = p < .55 ? noted.length - 1 : Math.min(noted.length - 1, Math.floor(g.seg(p, .55, .98) * noted.length)), q = noted[cyc];
        g.arrow(q.x, 460, q.x, y + size * .55, { color: q.c, lw: 3, head: 11 });
        g.panel(200, 470, 880, 110, { stroke: g.hexA(q.c, .6) });
        g.text(q.note, 640, 525, { size: 25, align: 'center', maxW: 820, vcenter: true, lh: 31 });
      }
      if (P.below) g.text(P.below, 640, 640, { size: 22, color: g.C.muted, align: 'center', alpha: g.seg(p, .5, .6), mono: !!P.monoBelow, maxW: 1100 });
    }
  });

  /* Animated bar chart */
  M.kit('bars', {
    draw: function (g, p, P, S, t) {
      var L = P.labels || [], V = P.values || [], n = L.length, max = P.max || Math.max.apply(null, V) * 1.15;
      g.heading(P.head || '', p, P.sub);
      var x0 = 150, x1 = 1170, y0 = 190, y1 = 590, bw = (x1 - x0) / n;
      g.axes(x0, y0, x1 - x0, y1 - y0, { yl: P.unit || '', alpha: g.seg(p, 0, .1) });
      if (P.ref) { var ry = y1 - (y1 - y0) * P.ref.v / max; g.line(x0, ry, x1, ry, { color: g.C.amber, dash: [8, 8], lw: 2, alpha: g.seg(p, .6, .7) }); g.text(P.ref.label, x1, ry - 16, { size: 17, color: g.C.amber, align: 'right', alpha: g.seg(p, .6, .7) }); }
      L.forEach(function (l, k) {
        var st = .08 + k * (.5 / n), a = g.E.out(g.seg(p, st, st + .22)), v = V[k] * a, h = (y1 - y0) * v / max, x = x0 + k * bw + bw * .18, w = bw * .64;
        var c = P.hl != null ? (k === P.hl ? g.C.pink : g.C.cyan) : col(g, null, k);
        g.box(x, y1 - h, w, h, { r: 8, fill: g.hexA(c, .85), glow: c, blur: 12 });
        if (a > 0) g.text((P.dec ? v.toFixed(P.dec) : Math.round(v)) + (P.suffix || ''), x + w / 2, y1 - h - 22, { size: 22, weight: 700, align: 'center', mono: true, alpha: a });
        g.text(l, x + w / 2, y1 + 30, { size: n > 7 ? 15 : 18, align: 'center', color: g.C.muted, maxW: bw - 8, lh: 20, alpha: g.seg(p, 0, .12) });
      });
    }
  });

  /* A definition card with a typewriter effect */
  M.kit('definition', {
    draw: function (g, p, P, S, t) {
      var A = ACC(P, g), a = g.E.out(g.seg(p, 0, .15));
      g.pill(640, 190, (P.kicker || 'DEFINITION').toUpperCase(), { fill: A, align: 'center', size: 16, alpha: a });
      g.text(P.term, 640, 270, { size: 64, weight: 700, head: true, align: 'center', alpha: a, glow: g.hexA(A, .5) });
      var d = String(P.def || ''), n = Math.floor(d.length * g.seg(p, .12, .65));
      g.panel(160, 330, 960, P.eg ? 190 : 250, { alpha: a });
      g.text(d.slice(0, n) + (n < d.length && Math.floor(t * 3) % 2 ? '▍' : ''), 640, P.eg ? 425 : 455, { size: 28, align: 'center', maxW: 880, vcenter: true, lh: 38, alpha: a });
      if (P.eg) g.text('Example: ' + P.eg, 640, 580, { size: 22, color: g.C.muted, align: 'center', maxW: 1000, alpha: g.seg(p, .65, .75) });
    }
  });
})(window.Motion);
