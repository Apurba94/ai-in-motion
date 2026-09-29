#!/usr/bin/env node
/*
 * AI in Motion — animated video lectures on AI, ML, deep learning and computer vision.
 * Zero-dependency static site generator: node build.js → site/
 * © Janin A Apurba, CSE, AUST · Advanced ICT Officer, CNRS-UNHCR
 */
'use strict';
const fs = require('fs');
const path = require('path');

const SITE = {
  name: 'AI in Motion',
  tagline: 'Animated video lectures on AI, Machine Learning, Deep Learning, Computer Vision, NLP, Generative AI, LLMs, Reinforcement Learning, MLOps and the Mathematics of ML',
  author: 'Janin A Apurba', credentials: 'CSE, AUST', role: 'Advanced ICT Officer', org: 'CNRS-UNHCR',
  baseUrl: 'https://ai-in-motion.vercel.app',
  blog: 'https://ai-lecture-hall.vercel.app', blogName: 'The AI Lecture Hall',
  portfolio: 'https://janin-a-apurba.vercel.app'
};
const TRACKS = [
  { id: 'ai', name: 'Artificial Intelligence', short: 'AI', accent: '#22d3ee', icon: '◎', blurb: 'Agents, search, games, optimisation, probability, language models, attention and image generation.' },
  { id: 'ml', name: 'Machine Learning', short: 'ML', accent: '#34d399', icon: '◈', blurb: 'Regression, gradient descent, classifiers, trees, SVMs, clustering, PCA, overfitting and evaluation.' },
  { id: 'dl', name: 'Deep Learning', short: 'DL', accent: '#f472b6', icon: '⬡', blurb: 'Neurons, networks, activations, training, backpropagation, optimisers, RNNs, embeddings, autoencoders and GANs.' },
  { id: 'cv', name: 'Computer Vision', short: 'CV', accent: '#fbbf24', icon: '◐', blurb: 'Pixels, convolution, edges, CNNs, classic architectures, augmentation, detection, segmentation, ViTs and pose.' },
  { id: 'nlp', name: 'Natural Language Processing', short: 'NLP', accent: '#60a5fa', icon: '❝', blurb: 'Tokenization, TF-IDF, n-grams, word2vec, classification, NER, translation, positional encoding, BERT vs GPT, semantic search and speech.' },
  { id: 'gen', name: 'Generative AI', short: 'GenAI', accent: '#c084fc', icon: '✦', blurb: 'VAEs, diffusion, guidance, LLM training, decoding, prompting, RAG, LoRA, quantisation, mixture of experts, agents and multimodal models.' },
  { id: 'llm', name: 'Large Language Models', short: 'LLMs', accent: '#f87171', icon: '❖', blurb: 'Deep dives into transformer internals, attention maths, pre-training at scale, alignment (SFT, RLHF, DPO), inference engineering and building LLM applications.' },
  { id: 'rl', name: 'Reinforcement Learning', short: 'RL', accent: '#fb923c', icon: '♞', blurb: 'MDPs and returns, value and policy iteration, Monte Carlo and TD learning, Q-learning vs SARSA, bandits, deep Q-networks, policy gradients and PPO.' },
  { id: 'mlops', name: 'MLOps & Engineering', short: 'MLOps', accent: '#a3e635', icon: '⚙', blurb: 'The ML lifecycle, data and experiment management, Docker and model serving, CI/CD and deployment strategies, monitoring and drift, A/B testing and responsible operations.' },
  { id: 'math', name: 'Mathematics for ML', short: 'Math', accent: '#818cf8', icon: '∑', blurb: 'Vectors and dot products, matrices as transformations, eigenvectors, SVD and PCA, calculus and gradients, probability, likelihood and information theory.' }
];
for (let i = TRACKS.length - 1; i >= 0; i--) if (!fs.existsSync(path.join(__dirname, 'content', TRACKS[i].id + '.js'))) TRACKS.splice(i, 1); // tracks without content are skipped
const TR = Object.fromEntries(TRACKS.map((t) => [t.id, t]));
const ROOT = __dirname, OUT = path.join(ROOT, 'site');
const YEAR = new Date().getFullYear(), V = Date.now().toString(36);
const BLOG = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'blog-index.json'), 'utf8'));

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
function writeFile(rel, data) { const p = path.join(OUT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); }
function clean(p) { if (!fs.existsSync(p)) return; for (const e of fs.readdirSync(p)) fs.rmSync(path.join(p, e), { recursive: true, force: true, maxRetries: 3 }); }
function copyDir(src, dst) { if (!fs.existsSync(src)) return; fs.mkdirSync(dst, { recursive: true }); for (const e of fs.readdirSync(src, { withFileTypes: true })) { const s = path.join(src, e.name), d = path.join(dst, e.name); e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d); } }
const sceneDur = (s) => s.dur || Math.max(5, Math.min(24, String(s.say || '').split(/\s+/).filter(Boolean).length / 2.55 + 1.6));
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const DEEP_MIN = 600; // every deep-dive lecture must run for at least 10 minutes

