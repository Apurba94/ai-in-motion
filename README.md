# AI in Motion

Animated video lectures on **Artificial Intelligence, Machine Learning, Deep Learning, Computer Vision, NLP, Generative AI, Large Language Models, Reinforcement Learning, MLOps & Engineering and Mathematics for ML**, by **Janin A Apurba** (CSE, AUST), Advanced ICT Officer at CNRS-UNHCR.

- **Lectures:** 110 animated lectures (≈ 8 hours 20 minutes) in 10 tracks: 74 short lessons of 1–3 minutes and 36 **deep dives** of 10 minutes or more.
- **Deep dives:** a lecture marked `deep: true` must run for at least 10 minutes. `build.js` refuses to build if one is shorter.
- **In every lecture:**
  - animations drawn live on a canvas from real computations: the searches really search, gradient descent really descends, Q-learning really learns and the Markov chains really converge;
  - optional spoken narration (browser speech), subtitles, chapters, a seek bar, speed control and fullscreen;
  - a transcript, key takeaways, a quiz, and links to the matching written lectures in [The AI Lecture Hall](https://ai-lecture-hall.vercel.app).

© Janin A Apurba, CSE, AUST · Advanced ICT Officer, CNRS-UNHCR. All rights reserved.

## Add or edit a lecture
Lectures live in `content/<track>.js`, where the track is `ai`, `ml`, `dl`, `cv`, `nlp`, `gen`, `llm`, `rl`, `mlops` or `math`. Extra deep dives for the first six tracks live in `content/<track>-deep.js` and appear after that track's short lessons. Each lecture is a list of scenes:

```js
{
  slug: 'my-lecture', title: 'My Lecture', track: 'ml', level: 'Beginner', deep: false,
  summary: 'One or two sentences.',
  scenes: [
    { kit: 'title', title: 'My Lecture', sub: 'Subtitle', track: 'Machine Learning', chapter: 'Introduction', say: 'Narration for this scene.' },
    { kit: 'kmeans', chapter: 'Watching k-means', say: 'What the narrator says while this animates.' },
    { kit: 'bullets', style: 'recap', items: ['Point one', 'Point two'], chapter: 'Recap', say: 'To recap…' }
  ],
  takeaways: ['…'],
  quiz: [{ q: 'Question?', a: ['A', 'B', 'C'], c: 0, why: 'Explanation.' }],
  read: ['k-means-clustering']   // slugs of AI Lecture Hall posts
}
```

Each scene lasts as long as its narration (`say`, about 2.5 words per second, 5–24 s), or you can set `dur` in seconds. A 10-minute deep dive needs about 1,500 words of narration over 30–40 scenes.

**Scene kits:**

| Group | Kits |
|---|---|
| General | title, bullets, compare, pipeline, cycle, nested, timeline, equation, bars, definition, code, table, flow, plot, question, stats |
| AI | grid-search, agent, game-tree, landscape, genetic, bayes, llm, attention, diffusion, embedding |
| Machine learning | scatter-fit, loss-curve, contour, classify-boundary, knn, tree-split, forest, svm, kmeans, pca, fit-compare, darts, split-folds, confusion, learning-curve |
| Deep learning | neuron, network, activation, backprop-graph, gradient-flow, dropout, rnn, autoencoder, gan, train-loop, transfer |
| Computer vision | pixels, convolve, edges, pooling, cnn-arch, features-hierarchy, classify, augment, detection, segment, vit, pose |
| NLP | tokenize, bpe, bow-tfidf, ngram, skipgram, sentiment, ner, seq2seq, posenc, mask-compare, masked-lm, vector-search, spectrogram |
| Generative AI | gen-disc, vae-latent, noise-schedule, cfg, scaling, rlhf, sampling, chat, rag, lora, quantize, moe, clip |
| Mathematics | vectors, transform, eigen, svd, matmul, derivative, gradient-field, chain-rule, distribution, clt, entropy, mle, montecarlo, markov, norms, dims, posterior |
| Reinforcement learning | gridworld, rl-loop, returns, bandit, random-walk, cliff, policy-grad, cartpole, dqn |
| LLMs | transformer, qkv, kv-cache, heads, rope, batching, speculative, context-window, next-token, embed-lookup, dpo |
| MLOps | ci, drift, docker, serving, abtest, rollout, lineage, tracking, debt, monitor |

Test every scene headlessly with `node test-kits.js content/ml.js` (or any other content file).

## Media (about 81 MB, in `public/media/`)
- `frames/<slug>/NN.webp`: a 1280 × 720 still of every chapter, rendered from the same kits. Used by the illustrated notes pages (`/notes/<slug>.html`, printable) and the no-JavaScript fallback.
- `thumbs/<slug>/NN.webp`: 320 × 180 chapter thumbnails for the chapter list and the seek-bar preview.
- `og/*.jpg`: 1200 × 630 social-sharing cards for every lecture, track and the home page.

These are rendered in a browser from the kits. After you change a lecture's scenes, re-render that lecture's images, or the notes will show the old frames. Pages fall back gracefully if images for a lecture are missing.

## Publish
Double-click **`publish.cmd`** (not "Run as administrator"). It builds, commits and pushes to GitHub, and then Vercel redeploys automatically.

## Preview locally
```
node build.js
node serve.js 8093
```
Then open http://localhost:8093.

## Structure
- `content/`: lecture scripts
- `src/engine.js`: animation engine and video player
- `src/kits/`: scene kits
- `src/site.js`, `src/style.css`: page behaviour and styles
- `data/blog-index.json`: titles of The AI Lecture Hall posts, used for the "Go deeper" links
- `build.js`: static site generator. It writes `site/`, including `blog-links.json`, which the AI Lecture Hall uses to show "Watch the animated lesson" links.
