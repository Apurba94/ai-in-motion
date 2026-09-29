// Headless smoke test: runs every kit at many progress values with a fake canvas and reports errors / NaN coordinates.
'use strict';
let errors = 0, runs = 0;
const fs = require('fs'), path = require('path'), vm = require('vm');
let nan = [];
function fakeCtx() {
  const state = { font: '10px x' };
  const check = (name) => (...a) => { if (a.some(v => typeof v === 'number' && !isFinite(v))) nan.push(name + '(' + a.map(v => typeof v === 'number' ? v.toFixed ? v.toFixed(1) : v : typeof v).join(',') + ')'); };
  const grad = { addColorStop() {} };
  return new Proxy(state, {
    get(t, k) {
      if (k in t) return t[k];
      if (k === 'measureText') return (s) => ({ width: String(s).length * (parseFloat((t.font.match(/(\d+(\.\d+)?)px/) || [0, 10])[1])) * .52 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => grad;
      if (k === 'createImageData') return (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) });
      if (k === 'getImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) });
      if (['moveTo', 'lineTo', 'arc', 'arcTo', 'fillRect', 'fillText', 'rect', 'bezierCurveTo', 'quadraticCurveTo', 'ellipse', 'drawImage', 'translate', 'scale', 'rotate'].includes(k)) return check(k);
      return () => {};
    },
    set(t, k, v) { t[k] = v; return true; }
  });
}
const canvas = () => ({ width: 300, height: 150, getContext: () => fakeCtx(), clientWidth: 300 });
let current = '';
const ctxWin = { console: { log: console.log, warn() {}, error: (e) => { errors++; console.log('ERROR', current, e && e.message); } }, Math, JSON, localStorage: { getItem() { return null; }, setItem() {} }, devicePixelRatio: 1,
  document: { createElement: () => canvas(), fonts: null }, requestAnimationFrame() {}, CustomEvent: function () {}, speechSynthesis: null };
ctxWin.window = ctxWin; vm.createContext(ctxWin);
const src = path.join(__dirname, 'src');
['engine.js', 'kits/general.js', 'kits/ai.js', 'kits/ml.js', 'kits/dl.js', 'kits/cv.js', 'kits/nlp.js', 'kits/gen.js', 'kits/math.js', 'kits/rl.js', 'kits/llm.js', 'kits/mlops.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(src, f), 'utf8'), ctxWin, { filename: f }));
const M = ctxWin.Motion;
const lectures = process.argv[2] ? require(path.resolve(process.argv[2])) : null;

const scenesToTest = lectures ? [].concat(...lectures.map(l => l.scenes.map(s => ({ ...s, _lec: l.slug })))) : Object.keys(M.KITS).map(k => ({ kit: k, _lec: 'kit-test' }));
for (const sc of scenesToTest) {
  if (!M.KITS[sc.kit]) { console.log('UNKNOWN KIT', sc.kit, 'in', sc._lec); errors++; continue; }
  const def = { ...sc };
  for (const pr of [0, .05, .13, .27, .41, .5, .58, .66, .74, .83, .91, 1]) {
    runs++; nan = []; current = sc._lec + ' ' + sc.kit + ' p=' + pr;
    try { const cv = canvas(); cv.clientWidth = 640; M.poster(cv, def, pr, '#22d3ee', pr * 10); }
    catch (e) { errors++; console.log('ERROR', sc._lec, sc.kit, 'p=' + pr, e.message); break; }
    if (nan.length) { errors++; console.log('NaN', sc._lec, sc.kit, 'p=' + pr, nan.slice(0, 3).join(' ')); break; }
  }
}
console.log(`kits: ${Object.keys(M.KITS).length}, scenes tested: ${scenesToTest.length}, renders: ${runs}, problems: ${errors}`);
process.exitCode = errors ? 1 : 0;
