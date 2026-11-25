const ZETA={
  repo:'https://github.com/e4493089-cmyk/zeta-userscripts',
  raw:'https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts/main/',
  pages:'https://e4493089-cmyk.github.io/zeta-userscripts-site/',
  userscripts:'https://apps.apple.com/kr/app/userscripts/id1463298887',
  tampermonkey:'https://www.tampermonkey.net/'
};

const PLATFORM_KEY='zeta-tools:platform-mode:v2';
const PLATFORM_OPTIONS={
  auto:{label:'자동'},
  ios:{label:'iOS · Userscripts'},
  monkey:{label:'Android / PC · Tampermonkey'}
};

function detectBrowser(){
  const ua=navigator.userAgent||'';
  if(/EdgiOS/i.test(ua))return 'Edge';
  if(/EdgA|Edg\//i.test(ua))return 'Edge';
  if(/CriOS|Chrome\//i.test(ua))return 'Chrome';
  if(/FxiOS|Firefox\//i.test(ua))return 'Firefox';
  if(/Safari/i.test(ua))return 'Safari';
  return '브라우저';
}

function detectPlatform(){
  const ua=navigator.userAgent||'';
  const iPadDesktop=navigator.platform==='MacIntel' && navigator.maxTouchPoints>1;
  const isIOS=/iPhone|iPad|iPod/i.test(ua)||iPadDesktop;
  return isIOS?'ios':'monkey';
}

function getPlatformMode(){
  const saved=localStorage.getItem(PLATFORM_KEY);
  return PLATFORM_OPTIONS[saved]?saved:'auto';
}
function getPlatform(){
  const mode=getPlatformMode();
  return mode==='auto'?detectPlatform():mode;
}
function setPlatformMode(mode){
  if(!PLATFORM_OPTIONS[mode])return;
  localStorage.setItem(PLATFORM_KEY,mode);
  renderPlatformUI();
  window.dispatchEvent(new CustomEvent('zeta:platformchange',{detail:{mode,platform:getPlatform()}}));
}

function platformName(platform=getPlatform()){
  if(platform==='ios')return 'iOS · Userscripts';
  return 'Android / PC · Tampermonkey';
}

function platformInstallMeta(platform=getPlatform()){
  if(platform==='ios'){
    return {
      manager:'Userscripts',
      managerUrl:ZETA.userscripts,
      primary:'.user.js 다운로드',
      downloadFirst:true,
      badge:'Safari · Userscripts 사용',
      summary:'iPhone/iPad는 Safari + Userscripts를 사용하세요. 받은 .user.js 파일을 앱에 지정된 폴더에 넣고, Safari 확장의 기타 웹사이트 권한을 허용합니다.',
      steps:['App Store에서 Userscripts를 설치하고 한 번 실행해 스크립트 저장 폴더를 확인합니다.',
        '설정 → 앱 → Safari → 확장 프로그램 → Userscripts를 켭니다. 구버전 iOS는 설정 → Safari에서 찾으세요.',
        '웹사이트 접근 권한의 “기타 웹사이트”를 “허용”으로 바꾸고, 제타가 별도 목록에 있으면 함께 허용합니다.',
        '이 사이트에서 받은 .user.js 파일을 파일 앱에서 Userscripts에 지정된 폴더로 이동합니다. 다운로드 폴더에만 두면 적용되지 않습니다.',
        'Safari로 제타를 열고 확장 프로그램 → Userscripts에서 해당 스크립트가 켜져 있는지 확인합니다.',
        'Stay에서 같은 스크립트를 쓰고 있었다면 꺼서 중복 실행을 막고, 제타를 새로고침합니다.']
    };
  }
  return {
    manager:'Tampermonkey',
    managerUrl:ZETA.tampermonkey,
    primary:'Tampermonkey로 설치',
    downloadFirst:false,
    badge:'Tampermonkey 추천',
    summary:'설치 버튼을 누르면 Tampermonkey 설치 화면이 열립니다.',
    steps:['Tampermonkey를 설치하고 활성화합니다.','원하는 스크립트의 설치 버튼을 누릅니다.','Tampermonkey 설치 화면에서 설치를 확인합니다.','ZETA를 새로고침합니다.']
  };
}

let toastTimer;
function toast(message){
  const el=document.getElementById('toast');
  if(!el)return;
  el.textContent=message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),1800);
}
async function copyText(text,message='복사했어요.'){
  try{await navigator.clipboard.writeText(text)}
  catch(_){
    const t=document.createElement('textarea');
    t.value=text;t.style.position='fixed';t.style.opacity='0';
    document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();
  }
  toast(message);
}

function ensureInstallSheet(){
  if(document.getElementById('install-sheet'))return document.getElementById('install-sheet');
  const wrap=document.createElement('div');
  wrap.id='install-sheet';wrap.className='sheet-wrap';wrap.hidden=true;
  wrap.innerHTML=`<div class="sheet-backdrop" data-sheet-close></div><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"><div class="sheet-handle"></div><div class="sheet-head"><div><span class="sheet-kicker" id="sheet-kicker"></span><h2 id="sheet-title"></h2><p id="sheet-desc"></p></div><button class="sheet-close" type="button" aria-label="닫기" data-sheet-close>×</button></div><ol class="sheet-steps" id="sheet-steps"></ol><div class="sheet-actions"><a class="btn btn-dark" id="sheet-manager" target="_blank" rel="noopener">관리자 열기</a><button class="btn btn-light" type="button" data-sheet-close>닫기</button></div></section>`;
  document.body.appendChild(wrap);
  wrap.querySelectorAll('[data-sheet-close]').forEach(x=>x.addEventListener('click',()=>{wrap.hidden=true;document.body.classList.remove('sheet-open')}));
  return wrap;
}
function showInstallGuide(scriptName,url){
  const meta=platformInstallMeta();
  const sheet=ensureInstallSheet();
  sheet.querySelector('#sheet-kicker').textContent=platformName();
  sheet.querySelector('#sheet-title').textContent=`${scriptName} · ${meta.manager}`;
  sheet.querySelector('#sheet-desc').textContent=meta.summary;
  sheet.querySelector('#sheet-steps').innerHTML=meta.steps.map((s,i)=>`<li><span>${i+1}</span><b>${s}</b></li>`).join('');
  const a=sheet.querySelector('#sheet-manager');a.href=meta.managerUrl;a.textContent=`${meta.manager} 열기 ↗`;
  sheet.hidden=false;document.body.classList.add('sheet-open');
}

const scriptVersionCache=new Map();
async function syncScriptVersion(box,url){
  const node=box.closest('article')?.querySelector('[data-script-version]');
  if(!node||!url)return;
  let pending=scriptVersionCache.get(url);
  if(!pending){
    pending=fetch(url+(url.includes('?')?'&':'?')+'zetaVersion='+Date.now(),{cache:'no-store'})
      .then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.text()})
      .then(text=>text.match(/^\s*\/\/\s*@version\s+([^\s]+)\s*$/m)?.[1]||null)
      .catch(()=>null);
    scriptVersionCache.set(url,pending);
  }
  const version=await pending;
  if(version)node.textContent=`v${version}`;
}

