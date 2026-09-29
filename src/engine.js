/*
 * AI in Motion — animation engine and video player.
 * Every lecture is a timeline of scenes. Each scene is drawn by a "kit" on a 1280×720 canvas,
 * with subtitles and optional spoken narration (Web Speech API).
 * © Janin A Apurba, CSE, AUST · Advanced ICT Officer, CNRS-UNHCR
 */
(function (global) {
  'use strict';
  var W = 1280, H = 720;
  var C = {
    bg: '#060a17', bg2: '#0c1330', ink: '#eef1ff', muted: '#8f99be', faint: '#232c52', line: '#2d3868',
    cyan: '#22d3ee', violet: '#a78bfa', pink: '#f472b6', amber: '#fbbf24', green: '#34d399', red: '#f87171',
    blue: '#60a5fa', orange: '#fb923c', white: '#ffffff', panel: 'rgba(20,28,64,.72)'
  };
  var PAL = [C.cyan, C.pink, C.amber, C.green, C.violet, C.orange, C.blue, C.red];
  var FF = "'Inter', system-ui, sans-serif", FH = "'Space Grotesk', 'Inter', sans-serif", FM = "'JetBrains Mono', Consolas, monospace";

  var clamp = function (v, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a)); };
  var E = {
    lin: function (t) { return t; },
    out: function (t) { return 1 - Math.pow(1 - t, 3); },
    inOut: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    back: function (t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };
  function rng(a) { a = a >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gauss(r) { var u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
  function hexA(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function mix(a, b, t) {
    var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
    var r = Math.round(lerp(x >> 16 & 255, y >> 16 & 255, t)), g = Math.round(lerp(x >> 8 & 255, y >> 8 & 255, t)), bl = Math.round(lerp(x & 255, y & 255, t));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
  }

  /* ---------- drawing helpers ---------- */
  function makeG(ctx) {
    var g = { ctx: ctx, W: W, H: H, C: C, PAL: PAL, E: E, seg: seg, clamp: clamp, lerp: lerp, rng: rng, gauss: gauss, hexA: hexA, mix: mix };
    g.setFont = function (o) { ctx.font = (o.italic ? 'italic ' : '') + (o.weight || 500) + ' ' + (o.size || 24) + 'px ' + (o.mono ? FM : o.head ? FH : FF); };
    g.wrap = function (s, maxW) {
      var words = String(s).split(/\s+/), lines = [], cur = '';
      for (var i = 0; i < words.length; i++) {
        var t = cur ? cur + ' ' + words[i] : words[i];
        if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = words[i]; } else cur = t;
      }
      if (cur) lines.push(cur);
      return lines;
    };
    g.text = function (s, x, y, o) {
      o = o || {}; ctx.save();
      if (o.alpha != null) ctx.globalAlpha *= clamp(o.alpha);
      g.setFont(o); ctx.fillStyle = o.color || C.ink; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle';
      if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur || 18; }
      var w;
      if (o.maxW) {
        var lines = g.wrap(s, o.maxW), lh = o.lh || (o.size || 24) * 1.32, off = o.vcenter ? -(lines.length - 1) * lh / 2 : 0;
        for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], x, y + off + i * lh);
        w = lines.length * lh;
      } else { ctx.fillText(String(s), x, y); w = ctx.measureText(String(s)).width; }
      ctx.restore(); return w;
    };
    g.measure = function (s, o) { ctx.save(); g.setFont(o || {}); var w = ctx.measureText(String(s)).width; ctx.restore(); return w; };
    g.rr = function (x, y, w, h, r) {
      r = Math.max(0, Math.min(r, w / 2, h / 2)); ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    };
    g.box = function (x, y, w, h, o) {
      o = o || {}; if (w <= 0 || h <= 0) return; ctx.save();
      if (o.alpha != null) ctx.globalAlpha *= clamp(o.alpha);
      g.rr(x, y, w, h, o.r == null ? 14 : o.r);
      if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur || 24; }
      if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
      ctx.shadowBlur = 0;
      if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 2; if (o.dash) ctx.setLineDash(o.dash); ctx.stroke(); }
      ctx.restore();
    };
    g.circle = function (x, y, r, o) {
      o = o || {}; if (r <= 0) return; ctx.save();
      if (o.alpha != null) ctx.globalAlpha *= clamp(o.alpha);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur || 20; }
      if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
      ctx.shadowBlur = 0;
      if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 2; if (o.dash) ctx.setLineDash(o.dash); ctx.stroke(); }
      ctx.restore();
    };
    g.line = function (x1, y1, x2, y2, o) {
      o = o || {}; var p = o.p == null ? 1 : clamp(o.p); if (p <= 0) return; ctx.save();
      if (o.alpha != null) ctx.globalAlpha *= clamp(o.alpha);
      ctx.strokeStyle = o.color || C.line; ctx.lineWidth = o.lw || 2; ctx.lineCap = 'round';
      if (o.dash) ctx.setLineDash(o.dash);
      if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur || 14; }
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, p), lerp(y1, y2, p)); ctx.stroke(); ctx.restore();
    };
    g.arrow = function (x1, y1, x2, y2, o) {
      o = o || {}; var p = o.p == null ? 1 : clamp(o.p); if (p <= 0) return;
      var ex = lerp(x1, x2, p), ey = lerp(y1, y2, p); g.line(x1, y1, ex, ey, o);
      var a = Math.atan2(y2 - y1, x2 - x1), s = o.head || 12;
      ctx.save(); if (o.alpha != null) ctx.globalAlpha *= clamp(o.alpha);
      ctx.fillStyle = o.color || C.line; ctx.beginPath(); ctx.moveTo(ex, ey);
      ctx.lineTo(ex - s * Math.cos(a - .45), ey - s * Math.sin(a - .45)); ctx.lineTo(ex - s * Math.cos(a + .45), ey - s * Math.sin(a + .45)); ctx.closePath(); ctx.fill(); ctx.restore();
    };
    g.path = function (pts, o) {
      o = o || {}; if (pts.length < 2) return; var p = o.p == null ? 1 : clamp(o.p); if (p <= 0) return;
      var total = 0, d = [0]; for (var i = 1; i < pts.length; i++) { total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); d.push(total); }
      var lim = total * p; ctx.save(); if (o.alpha != null) ctx.globalAlpha *= clamp(o.alpha);
      ctx.strokeStyle = o.color || C.cyan; ctx.lineWidth = o.lw || 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (o.dash) ctx.setLineDash(o.dash);
      if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur || 14; }
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (var j = 1; j < pts.length; j++) {
        if (d[j] <= lim) ctx.lineTo(pts[j][0], pts[j][1]);
        else { var f = (lim - d[j - 1]) / (d[j] - d[j - 1] || 1); ctx.lineTo(lerp(pts[j - 1][0], pts[j][0], f), lerp(pts[j - 1][1], pts[j][1], f)); break; }
      }
      if (o.fill && p >= 1) { ctx.closePath(); ctx.fillStyle = o.fill; ctx.fill(); }
      ctx.stroke(); ctx.restore();
    };
    g.alpha = function (a, fn) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); fn(); ctx.restore(); };
    g.pill = function (x, y, s, o) {
      o = o || {}; var size = o.size || 18, w = g.measure(s, { size: size, weight: 700 }) + (o.pad || 28), h = o.h || size * 2;
      var bx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
      g.box(bx, y - h / 2, w, h, { r: h / 2, fill: o.fill || C.cyan, alpha: o.alpha, glow: o.glow, stroke: o.stroke });
      g.text(s, bx + w / 2, y + 1, { size: size, weight: 700, color: o.color || C.bg, align: 'center', alpha: o.alpha });
      return w;
    };
    g.heading = function (s, p, sub) {
      var a = E.out(seg(p, 0, .12)), dx = (1 - a) * -30;
      g.box(56 + dx, 58, 6, 44, { r: 3, fill: C.cyan, alpha: a, glow: C.cyan });
      var hs = Math.min(40, Math.floor(40 * 1120 / Math.max(1, g.measure(s, { size: 40, weight: 700, head: true })))), ss = sub ? Math.min(20, Math.floor(20 * 1120 / Math.max(1, g.measure(sub, { size: 20 })))) : 20;
      g.text(s, 80 + dx, 80, { size: hs, weight: 700, head: true, alpha: a });
      if (sub) g.text(sub, 82 + dx, 124, { size: ss, color: C.muted, alpha: E.out(seg(p, .05, .18)) });
    };
    g.panel = function (x, y, w, h, o) { o = o || {}; g.box(x, y, w, h, { r: o.r || 20, fill: o.fill || C.panel, stroke: o.stroke || 'rgba(120,140,220,.22)', lw: 1.5, alpha: o.alpha }); };
    g.img = function (canvas, x, y, w, h, o) { o = o || {}; ctx.save(); if (o.alpha != null) ctx.globalAlpha *= clamp(o.alpha); ctx.imageSmoothingEnabled = !!o.smooth; ctx.drawImage(canvas, x, y, w, h); ctx.restore(); };
    g.canvas = function (w, h, fn) { var c = document.createElement('canvas'); c.width = w; c.height = h; var cx = c.getContext('2d'); fn(cx, c); return c; };
    g.pixels = function (w, h, fn) { // fn(x,y) -> [r,g,b]
      return g.canvas(w, h, function (cx) { var id = cx.createImageData(w, h); for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var v = fn(x, y), k = (y * w + x) * 4; id.data[k] = v[0]; id.data[k + 1] = v[1]; id.data[k + 2] = v[2]; id.data[k + 3] = v[3] == null ? 255 : v[3]; } cx.putImageData(id, 0, 0); });
    };
    g.axes = function (x0, y0, w, h, o) {
      o = o || {}; var a = o.alpha == null ? 1 : o.alpha;
      g.line(x0, y0 + h, x0 + w, y0 + h, { color: '#4a5690', lw: 2, alpha: a });
      g.line(x0, y0, x0, y0 + h, { color: '#4a5690', lw: 2, alpha: a });
      if (o.xl) g.text(o.xl, x0 + w, y0 + h + 30, { size: 17, color: C.muted, align: 'right', alpha: a });
      if (o.yl) g.text(o.yl, x0 - 12, y0 - 18, { size: 17, color: C.muted, alpha: a });
    };
    g.pulse = function (t, speed) { return .5 + .5 * Math.sin(t * (speed || 4)); };
    return g;
  }

  /* ---------- ambient background ---------- */
  function drawBg(g, T, accent) {
    var ctx = g.ctx;
    var gr = ctx.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#070b1c'); gr.addColorStop(1, '#0b1030');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    var orb = function (x, y, r, col, a) { var rg = ctx.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, hexA(col, a)); rg.addColorStop(1, hexA(col, 0)); ctx.fillStyle = rg; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); };
    orb(W * .82 + Math.sin(T * .13) * 60, H * .18 + Math.cos(T * .11) * 40, 520, accent || C.violet, .16);
    orb(W * .12 + Math.cos(T * .09) * 50, H * .9 + Math.sin(T * .12) * 30, 460, C.cyan, .1);
    ctx.save(); ctx.strokeStyle = 'rgba(120,140,220,.06)'; ctx.lineWidth = 1; var off = (T * 6) % 64;
    ctx.beginPath(); for (var x = -off; x < W; x += 64) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (var y = -off; y < H; y += 64) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke(); ctx.restore();
  }

  /* ---------- kits registry ---------- */
  var KITS = {};
  function kit(name, def) { KITS[name] = def; }

  /* ---------- timing ---------- */
  function sentences(s) { // split after . ! ? only when followed by a space or the end, so numbers like 0.55 stay whole
    s = String(s || ''); var out = [], cur = '';
    for (var i = 0; i < s.length; i++) {
      cur += s[i];
      if (/[.!?]/.test(s[i])) { while (i + 1 < s.length && /["')\]’”]/.test(s[i + 1])) cur += s[++i]; if (i + 1 >= s.length || /\s/.test(s[i + 1])) { out.push(cur.trim()); cur = ''; } }
    }
    if (cur.trim()) out.push(cur.trim());
    return out.filter(Boolean);
  }
  function sceneDur(sc) { if (sc.dur) return sc.dur; var words = String(sc.say || '').split(/\s+/).filter(Boolean).length; return clamp(words / 2.55 + 1.6, 5, 24); }
  function fmt(t) { t = Math.max(0, Math.floor(t)); return Math.floor(t / 60) + ':' + ('0' + t % 60).slice(-2); }

  /* ---------- speech ---------- */
  var synth = global.speechSynthesis || null, VOICE = null;
  function pickVoice() {
    if (!synth) return null; var vs = synth.getVoices().filter(function (v) { return /^en(-|_|$)/i.test(v.lang); });
    var pref = [/natural/i, /aria|jenny|guy|sonia|libby|ryan/i, /google (uk|us) english/i, /samantha|daniel|karen|moira/i];
    for (var i = 0; i < pref.length; i++) { var f = vs.filter(function (v) { return pref[i].test(v.name); })[0]; if (f) return f; }
    return vs[0] || null;
  }
  if (synth) { VOICE = pickVoice(); if (synth.addEventListener) synth.addEventListener('voiceschanged', function () { VOICE = pickVoice(); }); }
  var store = { get: function (k, d) { try { var v = localStorage.getItem('aim-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set: function (k, v) { try { localStorage.setItem('aim-' + k, JSON.stringify(v)); } catch (e) { } } };

  /* ---------- player ---------- */
  var ICON = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>', pause: '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>', next: '<svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5l11 7-11 7z"/></svg>',
    voice: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zM16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    mute: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    cc: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 10.5a2 2 0 1 0 0 3M16.5 10.5a2 2 0 1 0 0 3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    replay: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
  };
  var SPEEDS = [0.75, 1, 1.25, 1.5, 2];
  var players = [];

  function Player(root, lec, opt) {
    opt = opt || {};
    var self = this; this.root = root; this.lec = lec; this.opt = opt;
    this.scenes = lec.scenes.map(function (s) { var o = {}; for (var k in s) o[k] = s[k]; if (!o.accent && lec.accent) o.accent = lec.accent; o.dur = sceneDur(s); o.sents = sentences(s.say); return o; });
    this.starts = []; var acc = 0; this.scenes.forEach(function (s) { self.starts.push(acc); acc += s.dur; }); this.total = acc;
    this.time = 0; this.playing = false; this.ended = false; this.speedIdx = store.get('speed', 1);
    this.voiceOn = !!synth && !opt.silent && store.get('voice', true); this.ccOn = store.get('cc', true) && !opt.nocc;
    this.token = 0; this.speaking = false; this.speechSent = -1; this.hold = false; this.last = 0; this.ambient = 0;
    this.build(); this.resize(); this.render();
    players.push(this);
    if (global.ResizeObserver) new ResizeObserver(function () { self.resize(); self.render(); }).observe(this.stage);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { self.render(); });
  }
  Player.prototype.build = function () {
    var self = this, r = this.root, minimal = this.opt.minimal;
    r.classList.add('mv'); if (minimal) r.classList.add('mv-min');
    r.innerHTML = '<div class="mv-stage"><canvas class="mv-canvas" aria-hidden="true"></canvas><div class="mv-cap" aria-live="polite"></div>' +
      (minimal ? '' : '<button class="mv-big" type="button" aria-label="Play video">' + ICON.play + '</button><div class="mv-flash"></div>') + '</div>' +
      (minimal ? '' : '<div class="mv-bar"><div class="mv-track" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="' + Math.round(this.total) + '"><div class="mv-marks">' +
        this.starts.map(function (s) { return '<i style="left:' + (s / self.total * 100) + '%"></i>'; }).join('') +
        '</div><div class="mv-fill"></div><div class="mv-knob"></div><div class="mv-tip">' + (this.lec.thumbs ? '<img alt="" width="160" height="90">' : '') + '<span></span></div></div></div>' +
        '<div class="mv-ctrl"><button type="button" class="mv-btn mv-play" data-a="play" aria-label="Play or pause (K)">' + ICON.play + '</button>' +
        '<button type="button" class="mv-btn" data-a="prev" aria-label="Previous chapter">' + ICON.prev + '</button><button type="button" class="mv-btn" data-a="next" aria-label="Next chapter">' + ICON.next + '</button>' +
        '<span class="mv-time">0:00 / ' + fmt(this.total) + '</span><span class="mv-chap"></span>' +
        (synth ? '<button type="button" class="mv-btn mv-voice" data-a="voice" aria-label="Toggle narration voice (M)"></button>' : '') +
        '<button type="button" class="mv-btn mv-cc" data-a="cc" aria-label="Toggle subtitles (C)">' + ICON.cc + '</button>' +
        '<button type="button" class="mv-btn mv-speed" data-a="speed" aria-label="Playback speed">1×</button>' +
        '<button type="button" class="mv-btn" data-a="full" aria-label="Fullscreen (F)">' + ICON.full + '</button></div>');
    this.stage = r.querySelector('.mv-stage'); this.canvas = r.querySelector('canvas'); this.ctx = this.canvas.getContext('2d'); this.g = makeG(this.ctx);
    this.cap = r.querySelector('.mv-cap'); this.big = r.querySelector('.mv-big'); this.flash = r.querySelector('.mv-flash');
    this.track = r.querySelector('.mv-track'); this.fill = r.querySelector('.mv-fill'); this.knob = r.querySelector('.mv-knob'); this.tip = r.querySelector('.mv-tip'); this.tipText = this.tip && this.tip.querySelector('span'); this.tipImg = this.tip && this.tip.querySelector('img');
    this.timeEl = r.querySelector('.mv-time'); this.chapEl = r.querySelector('.mv-chap'); this.playBtn = r.querySelector('.mv-play');
    this.voiceBtn = r.querySelector('.mv-voice'); this.ccBtn = r.querySelector('.mv-cc'); this.speedBtn = r.querySelector('.mv-speed');
    this.updateButtons();
    if (minimal) return;
    r.tabIndex = 0;
    r.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]');
      if (b) { self.action(b.dataset.a); return; }
      if (e.target.closest('.mv-big') || e.target.closest('.mv-stage')) self.toggle();
    });
    var seeking = false;
    var posToTime = function (e) { var rc = self.track.getBoundingClientRect(); return clamp((e.clientX - rc.left) / rc.width) * self.total; };
    this.track.addEventListener('pointerdown', function (e) { seeking = true; self.track.setPointerCapture(e.pointerId); self.seek(posToTime(e)); });
    this.track.addEventListener('pointermove', function (e) {
      var t = posToTime(e), i = self.sceneAt(t);
      self.tipText.textContent = fmt(t) + ' · ' + (self.scenes[i].chapter || 'Part ' + (i + 1)); self.tip.style.left = (t / self.total * 100) + '%';
      if (self.tipImg) { var src = self.lec.thumbs + String(i + 1).padStart(2, '0') + '.webp'; if (self.tipImg.getAttribute('src') !== src) self.tipImg.setAttribute('src', src); }
      if (seeking) self.seek(t);
    });
    this.track.addEventListener('pointerup', function () { seeking = false; });
    r.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT') return;
      var k = e.key.toLowerCase();
      if (k === ' ' || k === 'k') { e.preventDefault(); self.toggle(); }
      else if (k === 'arrowright' || k === 'l') { e.preventDefault(); self.seek(self.time + 5); }
      else if (k === 'arrowleft' || k === 'j') { e.preventDefault(); self.seek(self.time - 5); }
      else if (k === 'n') self.action('next');
      else if (k === 'p') self.action('prev');
      else if (k === 'f') self.action('full');
      else if (k === 'c') self.action('cc');
      else if (k === 'm') self.action('voice');
    });
  };
  Player.prototype.updateButtons = function () {
    if (this.playBtn) { this.playBtn.innerHTML = this.playing ? ICON.pause : this.ended ? ICON.replay : ICON.play; }
    if (this.voiceBtn) { this.voiceBtn.innerHTML = this.voiceOn ? ICON.voice : ICON.mute; this.voiceBtn.classList.toggle('on', this.voiceOn); this.voiceBtn.title = this.voiceOn ? 'Narration on' : 'Narration off'; }
    if (this.ccBtn) this.ccBtn.classList.toggle('on', this.ccOn);
    if (this.speedBtn) this.speedBtn.textContent = SPEEDS[this.speedIdx] + '×';
    this.root.classList.toggle('playing', this.playing); this.root.classList.toggle('started', this.time > 0 || this.playing);
    this.cap.style.display = this.ccOn ? '' : 'none';
  };
  Player.prototype.resize = function () {
    var rc = this.stage.getBoundingClientRect(), dpr = Math.min(global.devicePixelRatio || 1, 2);
    var w = Math.max(320, Math.round(rc.width * dpr)); this.canvas.width = w; this.canvas.height = Math.round(w * 9 / 16); this.scale = w / W;
    this.root.style.setProperty('--cap', Math.max(12, rc.width / 52) + 'px');
  };
  Player.prototype.sceneAt = function (t) { for (var i = this.starts.length - 1; i >= 0; i--) if (t >= this.starts[i] - 1e-6) return i; return 0; };
  Player.prototype.render = function () {
    var g = this.g, ctx = this.ctx, i = this.sceneAt(this.time), sc = this.scenes[i], t = Math.min(this.time - this.starts[i], sc.dur);
    var cover = !this.playing && this.time === 0, tDraw = cover ? sc.dur * .55 : t, p = clamp(tDraw / sc.dur); // show a finished cover frame before the first play
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    drawBg(g, this.ambient, this.lec.accent);
    var k = KITS[sc.kit] || KITS.bullets;
    try {
      if (!sc._S && k.init) sc._S = k.init(sc, g) || {};
      ctx.save(); ctx.globalAlpha = clamp(tDraw / .45); k.draw(g, p, sc, sc._S || {}, tDraw); ctx.restore();
    } catch (err) { ctx.restore(); g.text('Scene error: ' + err.message, 40, 40, { size: 16, color: C.red }); if (global.console) console.error(err); }
    if (!this.opt.minimal) g.text('AI IN MOTION', W - 40, 40, { size: 14, weight: 700, color: 'rgba(160,175,230,.45)', align: 'right', head: true });
    this.updateUI(i, t);
  };
  Player.prototype.updateUI = function (i, t) {
    var sc = this.scenes[i], frac = this.time / this.total;
    if (this.fill) { this.fill.style.width = frac * 100 + '%'; this.knob.style.left = frac * 100 + '%'; this.track.setAttribute('aria-valuenow', Math.round(this.time)); }
    if (this.timeEl) this.timeEl.textContent = fmt(this.time) + ' / ' + fmt(this.total);
    if (this.chapEl) this.chapEl.textContent = sc.chapter || ('Part ' + (i + 1));
    // subtitles: follow the voice when speaking, otherwise time-based
    var si = 0;
    if (this.voiceOn && this.playing && this.speechSent >= 0 && this.speechScene === i) si = this.speechSent;
    else { var tot = 0, lens = sc.sents.map(function (s) { tot += s.length; return tot; }), pos = clamp(t / (sc.dur * .96)) * tot; for (si = 0; si < lens.length - 1 && pos > lens[si]; si++); }
    var line = sc.sents[si] || '';
    if (this.cap.textContent !== line) this.cap.textContent = line;
    this.cap.classList.toggle('empty', !line);
    if (this.lastScene !== i) {
      this.lastScene = i;
      if (this.flash && this.playing && sc.chapter) { this.flash.textContent = sc.chapter; this.flash.classList.remove('show'); void this.flash.offsetWidth; this.flash.classList.add('show'); }
      var ev = new CustomEvent('mv-scene', { detail: { index: i } }); this.root.dispatchEvent(ev);
    }
  };
  /* speech */
  Player.prototype.stopSpeech = function () { this.token++; this.speaking = false; this.speechSent = -1; if (synth) synth.cancel(); };
  Player.prototype.speakFrom = function (i, sIdx) {
    this.stopSpeech(); if (!this.voiceOn || !synth || !this.playing) return;
    var self = this, sc = this.scenes[i], tok = this.token, list = sc.sents.slice(sIdx);
    if (!list.length) return;
    this.speaking = true; this.speechScene = i;
    list.forEach(function (s, j) {
      var u = new SpeechSynthesisUtterance(s); if (VOICE) u.voice = VOICE; u.lang = VOICE ? VOICE.lang : 'en-US';
      u.rate = clamp(SPEEDS[self.speedIdx], .5, 2); u.pitch = 1;
      u.onstart = function () { if (tok === self.token) self.speechSent = sIdx + j; };
      u.onend = u.onerror = function () { if (tok === self.token && j === list.length - 1) { self.speaking = false; } };
      synth.speak(u);
    });
  };
  Player.prototype.sentenceAt = function (i, t) { var sc = this.scenes[i], tot = 0, lens = sc.sents.map(function (s) { tot += s.length; return tot; }), pos = clamp(t / (sc.dur * .96)) * tot, si = 0; for (; si < lens.length - 1 && pos > lens[si]; si++); return si; };
  /* transport */
  Player.prototype.play = function () {
    if (this.playing) return;
    if (this.ended || this.time >= this.total - .01) { this.time = 0; this.ended = false; }
    players.forEach(function (p) { if (p !== this && p.playing && !p.opt.minimal) p.pause(); }, this);
    this.playing = true; this.last = 0; this.updateButtons();
    var i = this.sceneAt(this.time); this.speakFrom(i, this.sentenceAt(i, this.time - this.starts[i]));
    var self = this; requestAnimationFrame(function (n) { self.loop(n); });
  };
  Player.prototype.pause = function () { if (!this.playing) return; this.playing = false; this.stopSpeech(); this.updateButtons(); this.render(); };
  Player.prototype.toggle = function () { this.playing ? this.pause() : this.play(); };
  Player.prototype.seek = function (t) {
    this.time = clamp(t, 0, this.total - .001); this.ended = false; var i = this.sceneAt(this.time);
    if (this.playing) this.speakFrom(i, this.sentenceAt(i, this.time - this.starts[i]));
    this.updateButtons(); this.render();
  };
  Player.prototype.seekScene = function (i) { this.seek(this.starts[clamp(i, 0, this.scenes.length - 1)] + .001); if (!this.playing) this.play(); };
  Player.prototype.loop = function (now) {
    if (!this.playing) return;
    var self = this, dt = this.last ? Math.min(.1, (now - this.last) / 1000) : 0; this.last = now;
    this.ambient += dt;
    var sp = SPEEDS[this.speedIdx], i = this.sceneAt(this.time), sc = this.scenes[i], local = this.time - this.starts[i] + dt * sp;
    if (local >= sc.dur) {
      if (this.voiceOn && this.speaking && this.speechScene === i && (this.holdT = (this.holdT || 0) + dt) < 20) { local = sc.dur - .0005; } // wait for the narrator (max 20 s)
      else if (i + 1 < this.scenes.length) { this.time = this.starts[i + 1] + (local - sc.dur); this.speakFrom(i + 1, 0); this.render(); requestAnimationFrame(function (n) { self.loop(n); }); return; }
      else if (this.opt.loop) { this.time = 0; this.render(); requestAnimationFrame(function (n) { self.loop(n); }); return; }
      else { this.time = this.total; this.playing = false; this.ended = true; this.stopSpeech(); this.updateButtons(); this.render(); this.root.dispatchEvent(new CustomEvent('mv-ended')); return; }
    }
    if (local < sc.dur - .001) this.holdT = 0;
    this.time = this.starts[i] + local;
    this.render();
    requestAnimationFrame(function (n) { self.loop(n); });
  };
  Player.prototype.action = function (a) {
    var i = this.sceneAt(this.time);
    if (a === 'play') this.toggle();
    else if (a === 'next') { if (i + 1 < this.scenes.length) this.seekScene(i + 1); }
    else if (a === 'prev') { var local = this.time - this.starts[i]; this.seekScene(local > 2 || i === 0 ? i : i - 1); }
    else if (a === 'voice') { this.voiceOn = !this.voiceOn; store.set('voice', this.voiceOn); if (this.voiceOn) this.speakFrom(i, this.sentenceAt(i, this.time - this.starts[i])); else this.stopSpeech(); this.updateButtons(); }
    else if (a === 'cc') { this.ccOn = !this.ccOn; store.set('cc', this.ccOn); this.updateButtons(); }
    else if (a === 'speed') { this.speedIdx = (this.speedIdx + 1) % SPEEDS.length; store.set('speed', this.speedIdx); this.updateButtons(); if (this.playing) this.speakFrom(i, this.sentenceAt(i, this.time - this.starts[i])); }
    else if (a === 'full') {
      var el = this.root, d = document;
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else if (el.requestFullscreen) el.requestFullscreen(); else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }
  };

  /* ---------- posters (thumbnails) ---------- */
  function poster(canvas, sceneDef, p, accent, t) {
    var dpr = Math.min(global.devicePixelRatio || 1, 2), w = Math.max(200, Math.round(canvas.clientWidth * dpr));
    if (canvas.width !== w) { canvas.width = w; canvas.height = Math.round(w * 9 / 16); }
    var ctx = canvas.getContext('2d'), g = makeG(ctx), s = canvas.width / W, k = KITS[sceneDef.kit] || KITS.bullets;
    if (accent && !sceneDef.accent) sceneDef.accent = accent;
    ctx.setTransform(s, 0, 0, s, 0, 0); drawBg(g, t || 0, accent);
    try { if (!sceneDef._S && k.init) sceneDef._S = k.init(sceneDef, g) || {}; k.draw(g, p, sceneDef, sceneDef._S || {}, (sceneDef.dur || 8) * p); } catch (e) { if (global.console) console.error(e); }
  }

  global.Motion = { kit: kit, KITS: KITS, Player: Player, poster: poster, players: players, sceneDur: sceneDur, fmt: fmt, C: C, PAL: PAL, W: W, H: H };
})(window);
