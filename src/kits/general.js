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
      if (total > 1140) { size = Math.floor(size * 1140 / total); widths = parts.map(function (q) { return g.measure(q.t, { size: size, weight: 600, mono: true }); }); total = widths.reduce(function (a, b) { return a + b; }, 0); } // shrink long formulas to fit
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
      var ts = Math.min(64, Math.floor(64 * 1160 / Math.max(1, g.measure(P.term || '', { size: 64, weight: 700, head: true }))));
      g.text(P.term, 640, 270, { size: ts, weight: 700, head: true, align: 'center', alpha: a, glow: g.hexA(A, .5) });
      var d = String(P.def || ''), n = Math.floor(d.length * g.seg(p, .12, .65));
      g.panel(160, 330, 960, P.eg ? 190 : 250, { alpha: a });
      g.text(d.slice(0, n) + (n < d.length && Math.floor(t * 3) % 2 ? '▍' : ''), 640, P.eg ? 425 : 455, { size: 28, align: 'center', maxW: 880, vcenter: true, lh: 38, alpha: a });
      if (P.eg) g.text('Example: ' + P.eg, 640, 580, { size: 22, color: g.C.muted, align: 'center', maxW: 1000, alpha: g.seg(p, .65, .75) });
    }
  });

  /* ---------- deep-dive kits: code, tables, diagrams, plots, questions, numbers ---------- */
  var KW = /^(def|return|for|in|if|elif|else|import|from|as|class|while|with|lambda|None|True|False|yield|and|or|not|try|except|raise|pass|break|continue|async|await|const|let|var|function|new|self|FROM|RUN|COPY|CMD|WORKDIR|EXPOSE|ENV|ENTRYPOINT|ARG)$/;
  var TOK = /(#.*$|\/\/.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|(\b\d+(?:\.\d+)?(?:e-?\d+)?\b)|([A-Za-z_][\w.]*)|(\s+)|([^\s\w])/g;
  function tokens(line) {
    var out = [], m; TOK.lastIndex = 0;
    while ((m = TOK.exec(line))) {
      var s = m[0], kind = m[1] ? 'com' : m[2] ? 'str' : m[3] ? 'num' : m[4] ? (KW.test(s) ? 'kw' : line.charAt(TOK.lastIndex) === '(' ? 'fn' : line.charAt(TOK.lastIndex) === ':' && /^\s*-?\s*[\w-]+$/.test(line.slice(0, TOK.lastIndex)) ? 'key' : 'id') : 'plain';
      out.push([s, kind]); if (!s) break;
    }
    return out;
  }
  var TC = { com: '#6f7aa3', str: '#86efac', num: '#fbbf24', kw: '#f472b6', fn: '#22d3ee', key: '#60a5fa', id: '#eef1ff', plain: '#b8c1e6' };

  /* Code listing typed out, then walked through line by line */
  M.kit('code', {
    init: function (P) { return { toks: (P.lines || []).map(tokens) }; },
    draw: function (g, p, P, S, t) {
      var A = ACC(P, g), lines = P.lines || ['# code'], n = lines.length, hl = P.hl || [], notes = P.notes || [], toks = S.toks || lines.map(tokens);
      if (P.head) g.heading(P.head, p, P.sub);
      var top = P.head ? (P.sub ? 170 : 150) : 70, noteH = notes.length ? 104 : 0, bottom = 690 - noteH;
      var size = P.size || Math.max(14, Math.min(23, Math.floor((bottom - top - 76) / Math.max(1, n) / 1.42))), maxLen = lines.reduce(function (m, l) { return Math.max(m, l.length); }, 1);
      var fitW = g.measure('M', { size: size, mono: true, weight: 500 }) * maxLen; if (fitW > 1030) size = Math.max(12, Math.floor(size * 1030 / fitW));
      var lh = size * 1.42, cw = g.measure('M', { size: size, mono: true, weight: 500 }), boxH = Math.min(bottom - top, 70 + n * lh), a = g.E.out(g.seg(p, 0, .08));
      g.box(80, top, 1120, boxH, { r: 18, fill: 'rgba(8,11,28,.94)', stroke: g.hexA(A, .35), lw: 1.5, alpha: a });
      ['#f87171', '#fbbf24', '#34d399'].forEach(function (c, k) { g.circle(108 + k * 22, top + 24, 6, { fill: c, alpha: a }); });
      g.text(P.file || P.lang || 'code', 640, top + 24, { size: 15, mono: true, color: g.C.muted, align: 'center', alpha: a });
      var total = lines.reduce(function (s, l) { return s + l.length + 1; }, 0), shown = Math.floor(total * g.seg(p, .05, hl.length ? .45 : .75)), used = 0;
      var cur = -1; if (hl.length && p > .47) cur = Math.min(hl.length - 1, Math.floor(g.seg(p, .47, .985) * hl.length));
      var rng2 = cur >= 0 ? (Array.isArray(hl[cur]) ? hl[cur] : [hl[cur], hl[cur]]) : null;
      if (rng2) g.box(90, top + 52 + rng2[0] * lh, 1100, (rng2[1] - rng2[0] + 1) * lh, { r: 8, fill: g.hexA(A, .16), stroke: g.hexA(A, .6), lw: 1.5, glow: A, blur: 10 });
      toks.forEach(function (tl, k) {
        var y = top + 52 + k * lh + lh / 2, x = 150, room = shown - used; used += lines[k].length + 1;
        if (room <= 0) return;
        g.text(String(k + 1), 124, y, { size: size * .78, mono: true, color: '#465281', align: 'right' });
        var dim = rng2 && (k < rng2[0] || k > rng2[1]) ? .45 : 1;
        for (var i = 0; i < tl.length && room > 0; i++) {
          var s = tl[i][0].slice(0, room); room -= tl[i][0].length;
          if (tl[i][1] !== 'plain' || s.trim()) g.text(s, x, y, { size: size, mono: true, color: TC[tl[i][1]], alpha: dim, italic: tl[i][1] === 'com' });
          x += tl[i][0].length * cw;
        }
        if (room < 0 && room > -40 && Math.floor(t * 3) % 2) g.box(x - (-room) * cw + 2, y - size * .6, 3, size * 1.2, { r: 1, fill: A });
      });
      if (notes.length && cur >= 0 && notes[cur]) {
        var na = g.E.out(g.seg(g.seg(p, .47, .985) * hl.length - cur, 0, .2));
        g.panel(80, 700 - noteH, 1120, noteH - 14, { alpha: na, stroke: g.hexA(A, .5) });
        g.text(notes[cur], 640, 700 - noteH / 2 - 7, { size: 23, align: 'center', maxW: 1060, vcenter: true, lh: 29, alpha: na });
      }
    }
  });

  /* Table whose rows slide in, with an optional highlighted row */
  M.kit('table', {
    draw: function (g, p, P, S, t) {
      var A = ACC(P, g), cols = P.cols || ['Column', 'Value'], rows = P.rows || [['—', '—']], n = rows.length, m = cols.length;
      g.heading(P.head || '', p, P.sub);
      var top = P.sub ? 184 : 164, bottom = P.note ? 600 : 668, rh = Math.min(68, (bottom - top) / (n + 1)), x0 = 80, TW = 1120;
      var wts = P.widths || cols.map(function () { return 1; }), sw = wts.reduce(function (a, b) { return a + b; }, 0), xs = [x0];
      wts.forEach(function (w, k) { xs.push(xs[k] + w / sw * TW); });
      var size = P.size || (rh > 54 ? 22 : rh > 44 ? 19 : 17), ha = g.E.out(g.seg(p, 0, .1));
      g.box(x0, top, TW, rh, { r: 12, fill: g.hexA(A, .22), alpha: ha });
      cols.forEach(function (c, k) { g.text(c, xs[k] + 18, top + rh / 2, { size: size - 1, weight: 800, head: true, color: A, alpha: ha, maxW: xs[k + 1] - xs[k] - 24, vcenter: true, lh: size }); });
      var hls = P.hl == null ? [] : [].concat(P.hl), hla = g.E.out(g.seg(p, .62, .72));
      rows.forEach(function (r, i) {
        var st = .08 + i * (.48 / n), a = g.E.out(g.seg(p, st, st + .1)); if (a <= 0) return;
        var y = top + (i + 1) * rh, on = hls.indexOf(i) >= 0 && hla > 0;
        g.box(x0 + (1 - a) * 30, y + 3, TW, rh - 6, { r: 10, fill: on ? g.hexA(g.C.green, .16 * hla + .04) : i % 2 ? 'rgba(30,40,84,.5)' : 'rgba(22,30,66,.5)', stroke: on ? g.hexA(g.C.green, hla) : null, glow: on ? g.C.green : null, blur: 12, alpha: a });
        r.forEach(function (c, k) {
          var s = String(c), clr = /^✓/.test(s) ? g.C.green : /^✗/.test(s) ? g.C.red : k === 0 ? g.C.ink : '#c9d0f0';
          g.text(s, xs[k] + 18 + (1 - a) * 30, y + rh / 2, { size: size, weight: k === 0 ? 700 : 500, mono: typeof c === 'number' || /^[\d.,%×+−-]+$/.test(s), color: clr, alpha: a, maxW: xs[k + 1] - xs[k] - 26, vcenter: true, lh: size * 1.2 });
        });
      });
      if (P.note) g.text(P.note, 640, 640, { size: 22, color: g.C.muted, align: 'center', maxW: 1100, vcenter: true, lh: 28, alpha: g.seg(p, .6, .7) });
    }
  });

  /* Node-and-arrow diagram; a packet travels along the edges in order */
  function clipTo(n, ux, uy) { var tx = ux ? (n.w / 2 + 6) / Math.abs(ux) : 1e9, ty = uy ? (n.h / 2 + 6) / Math.abs(uy) : 1e9, s = Math.min(tx, ty); return [n.x + ux * s, n.y + uy * s]; }
  M.kit('flow', {
    draw: function (g, p, P, S, t) {
      var A = ACC(P, g), nodes = P.nodes || [['a', 'Input', 360, 400], ['b', 'Model', 640, 400], ['c', 'Output', 920, 400]], edges = P.edges || [['a', 'b'], ['b', 'c']], by = {}, nN = nodes.length, nE = edges.length;
      g.heading(P.head || '', p, P.sub);
      (P.groups || []).forEach(function (gr, k) { var a = g.E.out(g.seg(p, 0, .1)), c = col(g, gr[5], k + 4); g.box(gr[1], gr[2], gr[3], gr[4], { r: 18, fill: g.hexA(c, .06), stroke: g.hexA(c, .5), dash: [8, 8], lw: 1.5, alpha: a }); g.text(gr[0], gr[1] + 16, gr[2] + 20, { size: 15, weight: 800, color: c, alpha: a, head: true }); });
      var ap = P.steps ? .3 : .34, e0 = ap + .04, eLen = (.97 - e0) / Math.max(1, nE), prog = (p - e0) / eLen, ae = prog >= 0 && prog < nE ? Math.floor(prog) : -1, af = prog - ae;
      nodes.forEach(function (nd, k) {
        var sz = nd[6] || 20, w = Math.max(nd[7] || 0, g.measure(nd[1], { size: sz, weight: 700, head: true }) + 40, nd[5] ? g.measure(nd[5], { size: 15 }) + 32 : 0, 110);
        by[nd[0]] = { x: nd[2], y: nd[3], w: w, h: nd[5] ? 74 : 58, c: col(g, nd[4], k), a: g.E.back(g.seg(p, .02 + k * (ap / nN), .09 + k * (ap / nN))), l: nd[1], s: nd[5], sz: sz };
      });
      var target = ae >= 0 ? by[edges[ae][1]] : null, done = p >= .97;
      edges.forEach(function (e, k) {
        var A1 = by[e[0]], B1 = by[e[1]]; if (!A1 || !B1) return;
        var a = Math.min(A1.a, B1.a); if (a <= 0) return;
        if (A1 === B1) { // self-loop: a small arc above the node
          var lc = k === ae ? A1.c : done || k < ae ? g.hexA(A1.c, .7) : '#3a4680', ly = A1.y - A1.h / 2 - 20, ctx2 = g.ctx;
          ctx2.save(); ctx2.globalAlpha *= a; ctx2.strokeStyle = lc; ctx2.lineWidth = k === ae ? 4 : 2.5; ctx2.beginPath(); ctx2.arc(A1.x, ly, 20, Math.PI * .8, Math.PI * 2.2); ctx2.stroke();
          ctx2.fillStyle = lc; ctx2.beginPath(); var ax2 = A1.x + 20 * Math.cos(Math.PI * 2.2), ay2 = ly + 20 * Math.sin(Math.PI * 2.2); ctx2.moveTo(ax2 + 2, ay2 + 10); ctx2.lineTo(ax2 - 7, ay2 - 2); ctx2.lineTo(ax2 + 9, ay2 - 3); ctx2.closePath(); ctx2.fill(); ctx2.restore();
          if (e[2]) { var lw3 = g.measure(e[2], { size: 15, weight: 600 }) + 16; g.box(A1.x - lw3 / 2, ly - 50, lw3, 26, { r: 8, fill: 'rgba(8,11,28,.92)', stroke: k === ae ? lc : 'rgba(120,140,220,.25)', lw: 1, alpha: a }); g.text(e[2], A1.x, ly - 36, { size: 15, weight: 600, align: 'center', color: k === ae ? g.C.ink : '#aab3d8', alpha: a }); }
          return;
        }
        var bend = e[3] || 0, mx = (A1.x + B1.x) / 2, my = (A1.y + B1.y) / 2, dx = B1.x - A1.x, dy = B1.y - A1.y, L = Math.hypot(dx, dy) || 1, cx = mx - dy / L * bend, cy = my + dx / L * bend;
        var d1 = [cx - A1.x, cy - A1.y], l1 = Math.hypot(d1[0], d1[1]) || 1, d2 = [B1.x - cx, B1.y - cy], l2 = Math.hypot(d2[0], d2[1]) || 1;
        var s = clipTo(A1, d1[0] / l1, d1[1] / l1), en = clipTo(B1, -d2[0] / l2, -d2[1] / l2), pts = [];
        for (var i = 0; i <= 24; i++) { var u = i / 24; pts.push([(1 - u) * (1 - u) * s[0] + 2 * u * (1 - u) * cx + u * u * en[0], (1 - u) * (1 - u) * s[1] + 2 * u * (1 - u) * cy + u * u * en[1]]); }
        var on = k === ae, past = done || k < ae, c = on || past ? B1.c : g.C.line;
        g.path(pts, { color: on ? c : past ? g.hexA(c, .7) : '#3a4680', lw: on ? 4 : 2.5, glow: on ? c : null, alpha: a, dash: e[4] ? [7, 7] : null });
        var q1 = pts[22], q2 = pts[24], ang = Math.atan2(q2[1] - q1[1], q2[0] - q1[0]), hs = 12;
        g.ctx.save(); g.ctx.globalAlpha *= a; g.ctx.fillStyle = on ? c : past ? g.hexA(c, .8) : '#3a4680'; g.ctx.beginPath(); g.ctx.moveTo(q2[0], q2[1]); g.ctx.lineTo(q2[0] - hs * Math.cos(ang - .45), q2[1] - hs * Math.sin(ang - .45)); g.ctx.lineTo(q2[0] - hs * Math.cos(ang + .45), q2[1] - hs * Math.sin(ang + .45)); g.ctx.closePath(); g.ctx.fill(); g.ctx.restore();
        if (e[2]) { var mp = pts[12], lw2 = g.measure(e[2], { size: 15, weight: 600 }) + 16; g.box(mp[0] - lw2 / 2, mp[1] - 13, lw2, 26, { r: 8, fill: 'rgba(8,11,28,.92)', stroke: on ? c : 'rgba(120,140,220,.25)', lw: 1, alpha: a }); g.text(e[2], mp[0], mp[1] + 1, { size: 15, weight: 600, align: 'center', color: on ? g.C.ink : '#aab3d8', alpha: a }); }
        if (on) { var pi = Math.min(24, Math.floor(g.E.inOut(g.clamp(af / .8)) * 24)); g.circle(pts[pi][0], pts[pi][1], 8, { fill: g.C.white, glow: c, blur: 18 }); }
      });
      nodes.forEach(function (nd) {
        var n = by[nd[0]], cur = n === target && af > .75, a = n.a; if (a <= 0) return;
        g.box(n.x - n.w / 2, n.y - n.h / 2, n.w, n.h, { r: 14, fill: g.hexA(n.c, cur ? .34 : .15), stroke: n.c, lw: cur ? 3 : 1.8, glow: cur ? n.c : null, alpha: a });
        g.text(n.l, n.x, n.y + (n.s ? -11 : 1), { size: n.sz, weight: 700, head: true, align: 'center', alpha: a });
        if (n.s) g.text(n.s, n.x, n.y + 16, { size: 15, color: '#aab3d8', align: 'center', alpha: a });
      });
      if (P.steps && ae >= 0 && P.steps[ae]) {
        var sa = g.E.out(g.seg(af, 0, .15));
        g.panel(120, 604, 1040, 84, { alpha: sa, stroke: g.hexA(target ? target.c : A, .6) });
        g.text(P.steps[ae], 640, 646, { size: 22, align: 'center', maxW: 1000, vcenter: true, lh: 27, alpha: sa });
      } else if (P.note) g.text(P.note, 640, 664, { size: 21, color: g.C.muted, align: 'center', maxW: 1100, alpha: g.seg(p, .4, .5) });
    }
  });

  /* Function plotter: curves, points, shaded areas and a sliding tangent */
  var fcache = {};
  function compile(f) {
    if (fcache[f]) return fcache[f];
    var fn; try { fn = new Function('x', 'var sin=Math.sin,cos=Math.cos,tan=Math.tan,exp=Math.exp,log=Math.log,sqrt=Math.sqrt,abs=Math.abs,max=Math.max,min=Math.min,pow=Math.pow,tanh=Math.tanh,floor=Math.floor,PI=Math.PI;return (' + f + ');'); } catch (e) { fn = function () { return NaN; }; }
    return (fcache[f] = fn);
  }
  M.compile = compile;
  var nice = function (span) { var s = Math.pow(10, Math.floor(Math.log10(span / 6))), m = span / 6 / s; return s * (m > 5 ? 10 : m > 2 ? 5 : m > 1 ? 2 : 1); };
  var fmtN = function (v) { return Math.abs(v) >= 1e5 || (Math.abs(v) < .01 && v) ? v.toExponential(0) : String(+v.toFixed(2)); };
  M.fmtN = fmtN;
  M.kit('plot', {
    draw: function (g, p, P, S, t) {
      var A = ACC(P, g), xr = P.x || [-4, 4], yr = P.y || [-1, 5], fns = P.fns || [{ f: 'x*x/4' }], side = !!P.side;
      g.heading(P.head || '', p, P.sub);
      var bx = P.box || [150, P.sub ? 196 : 180, side ? 640 : 1000, P.note ? 390 : 430], x0 = bx[0], y0 = bx[1], w = bx[2], h = bx[3];
      var X = function (x) { return x0 + (x - xr[0]) / (xr[1] - xr[0]) * w; }, Y = function (y) { return y0 + h - (y - yr[0]) / (yr[1] - yr[0]) * h; };
      var a0 = g.E.out(g.seg(p, 0, .08)), sx = P.xstep || nice(xr[1] - xr[0]), sy = P.ystep || nice(yr[1] - yr[0]);
      for (var gx = Math.ceil(xr[0] / sx) * sx; gx <= xr[1] + 1e-9; gx += sx) { g.line(X(gx), y0, X(gx), y0 + h, { color: 'rgba(120,140,220,.1)', lw: 1, alpha: a0 }); g.text(fmtN(+gx.toFixed(6)), X(gx), y0 + h + 22, { size: 15, mono: true, color: g.C.muted, align: 'center', alpha: a0 }); }
      for (var gy = Math.ceil(yr[0] / sy) * sy; gy <= yr[1] + 1e-9; gy += sy) { g.line(x0, Y(gy), x0 + w, Y(gy), { color: 'rgba(120,140,220,.1)', lw: 1, alpha: a0 }); g.text(fmtN(+gy.toFixed(6)), x0 - 12, Y(gy), { size: 15, mono: true, color: g.C.muted, align: 'right', alpha: a0 }); }
      var ax = yr[0] <= 0 && yr[1] >= 0 ? Y(0) : y0 + h, ay = xr[0] <= 0 && xr[1] >= 0 ? X(0) : x0;
      g.line(x0, ax, x0 + w, ax, { color: '#56629c', lw: 2, alpha: a0 }); g.line(ay, y0, ay, y0 + h, { color: '#56629c', lw: 2, alpha: a0 });
      if (P.xl) g.text(P.xl, x0 + w, y0 + h + 46, { size: 17, color: g.C.muted, align: 'right', alpha: a0 });
      if (P.yl) g.text(P.yl, x0, y0 - 20, { size: 17, color: g.C.muted, alpha: a0 });
      var ctx = g.ctx; ctx.save(); ctx.beginPath(); ctx.rect(x0, y0 - 2, w, h + 4); ctx.clip();
      var nf = fns.length, span = .4 / nf;
      if (P.shade) { var sh = P.shade, fsh = compile(fns[sh.i || 0].f), spts = [[X(sh.from), Y(Math.max(yr[0], Math.min(0, yr[1])))]]; for (var u = 0; u <= 60; u++) { var xv = sh.from + (sh.to - sh.from) * u / 60; spts.push([X(xv), Y(fsh(xv))]); } spts.push([X(sh.to), Y(Math.max(yr[0], Math.min(0, yr[1])))]); g.alpha(g.seg(p, .55, .7), function () { g.path(spts, { color: 'rgba(0,0,0,0)', lw: 0, fill: g.hexA(col(g, sh.c, 3), .28) }); }); }
      fns.forEach(function (q, k) {
        var f = compile(q.f), pts = [], c = col(g, q.c, k); for (var i = 0; i <= 320; i++) { var xv = xr[0] + (xr[1] - xr[0]) * i / 320, yv = f(xv); if (isFinite(yv)) pts.push([X(xv), Y(Math.max(yr[0] - (yr[1] - yr[0]), Math.min(yr[1] + (yr[1] - yr[0]), yv)))]); }
        g.path(pts, { color: c, lw: q.lw || 4, glow: c, blur: 10, dash: q.dash, p: g.E.inOut(g.seg(p, .06 + k * span, .06 + (k + 1) * span)) });
      });
      ctx.restore();
      fns.forEach(function (q, k) { if (!q.label) return; var f = compile(q.f), lx = q.lx != null ? q.lx : xr[1] - (xr[1] - xr[0]) * .06, ly = Math.max(yr[0], Math.min(yr[1], f(lx))); g.text(q.label, X(lx) + (q.dx || 0), Y(ly) + (q.dy == null ? -22 : q.dy), { size: 19, weight: 700, color: col(g, q.c, k), align: q.align || 'right', alpha: g.seg(p, .06 + (k + 1) * span, .12 + (k + 1) * span) }); });
      (P.vlines || []).forEach(function (v) { var a = g.seg(p, .45, .55); g.line(X(v[0]), y0, X(v[0]), y0 + h, { color: col(g, v[2], 2), dash: [6, 6], lw: 2, alpha: a }); if (v[1]) g.text(v[1], X(v[0]) + 8, y0 + 14, { size: 16, color: col(g, v[2], 2), alpha: a }); });
      (P.points || []).forEach(function (q, k) { var a = g.E.back(g.seg(p, .45 + k * .05, .55 + k * .05)), c = col(g, q[3], 2); g.circle(X(q[0]), Y(q[1]), 8 * a, { fill: c, glow: c }); if (q[2]) { var flip = X(q[0]) + 14 + g.measure(q[2], { size: 17, weight: 600 }) > 1240; g.text(q[2], X(q[0]) + (flip ? -14 : 14), Y(q[1]) - 18, { size: 17, weight: 600, color: c, alpha: a, align: flip ? 'right' : 'left' }); } });
      if (P.shade && P.shade.label) g.text(P.shade.label, X((P.shade.from + P.shade.to) / 2), Y(yr[0] + (yr[1] - yr[0]) * .12), { size: 18, weight: 700, align: 'center', color: col(g, P.shade.c, 3), alpha: g.seg(p, .62, .72) });
      if (P.tangent) {
        var tg = P.tangent, ft = compile(fns[tg.i || 0].f), ta = g.seg(p, .48, .56), xt = tg.from + (tg.to - tg.from) * g.E.inOut(g.seg(p, .52, .94)), yt = ft(xt), sl = (ft(xt + 1e-4) - ft(xt - 1e-4)) / 2e-4;
        var px = w / (xr[1] - xr[0]), py = h / (yr[1] - yr[0]), vx = px, vy = -sl * py, vl = Math.hypot(vx, vy); vx = vx / vl * 150; vy = vy / vl * 150;
        g.line(X(xt) - vx, Y(yt) - vy, X(xt) + vx, Y(yt) + vy, { color: g.C.amber, lw: 3, alpha: ta, glow: g.C.amber });
        g.circle(X(xt), Y(yt), 9, { fill: g.C.amber, glow: g.C.amber, alpha: ta });
        g.text((tg.label || 'slope') + ' = ' + sl.toFixed(2), X(xt), Y(yt) - 34, { size: 19, weight: 700, mono: true, color: g.C.amber, align: 'center', alpha: ta });
      }
      if (side && P.side) {
        var sa = g.E.out(g.seg(p, .1, .25)), sxp = x0 + w + 60, sw = 1210 - sxp;
        g.panel(sxp, y0 - 10, sw, h + 20, { alpha: sa });
        P.side.forEach(function (line, k) { var la = g.E.out(g.seg(p, .15 + k * .08, .25 + k * .08)), c = typeof line === 'string' ? null : col(g, line[1], k); g.text(typeof line === 'string' ? line : line[0], sxp + 24, y0 + 30 + k * 52, { size: 21, weight: c ? 700 : 500, color: c || g.C.ink, alpha: la, maxW: sw - 44, lh: 25, mono: !!(line && line[2]) }); });
      }
      if (P.note) g.text(P.note, 640, 670, { size: 21, color: g.C.muted, align: 'center', maxW: 1100, vcenter: true, lh: 26, alpha: g.seg(p, .5, .6) });
    }
  });

  /* "Pause and think": a question, a countdown, then the answer */
  M.kit('question', {
    draw: function (g, p, P, S, t) {
      var a = g.E.out(g.seg(p, 0, .1)), ans = g.E.out(g.seg(p, .6, .7));
      g.pill(640, 128, (P.kicker || 'Pause and think').toUpperCase(), { fill: g.C.amber, align: 'center', size: 16, alpha: a });
      g.text(P.q || 'What do you think?', 640, 238, { size: 36, weight: 700, head: true, align: 'center', maxW: 1040, vcenter: true, lh: 46, alpha: a });
      var cd = g.seg(p, .1, .58), ra = a * (1 - ans);
      if (ra > 0) {
        g.circle(640, 450, 58, { stroke: g.C.faint, lw: 8, alpha: ra });
        var ctx = g.ctx; ctx.save(); ctx.globalAlpha *= ra; ctx.strokeStyle = g.C.amber; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.shadowColor = g.C.amber; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(640, 450, 58, -Math.PI / 2, -Math.PI / 2 + (1 - cd) * Math.PI * 2 + 1e-3); ctx.stroke(); ctx.restore();
        g.text('?', 640, 452, { size: 54, weight: 800, head: true, align: 'center', color: g.C.amber, alpha: ra * (.6 + .4 * g.pulse(t, 3)) });
        if (P.hint) g.text('Hint: ' + P.hint, 640, 560, { size: 21, color: g.C.muted, align: 'center', maxW: 980, alpha: ra * g.seg(p, .25, .35) });
      }
      if (ans > 0) {
        g.panel(150, 350 + (1 - ans) * 24, 980, 280, { alpha: ans, stroke: g.hexA(g.C.green, .6) });
        g.text('ANSWER', 190, 388 + (1 - ans) * 24, { size: 15, weight: 800, color: g.C.green, head: true, alpha: ans });
        g.text(P.a || '', 640, 500 + (1 - ans) * 24, { size: 26, align: 'center', maxW: 900, vcenter: true, lh: 35, alpha: ans });
      }
    }
  });

  /* Big numbers counting up */
  M.kit('stats', {
    draw: function (g, p, P, S, t) {
      var items = P.items || [['42', 'answer']], n = items.length, gap = 22, w = (1120 - (n - 1) * gap) / n, y = P.sub ? 250 : 230, h = P.note ? 300 : 330;
      g.heading(P.head || '', p, P.sub);
      items.forEach(function (it, k) {
        var st = .06 + k * .1, a = g.E.back(g.seg(p, st, st + .14)), c = col(g, it[3], k), x = 80 + k * (w + gap);
        g.panel(x, y + (1 - a) * 30, w, h, { alpha: g.clamp(a), stroke: g.hexA(c, .55) });
        g.box(x, y + (1 - a) * 30, w, 6, { r: 3, fill: c, alpha: g.clamp(a), glow: c });
        var m = String(it[0]).match(/^([^\d]*)([\d][\d,]*\.?\d*)(.*)$/), val = String(it[0]);
        if (m) { var num = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, cur = num * g.E.out(g.seg(p, st, st + .3)); val = m[1] + (m[2].indexOf(',') >= 0 ? Math.round(cur).toLocaleString('en-US') : cur.toFixed(dec)) + m[3]; }
        var size = Math.min(62, (w - 30) / Math.max(1, String(it[0]).length * .6));
        g.text(val, x + w / 2, y + 96 + (1 - a) * 30, { size: size, weight: 800, head: true, align: 'center', color: c, alpha: g.clamp(a), glow: g.hexA(c, .5) });
        g.text(it[1], x + w / 2, y + 170 + (1 - a) * 30, { size: 22, weight: 700, align: 'center', maxW: w - 30, vcenter: true, lh: 27, alpha: g.clamp(a) });
        if (it[2]) g.text(it[2], x + w / 2, y + 250 + (1 - a) * 30, { size: 17, color: g.C.muted, align: 'center', maxW: w - 34, vcenter: true, lh: 22, alpha: g.clamp(a) });
      });
      if (P.note) g.text(P.note, 640, 640, { size: 22, color: g.C.muted, align: 'center', maxW: 1100, alpha: g.seg(p, .5, .6) });
    }
  });
})(window.Motion);
