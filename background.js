const hero = document.querySelector('.hero');
const toggle = document.querySelector('#background-motion');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let visible = !('IntersectionObserver' in window);
let paused = false;

function syncBackgroundMotion() {
  hero.dataset.motion = visible && !paused && !preference.matches ? 'playing' : 'paused';
  toggle.textContent = paused ? '播放背景动效' : '暂停背景动效';
  toggle.hidden = preference.matches;
}

toggle.addEventListener('click', () => {
  paused = !paused;
  syncBackgroundMotion();
});
preference.addEventListener('change', syncBackgroundMotion);

if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncBackgroundMotion();
  }).observe(hero);
}
syncBackgroundMotion();