async function downloadScript(url,name){
  try{
    const response=await fetch(url+(url.includes('?')?'&':'?')+'download='+Date.now(),{cache:'no-store'});
    if(!response.ok)throw Error('HTTP '+response.status);
    const blob=await response.blob();
    const objectUrl=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=objectUrl;
    a.download=url.split('/').pop().split('?')[0]||'zeta-script.user.js';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
    toast(`${name} JS 파일을 다운로드했어요.`);
  }catch(_){
    window.open(url,'_blank','noopener');
    toast('다운로드가 막혀 원본 JS를 열었어요.');
  }
}

function installScript(url,name){
  const meta=platformInstallMeta();
  if(meta.downloadFirst){
    downloadScript(url,name).then(()=>showInstallGuide(name,url));
  }else{
    window.location.href=url;
  }
}

function renderScriptActions(root=document){
  root.querySelectorAll('[data-script-actions]').forEach(box=>{
    const url=box.dataset.scriptUrl;
    const name=box.dataset.scriptName||'스크립트';
    const compact=box.dataset.compact==='1';
    const meta=platformInstallMeta();
    box.innerHTML='';
    const primary=document.createElement(meta.downloadFirst?'button':'a');
    primary.className=`btn btn-primary${compact?' btn-sm':''}`;primary.textContent=meta.primary;
    if(meta.downloadFirst){
      primary.type='button';
      primary.addEventListener('click',()=>installScript(url,name));
    }else{
      primary.href=url;
      primary.target='_blank';
      primary.rel='noopener';
      primary.setAttribute('data-userscript-install','1');
    }
    box.appendChild(primary);
    const secondary=document.createElement('button');
    secondary.type='button';secondary.className=`btn btn-light${compact?' btn-sm':''}`;
    if(meta.downloadFirst){
      secondary.textContent='설치 방법';
      secondary.addEventListener('click',()=>showInstallGuide(name,url));
    }else{
      secondary.textContent='링크 복사';
      secondary.addEventListener('click',()=>copyText(url,`${name} 링크를 복사했어요.`));
    }
    box.appendChild(secondary);
    syncScriptVersion(box,url);
  });
}

