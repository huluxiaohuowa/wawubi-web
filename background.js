const hero = document.querySelector('.hero');

if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    hero.dataset.motion = entry.isIntersecting ? 'playing' : 'paused';
  }).observe(hero);
} else {
  hero.dataset.motion = 'playing';
}
