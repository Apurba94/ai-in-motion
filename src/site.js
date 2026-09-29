/* AI in Motion — page behaviour. © Janin A Apurba, CSE, AUST */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var M = window.Motion;
  var data = function (id) { var el = document.getElementById(id); if (!el) return null; try { return JSON.parse(el.textContent); } catch (e) { return null; } };

  /* menu */
  var nav = $('#nav'), menu = $('#menu');
  if (nav && menu) menu.addEventListener('click', function () { menu.setAttribute('aria-expanded', nav.classList.toggle('open')); });

  /* lecture page player */
  var lec = data('lecture-data'), shell = $('#player');
  if (lec && shell && M) {
    var player = new M.Player(shell, lec);
    var chapterBtns = $$('.chapters button');
    var chapList = $('.chapters');
    shell.addEventListener('mv-scene', function (e) { chapterBtns.forEach(function (b, i) { b.classList.toggle('on', i === e.detail.index); }); var on = chapterBtns[e.detail.index]; if (on && chapList && chapList.scrollHeight > chapList.clientHeight) { var li = on.parentNode; chapList.scrollTo({ top: Math.max(0, li.offsetTop - chapList.offsetTop - chapList.clientHeight / 2 + li.offsetHeight / 2), behavior: reduced ? 'auto' : 'smooth' }); } });
    $$('[data-seek]').forEach(function (b) { b.addEventListener('click', function () { player.seekScene(+b.dataset.seek); shell.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); shell.focus({ preventScroll: true }); }); });
    shell.addEventListener('mv-ended', function () {
      var stage = $('.mv-stage', shell), next = $('.pn .next'); if (!stage || $('.mv-end', stage)) return;
      var box = document.createElement('div'); box.className = 'mv-end';
      box.innerHTML = '<p>Lecture complete ✓</p><div><button type="button" class="btn btn-line" data-replay>↺ Replay</button><a class="btn btn-line" href="#quiz-anchor">Take the quiz</a>' + (next ? '<a class="btn btn-glow" href="' + next.getAttribute('href') + '">' + next.querySelector('small').textContent + '</a>' : '') + '</div>';
      stage.appendChild(box);
      box.addEventListener('click', function (e) { e.stopPropagation(); if (e.target.closest('[data-replay]')) { box.remove(); player.seek(0); player.play(); } });
      shell.addEventListener('mv-scene', function rm() { box.remove(); shell.removeEventListener('mv-scene', rm); });
    });
    var quizSec = $('.quiz'); if (quizSec) quizSec.closest('section').id = 'quiz-anchor';
  }

  /* quiz */
  $$('.quiz').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var score = 0, qs = $$('.q', form);
      qs.forEach(function (q) {
        var sel = $('input:checked', q), correct = q.dataset.correct;
        $$('label', q).forEach(function (l) { var inp = $('input', l); l.classList.remove('ok', 'bad'); if (inp.value === correct) l.classList.add('ok'); else if (inp.checked) l.classList.add('bad'); });
        if (sel && sel.value === correct) score++;
        $('.why', q).hidden = false;
      });
      $('.score', form).textContent = score + ' / ' + qs.length + (score === qs.length ? ' — excellent! 🎉' : score ? ' — good, review the highlighted answers' : ' — rewatch the video and try again');
    });
  });

  /* home showreel */
  var reel = data('reel-data'), reelEl = $('#reel');
  if (reel && reelEl && M) {
    var rp = new M.Player(reelEl, reel, { minimal: true, silent: true, loop: true });
    if (!reduced && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? rp.play() : rp.pause(); }); }, { threshold: .3 }).observe(reelEl);
    reelEl.addEventListener('click', function () { rp.playing ? rp.pause() : rp.play(); });
  }

  /* card thumbnails: drawn live, animated on hover */
  var posters = data('poster-data');
  if (posters && M) {
    var draw = function (cv, p, t) { var d = posters[cv.dataset.poster]; if (d) M.poster(cv, d.scene, p, d.accent, t); };
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { draw(e.target, .72, 3); io.unobserve(e.target); } }); }, { rootMargin: '200px' }) : null;
    $$('canvas[data-poster]').forEach(function (cv) {
      if (io) io.observe(cv); else draw(cv, .72, 3);
      if (reduced) return;
      var card = cv.closest('.card'), raf = null, t0 = 0;
      var loop = function (now) { if (!t0) t0 = now; var d = posters[cv.dataset.poster], dur = M.sceneDur(d.scene) * 1000; draw(cv, ((now - t0) % dur) / dur, (now - t0) / 1000); raf = requestAnimationFrame(loop); };
      card.addEventListener('pointerenter', function () { t0 = 0; raf = requestAnimationFrame(loop); });
      card.addEventListener('pointerleave', function () { cancelAnimationFrame(raf); draw(cv, .72, 3); });
    });
  }

  /* library search and track filter */
  var grid = $('#grid'), q = $('#q'), chips = $('#chips');
  if (grid && chips) {
    var track = 'all';
    var apply = function () {
      var terms = (q ? q.value : '').toLowerCase().split(/\s+/).filter(Boolean), shown = 0;
      $$('.card', grid).forEach(function (c) { var ok = (track === 'all' || c.dataset.track === track || (track === 'deep' && c.dataset.deep === '1')) && terms.every(function (t) { return c.dataset.q.indexOf(t) !== -1; }); c.hidden = !ok; if (ok) shown++; });
      $('#empty').hidden = shown > 0;
    };
    if (q) q.addEventListener('input', apply);
    chips.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (!b) return; track = b.dataset.track; $$('.chip', chips).forEach(function (x) { x.classList.toggle('on', x === b); }); apply(); });
  }
})();
