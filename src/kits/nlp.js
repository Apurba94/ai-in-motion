/* AI in Motion — natural language processing kits. © Janin A Apurba, CSE, AUST */
(function (M) {
  'use strict';
  var mk = function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  var hash = function (s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  /* a row of token chips; returns the x after the last chip */
  function chips(g, toks, x, y, o) {
    o = o || {}; var size = o.size || 20, gap = o.gap || 8, maxX = o.maxX || 1200, x0 = x, rowH = size * 2.2;
    toks.forEach(function (tk, i) {
      var a = o.reveal == null ? 1 : g.clamp(o.reveal - i), label = tk === ' ' ? '␣' : tk, w = g.measure(label, { size: size, weight: 600, mono: true }) + 22;
      if (x + w > maxX) { x = x0; y += rowH; }
      var c = o.colors ? o.colors[i % o.colors.length] : g.PAL[i % g.PAL.length];
      if (a > 0) { g.box(x, y - size * .85, w, size * 1.7, { r: 8, fill: g.hexA(c, .22), stroke: c, lw: 1.5, alpha: a }); g.text(label, x + w / 2, y + 1, { size: size, weight: 600, mono: true, align: 'center', alpha: a }); if (o.ids) g.text(String(hash(tk) % 50000), x + w / 2, y + size * 1.5, { size: 12, mono: true, color: g.C.muted, align: 'center', alpha: a }); }
      x += w + gap;
    });
    return { x: x, y: y };
  }

  /* ---------- three ways to tokenise the same text ---------- */
  M.kit('tokenize', {
    draw: function (g, p, P, S, t) {
      var text = P.text || 'Tokenizers aren’t magic!';
      g.heading(P.head || 'Three ways to split text into tokens', p, P.sub);
      g.panel(80, 160, 1120, 70); g.text('“' + text + '”', 640, 196, { size: 28, weight: 600, align: 'center' });
      var words = text.match(/[\w’']+|[^\s\w]/g) || [], chars = text.split(''), sub = P.sub_tokens || ['Token', 'izers', ' aren', '’t', ' magic', '!'];
      var rows = [['Word-level', words, 'short sequences, but a huge vocabulary and unknown words'], ['Character-level', chars, 'tiny vocabulary, but very long sequences'], ['Subword (BPE)', sub, 'the best of both — used by modern language models']];
      rows.forEach(function (r, i) {
        var st = .12 + i * .26, a = g.seg(p, st, st + .06); if (a <= 0) return;
        var y = 290 + i * 140;
        g.text(r[0], 100, y, { size: 22, weight: 700, color: g.PAL[i], alpha: a });
        g.text(r[1].length + ' tokens · ' + r[2], 100, y + 34, { size: 16, color: g.C.muted, alpha: a });
        chips(g, r[1], 400, y, { size: i === 1 ? 15 : 19, gap: i === 1 ? 4 : 8, reveal: g.seg(p, st, st + .2) * r[1].length, maxX: 1200 });
      });
    }
  });

  /* ---------- byte-pair encoding, computed on a tiny corpus ---------- */
  M.kit('bpe', {
    init: function (P) {
      var corpus = P.corpus || { low: 5, lower: 2, newest: 6, widest: 3 }, words = Object.keys(corpus).map(function (w) { return { sym: w.split('').concat(['_']), n: corpus[w], w: w }; });
      var states = [{ words: words.map(function (w) { return w.sym.slice(); }), merge: null }], merges = [];
      for (var k = 0; k < (P.merges || 8); k++) {
        var cnt = {};
        words.forEach(function (w) { for (var i = 0; i < w.sym.length - 1; i++) { var key = w.sym[i] + '\u0001' + w.sym[i + 1]; cnt[key] = (cnt[key] || 0) + w.n; } });
        var best = null, bc = 0; Object.keys(cnt).forEach(function (key) { if (cnt[key] > bc) { bc = cnt[key]; best = key; } });
        if (!best) break; var pr = best.split('\u0001');
        words.forEach(function (w) { var out = []; for (var i = 0; i < w.sym.length; i++) { if (i < w.sym.length - 1 && w.sym[i] === pr[0] && w.sym[i + 1] === pr[1]) { out.push(pr[0] + pr[1]); i++; } else out.push(w.sym[i]); } w.sym = out; });
        merges.push([pr[0], pr[1], bc]); states.push({ words: words.map(function (w) { return w.sym.slice(); }), merge: [pr[0], pr[1], bc] });
      }
      return { states: states, merges: merges, counts: Object.keys(corpus).map(function (w) { return corpus[w]; }), names: Object.keys(corpus) };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Byte-pair encoding: learning subwords', p, P.sub || 'Repeatedly merge the most frequent pair of symbols');
      var n = S.states.length, k = Math.min(n - 1, Math.floor(g.seg(p, .08, .92) * n)), st = S.states[k];
      g.panel(80, 170, 700, 430);
      g.text('word (count)', 110, 205, { size: 16, color: g.C.muted });
      st.words.forEach(function (syms, i) {
        var y = 260 + i * 88; g.text(S.names[i] + '  ×' + S.counts[i], 110, y, { size: 20, weight: 700, mono: true, color: g.C.muted });
        chips(g, syms.map(function (s) { return s.replace('_', '·'); }), 330, y, { size: 20, gap: 6, maxX: 770, colors: syms.map(function (s) { return st.merge && s === st.merge[0] + st.merge[1] ? g.C.amber : '#6b7bd0'; }) });
      });
      g.panel(820, 170, 380, 430);
      g.text('Merges learned', 850, 205, { size: 18, weight: 700, color: g.C.amber });
      S.merges.slice(0, k).forEach(function (m, i) { var cur = i === k - 1; g.text((i + 1) + '.  ' + m[0].replace('_', '·') + ' + ' + m[1].replace('_', '·') + '  →  ' + (m[0] + m[1]).replace('_', '·'), 850, 250 + i * 40, { size: 18, mono: true, weight: cur ? 700 : 500, color: cur ? g.C.ink : g.C.muted }); g.text('(' + m[2] + ')', 1170, 250 + i * 40, { size: 16, mono: true, align: 'right', color: g.C.muted }); });
      g.text('· marks the end of a word', 110, 630, { size: 16, color: g.C.muted });
    }
  });

  /* ---------- bag of words and TF-IDF ---------- */
  M.kit('bow-tfidf', {
    init: function (P) {
      var docs = P.docs || ['the cat sat on the mat', 'the dog sat on the log', 'the cat chased the dog'], toks = docs.map(function (d) { return d.split(' '); });
      var vocab = []; toks.forEach(function (ts) { ts.forEach(function (w) { if (vocab.indexOf(w) < 0) vocab.push(w); }); });
      var N = docs.length, counts = toks.map(function (ts) { return vocab.map(function (w) { return ts.filter(function (x) { return x === w; }).length; }); });
      var df = vocab.map(function (_, j) { return counts.filter(function (r) { return r[j] > 0; }).length; });
      var idf = df.map(function (d) { return Math.log(N / d); });
      var tfidf = counts.map(function (r, i) { return r.map(function (c, j) { return c / toks[i].length * idf[j]; }); });
      return { docs: docs, vocab: vocab, counts: counts, idf: idf, tfidf: tfidf };
    },
    draw: function (g, p, P, S, t) {
      var phase = p < .5 ? 0 : 1;
      g.heading(P.head || (phase ? 'TF-IDF: weigh words by how informative they are' : 'Bag of words: count every word'), p, P.sub);
      var cw = Math.min(110, 900 / S.vocab.length), x0 = 330, y0 = 250, rh = 90;
      S.docs.forEach(function (d, i) { g.text('Doc ' + (i + 1), 90, y0 + i * rh, { size: 18, weight: 700, color: g.PAL[i] }); g.text('“' + d + '”', 90, y0 + i * rh + 28, { size: 14, color: g.C.muted, maxW: 230 }); });
      S.vocab.forEach(function (w, j) { g.text(w, x0 + j * cw + cw / 2, y0 - 50, { size: 17, weight: 700, align: 'center', mono: true }); });
      var mx = 0; S.tfidf.forEach(function (r) { r.forEach(function (v) { mx = Math.max(mx, v); }); });
      S.counts.forEach(function (r, i) { r.forEach(function (c, j) {
        var a = g.seg(p, .06 + (i * S.vocab.length + j) * .004, .12 + (i * S.vocab.length + j) * .004), v = phase ? S.tfidf[i][j] : c, x = x0 + j * cw, y = y0 + i * rh - 26;
        var fill = phase ? g.hexA(g.C.green, .08 + .8 * v / mx) : g.hexA(g.C.blue, .08 + .3 * c);
        g.box(x + 3, y, cw - 6, 60, { r: 8, fill: fill, alpha: a }); g.text(phase ? v.toFixed(2) : String(c), x + cw / 2, y + 31, { size: 19, weight: 700, mono: true, align: 'center', alpha: a });
      }); });
      if (phase) { S.idf.forEach(function (v, j) { g.text('idf ' + v.toFixed(2), x0 + j * cw + cw / 2, y0 + 3 * rh + 4, { size: 14, mono: true, align: 'center', color: v === 0 ? g.C.red : g.C.muted, alpha: g.seg(p, .55, .65) }); }); g.text('“the” appears in every document → idf = 0 → weight 0', 640, 650, { size: 20, align: 'center', color: g.C.amber, alpha: g.seg(p, .7, .8) }); }
      else g.text('Word order is lost — only counts remain', 640, 650, { size: 20, align: 'center', color: g.C.muted, alpha: g.seg(p, .3, .4) });
    }
  });

  /* ---------- a bigram language model from real counts ---------- */
  M.kit('ngram', {
    init: function (P) {
      var corpus = P.corpus || 'i like green tea . i like black coffee . i drink green tea .', w = corpus.split(' '), big = {};
      for (var i = 0; i < w.length - 1; i++) { big[w[i]] = big[w[i]] || {}; big[w[i]][w[i + 1]] = (big[w[i]][w[i + 1]] || 0) + 1; }
      return { words: w, big: big };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'A bigram language model', p, P.sub || 'Predict the next word from counts of word pairs');
      var focus = P.focus || ['i', 'like', 'green'], k = Math.min(focus.length - 1, Math.floor(g.seg(p, .1, .92) * focus.length)), f = focus[k];
      g.panel(80, 160, 1120, 100); var x = 110;
      S.words.forEach(function (wd, i) { var hl = wd === f && S.words[i + 1]; var w = g.measure(wd + ' ', { size: 24, mono: true }); if (hl) g.box(x - 4, 190, w + g.measure(S.words[i + 1], { size: 24, mono: true }) + 4, 44, { r: 8, fill: g.hexA(g.C.amber, .25) }); g.text(wd, x, 212, { size: 24, mono: true, color: wd === f ? g.C.amber : g.C.ink }); x += w; });
      var nxt = S.big[f] || {}, tot = 0; Object.keys(nxt).forEach(function (k2) { tot += nxt[k2]; });
      g.text('After “' + f + '”, the corpus continues with:', 110, 320, { size: 22, weight: 600 });
      Object.keys(nxt).sort(function (a, b) { return nxt[b] - nxt[a]; }).forEach(function (w2, j) {
        var y = 380 + j * 64, pr = nxt[w2] / tot, a = g.E.out(g.seg(p, .15 + k * .25 + j * .05, .25 + k * .25 + j * .05));
        g.text(w2, 130, y, { size: 26, weight: 700, mono: true }); g.box(300, y - 18, 520 * pr * a, 36, { r: 8, fill: g.C.blue, glow: g.C.blue });
        g.text(nxt[w2] + ' / ' + tot + ' = ' + (pr * 100).toFixed(0) + '%', 840, y, { size: 22, mono: true, alpha: a });
      });
      g.text('P(next | “' + f + '”) = count(“' + f + ' next”) / count(“' + f + '”)', 640, 660, { size: 20, mono: true, align: 'center', color: g.C.muted });
    }
  });

  /* ---------- word2vec skip-gram training pairs ---------- */
  M.kit('skipgram', {
    draw: function (g, p, P, S, t) {
      var words = P.words || ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'], win = P.window || 2, n = words.length;
      g.heading(P.head || 'Word2vec: learning from context', p, P.sub || 'Skip-gram: predict the neighbours of each word (window = ' + win + ')');
      var ci = Math.min(n - 1, Math.floor(g.seg(p, .08, .9) * n)), sp = 1080 / n, X = function (i) { return 100 + i * sp + sp / 2; };
      g.box(X(Math.max(0, ci - win)) - sp / 2 + 4, 200, sp * (Math.min(n - 1, ci + win) - Math.max(0, ci - win) + 1) - 8, 70, { r: 14, stroke: g.C.amber, lw: 2.5, dash: [8, 6] });
      words.forEach(function (w, i) { var c = i === ci ? g.C.pink : Math.abs(i - ci) <= win ? g.C.cyan : '#3a4680'; g.pill(X(i), 235, w, { fill: c, align: 'center', size: 19, color: i === ci || Math.abs(i - ci) <= win ? g.C.bg : g.C.ink }); });
      var pairs = []; for (var i = 0; i <= ci; i++) for (var j = Math.max(0, i - win); j <= Math.min(n - 1, i + win); j++) if (j !== i) pairs.push([words[i], words[j], i === ci]);
      g.text('Training pairs (centre → context): ' + pairs.length, 100, 330, { size: 20, weight: 700, color: g.C.muted });
      var show = pairs.slice(-24); show.forEach(function (q, k2) { var x = 100 + (k2 % 4) * 275, y = 380 + Math.floor(k2 / 4) * 46; g.text(q[0] + ' → ' + q[1], x, y, { size: 19, mono: true, color: q[2] ? g.C.pink : g.C.ink }); });
      g.text('The network learns vectors that make these predictions easy — similar words get similar vectors.', 640, 670, { size: 19, align: 'center', color: g.C.muted, alpha: g.seg(p, .6, .7) });
    }
  });

  /* ---------- sentiment scoring ---------- */
  M.kit('sentiment', {
    draw: function (g, p, P, S, t) {
      var sents = P.sentences || [[['The', 0], ['food', 0], ['was', 0], ['absolutely', .6], ['delicious', 2.2], ['!', .2]], [['Service', 0], ['was', 0], ['slow', -1.4], ['and', 0], ['rude', -2.1]], [['Not', -.4], ['bad', -.6], ['at', 0], ['all', 0]]];
      g.heading(P.head || 'Sentiment analysis', p, P.sub || 'illustrative word weights');
      sents.forEach(function (s, i) {
        var st = .08 + i * .28, a = g.seg(p, st, st + .08); if (a <= 0) return; var y = 230 + i * 150, x = 100, sum = 0;
        s.forEach(function (w, j) { var wa = g.seg(p, st + j * .02, st + .06 + j * .02), c = w[1] > 0 ? g.C.green : w[1] < 0 ? g.C.red : '#5a669e', wd = g.measure(w[0], { size: 24, weight: 600 }) + 24; g.box(x, y - 22, wd, 44, { r: 10, fill: g.hexA(c, .15 + Math.min(.6, Math.abs(w[1]) * .25)), stroke: c, alpha: wa }); g.text(w[0], x + wd / 2, y + 1, { size: 24, weight: 600, align: 'center', alpha: wa }); if (w[1]) g.text((w[1] > 0 ? '+' : '') + w[1].toFixed(1), x + wd / 2, y + 40, { size: 14, mono: true, color: c, align: 'center', alpha: wa }); x += wd + 8; sum += w[1] * wa; });
        var pr = 1 / (1 + Math.exp(-sum)), ga = g.seg(p, st + .14, st + .22);
        g.box(840, y - 14, 300, 28, { r: 14, fill: '#2a3360', alpha: ga }); g.box(840, y - 14, 300 * pr, 28, { r: 14, fill: pr > .5 ? g.C.green : g.C.red, alpha: ga });
        g.text((pr > .5 ? 'positive ' : 'negative ') + Math.round((pr > .5 ? pr : 1 - pr) * 100) + '%', 1140, y + 44, { size: 18, weight: 700, align: 'right', color: pr > .5 ? g.C.green : g.C.red, alpha: ga });
      });
    }
  });

  /* ---------- named entity recognition with BIO tags ---------- */
  M.kit('ner', {
    draw: function (g, p, P, S, t) {
      var toks = P.tokens || ['Ada', 'Lovelace', 'worked', 'with', 'Charles', 'Babbage', 'in', 'London', 'in', '1843', '.'], tags = P.tags || ['B-PER', 'I-PER', 'O', 'O', 'B-PER', 'I-PER', 'O', 'B-LOC', 'O', 'B-DATE', 'O'];
      var col = { PER: g.C.pink, ORG: g.C.amber, LOC: g.C.green, DATE: g.C.cyan, MISC: g.C.violet };
      g.heading(P.head || 'Named entity recognition', p, P.sub || 'Find and label people, organisations, places and dates');
      var x = 90, pos = []; toks.forEach(function (tk) { var w = g.measure(tk, { size: 28, weight: 600 }) + 26; pos.push([x, w]); x += w + 10; });
      var scale = Math.min(1, 1100 / (x - 90)); var X0 = 640 - (x - 90) * scale / 2;
      toks.forEach(function (tk, i) {
        var tg = tags[i], ty = tg === 'O' ? null : tg.slice(2), c = ty ? col[ty] || g.C.violet : null, a = g.seg(p, .2 + i * .05, .3 + i * .05), px = X0 + (pos[i][0] - 90) * scale, w = pos[i][1] * scale;
        g.box(px, 280, w, 64, { r: 12, fill: c ? g.hexA(c, .25 * a + .05) : 'rgba(40,52,100,.6)', stroke: c && a > .5 ? c : null, lw: 2.5 });
        g.text(tk, px + w / 2, 313, { size: 28 * scale, weight: 600, align: 'center' });
        if (a > 0) { g.text(tg, px + w / 2, 380, { size: 17, mono: true, weight: 700, align: 'center', color: c || g.C.muted, alpha: a }); if (ty) g.pill(px + w / 2, 240, ty, { fill: c, align: 'center', size: 14, alpha: a }); }
      });
      g.panel(160, 450, 960, 170, { alpha: g.seg(p, .7, .8) });
      g.text('BIO tagging', 200, 490, { size: 20, weight: 700, alpha: g.seg(p, .7, .8) });
      g.text('B- = beginning of an entity · I- = inside (continuation) · O = outside any entity', 200, 530, { size: 19, alpha: g.seg(p, .72, .82) });
      g.text('Multi-word names use I-: “New/B-LOC York/I-LOC”', 200, 572, { size: 19, color: g.C.muted, alpha: g.seg(p, .74, .84) });
    }
  });

  /* ---------- sequence to sequence translation with attention ---------- */
  M.kit('seq2seq', {
    draw: function (g, p, P, S, t) {
      var src = P.src || ['the', 'black', 'cat', 'sleeps'], tgt = P.tgt || ['le', 'chat', 'noir', 'dort'], att = P.att || [[.8, .05, .1, .05], [.05, .1, .8, .05], [.05, .85, .05, .05], [.05, .05, .05, .85]], showAtt = P.mode === 'attention';
      g.heading(P.head || (showAtt ? 'Translation with attention' : 'Sequence to sequence: encoder and decoder'), p, P.sub);
      var ns = src.length, nt = tgt.length, enc = g.seg(p, .06, .35) * ns, dec = g.seg(p, .4, .92) * nt;
      var SX = function (i) { return 150 + i * 150; }, TX = function (i) { return 150 + i * 150; };
      src.forEach(function (w, i) { var on = enc >= i; g.box(SX(i) - 60, 440, 120, 70, { r: 14, fill: on ? 'rgba(96,165,250,.22)' : 'rgba(40,52,100,.6)', stroke: on ? g.C.blue : g.C.line, lw: 2 }); g.text('Enc', SX(i), 476, { size: 17, weight: 700, align: 'center', color: on ? g.C.ink : g.C.muted }); g.pill(SX(i), 560, w, { fill: g.C.blue, align: 'center', size: 18, alpha: on ? 1 : .35 }); if (i < ns - 1) g.arrow(SX(i) + 62, 475, SX(i + 1) - 62, 475, { color: enc > i + .5 ? g.C.blue : g.C.line, lw: 2.5, head: 8 }); });
      g.text('source (English)', 150 - 60, 610, { size: 16, color: g.C.muted });
      var ctxA = g.seg(p, .32, .4); g.box(SX(ns - 1) + 90, 430, 110, 90, { r: 16, fill: 'rgba(251,191,36,.2)', stroke: g.C.amber, lw: 2, alpha: ctxA }); g.text('context', SX(ns - 1) + 145, 476, { size: 16, weight: 700, align: 'center', color: g.C.amber, alpha: ctxA });
      tgt.forEach(function (w, i) { var on = dec >= i; g.box(TX(i) - 60, 240, 120, 70, { r: 14, fill: on ? 'rgba(244,114,182,.2)' : 'rgba(40,52,100,.6)', stroke: on ? g.C.pink : g.C.line, lw: 2 }); g.text('Dec', TX(i), 276, { size: 17, weight: 700, align: 'center', color: on ? g.C.ink : g.C.muted }); if (on) g.pill(TX(i), 190, w, { fill: g.C.pink, align: 'center', size: 18, alpha: g.clamp(dec - i + .3) }); if (i < nt - 1) g.arrow(TX(i) + 62, 275, TX(i + 1) - 62, 275, { color: dec > i + .5 ? g.C.pink : g.C.line, lw: 2.5, head: 8 }); });
      g.text('target (French)', 150 - 60, 140, { size: 16, color: g.C.muted });
      if (showAtt && dec > 0) { var cur = Math.min(nt - 1, Math.floor(dec)); att[cur].forEach(function (w, j) { g.line(TX(cur), 312, SX(j), 438, { color: g.C.amber, lw: 1 + w * 12, alpha: .25 + w * .7 }); }); g.text('while writing “' + tgt[cur] + '”, attention focuses on “' + src[att[cur].indexOf(Math.max.apply(null, att[cur]))] + '”', 1180, 380, { size: 19, color: g.C.amber, align: 'right' }); }
      else if (!showAtt && dec > 0) g.line(SX(ns - 1) + 145, 430, TX(0), 312, { color: g.C.amber, lw: 3, dash: [8, 6] });
    }
  });

  /* ---------- sinusoidal positional encodings ---------- */
  M.kit('posenc', {
    init: function () { var P2 = 48, D = 32, pe = []; for (var pos = 0; pos < P2; pos++) { var row = []; for (var i = 0; i < D; i++) { var f = 1 / Math.pow(10000, (2 * Math.floor(i / 2)) / D); row.push(i % 2 === 0 ? Math.sin(pos * f) : Math.cos(pos * f)); } pe.push(row); } return { pe: pe, P: P2, D: D }; },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Positional encodings', p, P.sub || 'Each position gets a unique pattern of sine and cosine waves');
      var cs = 11, x0 = 90, y0 = 180, reveal = g.seg(p, .05, .5) * S.P;
      for (var pos = 0; pos < S.P; pos++) { if (pos > reveal) break; for (var i = 0; i < S.D; i++) { var v = S.pe[pos][i]; g.ctx.fillStyle = v >= 0 ? g.hexA(g.C.amber, .1 + .85 * v) : g.hexA(g.C.blue, .1 + .85 * -v); g.ctx.fillRect(x0 + i * cs, y0 + pos * cs, cs - 1, cs - 1); } }
      g.text('dimension →', x0, y0 - 16, { size: 15, color: g.C.muted }); g.text('position ↓', x0 - 10, y0 + S.P * cs + 20, { size: 15, color: g.C.muted });
      var hl = Math.floor(g.lerp(3, S.P - 5, g.seg(p, .55, .95))); if (p > .5) g.box(x0 - 3, y0 + hl * cs - 2, S.D * cs + 4, cs + 3, { r: 3, stroke: g.C.white, lw: 2 });
      var px = 560, py = 190, pw = 620; g.panel(px - 20, py - 20, pw + 40, 470);
      [[0, g.C.amber], [6, g.C.pink], [14, g.C.cyan]].forEach(function (d, k) { var f = 1 / Math.pow(10000, (2 * Math.floor(d[0] / 2)) / S.D), pts = []; for (var q = 0; q <= 47; q += .25) pts.push([px + q / 47 * pw, py + 70 + k * 140 - Math.sin(q * f) * 50]); g.path(pts, { color: d[1], lw: 3, p: g.seg(p, .2 + k * .1, .45 + k * .1) }); g.text('dim ' + d[0] + ': frequency ' + f.toFixed(3), px, py + 10 + k * 140, { size: 15, mono: true, color: d[1], alpha: g.seg(p, .2 + k * .1, .3 + k * .1) }); if (p > .5) g.circle(px + hl / 47 * pw, py + 70 + k * 140 - Math.sin(hl * f) * 50, 7, { fill: g.C.white, glow: d[1] }); });
      if (p > .5) g.text('position ' + hl, px + hl / 47 * pw, py + 440, { size: 16, mono: true, align: 'center', color: g.C.white });
    }
  });

  /* ---------- BERT (bidirectional) vs GPT (causal) attention masks ---------- */
  M.kit('mask-compare', {
    draw: function (g, p, P, S, t) {
      var words = P.words || ['The', 'cat', 'sat', 'on', 'the', 'mat'], n = words.length, cs = 52;
      g.heading(P.head || 'BERT vs GPT: who can see what?', p, P.sub);
      [['BERT — bidirectional', false, 150, g.C.cyan, 'every word sees every word'], ['GPT — causal', true, 720, g.C.pink, 'each word sees only earlier words']].forEach(function (m, k) {
        var a = g.seg(p, .08 + k * .3, .2 + k * .3); if (a <= 0) return; var x0 = m[2] + 60, y0 = 230;
        g.text(m[0], m[2], 190, { size: 24, weight: 700, color: m[3], alpha: a });
        words.forEach(function (w, i) { g.text(w, x0 - 10, y0 + i * cs + cs / 2, { size: 15, align: 'right', color: g.C.muted, alpha: a }); g.text(w, x0 + i * cs + cs / 2, y0 + n * cs + 18, { size: 15, align: 'center', color: g.C.muted, alpha: a }); });
        var fill = g.seg(p, .12 + k * .3, .32 + k * .3) * n * n;
        for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) { var idx = i * n + j, blocked = m[1] && j > i, on = idx < fill; g.box(x0 + j * cs + 2, y0 + i * cs + 2, cs - 4, cs - 4, { r: 6, fill: blocked ? 'rgba(30,20,40,.9)' : on ? g.hexA(m[3], .5) : 'rgba(40,52,100,.5)', alpha: a }); if (blocked && on) g.text('×', x0 + j * cs + cs / 2, y0 + i * cs + cs / 2 + 1, { size: 18, color: '#6a4060', align: 'center' }); }
        g.text(m[4], x0 + n * cs / 2, y0 + n * cs + 56, { size: 18, align: 'center', color: g.C.ink, alpha: g.seg(p, .3 + k * .3, .4 + k * .3) });
      });
    }
  });

  /* ---------- masked language modelling ---------- */
  M.kit('masked-lm', {
    draw: function (g, p, P, S, t) {
      var words = P.words || ['The', 'chef', 'cooked', 'a', '[MASK]', 'dinner', 'for', 'us'], mi = words.indexOf('[MASK]'), cands = P.cands || [['delicious', .41], ['big', .19], ['quick', .14], ['special', .12]];
      g.heading(P.head || 'BERT’s training game: fill in the blank', p, P.sub || 'illustrative probabilities');
      var sp = 1080 / words.length, X = function (i) { return 100 + i * sp + sp / 2; };
      words.forEach(function (w, i) { g.pill(X(i), 260, w, { fill: i === mi ? g.C.amber : 'rgba(96,165,250,.9)', align: 'center', size: 19, color: g.C.bg }); });
      var la = g.seg(p, .15, .45);
      words.forEach(function (w, i) { if (i === mi) return; g.ctx.save(); g.ctx.globalAlpha *= la * .8; g.ctx.strokeStyle = i < mi ? g.C.cyan : g.C.pink; g.ctx.lineWidth = 2.5; g.ctx.beginPath(); g.ctx.moveTo(X(i), 290); g.ctx.quadraticCurveTo((X(i) + X(mi)) / 2, 380 + Math.abs(i - mi) * 14, X(mi), 292); g.ctx.stroke(); g.ctx.restore(); });
      g.text('context from the left ←  and  → context from the right', 640, 440, { size: 19, align: 'center', color: g.C.muted, alpha: la });
      cands.forEach(function (c, j) { var y = 500 + j * 44, a = g.E.out(g.seg(p, .5 + j * .06, .62 + j * .06)); g.text(c[0], 400, y, { size: 22, weight: 700, mono: true, align: 'right', color: j === 0 ? g.C.amber : g.C.ink, alpha: a }); g.box(420, y - 14, 520 * c[1] * a / .45, 28, { r: 7, fill: j === 0 ? g.C.amber : g.hexA(g.C.blue, .6) }); g.text(Math.round(c[1] * 100) + '%', 430 + 520 * c[1] / .45, y, { size: 18, mono: true, color: g.C.muted, alpha: a }); });
    }
  });

  /* ---------- semantic search in embedding space ---------- */
  M.kit('vector-search', {
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Semantic search with embeddings', p, P.sub || 'Find documents by meaning, not exact words');
      var docs = P.docs || [['Reset your password', 420, 250], ['Forgot login details', 470, 300], ['Change account email', 380, 330], ['Refund policy', 250, 520], ['Return an item', 300, 560], ['Delivery times', 700, 560], ['Track my parcel', 750, 520], ['Card was declined', 180, 300], ['Payment failed', 230, 250]];
      var q = P.query || ['I can’t sign in', 520, 215], qa = g.seg(p, .3, .45);
      g.axes(110, 170, 760, 470, { alpha: .6 });
      docs.forEach(function (d, i) { var a = g.seg(p, .05 + i * .02, .1 + i * .02); g.circle(d[1], d[2], 8, { fill: g.C.blue, alpha: a }); g.text(d[0], d[1] + 14, d[2] + 1, { size: 16, alpha: a }); });
      if (qa > 0) { g.circle(q[1], q[2], 12, { fill: g.C.amber, glow: g.C.amber, alpha: qa }); g.text('query: “' + q[0] + '”', q[1] + 18, q[2] - 24, { size: 18, weight: 700, color: g.C.amber, alpha: qa }); }
      var ranked = docs.map(function (d) { return [Math.hypot(d[1] - q[1], d[2] - q[2]), d]; }).sort(function (a, b) { return a[0] - b[0]; }), ra = g.seg(p, .5, .65);
      if (ra > 0) { g.circle(q[1], q[2], (ranked[2][0] + 14) * g.E.out(ra), { stroke: g.C.amber, lw: 2, dash: [8, 6] }); ranked.slice(0, 3).forEach(function (r) { g.line(q[1], q[2], r[1][1], r[1][2], { color: g.C.amber, lw: 2, alpha: ra }); }); }
      g.panel(910, 190, 300, 330, { alpha: g.seg(p, .6, .7) }); g.text('Top results', 935, 225, { size: 19, weight: 700, color: g.C.amber, alpha: g.seg(p, .6, .7) });
      ranked.slice(0, 3).forEach(function (r, i) { var a = g.seg(p, .68 + i * .06, .76 + i * .06), sim = Math.max(0, 1 - r[0] / 400); g.text((i + 1) + '. ' + r[1][0], 935, 275 + i * 70, { size: 18, weight: 600, alpha: a, maxW: 250 }); g.text('similarity ' + sim.toFixed(2), 935, 300 + i * 70, { size: 15, mono: true, color: g.C.muted, alpha: a }); });
      g.text('No shared words with “sign in” — still found, because the meanings are close.', 640, 680, { size: 19, align: 'center', color: g.C.muted, alpha: g.seg(p, .85, .92) });
    }
  });

  /* ---------- speech: waveform → spectrogram → text ---------- */
  M.kit('spectrogram', {
    init: function (P, g) {
      var fs = 1600, N = 4800, sig = [], segs = [[0, 1400, [180, 520]], [1700, 3000, [260, 700, 1100]], [3300, 4700, [150, 380, 610]]];
      for (var i = 0; i < N; i++) { var v = 0; segs.forEach(function (s) { if (i >= s[0] && i < s[1]) { var env = Math.sin(Math.PI * (i - s[0]) / (s[1] - s[0])); s[2].forEach(function (f, k) { v += env * Math.sin(2 * Math.PI * f * i / fs) / (k + 1); }); } }); sig.push(v * .5); }
      var F = 64, B = 40, hop = N / F, win = 128, spec = [], mx = 0;
      for (var fr = 0; fr < F; fr++) { var col = [], st = Math.floor(fr * hop); for (var b = 0; b < B; b++) { var freq = b * (fs / 2) / B, re = 0, im = 0; for (var n = 0; n < win; n++) { var x = sig[st + n] || 0, w = .5 - .5 * Math.cos(2 * Math.PI * n / (win - 1)); re += x * w * Math.cos(2 * Math.PI * freq * n / fs); im -= x * w * Math.sin(2 * Math.PI * freq * n / fs); } var m = Math.hypot(re, im); col.push(m); if (m > mx) mx = m; } spec.push(col); }
      var img = g.pixels(F, B, function (x, y) { var v = Math.sqrt(spec[x][B - 1 - y] / mx); return [Math.round(20 + v * 235), Math.round(20 + v * 140), Math.round(70 + v * 100)]; });
      return { sig: sig, img: img, segs: segs, N: N };
    },
    draw: function (g, p, P, S, t) {
      g.heading(P.head || 'Speech recognition: sound → spectrogram → text', p, P.sub || 'simplified synthetic signal');
      var x0 = 110, w = 1060, wa = g.seg(p, .05, .3), pts = [];
      for (var i = 0; i < S.N; i += 6) pts.push([x0 + i / S.N * w, 250 - S.sig[i] * 70]);
      g.text('waveform (air pressure over time)', x0, 175, { size: 16, color: g.C.muted }); g.path(pts, { color: g.C.cyan, lw: 1.5, p: wa });
      var sa = g.seg(p, .3, .6); g.ctx.save(); g.ctx.beginPath(); g.ctx.rect(x0, 340, w * g.E.out(sa), 200); g.ctx.clip(); g.img(S.img, x0, 340, w, 200, { smooth: true }); g.ctx.restore();
      g.text('spectrogram (frequency ↑ over time →, brightness = energy)', x0, 322, { size: 16, color: g.C.muted, alpha: sa });
      var words = P.words || ['hello', 'from', 'Dhaka']; S.segs.forEach(function (s, k) { var a = g.seg(p, .65 + k * .08, .75 + k * .08), cx = x0 + (s[0] + s[1]) / 2 / S.N * w; g.line(x0 + s[0] / S.N * w, 560, x0 + s[1] / S.N * w, 560, { color: g.C.pink, lw: 3, alpha: a }); g.pill(cx, 610, words[k], { fill: g.C.pink, align: 'center', size: 22, alpha: a }); });
    }
  });
})(window.Motion);