function applyPlatformVisibility(platform=getPlatform()){
  document.querySelectorAll('[data-platforms]').forEach(el=>{
    const allowed=(el.dataset.platforms||'').split(/\s+/).filter(Boolean);
    el.hidden=allowed.length>0&&!allowed.includes(platform);
  });
}

function renderPlatformUI(){
  const detected=detectPlatform();
  const current=getPlatform();
  const mode=getPlatformMode();
  document.querySelectorAll('[data-platform-name]').forEach(x=>x.textContent=platformName(current));
  document.querySelectorAll('[data-platform-detected]').forEach(x=>x.textContent=platformName(detected));
  document.querySelectorAll('[data-platform-badge]').forEach(x=>x.textContent=platformInstallMeta(current).badge);
  document.querySelectorAll('[data-platform-summary]').forEach(x=>x.textContent=platformInstallMeta(current).summary);
  document.querySelectorAll('[data-platform-option]').forEach(btn=>{
    const active=btn.dataset.platformOption===mode;
    btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));
  });
  const manager=platformInstallMeta(current);
  document.querySelectorAll('[data-manager-link]').forEach(a=>{a.href=manager.managerUrl;a.textContent=`${manager.manager} 열기 ↗`});
  document.querySelectorAll('[data-platform-preview-note]').forEach(x=>{
    x.textContent=mode==='auto'?'자동 선택':`수동 선택 · ${PLATFORM_OPTIONS[mode].label}`;
  });
  applyPlatformVisibility(current);
  renderScriptActions();
}

function mountPlatformBar(){
  const mount=document.getElementById('platform-mount');
  if(!mount)return;
  mount.innerHTML=`<div class="platform-card"><div class="platform-top"><div><span class="platform-label">현재 설치 환경</span><div class="platform-current"><strong data-platform-name></strong><span data-platform-badge></span></div><p data-platform-summary></p></div><a class="manager-link" data-manager-link target="_blank" rel="noopener"></a></div><div class="platform-switch" aria-label="설치 환경 선택">${Object.entries(PLATFORM_OPTIONS).map(([key,v])=>`<button type="button" data-platform-option="${key}">${v.label}</button>`).join('')}</div><div class="platform-foot"><span><b>자동 감지:</b> <span data-platform-detected></span></span><span data-platform-preview-note></span><span>현재 환경과 다르면 직접 선택하세요.</span></div></div>`;
  mount.querySelectorAll('[data-platform-option]').forEach(btn=>btn.addEventListener('click',()=>setPlatformMode(btn.dataset.platformOption)));
  renderPlatformUI();
}

