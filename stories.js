(() => {
  const demo = document.querySelector('#candidate-demo');
  if (!demo) return;

  document.querySelectorAll('[data-demo-theme]').forEach(button => {
    button.addEventListener('click', () => {
      demo.dataset.theme = button.dataset.demoTheme;
      document.querySelectorAll('[data-demo-theme]').forEach(option => {
        option.setAttribute('aria-pressed', String(option === button));
      });
    });
  });

  document.querySelectorAll('[data-demo-layout]').forEach(button => {
    button.addEventListener('click', () => {
      demo.dataset.layout = button.dataset.demoLayout;
      document.querySelectorAll('[data-demo-layout]').forEach(option => {
        option.setAttribute('aria-pressed', String(option === button));
      });
    });
  });

  const size = document.querySelector('#candidate-size');
  const label = document.querySelector('#candidate-size-label');
  size.addEventListener('input', () => {
    demo.style.setProperty('--candidate-size', size.value + 'px');
    label.value = size.value + ' pt';
  });
})();