/* ---------- load lectures ---------- */
function load() {
  const lecs = [];
  for (const t of TRACKS) {
    const deepFile = path.join(ROOT, 'content', t.id + '-deep.js'); // extra deep dives for an existing track
    const list = require(path.join(ROOT, 'content', t.id + '.js')).concat(fs.existsSync(deepFile) ? require(deepFile) : []);
    list.forEach((l, k) => {
      if (l.track !== t.id) throw new Error(`${l.slug}: track mismatch`);
      l.accent = t.accent; l.n = k + 1; l.trackObj = t;
      const PLAIN = ['title', 'bullets', 'compare', 'definition', 'equation', 'pipeline', 'cycle', 'code', 'table', 'question', 'stats'];
      const rich = l.scenes.findIndex((s) => !PLAIN.includes(s.kit));
      l.poster = rich >= 0 ? rich : (l.poster || 0);
      l.duration = l.scenes.reduce((a, s) => a + sceneDur(s), 0);
      if (l.deep && l.duration < DEEP_MIN) throw new Error(`${l.slug}: deep dive runs only ${fmt(l.duration)} (minimum ${fmt(DEEP_MIN)})`);
      l.starts = []; let acc = 0; l.scenes.forEach((s) => { l.starts.push(acc); acc += sceneDur(s); });
      (l.read || []).forEach((r) => { if (!BLOG[r]) throw new Error(`${l.slug}: unknown blog post ${r}`); });
      lecs.push(l);
    });
    t.lectures = lecs.filter((l) => l.track === t.id);
    t.lectures.forEach((l, k) => { l.prev = t.lectures[k - 1]; l.next = t.lectures[k + 1]; });
  }
  const seen = new Set(); lecs.forEach((l) => { if (seen.has(l.slug)) throw new Error('Duplicate slug ' + l.slug); seen.add(l.slug); });
  return lecs;
}
/* ---------- pre-rendered media (public/media, rendered from the same kits) ---------- */
const hasPublic = (rel) => fs.existsSync(path.join(ROOT, 'public', rel));
const num2 = (i) => String(i + 1).padStart(2, '0');
const frameSrc = (slug, i) => `/media/frames/${slug}/${num2(i)}.webp`;
const thumbSrc = (slug, i) => `/media/thumbs/${slug}/${num2(i)}.webp`;
const hasFrames = (l) => hasPublic(`media/frames/${l.slug}/01.webp`);
const hasThumbs = (l) => hasPublic(`media/thumbs/${l.slug}/01.webp`);
const lecData = (l) => Object.assign({ slug: l.slug, title: l.title, accent: l.accent, scenes: l.scenes }, hasThumbs(l) ? { thumbs: `/media/thumbs/${l.slug}/` } : {});

