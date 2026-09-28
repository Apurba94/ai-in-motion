/* AI in Motion — computer vision kits. © Janin A Apurba, CSE, AUST */
(function (M) {
  'use strict';
  /* A small procedural picture: sky, sun, hills and a house. u,v in [0,1]. */
  function picture(u, v) {
    var sky = [Math.round(90 + v * 90), Math.round(150 + v * 70), 235];
    if (Math.hypot(u - .78, v - .22) < .1) return [255, 214, 90];
    var hill = .68 + .08 * Math.sin(u * 7.5);
    if (u > .2 && u < .52 && v > .5 && v < .8) { if (u > .31 && u < .39 && v > .63) return [110, 70, 45]; if ((u > .23 && u < .29 || u > .42 && u < .49) && v > .56 && v < .63) return [180, 225, 255]; return [230, 205, 160]; }
    if (v < .5 && v > .36 && Math.abs(u - .36) < (v - .36) * 1.25) return [200, 60, 60];
    if (v > hill) return [Math.round(60 + (1 - v) * 40), Math.round(150 - (v - hill) * 60), 80];
    return sky;
  }
  var picCache = {};
  function picCanvas(g, N) { if (!picCache[N]) picCache[N] = g.pixels(N, N, function (x, y) { return picture((x + .5) / N, (y + .5) / N); }); return picCache[N]; }

  /* ---------- images are grids of numbers ---------- */
  M.kit('pixels', {
    draw: function (g, p, P, S, t) {
      var N = 32, img = picCanvas(g, N), rgb = P.mode === 'rgb';
      g.heading(P.head || (rgb ? 'Colour images have three channels' : 'To a computer, an image is numbers'), p, P.sub);
      if (rgb) {
        var sp = g.E.inOut(g.seg(p, .15, .6)), chans = [[1, 0, 0, 'Red', g.C.red], [0, 1, 0, 'Green', g.C.green], [0, 0, 1, 'Blue', g.C.blue]];
        g.img(img, 110, 190, 380, 380, { alpha: 1 - sp * .6 }); g.text('32 × 32 × 3', 300, 610, { size: 20, mono: true, align: 'center', color: g.C.muted });
        chans.forEach(function (c, i) {
          if (!S['ch' + i]) S['ch' + i] = g.pixels(N, N, function (x, y) { var v = picture((x + .5) / N, (y + .5) / N); return [v[0] * c[0], v[1] * c[1], v[2] * c[2]]; });
          var x = g.lerp(110, 560 + i * 230, sp), y = g.lerp(190, 230 + i * 20, sp), s = g.lerp(380, 200, sp);
          g.img(S['ch' + i], x, y, s, s, { alpha: sp }); g.text(c[3] + ' channel', x + s / 2, y + s + 28, { size: 19, weight: 700, color: c[4], align: 'center', alpha: sp });
        });
        g.text('Each pixel = three numbers (0–255): how much red, green and blue.', 640, 670, { size: 21, align: 'center', alpha: g.seg(p, .6, .7) });
        return;
      }
      var a = g.E.out(g.seg(p, 0, .12)); g.img(img, 100, 180, 440, 440, { alpha: a });
      var path = [[4, 20], [12, 17], [22, 6], [9, 10]], pp = g.seg(p, .15, .9) * (path.length - 1), k = Math.min(path.length - 2, Math.floor(pp)), f = g.E.inOut(pp - k), zx = Math.round(g.lerp(path[k][0], path[k + 1][0], f)), zy = Math.round(g.lerp(path[k][1], path[k + 1][1], f)), Z = 6, cs = 440 / N;
      g.box(100 + zx * cs, 180 + zy * cs, Z * cs, Z * cs, { r: 2, stroke: g.C.amber, lw: 3, glow: g.C.amber });
      var gx = 640, gy = 180, cz = 90; g.line(100 + (zx + Z) * cs, 180 + zy * cs, gx, gy, { color: g.hexA(g.C.amber, .5), lw: 1.5 }); g.line(100 + (zx + Z) * cs, 180 + (zy + Z) * cs, gx, gy + Z * cz, { color: g.hexA(g.C.amber, .5), lw: 1.5 });
      for (var yy = 0; yy < Z; yy++) for (var xx = 0; xx < Z; xx++) {
        var v = picture((zx + xx + .5) / N, (zy + yy + .5) / N), gray = Math.round(.299 * v[0] + .587 * v[1] + .114 * v[2]);
        g.ctx.fillStyle = 'rgb(' + v[0] + ',' + v[1] + ',' + v[2] + ')'; g.ctx.fillRect(gx + xx * cz, gy + yy * cz, cz - 3, cz - 3);
        g.text(String(gray), gx + xx * cz + cz / 2 - 1, gy + yy * cz + cz / 2, { size: 22, weight: 700, mono: true, align: 'center', color: gray > 140 ? '#10142c' : '#ffffff' });
      }
      g.text('brightness values (0 = black, 255 = white)', gx, gy + Z * cz + 26, { size: 18, color: g.C.muted });
    }
  });

  /* ---------- convolution with a 3×3 kernel ---------- */
  var KERNELS = { edge: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], hedge: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]], sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], blur: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] };
  M.kit('convolve', {
    draw: function (g, p, P, S, t) {
      var img = P.img || [[0, 0, 0, 0, 9, 9, 9], [0, 0, 0, 0, 9, 9, 9], [0, 0, 0, 0, 9, 9, 9], [0, 0, 0, 0, 9, 9, 9], [0, 0, 0, 0, 9, 9, 9], [0, 0, 0, 0, 9, 9, 9], [0, 0, 0, 0, 9, 9, 9]];
      var kn = P.kernel || 'edge', K = KERNELS[kn], div = kn === 'blur' ? 9 : 1, n = img.length, on = n - 2, total = on * on;
      g.heading(P.head || 'Convolution: sliding a filter over an image', p, P.sub);
      var cnt = Math.max(1, Math.ceil(g.seg(p, .1, .88) * total)), cur = cnt - 1, cr = Math.floor(cur / on), cc = cur % on;
      var val = function (r, c) { var s = 0; for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) s += img[r + a][c + b] * K[a][b]; return s / div; };
      var cs = 62, x0 = 80, y0 = 200;
      img.forEach(function (row, r) { row.forEach(function (v, c) { g.box(x0 + c * cs + 2, y0 + r * cs + 2, cs - 4, cs - 4, { r: 6, fill: g.mix('#141a3a', '#e8ecff', v / 9) }); g.text(String(v), x0 + c * cs + cs / 2, y0 + r * cs + cs / 2, { size: 20, weight: 700, mono: true, align: 'center', color: v > 5 ? '#10142c' : '#dfe4ff' }); }); });
      g.box(x0 + cc * cs - 2, y0 + cr * cs - 2, cs * 3 + 4, cs * 3 + 4, { r: 8, stroke: g.C.pink, lw: 4, glow: g.C.pink });
      var kx = 560, ky = 260, ks = 56; g.text('Kernel' + (div > 1 ? ' (÷9)' : ''), kx, ky - 26, { size: 18, color: g.C.muted });
      K.forEach(function (row, a) { row.forEach(function (v, b) { g.box(kx + b * ks + 2, ky + a * ks + 2, ks - 4, ks - 4, { r: 6, fill: v > 0 ? g.hexA(g.C.green, .3) : v < 0 ? g.hexA(g.C.red, .3) : 'rgba(60,72,130,.6)' }); g.text(String(v), kx + b * ks + ks / 2, ky + a * ks + ks / 2, { size: 20, weight: 700, mono: true, align: 'center' }); }); });
      var terms = []; for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) if (K[a][b] !== 0) terms.push(img[cr + a][cc + b] + '×' + K[a][b]);
      g.text('multiply, then add:', kx, 470, { size: 17, color: g.C.muted }); g.text(terms.slice(0, 5).join(' + ') + (terms.length > 5 ? ' + …' : ''), kx, 500, { size: 17, mono: true, maxW: 190, lh: 22 });
      g.text('= ' + (Math.round(val(cr, cc) * 10) / 10), kx, 600, { size: 28, weight: 700, mono: true, color: g.C.pink });
      var ox = 820, oy = 230, os = 74; g.text('Feature map', ox, oy - 30, { size: 18, color: g.C.muted });
      var mx = 0; for (var r = 0; r < on; r++) for (var c = 0; c < on; c++) mx = Math.max(mx, Math.abs(val(r, c)));
      for (var i = 0; i < total; i++) { var rr = Math.floor(i / on), c2 = i % on, v = val(rr, c2), shown = i < cnt; g.box(ox + c2 * os + 2, oy + rr * os + 2, os - 4, os - 4, { r: 8, fill: shown ? (v >= 0 ? g.hexA(g.C.pink, .12 + .75 * v / (mx || 1)) : g.hexA(g.C.cyan, .12 + .75 * -v / (mx || 1))) : 'rgba(40,52,100,.5)', stroke: i === cur ? g.C.pink : null, lw: 3 }); if (shown) g.text(String(Math.round(v * 10) / 10), ox + c2 * os + os / 2, oy + rr * os + os / 2, { size: 19, weight: 700, mono: true, align: 'center' }); }
    }
  });

  /* ---------- Sobel edge detection on a real image ---------- */
  M.kit('edges', {
    init: function (P, g) {
      var N = 72, img = []; for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) { var u = x / N, v = y / N, val = .12; if (u > .12 && u < .42 && v > .15 && v < .45) val = .9; if (Math.hypot(u - .68, v - .32) < .18) val = .65; if (v > .58 && v < .9 && Math.abs(u - .5) < (v - .58) * .9) val = .8; img.push(val); }
      var at = function (x, y) { x = Math.max(0, Math.min(N - 1, x)); y = Math.max(0, Math.min(N - 1, y)); return img[y * N + x]; };
      var gx = [], gy = [], mag = [], mx = 0; for (y = 0; y < N; y++) for (x = 0; x < N; x++) { var a = -at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1) + at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1), b = -at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1) + at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1); gx.push(a); gy.push(b); var m = Math.hypot(a, b); mag.push(m); if (m > mx) mx = m; }
      var mkc = function (arr, signed) { return g.pixels(N, N, function (x, y) { var v = arr[y * N + x]; if (signed) { var s = v / 4; return s >= 0 ? [Math.round(20 + s * 235), Math.round(20 + s * 90), Math.round(60 + s * 120)] : [Math.round(20 - s * 20), Math.round(20 - s * 200), Math.round(60 - s * 190)]; } var q = Math.round(v / mx * 255); return [q, q, q]; }); };
      return { orig: g.pixels(N, N, function (x, y) { var q = Math.round(img[y * N + x] * 255); return [q, q, q]; }), gx: mkc(gx, true), gy: mkc(gy, true), mag: mkc(mag, false) };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Edge detection with Sobel filters', p, P.sub);
      var panels = [[S.orig, 'Original'], [S.gx, 'Horizontal change (Gx)'], [S.gy, 'Vertical change (Gy)'], [S.mag, 'Edge strength √(Gx² + Gy²)']], sz = 260;
      panels.forEach(function (q, i) {
        var x = 70 + i * 290, y = 230, a = g.seg(p, .05 + i * .18, .2 + i * .18); if (a <= 0) return;
        g.ctx.save(); g.ctx.beginPath(); g.ctx.rect(x, y, sz * g.E.out(a), sz); g.ctx.clip(); g.img(q[0], x, y, sz, sz); g.ctx.restore();
        g.box(x, y, sz, sz, { r: 4, stroke: g.C.line, lw: 1.5 }); g.text(q[1], x + sz / 2, y + sz + 30, { size: 17, weight: 700, align: 'center', maxW: 270, lh: 21, alpha: a });
        if (i < 3) g.arrow(x + sz + 4, y + sz / 2, x + 286, y + sz / 2, { color: g.C.muted, lw: 2, head: 8, alpha: a });
      });
      g.text('Pink = getting brighter, blue = getting darker. Edges are where brightness changes fast.', 640, 640, { size: 20, align: 'center', color: g.C.muted, alpha: g.seg(p, .75, .85) });
    }
  });

  /* ---------- pooling ---------- */
  M.kit('pooling', {
    draw: function (g, p, P, S, t) {
      var I = P.grid || [[1, 3, 2, 1], [4, 6, 5, 0], [7, 2, 9, 8], [3, 1, 4, 6]], avg = P.mode === 'avg';
      g.heading(P.head || (avg ? 'Average pooling' : 'Max pooling (2 × 2, stride 2)'), p, P.sub);
      var cs = 100, x0 = 140, y0 = 200, k = Math.min(3, Math.floor(g.seg(p, .1, .85) * 4)), cols = [g.C.cyan, g.C.pink, g.C.amber, g.C.green];
      var out = [0, 1, 2, 3].map(function (w) { var r = Math.floor(w / 2) * 2, c = (w % 2) * 2, v = [I[r][c], I[r][c + 1], I[r + 1][c], I[r + 1][c + 1]]; return avg ? v.reduce(function (a, b) { return a + b; }, 0) / 4 : Math.max.apply(null, v); });
      I.forEach(function (row, r) { row.forEach(function (v, c) { var w = Math.floor(r / 2) * 2 + Math.floor(c / 2), on = w <= k; g.box(x0 + c * cs + 3, y0 + r * cs + 3, cs - 6, cs - 6, { r: 10, fill: on ? g.hexA(cols[w], .25) : 'rgba(40,52,100,.6)', stroke: on && w === k ? cols[w] : null, lw: 3 }); var isMax = !avg && on && v === out[w]; g.text(String(v), x0 + c * cs + cs / 2, y0 + r * cs + cs / 2, { size: 30, weight: 700, mono: true, align: 'center', color: isMax ? cols[w] : g.C.ink }); }); });
      g.text('4 × 4 feature map', x0 + 2 * cs, y0 + 4 * cs + 34, { size: 19, color: g.C.muted, align: 'center' });
      g.arrow(x0 + 4 * cs + 30, y0 + 2 * cs, x0 + 4 * cs + 150, y0 + 2 * cs, { color: g.C.muted, lw: 3 });
      var ox = 850, oy = 300;
      out.forEach(function (v, w) { var r = Math.floor(w / 2), c = w % 2, on = w <= k; g.box(ox + c * cs + 3, oy + r * cs + 3, cs - 6, cs - 6, { r: 10, fill: on ? g.hexA(cols[w], .45) : 'rgba(40,52,100,.6)', glow: on && w === k ? cols[w] : null }); if (on) g.text(avg ? v.toFixed(2) : String(v), ox + c * cs + cs / 2, oy + r * cs + cs / 2, { size: 28, weight: 700, mono: true, align: 'center' }); });
      g.text('2 × 2 output: ¼ of the size', ox + cs, oy + 2 * cs + 34, { size: 19, color: g.C.muted, align: 'center' });
    }
  });

  /* ---------- CNN architecture: shrinking maps, growing depth ---------- */
  M.kit('cnn-arch', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Inside a convolutional neural network', p, P.sub);
      var blocks = [['Input', '32×32×3', 150, 3, g.C.blue], ['Conv + ReLU', '32×32×16', 150, 9, g.C.cyan], ['Pool', '16×16×16', 90, 9, g.C.violet], ['Conv + ReLU', '16×16×32', 90, 14, g.C.cyan], ['Pool', '8×8×32', 55, 14, g.C.violet]];
      var x = 80, ph = g.seg(p, .06, .9), packet = ph * (blocks.length + 2);
      blocks.forEach(function (b, i) {
        var a = g.E.out(g.seg(ph, i * .1, .1 + i * .1)), s = b[2], d = b[3], cy = 420;
        for (var j = d - 1; j >= 0; j--) { var ox = x + j * 5, oy = cy - s / 2 - j * 4; g.box(ox, oy, s, s, { r: 4, fill: g.hexA(b[4], .12 + (j === 0 ? .25 : 0)), stroke: g.hexA(b[4], .7), lw: 1.2, alpha: a }); }
        g.text(b[0], x + s / 2 + d * 2.5, cy + s / 2 + 44, { size: 18, weight: 700, align: 'center', alpha: a, color: b[4] }); g.text(b[1], x + s / 2 + d * 2.5, cy + s / 2 + 70, { size: 16, mono: true, align: 'center', color: g.C.muted, alpha: a });
        if (packet > i && packet < i + 1) g.circle(x + s / 2, cy - 4, 10, { fill: g.C.amber, glow: g.C.amber });
        x += s + d * 5 + 40;
      });
      var fa = g.E.out(g.seg(ph, .55, .68)); for (var i = 0; i < 12; i++) g.box(x, 250 + i * 26, 22, 20, { r: 4, fill: g.hexA(g.C.amber, .6), alpha: fa }); g.text('Flatten', x + 11, 590, { size: 17, weight: 700, align: 'center', color: g.C.amber, alpha: fa }); x += 70;
      var da = g.E.out(g.seg(ph, .68, .8)); for (i = 0; i < 6; i++) g.circle(x + 16, 290 + i * 45, 14, { fill: g.hexA(g.C.pink, .4), stroke: g.C.pink, alpha: da }); g.text('Dense', x + 16, 590, { size: 17, weight: 700, align: 'center', color: g.C.pink, alpha: da }); x += 70;
      var sa = g.E.out(g.seg(ph, .8, .95)), probs = P.probs || [['cat', .82], ['dog', .12], ['car', .06]];
      probs.forEach(function (q, j) { g.text(q[0], x, 330 + j * 60, { size: 18, weight: 700, alpha: sa }); g.box(x + 50, 318 + j * 60, 110 * q[1] * sa, 24, { r: 6, fill: g.C.green }); g.text(Math.round(q[1] * 100) + '%', x + 58 + 110 * q[1], 331 + j * 60, { size: 15, mono: true, alpha: sa, color: g.C.muted }); });
      g.text('Softmax', x + 60, 590, { size: 17, weight: 700, align: 'center', color: g.C.green, alpha: sa });
      g.text('Spatial size shrinks while the number of feature channels grows.', 640, 675, { size: 20, align: 'center', color: g.C.muted, alpha: g.seg(ph, .3, .4) });
    }
  });

  /* ---------- the feature hierarchy ---------- */
  M.kit('features-hierarchy', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'What each layer learns to see', p, P.sub);
      var st = [['Layer 1', 'edges & colours'], ['Layer 2', 'textures & corners'], ['Layer 3', 'parts'], ['Layer 4', 'whole objects']];
      st.forEach(function (s, i) {
        var x = 80 + i * 290, y = 200, a = g.E.out(g.seg(p, .06 + i * .18, .2 + i * .18)); if (a <= 0) return;
        g.panel(x, y, 250, 330, { alpha: a }); g.text(s[0], x + 125, y + 30, { size: 20, weight: 700, align: 'center', color: g.PAL[i], alpha: a }); g.text(s[1], x + 125, y + 58, { size: 16, align: 'center', color: g.C.muted, alpha: a });
        var cx = x + 125, cy = y + 200, c = g.PAL[i];
        if (i === 0) for (var k = 0; k < 9; k++) { var ang = k * .7, ox = cx - 70 + (k % 3) * 70, oy = cy - 70 + Math.floor(k / 3) * 70; g.line(ox - 22 * Math.cos(ang), oy - 22 * Math.sin(ang), ox + 22 * Math.cos(ang), oy + 22 * Math.sin(ang), { color: g.PAL[k % 6], lw: 5, alpha: a }); }
        if (i === 1) { g.circle(cx - 50, cy - 45, 26, { stroke: c, lw: 4, alpha: a }); g.path([[cx + 20, cy - 70], [cx + 20, cy - 20], [cx + 70, cy - 20]], { color: c, lw: 4, alpha: a }); for (var j = 0; j < 5; j++) g.line(cx - 80 + j * 16, cy + 30, cx - 70 + j * 16, cy + 80, { color: g.C.amber, lw: 3, alpha: a }); g.path([[cx + 10, cy + 70], [cx + 40, cy + 30], [cx + 70, cy + 70]], { color: c, lw: 4, alpha: a }); }
        if (i === 2) { g.circle(cx - 45, cy - 40, 22, { fill: '#e8ecff', alpha: a }); g.circle(cx - 45, cy - 40, 9, { fill: '#10142c', alpha: a }); g.circle(cx + 45, cy - 40, 30, { stroke: c, lw: 8, alpha: a }); g.path([[cx - 60, cy + 70], [cx - 40, cy + 20], [cx - 20, cy + 70]], { color: g.C.pink, lw: 5, fill: g.hexA(g.C.pink, .3), alpha: a }); g.text('eye · wheel · ear', cx, cy + 110, { size: 15, color: g.C.muted, align: 'center', alpha: a }); }
        if (i === 3) { g.circle(cx, cy - 20, 62, { fill: g.hexA(g.C.amber, .9), alpha: a }); g.path([[cx - 58, cy - 50], [cx - 44, cy - 108], [cx - 18, cy - 76]], { color: g.C.amber, lw: 3, fill: g.C.amber, alpha: a }); g.path([[cx + 58, cy - 50], [cx + 44, cy - 108], [cx + 18, cy - 76]], { color: g.C.amber, lw: 3, fill: g.C.amber, alpha: a }); g.circle(cx - 22, cy - 30, 8, { fill: '#10142c', alpha: a }); g.circle(cx + 22, cy - 30, 8, { fill: '#10142c', alpha: a }); g.text('cat!', cx, cy + 90, { size: 22, weight: 700, align: 'center', alpha: a }); }
        if (i < 3) g.arrow(x + 252, y + 165, x + 288, y + 165, { color: g.C.muted, lw: 2.5, alpha: a });
      });
      g.text('Nobody programs these features — they emerge during training.', 640, 640, { size: 21, align: 'center', color: g.C.ink, alpha: g.seg(p, .8, .9) });
    }
  });

  /* ---------- image classification: picture → network → probabilities ---------- */
  M.kit('classify', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Image classification', p, P.sub);
      var img = picCanvas(g, 48), labels = P.labels || [['house', .86], ['barn', .08], ['castle', .04], ['tent', .02]], ph = g.seg(p, .05, .95);
      g.img(img, 90, 220, 300, 300, { smooth: true, alpha: g.seg(ph, 0, .1) }); g.text('input image', 240, 550, { size: 18, color: g.C.muted, align: 'center' });
      var na = g.seg(ph, .12, .5); for (var i = 0; i < 5; i++) { var h = 260 - i * 34, x = 450 + i * 64; g.box(x, 370 - h / 2, 44, h, { r: 10, fill: g.hexA(g.PAL[i], .2 + .3 * g.pulse(t * 2 - i, 3)), stroke: g.PAL[i], lw: 2, alpha: g.seg(na, i * .15, i * .15 + .2) }); }
      g.text('CNN', 580, 560, { size: 20, weight: 700, align: 'center', alpha: na });
      var sa = g.E.out(g.seg(ph, .55, .8));
      labels.forEach(function (q, j) { var y = 260 + j * 76; g.text(q[0], 820, y, { size: 24, weight: 700, alpha: sa, color: j === 0 ? g.C.green : g.C.ink }); g.box(960, y - 16, 240 * q[1] * sa, 32, { r: 8, fill: j === 0 ? g.C.green : g.hexA(g.C.cyan, .5), glow: j === 0 ? g.C.green : null }); g.text((q[1] * 100 * sa).toFixed(0) + '%', 970 + 240 * q[1] * sa, y, { size: 18, mono: true, color: g.C.muted, alpha: sa }); });
      g.text('Softmax turns scores into probabilities that add up to 100%.', 640, 660, { size: 20, align: 'center', color: g.C.muted, alpha: g.seg(ph, .8, .9) });
    }
  });

  /* ---------- data augmentation ---------- */
  M.kit('augment', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Data augmentation: one image, many lessons', p, P.sub);
      var img = picCanvas(g, 48), ctx = g.ctx;
      g.img(img, 90, 250, 260, 260, { smooth: true }); g.text('original', 220, 540, { size: 18, color: g.C.muted, align: 'center' });
      var ops = [['flip', function (x, y, s) { ctx.translate(x + s, y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, s, s); }], ['rotate 15°', function (x, y, s) { ctx.beginPath(); ctx.rect(x, y, s, s); ctx.clip(); ctx.translate(x + s / 2, y + s / 2); ctx.rotate(.26); ctx.drawImage(img, -s * .62, -s * .62, s * 1.24, s * 1.24); }], ['random crop', function (x, y, s) { ctx.drawImage(img, 10, 14, 30, 30, x, y, s, s); }],
        ['brighter', function (x, y, s) { ctx.drawImage(img, x, y, s, s); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(x, y, s, s); }], ['darker', function (x, y, s) { ctx.drawImage(img, x, y, s, s); ctx.fillStyle = 'rgba(0,0,20,.45)'; ctx.fillRect(x, y, s, s); }], ['noise', function (x, y, s) { ctx.drawImage(img, x, y, s, s); var r = g.rng(3); for (var i = 0; i < 260; i++) { ctx.fillStyle = r() > .5 ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.5)'; ctx.fillRect(x + r() * s, y + r() * s, 4, 4); } }]];
      ops.forEach(function (o, i) {
        var a = g.E.back(g.seg(p, .1 + i * .1, .22 + i * .1)); if (a <= 0) return;
        var s = 180 * a, x = 460 + (i % 3) * 250 + (180 - s) / 2, y = 170 + Math.floor(i / 3) * 250 + (180 - s) / 2;
        ctx.save(); ctx.imageSmoothingEnabled = true; o[1](x, y, s); ctx.restore();
        g.box(x, y, s, s, { r: 4, stroke: g.C.line, lw: 1.5 }); g.text(o[0], 460 + (i % 3) * 250 + 90, 170 + Math.floor(i / 3) * 250 + 206, { size: 18, weight: 700, align: 'center', color: g.PAL[i], alpha: a });
      });
      g.text('Same label, new pixels: the model learns what matters, not where it happens to be.', 640, 685, { size: 20, align: 'center', color: g.C.muted, alpha: g.seg(p, .75, .85) });
    }
  });

  /* ---------- a stylised street scene (photo view or segmentation mask) ---------- */
  var OBJ = [
    { k: 'car', x: .12, y: .58, w: .3, h: .2, c: '#e2554f', m: '#ff4d6d', m2: '#ff4d6d', label: 'car' },
    { k: 'car', x: .6, y: .62, w: .26, h: .17, c: '#4f7de2', m: '#ff4d6d', m2: '#ffb020', label: 'car' },
    { k: 'person', x: .48, y: .38, w: .08, h: .36, c: '#f0c27b', m: '#ffe14d', m2: '#9b5de5', label: 'person' },
    { k: 'tree', x: .85, y: .16, w: .13, h: .46, c: '#2f9e5b', m: '#3ddc84', m2: '#3ddc84', label: 'tree' }
  ];
  function scene(g, X, Yt, W, H, mode) {
    var ctx = g.ctx, mask = mode === 'mask' || mode === 'inst', px = function (u) { return X + u * W; }, py = function (v) { return Yt + v * H; };
    ctx.save(); ctx.beginPath(); ctx.rect(X, Yt, W, H); ctx.clip();
    ctx.fillStyle = mask ? '#4dabf7' : '#7fb4e6'; ctx.fillRect(X, Yt, W, H * .55);
    ctx.fillStyle = mask ? '#6c757d' : '#555b66'; ctx.fillRect(X, py(.55), W, H * .45);
    if (!mask) { ctx.fillStyle = '#e6e6e6'; for (var i = 0; i < 8; i++) ctx.fillRect(px(i * .14), py(.8), W * .07, H * .015); }
    OBJ.forEach(function (o) {
      var col = mask ? (mode === 'inst' ? o.m2 : o.m) : o.c;
      if (o.k === 'car') { g.rr(px(o.x), py(o.y + o.h * .3), W * o.w, H * o.h * .5, 12); ctx.fillStyle = col; ctx.fill(); g.rr(px(o.x + o.w * .2), py(o.y), W * o.w * .55, H * o.h * .4, 10); ctx.fill(); ctx.fillStyle = mask ? col : '#1e1e24'; ctx.beginPath(); ctx.arc(px(o.x + o.w * .22), py(o.y + o.h * .82), H * o.h * .18, 0, 7); ctx.arc(px(o.x + o.w * .78), py(o.y + o.h * .82), H * o.h * .18, 0, 7); ctx.fill(); }
      if (o.k === 'person') { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px(o.x + o.w / 2), py(o.y + o.h * .1), W * o.w * .42, 0, 7); ctx.fill(); g.rr(px(o.x + o.w * .12), py(o.y + o.h * .2), W * o.w * .76, H * o.h * .45, 8); ctx.fill(); ctx.fillRect(px(o.x + o.w * .18), py(o.y + o.h * .6), W * o.w * .26, H * o.h * .4); ctx.fillRect(px(o.x + o.w * .56), py(o.y + o.h * .6), W * o.w * .26, H * o.h * .4); if (!mask) { ctx.fillStyle = '#3d5a80'; g.rr(px(o.x + o.w * .12), py(o.y + o.h * .2), W * o.w * .76, H * o.h * .45, 8); ctx.fill(); } }
      if (o.k === 'tree') { ctx.fillStyle = mask ? col : '#7a5230'; ctx.fillRect(px(o.x + o.w * .4), py(o.y + o.h * .55), W * o.w * .2, H * o.h * .45); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px(o.x + o.w / 2), py(o.y + o.h * .32), W * o.w * .55, 0, 7); ctx.fill(); }
    });
    ctx.restore();
  }
  var box = function (o, X, Yt, W, H) { return [X + o.x * W, Yt + o.y * H, o.w * W, o.h * H]; };
  var iou = function (a, b) { var x1 = Math.max(a[0], b[0]), y1 = Math.max(a[1], b[1]), x2 = Math.min(a[0] + a[2], b[0] + b[2]), y2 = Math.min(a[1] + a[3], b[1] + b[3]), inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1); return inter / (a[2] * a[3] + b[2] * b[3] - inter); };

  M.kit('detection', {
    draw: function (g, p, P, S, t) {
      var mode = P.mode || 'yolo', SX = 90, SY = 170, SW = 760, SH = 470;
      if (mode === 'iou') {
        g.heading(P.head || 'Intersection over Union (IoU)', p, P.sub);
        var A = [260, 260, 300, 240], dx = g.lerp(-220, 130, g.E.inOut(g.seg(p, .1, .5))) * (p < .55 ? 1 : 1) , Bx = p < .55 ? 260 + dx : g.lerp(390, 290, g.E.inOut(g.seg(p, .55, .85))), B = [Bx, 300, 300, 240];
        g.box(A[0], A[1], A[2], A[3], { r: 4, fill: g.hexA(g.C.green, .15), stroke: g.C.green, lw: 4 }); g.text('ground truth', A[0], A[1] - 18, { size: 18, color: g.C.green });
        g.box(B[0], B[1], B[2], B[3], { r: 4, fill: g.hexA(g.C.pink, .15), stroke: g.C.pink, lw: 4 }); g.text('prediction', B[0] + B[2], B[1] + B[3] + 24, { size: 18, color: g.C.pink, align: 'right' });
        var x1 = Math.max(A[0], B[0]), y1 = Math.max(A[1], B[1]), x2 = Math.min(A[0] + A[2], B[0] + B[2]), y2 = Math.min(A[1] + A[3], B[1] + B[3]); if (x2 > x1 && y2 > y1) g.box(x1, y1, x2 - x1, y2 - y1, { r: 2, fill: g.hexA(g.C.amber, .55) });
        var v = iou(A, B); g.panel(820, 230, 380, 300); g.text('IoU = overlap ÷ union', 850, 280, { size: 22, weight: 700 }); g.text(v.toFixed(2), 850, 360, { size: 64, weight: 700, mono: true, color: v >= .5 ? g.C.green : g.C.amber }); g.text(v >= .5 ? 'counts as a correct detection (≥ 0.5)' : 'too little overlap', 850, 440, { size: 19, color: g.C.muted, maxW: 330, lh: 25 });
        return;
      }
      if (mode === 'sliding') {
        g.heading(P.head || 'Sliding windows: the slow, classic approach', p, P.sub); scene(g, SX, SY, SW, SH);
        var nx = 7, ny = 4, cnt = Math.floor(g.seg(p, .08, .9) * nx * ny), i = Math.min(nx * ny - 1, cnt), wx = SX + (i % nx) * (SW - 200) / (nx - 1), wy = SY + Math.floor(i / nx) * (SH - 170) / (ny - 1), win = [wx, wy, 200, 170];
        var sc = Math.max.apply(null, OBJ.filter(function (o) { return o.k === 'car'; }).map(function (o) { return iou(win, box(o, SX, SY, SW, SH)); }));
        g.box(wx, wy, 200, 170, { r: 4, stroke: sc > .3 ? g.C.green : g.C.amber, lw: 4, glow: sc > .3 ? g.C.green : null });
        g.panel(880, 220, 330, 260); g.text('Window ' + (i + 1) + ' of ' + nx * ny, 905, 262, { size: 20, mono: true }); g.text('“car” score', 905, 320, { size: 18, color: g.C.muted }); g.text(Math.min(.99, sc * 1.6).toFixed(2), 905, 364, { size: 42, weight: 700, mono: true, color: sc > .3 ? g.C.green : g.C.amber });
        g.text('A real image needs thousands of windows at many sizes.', 905, 430, { size: 17, color: g.C.muted, maxW: 290, lh: 22 });
        return;
      }
      g.heading(P.head || 'Object detection: boxes, scores and NMS', p, P.sub); scene(g, SX, SY, SW, SH);
      var ph = g.seg(p, .05, .95), gx = 8, gy = 5;
      if (ph < .3) { for (var c = 1; c < gx; c++) g.line(SX + c * SW / gx, SY, SX + c * SW / gx, SY + SH, { color: 'rgba(255,255,255,.35)', lw: 1.5, alpha: g.seg(ph, 0, .1) }); for (var r = 1; r < gy; r++) g.line(SX, SY + r * SH / gy, SX + SW, SY + r * SH / gy, { color: 'rgba(255,255,255,.35)', lw: 1.5, alpha: g.seg(ph, 0, .1) }); }
      var rnd = g.rng(12), cands = [];
      OBJ.forEach(function (o, oi) { var b = box(o, SX, SY, SW, SH); for (var k = 0; k < 4; k++) { var jx = (rnd() - .5) * b[2] * .3, jy = (rnd() - .5) * b[3] * .3, sc2 = k === 0 ? .82 + rnd() * .15 : .4 + rnd() * .35; cands.push({ b: [b[0] + jx, b[1] + jy, b[2] * (.9 + rnd() * .25), b[3] * (.9 + rnd() * .25)], s: sc2, o: oi, keep: k === 0 }); } });
      var showC = g.seg(ph, .15, .4), nms = g.seg(ph, .5, .75);
      cands.forEach(function (c2, k) {
        var a = g.seg(showC, k / cands.length * .8, k / cands.length * .8 + .2); if (nms > 0 && !c2.keep) a *= 1 - nms; if (a <= 0) return;
        var o = OBJ[c2.o], col = { car: g.C.pink, person: g.C.amber, tree: g.C.green }[o.k];
        g.box(c2.b[0], c2.b[1], c2.b[2], c2.b[3], { r: 3, stroke: col, lw: c2.keep && nms > .5 ? 4 : 2, alpha: a });
        if (c2.keep && nms > .7) { var lbl = o.label + ' ' + c2.s.toFixed(2), w = g.measure(lbl, { size: 16, weight: 700 }) + 14; g.box(c2.b[0], c2.b[1] - 26, w, 24, { r: 4, fill: col }); g.text(lbl, c2.b[0] + 7, c2.b[1] - 13, { size: 16, weight: 700, color: '#10142c' }); }
      });
      g.panel(880, 200, 330, 330);
      var stage = ph < .3 ? ['1 · Grid', 'The image is divided into cells. Each cell predicts boxes around objects whose centre falls inside it.'] : ph < .5 ? ['2 · Candidates', 'Many overlapping boxes, each with a confidence score.'] : ['3 · Non-max suppression', 'Keep the highest-scoring box; delete boxes that overlap it too much (IoU > 0.5).'];
      g.text(stage[0], 905, 244, { size: 22, weight: 700, color: g.C.cyan }); g.text(stage[1], 905, 290, { size: 19, maxW: 285, lh: 26 });
    }
  });

  M.kit('segment', {
    draw: function (g, p, P, S, t) {
      var mode = P.mode || 'semantic', SX = 90, SY = 170, SW = 760, SH = 470;
      if (mode === 'unet') {
        g.heading(P.head || 'U-Net: down to understand, up to locate', p, P.sub);
        var lv = [[150, 240, 130], [300, 330, 100], [450, 420, 70], [640, 520, 50], [830, 420, 70], [980, 330, 100], [1130, 240, 130]], ph = g.seg(p, .05, .9);
        lv.forEach(function (l, i) { var a = g.E.out(g.seg(ph, i * .1, .1 + i * .1)), c = i < 3 ? g.C.cyan : i === 3 ? g.C.amber : g.C.pink; g.box(l[0] - 34, l[1] - l[2] / 2, 68, l[2], { r: 10, fill: g.hexA(c, .25), stroke: c, lw: 2.5, alpha: a }); if (i < 6) g.arrow(l[0] + 36, l[1], lv[i + 1][0] - 36, lv[i + 1][1], { color: g.C.muted, lw: 2.5, head: 8, alpha: g.seg(ph, i * .1 + .08, i * .1 + .14) }); });
        [[0, 6], [1, 5], [2, 4]].forEach(function (s, i) { var a = g.seg(ph, .72 + i * .06, .8 + i * .06); g.line(lv[s[0]][0] + 36, lv[s[0]][1] - 10, lv[s[1]][0] - 36, lv[s[1]][1] - 10, { color: g.C.green, lw: 3, dash: [10, 8], alpha: a }); });
        g.text('encoder: what is in the image', 300, 640, { size: 19, color: g.C.cyan, align: 'center', alpha: g.seg(ph, .1, .2) }); g.text('decoder: where exactly it is', 980, 640, { size: 19, color: g.C.pink, align: 'center', alpha: g.seg(ph, .5, .6) }); g.text('skip connections carry fine detail across', 640, 190, { size: 19, color: g.C.green, align: 'center', alpha: g.seg(ph, .72, .8) });
        return;
      }
      var inst = mode === 'instance';
      g.heading(P.head || (inst ? 'Instance segmentation: every object separately' : 'Semantic segmentation: a label for every pixel'), p, P.sub);
      scene(g, SX, SY, SW, SH);
      var w = g.E.inOut(g.seg(p, .15, .7));
      g.ctx.save(); g.ctx.beginPath(); g.ctx.rect(SX, SY, SW * w, SH); g.ctx.clip(); g.ctx.globalAlpha *= .92; scene(g, SX, SY, SW, SH, inst ? 'inst' : 'mask'); g.ctx.restore();
      if (w > 0 && w < 1) g.line(SX + SW * w, SY, SX + SW * w, SY + SH, { color: g.C.white, lw: 3, glow: g.C.white });
      var legend = inst ? [['car #1', '#ff4d6d'], ['car #2', '#ffb020'], ['person #1', '#9b5de5'], ['tree #1', '#3ddc84']] : [['sky', '#4dabf7'], ['road', '#6c757d'], ['car', '#ff4d6d'], ['person', '#ffe14d'], ['tree', '#3ddc84']];
      g.panel(880, 200, 330, 60 + legend.length * 50, { alpha: g.seg(p, .6, .7) });
      legend.forEach(function (l, i) { var a = g.seg(p, .62 + i * .04, .7 + i * .04); g.box(905, 232 + i * 50, 26, 26, { r: 6, fill: l[1], alpha: a }); g.text(l[0], 944, 245 + i * 50, { size: 21, weight: 600, alpha: a }); });
      g.text(inst ? 'Two cars → two different masks.' : 'Both cars share one “car” colour.', 905, 290 + legend.length * 50, { size: 18, color: g.C.muted, alpha: g.seg(p, .75, .85), maxW: 290 });
    }
  });

  /* ---------- vision transformer: patches become tokens ---------- */
  M.kit('vit', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Vision Transformer: an image as a sequence of patches', p, P.sub);
      var img = picCanvas(g, 48), n = 4, ps = 64, x0 = 90, y0 = 200, fly = g.E.inOut(g.seg(p, .2, .5)), ctx = g.ctx;
      for (var i = 0; i < n * n; i++) {
        var r = Math.floor(i / n), c = i % n, sx = x0 + c * (ps + 6 * g.seg(p, .08, .18)), sy = y0 + r * (ps + 6 * g.seg(p, .08, .18)), tx = 160 + i * 64, ty = 560, x = g.lerp(sx, tx, fly), y = g.lerp(sy, ty, fly), s = g.lerp(ps, 52, fly);
        ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(img, c * 12, r * 12, 12, 12, x, y, s, s); ctx.restore();
        g.box(x, y, s, s, { r: 3, stroke: 'rgba(255,255,255,.5)', lw: 1 });
        if (fly > .9) g.text(String(i + 1), x + s / 2, y + s + 16, { size: 13, mono: true, align: 'center', color: g.C.muted });
      }
      if (fly > .9) { g.box(92, 560, 52, 52, { r: 8, fill: g.hexA(g.C.amber, .6), stroke: g.C.amber }); g.text('CLS', 118, 587, { size: 14, weight: 800, align: 'center', color: '#10142c' }); g.text('+ position numbers', 1180, 630, { size: 17, color: g.C.muted, align: 'right' }); }
      var ta = g.E.out(g.seg(p, .55, .7)); g.box(160, 330, 1024, 120, { r: 20, fill: 'rgba(167,139,250,.14)', stroke: g.C.violet, lw: 2.5, alpha: ta }); g.text('Transformer encoder: every patch attends to every other patch', 672, 390, { size: 22, weight: 700, align: 'center', alpha: ta });
      if (ta > .5) { var r2 = g.rng(Math.floor(t * 2)); for (var k = 0; k < 10; k++) { var a = Math.floor(r2() * 16), b = Math.floor(r2() * 16); g.line(186 + a * 64, 556, 186 + b * 64, 452, { color: g.hexA(g.C.pink, .5), lw: 1.5 }); } }
      var oa = g.E.back(g.seg(p, .75, .88)); g.arrow(118, 556, 118, 300, { color: g.C.amber, lw: 3, p: oa }); g.pill(118, 260, (P.label || 'house') + ' · 91%', { fill: g.C.green, align: 'center', alpha: oa, size: 20 });
      g.text('16 patches of 12×12 pixels → 16 tokens (real ViTs use 16×16-pixel patches)', 520, 230, { size: 18, color: g.C.muted, alpha: g.seg(p, .5, .6) });
    }
  });

  /* ---------- human pose estimation ---------- */
  M.kit('pose', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Pose estimation: finding the body’s keypoints', p, P.sub);
      var cx = 470, base = 620, sw = Math.sin(t * 3) * .5, ph = g.seg(p, .05, .95);
      var K = { head: [0, -330], neck: [0, -285], ls: [-50, -270], rs: [50, -270], le: [-75 - sw * 20, -200], re: [75 + sw * 20, -200], lw: [-70 - sw * 55, -130], rw: [85 + sw * 50, -140 - Math.abs(sw) * 40], lh: [-32, -150], rh: [32, -150], lk: [-40 + sw * 30, -75], rk: [40 - sw * 30, -75], la: [-45 + sw * 55, 0], ra: [45 - sw * 55, 0] };
      var P2 = function (k) { return [cx + K[k][0], base + K[k][1]]; };
      var limbs = [['neck', 'ls'], ['neck', 'rs'], ['ls', 'le'], ['le', 'lw'], ['rs', 're'], ['re', 'rw'], ['neck', 'lh'], ['neck', 'rh'], ['lh', 'rh'], ['lh', 'lk'], ['lk', 'la'], ['rh', 'rk'], ['rk', 'ra'], ['head', 'neck']];
      var sil = 1 - g.seg(ph, .55, .75) * .7;
      g.ctx.save(); g.ctx.globalAlpha *= sil * .8; g.ctx.strokeStyle = '#3f4a86'; g.ctx.lineWidth = 34; g.ctx.lineCap = 'round'; limbs.forEach(function (l) { var a = P2(l[0]), b = P2(l[1]); g.ctx.beginPath(); g.ctx.moveTo(a[0], a[1]); g.ctx.lineTo(b[0], b[1]); g.ctx.stroke(); }); g.ctx.restore();
      g.circle(P2('head')[0], P2('head')[1], 34, { fill: '#3f4a86', alpha: sil * .8 });
      var hm = g.seg(ph, .15, .35), kp = g.seg(ph, .35, .5), sk = g.seg(ph, .5, .7);
      Object.keys(K).forEach(function (k, i) { var q = P2(k); if (hm > 0 && kp < 1) g.circle(q[0], q[1], 26, { fill: g.hexA(g.C.orange, .35 * (1 - kp)), glow: g.C.orange, alpha: hm }); if (kp > 0) g.circle(q[0], q[1], 8, { fill: g.PAL[i % g.PAL.length], glow: g.PAL[i % g.PAL.length], alpha: kp }); });
      limbs.forEach(function (l, i) { var a = P2(l[0]), b = P2(l[1]); g.line(a[0], a[1], b[0], b[1], { color: g.PAL[i % g.PAL.length], lw: 5, p: sk }); });
      g.panel(800, 200, 400, 360);
      [['1 · Heatmaps', 'For every joint, the network predicts where it is likely to be.', .15], ['2 · Keypoints', 'The peak of each heatmap becomes a keypoint (x, y).', .35], ['3 · Skeleton', 'Connected keypoints form a skeleton that can be tracked frame by frame.', .5]].forEach(function (s, i) { var a = g.seg(ph, s[2], s[2] + .1); g.text(s[0], 825, 240 + i * 105, { size: 21, weight: 700, color: g.C.orange, alpha: a }); g.text(s[1], 825, 272 + i * 105, { size: 17, maxW: 350, lh: 22, alpha: a }); });
    }
  });
})(window.Motion);