function bindCopies(){
  document.querySelectorAll('[data-copy]').forEach(el=>{
    if(el.dataset.copyBound==='1')return;
    el.dataset.copyBound='1';
    el.addEventListener('click',()=>copyText(el.dataset.copy,el.dataset.message||'링크를 복사했어요.'));
  });
  document.querySelectorAll('[data-toggle]').forEach(btn=>{
    if(btn.dataset.toggleBound==='1')return;
    btn.dataset.toggleBound='1';
    btn.addEventListener('click',()=>{
      const target=document.getElementById(btn.dataset.toggle);
      if(!target)return;
      const open=target.hidden;
      target.hidden=!open;
      btn.textContent=open?'코드 닫기':'코드 보기';
    });
  });
}

function getBookmarklets(){
  const RAW={theme:ZETA.raw+'zeta-kakaotalk-theme.user.js',mask:ZETA.raw+'zeta-capture-user-mask.user.js',room:ZETA.raw+'zeta-room-manager.user.js',roomIos:ZETA.raw+'zeta-room-manager-ios.user.js',full:ZETA.raw+'zeta-fullscreen.user.js',chatExport:ZETA.raw+'zeta-full-chat-export.user.js',chatSearch:ZETA.raw+'zeta-chat-search.user.js'};
  return {
    launcher:"javascript:(async()=>{if(location.hostname!==\"zeta-ai.io\"&&!location.hostname.endsWith(\".zeta-ai.io\"))return alert(\"제타 페이지에서 실행해줘\");try{const r=await fetch(\"https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts-site/main/zeta-bookmarklet-launcher.js?bm=\"+Date.now(),{cache:\"no-store\"});if(!r.ok)throw Error(\"HTTP \"+r.status);(0,eval)(await r.text())}catch(e){alert(\"도구 메뉴 실행 실패: \"+e.message)}})();",
    theme:`javascript:(async()=>{const k="__zetaKakaoBookmarklet",u="${RAW.theme}",n="ZETA 카톡 테마";if(location.hostname!=="zeta-ai.io"&&!location.hostname.endsWith(".zeta-ai.io"))return alert("제타 페이지에서 실행해줘");if(window[k])return alert(n+" 이미 실행 중");try{window[k]=1;const r=await fetch(u+"?bm="+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);(0,eval)(await r.text());alert(n+" 적용됨\\n새로고침하면 해제됨")}catch(e){delete window[k];alert(n+" 실행 실패: "+e.message)}})();`,
    mask:`javascript:(async()=>{const k="__zetaMaskBookmarklet",u="${RAW.mask}",n="캡처 이름 가리기";if(location.hostname!=="zeta-ai.io"&&!location.hostname.endsWith(".zeta-ai.io"))return alert("제타 페이지에서 실행해줘");if(window[k])return alert(n+" 이미 실행 중");try{window[k]=1;const r=await fetch(u+"?bm="+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);(0,eval)(await r.text());alert(n+" 적용됨\\n새로고침하면 해제됨")}catch(e){delete window[k];alert(n+" 실행 실패: "+e.message)}})();`,
    both:`javascript:(async()=>{if(location.hostname!=="zeta-ai.io"&&!location.hostname.endsWith(".zeta-ai.io"))return alert("제타 페이지에서 실행해줘");const L=async(k,u)=>{if(window[k])return true;window[k]=1;const r=await fetch(u+"?bm="+Date.now(),{cache:"no-store"});if(!r.ok){delete window[k];throw Error("HTTP "+r.status)};(0,eval)(await r.text())};try{await L("__zetaKakaoBookmarklet","${RAW.theme}");await L("__zetaMaskBookmarklet","${RAW.mask}");alert("테마 + 이름 가리기 적용됨\\n새로고침하면 해제됨")}catch(e){alert("실행 실패: "+e.message)}})();`,
    room:"javascript:(async()=>{const k=\"__zetaRoomManagerBookmarklet\",u=\"https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts/main/zeta-room-manager.user.js\",n=\"Room Manager\";if(location.hostname!==\"zeta-ai.io\"&&!location.hostname.endsWith(\".zeta-ai.io\"))return alert(\"제타 페이지에서 실행해줘\");if(window[k])return alert(n+\" 이미 실행 중\");try{window[k]=1;const r=await fetch(u+\"?bm=\"+Date.now(),{cache:\"no-store\"});if(!r.ok)throw Error(\"HTTP \"+r.status);(0,eval)(await r.text());alert(n+\" 적용됨\")}catch(e){delete window[k];alert(n+\" 실행 실패: \"+e.message)}})();",
    roomIos:"javascript:(async()=>{const k=\"__zetaRoomManagerIosBookmarkletV3\",u=\"https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts/main/zeta-room-manager-ios.user.js\",n=\"Room Manager (iOS)\";if(location.hostname!==\"zeta-ai.io\"&&!location.hostname.endsWith(\".zeta-ai.io\"))return alert(\"제타 페이지에서 실행해줘\");try{const r=await fetch(u+\"?bm=\"+Date.now(),{cache:\"no-store\"});if(!r.ok)throw Error(\"HTTP \"+r.status);const t=await r.text(),v=(t.match(/@version\\s+([\\d.]+)/)||[])[1]||\"\";if(v&&window.__zrmRoomManagerIosVersion===v)return alert(n+\" \"+v+\" 이미 실행 중\");window[k]=1;(0,eval)(t);alert(n+\" \"+(window.__zrmRoomManagerIosVersion||v)+\" 적용됨\")}catch(e){delete window[k];alert(n+\" 실행 실패: \"+e.message)}})();",
    full:`javascript:(async()=>{const k="__zetaFullscreenBookmarklet",u="${RAW.full}",n="ZETA Fullscreen";if(location.hostname!=="zeta-ai.io"&&!location.hostname.endsWith(".zeta-ai.io"))return alert("제타 페이지에서 실행해줘");if(window[k])return alert(n+" 이미 실행 중");try{window[k]=1;const r=await fetch(u+"?bm="+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);(0,eval)(await r.text());alert(n+" 버튼 준비됨\\n화면의 ⛶ 버튼을 눌러줘")}catch(e){delete window[k];alert(n+" 실행 실패: "+e.message)}})();`,
    chatSearch:"javascript:(async()=>{const k=\"__zetaChatSearchBookmarklet\",u=\"https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts/main/zeta-chat-search.user.js\",n=\"대화 검색\";if(location.hostname!==\"zeta-ai.io\"&&!location.hostname.endsWith(\".zeta-ai.io\"))return alert(\"제타 페이지에서 실행해줘\");if(window[k])return alert(n+\" 이미 실행 중\");try{window[k]=1;const r=await fetch(u+\"?bm=\"+Date.now(),{cache:\"no-store\"});if(!r.ok)throw Error(\"HTTP \"+r.status);(0,eval)(await r.text());alert(n+\" 준비됨\\n대화창 메뉴에서 ‘대화 검색’을 눌러줘\")}catch(e){delete window[k];alert(n+\" 실행 실패: \"+e.message)}})();",
    chatExport:`javascript:(async()=>{const k="__zetaFullChatExportBookmarklet",u="${RAW.chatExport}",b="zeta-full-chat-export-button",n="대화 전체 저장";if(location.hostname!=="zeta-ai.io"&&!location.hostname.endsWith(".zeta-ai.io"))return alert("제타 채팅방에서 실행해줘");const s=()=>setTimeout(()=>{const x=document.getElementById(b);x?x.click():alert(n+" 버튼을 찾지 못했어요")},120);if(window[k])return s();try{window[k]=1;const r=await fetch(u+"?bm="+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);(0,eval)(await r.text());s()}catch(e){delete window[k];alert(n+" 실행 실패: "+e.message)}})();`
  };
}

window.ZetaSite={...ZETA,toast,copyText,bindCopies,detectPlatform,getPlatform,getPlatformMode,setPlatformMode,platformName,platformInstallMeta,renderScriptActions,showInstallGuide,getBookmarklets};
document.addEventListener('DOMContentLoaded',()=>{mountPlatformBar();applyPlatformVisibility();bindCopies();renderScriptActions()});
window.addEventListener('zeta:platformchange',()=>renderPlatformUI());
