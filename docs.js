(() => {
  const directory = document.querySelector('.docs-nav');
  if (!directory) return;
  if (matchMedia('(max-width: 60rem)').matches) directory.open = false;

  const search = document.querySelector('#doc-search');
  const status = document.querySelector('#doc-search-status');
  const links = [...directory.querySelectorAll('[data-doc-title]')];
  search.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    links.forEach(link => {
      link.hidden = !link.dataset.docTitle.toLocaleLowerCase().includes(query);
      if (!link.hidden) count++;
    });
    directory.querySelectorAll('.docs-nav-group').forEach(group => {
      group.hidden = ![...group.querySelectorAll('a')].some(link => !link.hidden);
    });
    status.hidden = !query;
    status.textContent = count ? '找到 ' + count + ' 篇文档' : '没有匹配的文档，试试其他关键词。';
  });
})();
