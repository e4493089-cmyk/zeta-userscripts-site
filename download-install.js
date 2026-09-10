(() => {
  'use strict';

  const button = document.querySelector('#downloadScript');
  const accent = document.querySelector('#accentPicker');
  const other = document.querySelector('#otherPicker');
  const bg = document.querySelector('#bgPicker');
  const fontSize = document.querySelector('#fontSize');
  if (!button || !accent || !other || !bg || !fontSize) return;

  const RAW = 'https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts-site/main/zeta-custom-theme.user.js';

  button.textContent = '.user.js 저장 + 몽키 추가';

  button.addEventListener('click', () => {
    const url = new URL(RAW);
    url.searchParams.set('bubble', accent.value.slice(1).toUpperCase());
    url.searchParams.set('other', other.value.slice(1).toUpperCase());
    url.searchParams.set('bg', bg.value.slice(1).toUpperCase());
    url.searchParams.set('fs', String(Math.max(12, Math.min(20, Number(fontSize.value) || 15))));

    // 기존 theme-maker.js의 Blob 다운로드가 먼저 시작되도록 잠깐 기다린 뒤,
    // 같은 설정의 raw .user.js를 열어 Tampermonkey 설치 화면까지 이어간다.
    setTimeout(() => {
      location.href = url.href;
    }, 450);
  }, true);
})();
