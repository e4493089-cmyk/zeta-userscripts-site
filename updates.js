(() => {
  'use strict';

  const list = document.getElementById('update-list');
  const nav = document.querySelector('.update-pagination');
  if (!list || !nav) return;

  const cards = Array.from(list.children).filter(card => card.classList.contains('update-card'));
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(cards.length / pageSize));
  let currentPage = 1;

  function button(label, page, ariaLabel) {
    const node = document.createElement('button');
    node.type = 'button';
    node.textContent = label;
    node.setAttribute('aria-label', ariaLabel);
    node.setAttribute('aria-controls', list.id);
    node.addEventListener('click', () => showPage(typeof page === 'function' ? page() : page, true));
    nav.appendChild(node);
    return node;
  }

  const previous = button('이전', () => currentPage - 1, '이전 페이지');
  const numbers = Array.from({ length: pageCount }, (_, index) =>
    button(String(index + 1), index + 1, (index + 1) + '페이지')
  );
  const next = button('다음', () => currentPage + 1, '다음 페이지');

  function showPage(page, moveToList = false) {
    currentPage = Math.min(pageCount, Math.max(1, page));
    const start = (currentPage - 1) * pageSize;
    cards.forEach((card, index) => { card.hidden = index < start || index >= start + pageSize; });
    previous.disabled = currentPage === 1;
    next.disabled = currentPage === pageCount;
    numbers.forEach((node, index) => {
      if (index + 1 === currentPage) node.setAttribute('aria-current', 'page');
      else node.removeAttribute('aria-current');
    });
    list.dataset.updatesReady = 'true';
    nav.hidden = pageCount <= 1;
    if (moveToList) {
      list.focus({ preventScroll: true });
      list.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }

  showPage(1);
})();
