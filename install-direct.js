(() => {
  'use strict';

  const button = document.querySelector('#installScript');
  const accent = document.querySelector('#accentPicker');
  const other = document.querySelector('#otherPicker');
  const bg = document.querySelector('#bgPicker');
  const fontSize = document.querySelector('#fontSize');
  if (!button || !accent || !other || !bg || !fontSize) return;

  const RAW = 'https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts-site/main/zeta-custom-theme.user.js';

  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    const url = new URL(RAW);
    url.searchParams.set('bubble', accent.value.slice(1).toUpperCase());
    url.searchParams.set('other', other.value.slice(1).toUpperCase());
    url.searchParams.set('bg', bg.value.slice(1).toUpperCase());
    url.searchParams.set('fs', String(Math.max(12, Math.min(20, Number(fontSize.value) || 15))));

    location.href = url.href;
  }, true);
})();
