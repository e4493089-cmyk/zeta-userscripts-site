(() => {
  'use strict';

  const RESUME_KEY = 'zeta-room-manager:profile-resume:v1';

  function helperRuntime() {
    const key = window.__zrmKey;
    const name = window.__zrmName || 'Room Manager';
    const source = window.__zrmSource || '';
    const resumeKey = window.__zrmResumeKey;

    const statusNode = () => document.getElementById('zrm-controller-status');
    const setStatus = text => {
      const node = statusNode();
      if (node) node.textContent = text;
    };

    if (window.__zrmControllerTimer) {
      try { clearInterval(window.__zrmControllerTimer); } catch (_) {}
    }

    const tick = () => {
      const main = window.opener;
      if (!main || main.closed) {
        setStatus('Zeta 탭이 닫혀 컨트롤러를 종료합니다.');
        try { clearInterval(window.__zrmControllerTimer); } catch (_) {}
        setTimeout(() => { try { window.close(); } catch (_) {} }, 500);
        return;
      }

      try {
        main.__zrmBookmarkletControllerReady = true;
        main.__zrmBookmarkletController = window;

        let resume = null;
        try {
          resume = JSON.parse(main.sessionStorage.getItem(resumeKey) || 'null');
        } catch (_) {}

        if (!resume || !resume.active) {
          setStatus('Zeta 탭에서 수집을 시작하면 자동 이어받기를 준비합니다.');
          return;
        }

        if (main.document.readyState === 'loading') {
          setStatus('Zeta 탭 메모리를 비우는 중…');
          return;
        }

        if (main[key]) {
          setStatus('이름 수집 진행 중 · 이 탭은 닫지 마세요.');
          return;
        }

        setStatus('Room Manager 자동 재개 중…');
        main[key] = 1;
        main.__zrmBookmarkletControllerReady = true;
        main.__zrmBookmarkletController = window;

        try {
          main.eval(source);
          setStatus(name + ' 자동 재개 완료 · 수집 진행 중');
          try { main.focus(); } catch (_) {}
        } catch (error) {
          try { delete main[key]; } catch (_) {}
          setStatus('자동 재개 실패 · ' + ((error && error.message) || error));
        }
      } catch (_) {
        setStatus('Zeta 탭 연결을 기다리는 중…');
      }
    };

    window.__zrmControllerTimer = setInterval(tick, 300);
    tick();
  }

  function install(controller, options = {}) {
    if (!controller || controller.closed) return false;

    const key = String(options.key || '');
    const name = String(options.name || 'Room Manager');
    const source = String(options.source || '');
    if (!key || !source) return false;

    try {
      if (controller.__zrmControllerTimer) {
        try { controller.clearInterval(controller.__zrmControllerTimer); } catch (_) {}
      }

      controller.document.open();
      controller.document.write(
        '<!doctype html><html lang="ko"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>Room Manager 자동 이어받기</title>' +
        '<style>' +
        'html,body{margin:0;min-height:100%;background:#f7f8fa;color:#1f2933;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans KR",sans-serif}' +
        'main{max-width:430px;margin:0 auto;padding:28px 22px}' +
        'h1{font-size:18px;margin:0 0 12px}' +
        'p{font-size:14px;line-height:1.6;margin:8px 0;color:#52606d}' +
        '#zrm-controller-status{margin-top:18px;padding:14px 16px;background:#fff;border:1px solid #dde3e8;border-radius:12px;color:#24323d;font-weight:700}' +
        'b{color:#111827}' +
        '</style></head><body><main>' +
        '<h1>Room Manager 자동 이어받기</h1>' +
        '<p><b>수집이 끝날 때까지 이 탭을 닫지 마세요.</b></p>' +
        '<p>Zeta 탭이 메모리 정리를 위해 새로고침되면 Room Manager를 자동으로 다시 실행합니다.</p>' +
        '<div id="zrm-controller-status">준비 중…</div>' +
        '</main></body></html>'
      );
      controller.document.close();

      controller.__zrmKey = key;
      controller.__zrmName = name;
      controller.__zrmSource = source;
      controller.__zrmResumeKey = RESUME_KEY;
      controller.eval('(' + helperRuntime.toString() + ')()');

      window.__zrmBookmarkletControllerReady = true;
      window.__zrmBookmarkletController = controller;
      try { window.focus(); } catch (_) {}
      return true;
    } catch (error) {
      console.error('[ZRM bookmarklet controller]', error);
      try { controller.close(); } catch (_) {}
      return false;
    }
  }

  window.__zrmBookmarkletControllerInstall = install;
})();