/* ---------- layout ---------- */
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">';
const credit = `© ${YEAR} ${SITE.author}, ${SITE.credentials} · ${SITE.role}, ${SITE.org}. All rights reserved.`;
function layout({ title, desc, body, canonical = '/', extraHead = '', cls = '', image = '/media/og/home.jpg' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="${esc(SITE.author)}"><meta name="copyright" content="${esc(SITE.author)}, ${esc(SITE.credentials)}">
<meta name="theme-color" content="#060a17">
<link rel="canonical" href="${SITE.baseUrl}${canonical}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${SITE.baseUrl}${canonical}">
${hasPublic(image.slice(1)) ? `<meta property="og:image" content="${SITE.baseUrl}${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${SITE.baseUrl}${image}">` : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${FONTS}
<link rel="stylesheet" href="/assets/style.css?v=${V}">
${extraHead}
</head>
<body class="${cls}">
<a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="top-in">
<a class="brand" href="/"><span class="logo" aria-hidden="true"><i></i></span><span>AI <b>in Motion</b></span></a>
<nav class="nav" id="nav" aria-label="Main">${TRACKS.map((t) => `<a href="/tracks/${t.id}.html" style="--a:${t.accent}">${t.short}</a>`).join('')}<a href="/about.html">About</a></nav>
<div class="top-act"><a class="btn btn-sm btn-glow" href="${SITE.blog}" target="_blank" rel="noopener">Read the Lecture Hall ↗</a><button class="icon-btn menu" id="menu" aria-label="Open menu" aria-expanded="false" aria-controls="nav"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></div>
</div></header>
<main id="main">${body}</main>
<footer class="foot"><div class="wrap">
<div class="foot-grid">
<div><a class="brand" href="/"><span class="logo" aria-hidden="true"><i></i></span><span>AI <b>in Motion</b></span></a><p class="muted">${esc(SITE.tagline)}. A visual companion to <a href="${SITE.blog}" target="_blank" rel="noopener">${SITE.blogName}</a>.</p></div>
<div><h4>Tracks</h4>${TRACKS.map((t) => `<a href="/tracks/${t.id}.html">${t.name}</a>`).join('')}</div>
<div><h4>Author</h4><a href="/about.html">About</a><a href="${SITE.blog}" target="_blank" rel="noopener">${SITE.blogName}</a><a href="${SITE.portfolio}" target="_blank" rel="noopener">Portfolio</a></div>
</div>
<div class="foot-bottom"><p>${credit}</p><p class="muted">All credits and copyrights by ${esc(SITE.author)}, ${esc(SITE.credentials)}. Currently ${esc(SITE.role)} at ${esc(SITE.org)}, teaching students.</p></div>
</div></footer>
<script src="/assets/motion.js?v=${V}"></script>
<script src="/assets/site.js?v=${V}" defer></script>
</body></html>`;
}

function card(l) {
  return `<a class="card${l.deep ? ' is-deep' : ''}" href="/watch/${l.slug}.html" style="--a:${l.accent}" data-track="${l.track}"${l.deep ? ' data-deep="1"' : ''} data-q="${esc((l.title + ' ' + l.summary + ' ' + l.trackObj.name).toLowerCase())}">
<div class="thumb"><canvas data-poster="${l.slug}" aria-hidden="true"></canvas>${l.deep ? '<span class="deep-badge">Deep dive</span>' : ''}<span class="dur">${fmt(l.duration)}</span><span class="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span></div>
<div class="card-body"><span class="card-track">${esc(l.trackObj.name)} · ${String(l.n).padStart(2, '0')}</span><h3>${esc(l.title)}</h3><p>${esc(l.summary)}</p><span class="card-meta">${esc(l.level)} · ${l.scenes.length} chapters · ${l.quiz.length}-question quiz</span></div></a>`;
}
const posterData = (lecs) => json(Object.fromEntries(lecs.map((l) => [l.slug, { scene: l.scenes[l.poster || 0], accent: l.accent }])));

/* ---------- pages ---------- */
function buildIndex(lecs) {
  const pick = ['a-star-search', 'neural-networks-forward-pass', 'rl-foundations-mdps-and-returns', 'retrieval-augmented-generation', 'matrices-as-transformations', 'k-means-clustering', 'object-detection', 'inside-a-large-language-model', 'tokenization-and-subwords', 'monitoring-drift-and-retraining', 'attention-and-transformers', 'exploration-and-multi-armed-bandits', 'convolution-and-image-filters', 'probability-and-distributions', 'generative-adversarial-networks', 'llm-inference-engineering', 'principal-component-analysis', 'backpropagation'];
  const reel = { slug: 'showreel', title: 'Showreel', accent: '#a78bfa', scenes: pick.map((s) => lecs.find((l) => l.slug === s)).filter(Boolean).map((l) => Object.assign({}, l.scenes[l.poster || 1], { dur: 7, say: l.title + '.', accent: l.accent })) };
  const total = lecs.reduce((a, l) => a + l.duration, 0), deeps = lecs.filter((l) => l.deep);
  const body = `
<section class="hero"><div class="wrap hero-grid">
<div class="hero-copy">
<p class="eyebrow"><span class="rec"></span>${lecs.length} animated lectures · ${deeps.length} deep dives · ${Math.round(total / 60)} minutes</p>
<h1>See how AI <span class="grad">actually works.</span></h1>
<p class="lead">${esc(SITE.tagline)} — every lesson is an animated video with narration, subtitles, chapters and a quiz. Short lessons explain one idea in minutes; deep dives of ten minutes or more take you from intuition to the maths and the code.</p>
<div class="cta"><a class="btn btn-glow" href="/watch/what-is-artificial-intelligence.html"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Start watching</a><a class="btn btn-line" href="#library">Browse all lectures</a></div>
<ul class="hero-feats"><li>🎙️ Voice narration</li><li>💬 Subtitles & transcripts</li><li>🧩 Chapters & quizzes</li><li>📄 Printable illustrated notes</li><li>📚 Linked to ${SITE.blogName}</li></ul>
</div>
<div class="hero-reel"><div class="reel-frame"><div id="reel"></div></div><p class="muted small center">Live preview — every frame is drawn in real time in your browser</p></div>
</div>
<script type="application/json" id="reel-data">${json(reel)}</script>
</section>
<section class="wrap sec"><div class="tracks">${TRACKS.map((t) => `<a class="track" href="/tracks/${t.id}.html" style="--a:${t.accent}"><span class="track-ic">${t.icon}</span><h3>${t.name}</h3><p>${esc(t.blurb)}</p><span class="track-n">${t.lectures.length} lectures · ${Math.round(t.lectures.reduce((a, l) => a + l.duration, 0) / 60)} min →</span></a>`).join('')}</div></section>
<section class="wrap sec" id="library"><div class="sec-head"><span class="kicker">Library</span><h2>All animated lectures</h2></div>
<div class="tools"><label class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="q" type="search" placeholder="Search lectures — try “attention”, “Q-learning”, “drift” or “eigen”" aria-label="Search lectures"></label>
<div class="chips" id="chips"><button class="chip on" data-track="all">All <em>${lecs.length}</em></button><button class="chip" data-track="deep" style="--a:#fbbf24">Deep dives <em>${deeps.length}</em></button>${TRACKS.map((t) => `<button class="chip" data-track="${t.id}" style="--a:${t.accent}">${t.short} <em>${t.lectures.length}</em></button>`).join('')}</div></div>
<div class="grid" id="grid">${lecs.map(card).join('')}</div><p class="empty" id="empty" hidden>No lectures match your search.</p></section>
<section class="wrap sec"><div class="how">
<div><span class="kicker">How to learn here</span><h2>Watch, check, go deeper</h2><p class="lead">Short videos explain one idea visually in a few minutes; deep dives spend ten minutes or more going from intuition to formulas, worked examples and code. Test yourself with the quiz, then continue with the in-depth written lectures in ${SITE.blogName}.</p></div>
<ol class="steps"><li><b>Watch</b> the animation with narration — pause, rewind, jump by chapter or change speed.</li><li><b>Read</b> the transcript and key takeaways under every video.</li><li><b>Check</b> your understanding with the quiz.</li><li><b>Go deeper</b> with the linked university-level lectures.</li></ol>
</div></section>
<script type="application/json" id="poster-data">${posterData(lecs)}</script>`;
  const ld = { '@context': 'https://schema.org', '@type': 'Course', name: SITE.name, description: SITE.tagline, provider: { '@type': 'Person', name: SITE.author, url: SITE.portfolio }, hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: `PT${Math.round(total / 60)}M` } };
  writeFile('index.html', layout({ title: `${SITE.name} — Animated lectures on AI, ML, Deep Learning, CV, NLP, GenAI, LLMs, RL, MLOps & Math`, desc: `${lecs.length} animated video lectures, including ${deeps.length} deep dives of 10+ minutes, with narration, subtitles and quizzes on AI, machine learning, deep learning, computer vision, NLP, generative AI, LLMs, reinforcement learning, MLOps and mathematics for ML. By ${SITE.author}.`, body, extraHead: `<script type="application/ld+json">${json(ld)}</script>`, cls: 'home' }));
}

function buildLecture(l) {
  const t = l.trackObj, th = hasThumbs(l), fr = hasFrames(l);
  const chapters = l.scenes.map((s, i) => `<li><button type="button" data-seek="${i}">${th ? `<img class="ch-thumb" src="${thumbSrc(l.slug, i)}" alt="" width="64" height="36" loading="lazy">` : ''}<span class="ts">${fmt(l.starts[i])}</span><span>${esc(s.chapter || 'Part ' + (i + 1))}</span></button></li>`).join('');
  const transcript = l.scenes.map((s, i) => `<p><button type="button" class="ts" data-seek="${i}">${fmt(l.starts[i])}</button> <b>${esc(s.chapter || '')}.</b> ${esc(s.say)}</p>`).join('');
  const quiz = l.quiz.map((q, i) => `<fieldset class="q" data-correct="${q.c}"><legend><span>Q${i + 1}</span> ${esc(q.q)}</legend>${q.a.map((a, j) => `<label><input type="radio" name="q${i}" value="${j}"><span>${esc(a)}</span></label>`).join('')}<p class="why" hidden>${esc(q.why)}</p></fieldset>`).join('');
  const reads = (l.read || []).map((r) => `<a class="read" href="${SITE.blog}/posts/${r}.html" target="_blank" rel="noopener"><span>📖</span><div><b>${esc(BLOG[r].title)}</b><small>${SITE.blogName} · full lecture</small></div><em>↗</em></a>`).join('');
  const body = `
<section class="watch wrap" style="--a:${l.accent}">
<nav class="crumbs"><a href="/">Home</a><span>/</span><a href="/tracks/${t.id}.html">${esc(t.name)}</a><span>/</span><span>Lecture ${l.n}</span></nav>
<div class="watch-grid">
<div class="watch-main">
<div id="player" class="player-shell"></div>
<noscript>${fr ? `<img class="noscript-frame" src="${frameSrc(l.slug, l.poster)}" alt="${esc(l.title)}" width="1280" height="720">` : ''}<p class="note">This animated lecture needs JavaScript. The full transcript is below${fr ? `, and the <a href="/notes/${l.slug}.html">illustrated lecture notes</a> show every chapter as a picture` : ''}.</p></noscript>
<h1>${esc(l.title)}</h1>
<p class="meta"><span class="pill" style="--a:${l.accent}">${esc(t.name)}</span>${l.deep ? '<span class="pill deep-pill">Deep dive</span>' : ''}<span>${esc(l.level)}</span><span>${fmt(l.duration)}</span><span>${l.scenes.length} chapters</span></p>
<p class="lead">${esc(l.summary)}</p>
${fr ? `<p class="lec-actions"><a class="btn btn-line btn-sm" href="/notes/${l.slug}.html">📄 Illustrated notes · every chapter as a picture · printable</a></p>` : ''}
<div class="kbd-help muted small">Shortcuts: <kbd>Space</kbd> play/pause · <kbd>←</kbd>/<kbd>→</kbd> 5 s · <kbd>N</kbd>/<kbd>P</kbd> chapter · <kbd>M</kbd> voice · <kbd>C</kbd> subtitles · <kbd>F</kbd> fullscreen</div>
</div>
<aside class="side">
<div class="panel"><h2>Chapters <small class="muted">${l.scenes.length}</small></h2><ol class="chapters${l.scenes.length > 12 ? ' scroll' : ''}">${chapters}</ol></div>
<div class="panel"><h2>Key takeaways</h2><ul class="takeaways">${l.takeaways.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
</aside>
</div>
<div class="below">
<section class="panel"><h2>Quick quiz</h2><p class="muted small">${l.quiz.length} questions to check your understanding.</p><form class="quiz">${quiz}<div class="quiz-foot"><button type="submit" class="btn btn-glow">Check answers</button><span class="score" aria-live="polite"></span></div></form></section>
<section class="panel"><h2>Go deeper</h2><p class="muted small">University-level written lectures in ${SITE.blogName}:</p><div class="reads">${reads}</div></section>
</div>
<details class="panel transcript"><summary><h2>Transcript</h2></summary>${transcript}</details>
<div class="pn">${l.prev ? `<a href="/watch/${l.prev.slug}.html"><small>← Previous</small><b>${esc(l.prev.title)}</b></a>` : '<span></span>'}${l.next ? `<a class="next" href="/watch/${l.next.slug}.html"><small>Next →</small><b>${esc(l.next.title)}</b></a>` : `<a class="next" href="/tracks/${t.id}.html"><small>Track complete ✓</small><b>Back to ${esc(t.name)}</b></a>`}</div>
</section>
<script type="application/json" id="lecture-data">${json(lecData(l))}</script>`;
  const ld = { '@context': 'https://schema.org', '@type': 'LearningResource', name: l.title, description: l.summary, learningResourceType: 'Animated video lecture', educationalLevel: l.level, timeRequired: `PT${Math.ceil(l.duration / 60)}M`, inLanguage: 'en', author: { '@type': 'Person', name: SITE.author, url: SITE.portfolio }, isPartOf: { '@type': 'Course', name: SITE.name }, url: `${SITE.baseUrl}/watch/${l.slug}.html` };
  if (hasPublic(`media/og/${l.slug}.jpg`)) ld.image = `${SITE.baseUrl}/media/og/${l.slug}.jpg`;
  writeFile(`watch/${l.slug}.html`, layout({ title: `${l.title} — ${SITE.name}`, desc: l.summary, body, canonical: `/watch/${l.slug}.html`, extraHead: `<script type="application/ld+json">${json(ld)}</script>`, cls: 'is-watch', image: `/media/og/${l.slug}.jpg` }));
}

/* ---------- illustrated, printable lecture notes ---------- */
function buildNotes(l) {
  if (!hasFrames(l)) return false;
  const t = l.trackObj;
  const chapters = l.scenes.map((s, i) => `<section class="note-ch"><h2><span class="ts">${fmt(l.starts[i])}</span><span>${i + 1}. ${esc(s.chapter || 'Part ' + (i + 1))}</span></h2><a href="/watch/${l.slug}.html#t=${Math.floor(l.starts[i])}" title="Watch this chapter"><img src="${frameSrc(l.slug, i)}" alt="${esc((s.chapter || 'Chapter ' + (i + 1)) + ' — ' + l.title)}" width="1280" height="720" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async"></a><p>${esc(s.say)}</p></section>`).join('');
  const quiz = l.quiz.map((q) => `<li><b>${esc(q.q)}</b><details><summary>Show answer</summary><p>${esc(q.a[q.c])} — ${esc(q.why)}</p></details></li>`).join('');
  const reads = (l.read || []).map((r) => `<li><a href="${SITE.blog}/posts/${r}.html" target="_blank" rel="noopener">${esc(BLOG[r].title)}</a> <span class="muted">· ${SITE.blogName}</span></li>`).join('');
  const body = `
<article class="notes wrap" style="--a:${l.accent}">
<nav class="crumbs no-print"><a href="/">Home</a><span>/</span><a href="/tracks/${t.id}.html">${esc(t.name)}</a><span>/</span><a href="/watch/${l.slug}.html">Lecture ${l.n}</a><span>/</span><span>Notes</span></nav>
<header class="notes-head">
<p class="meta"><span class="pill" style="--a:${l.accent}">${esc(t.name)}</span>${l.deep ? '<span class="pill deep-pill">Deep dive</span>' : ''}<span>${esc(l.level)}</span><span>${fmt(l.duration)} video</span><span>${l.scenes.length} chapters</span></p>
<h1>${esc(l.title)} <span class="muted">— lecture notes</span></h1>
<p class="lead">${esc(l.summary)}</p>
<div class="cta no-print"><a class="btn btn-glow" href="/watch/${l.slug}.html">▶ Watch the animated lecture</a><button class="btn btn-line" type="button" data-print>🖨 Print or save as PDF</button></div>
</header>
${chapters}
<section class="panel"><h2>Key takeaways</h2><ul class="takeaways">${l.takeaways.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>
<section class="panel"><h2>Check yourself</h2><ol class="notes-quiz">${quiz}</ol></section>
<section class="panel"><h2>Go deeper</h2><ul class="notes-reads">${reads}</ul></section>
<p class="muted small">${credit} Notes for the animated lecture at ${SITE.baseUrl}/watch/${l.slug}.html</p>
</article>`;
  writeFile(`notes/${l.slug}.html`, layout({ title: `${l.title} — illustrated notes — ${SITE.name}`, desc: `Illustrated, printable notes for the animated lecture “${l.title}”: every chapter as a picture with its narration, takeaways and quiz.`, body, canonical: `/notes/${l.slug}.html`, cls: 'is-notes', image: `/media/og/${l.slug}.jpg` }));
  return true;
}

function buildTrack(t) {
  const body = `<section class="track-hero wrap" style="--a:${t.accent}"><nav class="crumbs"><a href="/">Home</a><span>/</span><span>Tracks</span></nav><span class="track-ic big">${t.icon}</span><h1>${t.name}</h1><p class="lead">${esc(t.blurb)}</p><p class="muted">${t.lectures.length} animated lectures · ${Math.round(t.lectures.reduce((a, l) => a + l.duration, 0) / 60)} minutes</p><a class="btn btn-glow" href="/watch/${t.lectures[0].slug}.html">▶ Start with lecture 1</a></section>
<section class="wrap sec"><div class="grid">${t.lectures.map(card).join('')}</div></section>
<script type="application/json" id="poster-data">${posterData(t.lectures)}</script>`;
  writeFile(`tracks/${t.id}.html`, layout({ title: `${t.name} — ${SITE.name}`, desc: t.blurb, body, canonical: `/tracks/${t.id}.html`, image: `/media/og/track-${t.id}.jpg` }));
}

function buildAbout(lecs) {
  const body = `<section class="wrap about"><span class="kicker">About</span><h1>Learn AI by <span class="grad">watching it work</span></h1>
<p class="lead">${SITE.name} is a collection of ${lecs.length} animated lectures, including ${lecs.filter((l) => l.deep).length} deep dives of ten minutes or more, on artificial intelligence, machine learning, deep learning, computer vision, natural language processing, generative AI, large language models, reinforcement learning, MLOps and the mathematics of machine learning, created by <b>${esc(SITE.author)}</b> (${esc(SITE.credentials)}), currently ${esc(SITE.role)} at ${esc(SITE.org)}, teaching students.</p>
<p>Every animation is drawn live in your browser from real computations: the search algorithms really search, gradient descent really descends, k-means really clusters, the convolutions really convolve, Q-learning really learns and the Markov chains really converge. The numbers you see on screen are the numbers the algorithms produce.</p>
<p>Each video has optional spoken narration (using your browser’s built-in voice), subtitles, chapters, a transcript, key takeaways and a short quiz. For the full theory — derivations, code and exercises — every lecture links to the matching chapters of <a href="${SITE.blog}" target="_blank" rel="noopener">${SITE.blogName}</a>, a free course of 273 written lectures by the same author.</p>
<div class="cta"><a class="btn btn-glow" href="/watch/what-is-artificial-intelligence.html">▶ Start watching</a><a class="btn btn-line" href="${SITE.portfolio}" target="_blank" rel="noopener">Author portfolio ↗</a></div>
<p class="muted small">${credit}</p></section>`;
  writeFile('about.html', layout({ title: `About — ${SITE.name}`, desc: `About ${SITE.name} and its author ${SITE.author}.`, body, canonical: '/about.html' }));
}

function main() {
  const t0 = Date.now();
  fs.mkdirSync(OUT, { recursive: true }); clean(OUT);
  const lecs = load();
  copyDir(path.join(ROOT, 'public'), OUT);
  const order = ['engine.js', 'kits/general.js', 'kits/ai.js', 'kits/ml.js', 'kits/dl.js', 'kits/cv.js', 'kits/nlp.js', 'kits/gen.js', 'kits/math.js', 'kits/rl.js', 'kits/llm.js', 'kits/mlops.js'];
  writeFile('assets/motion.js', '/* AI in Motion — © ' + YEAR + ' Janin A Apurba, CSE, AUST */\n' + order.map((f) => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8')).join('\n'));
  ['site.js', 'style.css'].forEach((f) => writeFile('assets/' + f, fs.readFileSync(path.join(ROOT, 'src', f), 'utf8')));
  fs.copyFileSync(path.join(ROOT, 'src', 'favicon.svg'), path.join(OUT, 'favicon.svg'));
  buildIndex(lecs); lecs.forEach(buildLecture); TRACKS.forEach(buildTrack); buildAbout(lecs);
  const noted = lecs.filter(buildNotes);
  writeFile('404.html', layout({ title: `Not found — ${SITE.name}`, desc: 'Page not found', canonical: '/404.html', body: `<section class="wrap nf"><span class="kicker">Error 404</span><h1>This scene is <span class="grad">missing</span>.</h1><p class="lead">The lecture you are looking for does not exist or has moved.</p><a class="btn btn-glow" href="/">Back to all lectures</a></section>` }));
  const urls = ['/', '/about.html', ...TRACKS.map((t) => `/tracks/${t.id}.html`), ...lecs.map((l) => `/watch/${l.slug}.html`), ...noted.map((l) => `/notes/${l.slug}.html`)];
  writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE.baseUrl}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  writeFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE.baseUrl}/sitemap.xml\n`);
  // Links for the companion blog: which animated lessons explain each written lecture
  const links = {}; lecs.forEach((l) => (l.read || []).forEach((r) => { (links[r] = links[r] || []).push({ title: l.title, url: `${SITE.baseUrl}/watch/${l.slug}.html`, minutes: Math.max(1, Math.round(l.duration / 60)) }); }));
  writeFile('blog-links.json', JSON.stringify(links, null, 1));
  const total = lecs.reduce((a, l) => a + l.duration, 0);
  console.log(`Built ${lecs.length} animated lectures + ${noted.length} illustrated notes pages (${lecs.reduce((a, l) => a + l.scenes.length, 0)} scenes, ${fmt(total)} of animation, ${Object.keys(links).length} blog posts linked) in ${Date.now() - t0} ms`);
}
main();
