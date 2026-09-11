(() => {
  'use strict';

  const installButton = document.querySelector('#installScript');
  const downloadButton = document.querySelector('#downloadScript');
  const accent = document.querySelector('#accentPicker');
  const other = document.querySelector('#otherPicker');
  const bg = document.querySelector('#bgPicker');
  const fontSize = document.querySelector('#fontSize');
  if (!installButton || !downloadButton || !accent || !other || !bg || !fontSize) return;

  const RAW = 'https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts-site/main/zeta-custom-theme.user.js';
  const fs = () => String(Math.max(12, Math.min(20, Number(fontSize.value) || 15)));

  installButton.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    const url = new URL(RAW);
    url.searchParams.set('bubble', accent.value.slice(1).toUpperCase());
    url.searchParams.set('other', other.value.slice(1).toUpperCase());
    url.searchParams.set('bg', bg.value.slice(1).toUpperCase());
    url.searchParams.set('fs', fs());
    location.href = url.href;
  }, true);

  // iOS/Stay의 로컬 파일 선택기는 일반 .js 파일을 가장 안정적으로 인식한다.
  // 기존 theme-maker.js의 Blob .user.js 다운로드는 캡처 단계에서 막고,
  // 같은 userscript 내용(메타데이터 포함)을 plain .js 파일로 저장한다.
  downloadButton.textContent = '.js 다운로드 (Stay용)';
  downloadButton.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    try {
      if (typeof buildStandaloneScript !== 'function') throw new Error('generator unavailable');
      const script = buildStandaloneScript();
      const a = accent.value.slice(1).toLowerCase();
      const o = other.value.slice(1).toLowerCase();
      const c = bg.value.slice(1).toLowerCase();
      const blob = new Blob([script], { type: 'application/javascript;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zeta-custom-theme-${a}-${o}-${c}-${fs()}px.js`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      if (window.ZetaSite?.toast) ZetaSite.toast('Stay에서 선택 가능한 .js 파일을 저장했어요.');
    } catch (error) {
      console.error('[Zeta Theme Maker download]', error);
      if (window.ZetaSite?.toast) ZetaSite.toast('스크립트 파일 생성에 실패했어요.');
    }
  }, true);
})();
