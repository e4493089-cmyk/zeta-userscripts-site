(() => {
  const id = 'zeta-bookmarklet-launcher';
  const old = document.getElementById(id);
  if (old) old.remove();

  const root = document.createElement('div');
  root.id = id;
  const shadow = root.attachShadow({ mode: 'open' });

  const raw = 'https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts/main/';
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const tools = [
    { name: '카카오톡 테마', file: 'zeta-kakaotalk-theme.user.js', key: '__zetaKakaoBookmarklet' },
    { name: '캡처 이름 가리기', file: 'zeta-capture-user-mask.user.js', key: '__zetaMaskBookmarklet' },
    { name: '캡처 OOC 제거', file: 'zeta-capture-ooc-hide.user.js', key: '__zetaOocHideBookmarklet' },
    {
      name: 'Room Manager ' + (ios ? '(iOS)' : '(AOS / PC)'),
      file: ios ? 'zeta-room-manager-ios.user.js' : 'zeta-room-manager.user.js',
      key: ios ? '__zetaRoomManagerIosBookmarkletV3' : '__zetaRoomManagerBookmarklet'
    },
    { name: '대화 전체 저장', file: 'zeta-full-chat-export.user.js', key: '__zetaFullChatExportBookmarklet', action: true },
    { name: '대화 검색', file: 'zeta-chat-search.user.js', key: '__zetaChatSearchBookmarklet' },
    { name: 'Fullscreen', file: 'zeta-fullscreen.user.js', key: '__zetaFullscreenBookmarklet' }
  ];

  shadow.innerHTML = `<style>
    :host{all:initial}
    .veil{position:fixed;inset:0;z-index:2147483646;background:rgba(18,28,34,.48)}
    .panel{position:fixed;z-index:2147483647;inset:auto 12px 12px;max-width:420px;max-height:min(84vh,680px);margin:auto;background:#fff;color:#233139;border:1px solid #d8e0e3;border-radius:20px;box-shadow:0 20px 65px #14212a55;overflow:hidden;display:flex;flex-direction:column;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Noto Sans KR",sans-serif}
    .head{display:flex;justify-content:space-between;align-items:center;padding:18px 18px 12px;border-bottom:1px solid #e8ecee}
    .head b{font-size:18px}.close{font-size:25px;border:0;background:none;color:#34454e;cursor:pointer;line-height:1}
    .list{overflow-y:auto;padding:8px 14px}.row{display:flex;align-items:center;gap:10px;min-height:49px;border-bottom:1px solid #edf0f1}
    .row:last-child{border:0}.row input{width:19px;height:19px;accent-color:#26343c;flex:none}
    .name{flex:1;min-width:0;word-break:keep-all}.state{font-size:12px;color:#52636b;white-space:nowrap}
    .foot{border-top:1px solid #e8ecee;padding:12px 14px 15px}.actions{display:flex;gap:8px}
    .actions button{flex:1;min-height:43px;border:0;border-radius:11px;font:700 14px/1.3 inherit;cursor:pointer}
    .run{background:#fee500;color:#1a1b1c}.preset{background:#ecf0f2;color:#26343c}
    .actions button:disabled{opacity:.6;cursor:wait}.message{min-height:22px;margin:9px 2px 0;color:#34454e;font-size:13px;word-break:keep-all}
    @media(min-width:700px){.panel{top:50%;bottom:auto;transform:translateY(-50%)}}
  </style>
  <div class="veil"></div>
  <section class="panel" role="dialog" aria-modal="true" aria-label="ZETA Tools">
    <div class="head"><b>ZETA Tools</b><button class="close" aria-label="닫기">×</button></div>
    <div class="list"></div>
    <div class="foot">
      <div class="actions"><button class="preset">전체 선택</button><button class="run">선택 실행</button></div>
      <p class="message" role="status">실행할 도구를 선택하세요.</p>
    </div>
  </section>`;

  const list = shadow.querySelector('.list');
  tools.forEach((tool, i) => {
    const row = document.createElement('label');
    row.className = 'row';
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.value = String(i);
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = tool.name;
    const state = document.createElement('span');
    state.className = 'state';
    state.textContent = window[tool.key] ? '실행됨' : '';
    row.append(check, name, state);
    list.append(row);
  });

  const msg = shadow.querySelector('.message');
  const buttons = [shadow.querySelector('.run'), shadow.querySelector('.preset')];
  let busy = false;

  async function launch(index) {
    const tool = tools[index];

    if (tool.action && window[tool.key]) {
      const button = document.getElementById('zeta-full-chat-export-button');
      if (!button) throw Error('대화 저장 버튼을 찾지 못했습니다. 채팅방에서 실행해 주세요.');
      button.click();
      return '실행';
    }

    if (window[tool.key]) return '이미 실행됨';
    window[tool.key] = 1;

    try {
      const response = await fetch(raw + tool.file + '?bm=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) throw Error('HTTP ' + response.status);
      const source = await response.text();


      (0, eval)(source);

      if (tool.action) {
        await new Promise(resolve => setTimeout(resolve, 150));
        const button = document.getElementById('zeta-full-chat-export-button');
        if (!button) throw Error('대화 저장 버튼을 찾지 못했습니다. 채팅방에서 실행해 주세요.');
        button.click();
      }

      list.children[index].querySelector('.state').textContent = '실행됨';
      return '실행';
    } catch (error) {
      delete window[tool.key];
      throw error;
    }
  }

  async function run(indices) {
    if (busy) return;
    busy = true;
    buttons.forEach(button => button.disabled = true);

    let ok = 0;
    try {
      for (const index of indices) {
        msg.textContent = tools[index].name + ' 실행 중…';
        await launch(index);
        ok++;
      }
      msg.textContent = ok + '개 도구 실행 완료';
    } catch (error) {
      msg.textContent = '실행 실패: ' + error.message;
    } finally {
      buttons.forEach(button => button.disabled = false);
      busy = false;
    }
  }

  shadow.querySelector('.run').onclick = () => {
    const indices = [...shadow.querySelectorAll('.row input:checked')].map(input => Number(input.value));
    if (!indices.length) {
      msg.textContent = '도구를 먼저 선택하세요.';
      return;
    }
    void run(indices);
  };

  shadow.querySelector('.preset').onclick = () => {
    const checks = [...shadow.querySelectorAll('.row input')];
    const all = checks.every(input => input.checked);
    checks.forEach(input => input.checked = !all);
    shadow.querySelector('.preset').textContent = all ? '전체 선택' : '전체 해제';
    msg.textContent = all
      ? '선택을 모두 해제했어요.'
      : '모든 도구를 선택했어요. 실행하려면 ‘선택 실행’을 누르세요.';
  };

  shadow.querySelectorAll('.row input').forEach(input => {
    input.onchange = () => {
      shadow.querySelector('.preset').textContent =
        [...shadow.querySelectorAll('.row input')].every(other => other.checked)
          ? '전체 해제'
          : '전체 선택';
    };
  });

  shadow.querySelector('.close').onclick = () => root.remove();
  shadow.querySelector('.veil').onclick = () => root.remove();
  document.documentElement.append(root);
})();
