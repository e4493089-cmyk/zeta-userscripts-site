(() => {
  'use strict';

  const installButton = document.querySelector('#installScript');
  const copyButton = document.querySelector('#copyBookmarklet');
  const downloadButton = document.querySelector('#downloadScript');
  const accent = document.querySelector('#accentPicker');
  const other = document.querySelector('#otherPicker');
  const bg = document.querySelector('#bgPicker');
  const fontSize = document.querySelector('#fontSize');
  const meBorder = document.querySelector('#meBorder');
  const meBorderPicker = document.querySelector('#meBorderPicker');
  const meBorderWidth = document.querySelector('#meBorderWidth');
  const otherBorder = document.querySelector('#otherBorder');
  const otherBorderPicker = document.querySelector('#otherBorderPicker');
  const otherBorderWidth = document.querySelector('#otherBorderWidth');
  if (!installButton || !copyButton || !downloadButton || !accent || !other || !bg || !fontSize) return;

  const RAW = 'https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts-site/main/zeta-custom-theme.user.js';
  const fs = () => String(Math.max(12, Math.min(20, Number(fontSize.value) || 15)));
  const bw = input => String(Math.max(.5, Math.min(5, Number(input?.value) || 1)));
  const settings = () => ({
    bubble: accent.value.slice(1).toUpperCase(),
    other: other.value.slice(1).toUpperCase(),
    bg: bg.value.slice(1).toUpperCase(),
    fs: fs(),
    mb: meBorder?.checked ? '1' : '0',
    mbc: (meBorderPicker?.value || '#53636C').slice(1).toUpperCase(),
    mbw: bw(meBorderWidth),
    ob: otherBorder?.checked ? '1' : '0',
    obc: (otherBorderPicker?.value || '#53636C').slice(1).toUpperCase(),
    obw: bw(otherBorderWidth)
  });

  function downloadStayScript() {
    if (typeof buildStandaloneScript !== 'function') throw new Error('generator unavailable');
    const script = buildStandaloneScript();
    const s = settings();
    const blob = new Blob([script], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zeta-custom-theme-${s.bubble.toLowerCase()}-${s.other.toLowerCase()}-${s.bg.toLowerCase()}-${s.fs}px.js`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    window.ZetaSite?.toast?.('선택한 색이 포함된 Stay용 .js 파일을 저장했어요.');
  }

  function syncInstallLabel() {
    installButton.textContent = 'Tampermonkey 설치';
  }

  installButton.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    try {
      const url = new URL(RAW);
      const s = settings();
      Object.entries(s).forEach(([key, value]) => url.searchParams.set(key, value));
      location.href = url.href;
    } catch (error) {
      console.error('[Zeta Theme Maker install]', error);
      window.ZetaSite?.toast?.('커스텀 테마를 만들지 못했어요.');
    }
  }, true);

  // 북마클릿에는 색상값을 코드 안에 직접 주입한다.
  // #RRGGBB를 그대로 넣으면 URL fragment로 잘릴 수 있어 # 없는 파라미터로 주입한다.
  copyButton.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    try {
      const params = new URLSearchParams(settings()).toString();
      const original = 'return new URLSearchParams(location.search);';
      const replacement = `return new URLSearchParams(${JSON.stringify(params)});`;
      const loader = `(async()=>{const u=${JSON.stringify(RAW)},a=${JSON.stringify(original)},b=${JSON.stringify(replacement)};if(location.hostname!=="zeta-ai.io"&&!location.hostname.endsWith(".zeta-ai.io"))return alert("제타 페이지에서 실행해줘");try{const r=await fetch(u+"?bm="+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);let s=await r.text();if(!s.includes(a))throw Error("설정 주입 위치를 찾지 못함");s=s.replace(a,b);(0,eval)(s)}catch(e){alert("커스텀 테마 실행 실패: "+e.message)}})();`;
      const bookmarklet = 'javascript:' + loader;

      if (bookmarklet.includes('#')) throw new Error('bookmarklet contains unsafe #');
      ZetaSite.copyText(bookmarklet, '북마클릿 링크를 복사했어요.');
    } catch (error) {
      console.error('[Zeta Theme Maker bookmarklet]', error);
      window.ZetaSite?.toast?.('북마클릿 생성에 실패했어요.');
    }
  }, true);

  downloadButton.textContent = '.js 다운로드 (Stay용)';
  downloadButton.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    try {
      downloadStayScript();
    } catch (error) {
      console.error('[Zeta Theme Maker download]', error);
      window.ZetaSite?.toast?.('스크립트 파일 생성에 실패했어요.');
    }
  }, true);

  syncInstallLabel();
  window.addEventListener('zeta:platformchange', syncInstallLabel);
})();