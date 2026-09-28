# AI in Motion

Animated video lectures on **Artificial Intelligence, Machine Learning, Deep Learning and Computer Vision**, by **Janin A Apurba** (CSE, AUST), Advanced ICT Officer at CNRS-UNHCR.

- **Lectures:** 49 animated lectures (≈ 72 minutes), in 4 tracks.
- **In every lecture:**
  - animations drawn live on a canvas from real computations: the searches really search, gradient descent really descends and k-means really clusters;
  - optional spoken narration (browser speech), subtitles, chapters, a seek bar, speed control and fullscreen;
  - a transcript, key takeaways, a 3-question quiz, and links to the matching written lectures in [The AI Lecture Hall](https://ai-lecture-hall.vercel.app).

© Janin A Apurba, CSE, AUST · Advanced ICT Officer, CNRS-UNHCR. All rights reserved.

## Add or edit a lecture
Lectures live in `content/ai.js`, `content/ml.js`, `content/dl.js` and `content/cv.js`. Each lecture is a list of scenes:

```js
{
  slug: 'my-lecture', title: 'My Lecture', track: 'ml', level: 'Beginner',
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

The length of each scene comes from its narration (`say`), or you can set `dur` in seconds.

**Scene kits:**

| Group | Kits |
|---|---|
| General | title, bullets, compare, pipeline, cycle, nested, timeline, equation, bars, definition |
| AI | grid-search, agent, game-tree, landscape, genetic, bayes, llm, attention, diffusion, embedding |
| Machine learning | scatter-fit, loss-curve, contour, classify-boundary, knn, tree-split, forest, svm, kmeans, pca, fit-compare, darts, split-folds, confusion, learning-curve |
| Deep learning | neuron, network, activation, backprop-graph, gradient-flow, dropout, rnn, autoencoder, gan, train-loop, transfer |
| Computer vision | pixels, convolve, edges, pooling, cnn-arch, features-hierarchy, classify, augment, detection, segment, vit, pose |

Test every scene headlessly with `node test-kits.js content/ml.js`.

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
