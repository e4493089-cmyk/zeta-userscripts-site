const ZETA={
  repo:'https://github.com/e4493089-cmyk/zeta-userscripts',
  raw:'https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts/main/',
  pages:'https://e4493089-cmyk.github.io/zeta-userscripts-site/',
  staySafari:'https://apps.apple.com/app/stay-for-safari/id1591620171',
  stayEdge:'https://microsoftedge.microsoft.com/addons/detail/pibdgdkfbmlggmbmmgmjblmdigmdgbdb',
  tampermonkey:'https://www.tampermonkey.net/'
};

const PLATFORM_KEY='zeta-tools:platform-mode:v1';
const PLATFORM_OPTIONS={
  auto:{label:'자동'},
  'ios-safari':{label:'iPhone Safari'},
  'ios-edge':{label:'iPhone Edge'},
  android:{label:'Android'},
  pc:{label:'PC'}
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
  const isAndroid=/Android/i.test(ua);
  if(isIOS && /EdgiOS/i.test(ua))return 'ios-edge';
  if(isIOS)return 'ios-safari';
  if(isAndroid)return 'android';
  return 'pc';
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
  if(platform==='ios-safari')return 'iPhone · Safari';
  if(platform==='ios-edge')return 'iPhone · Edge';
  if(platform==='android')return 'Android · '+detectBrowser();
  return 'PC · '+detectBrowser();
}

function platformInstallMeta(platform=getPlatform()){
  if(platform==='ios-safari')return {
    manager:'Stay for Safari',
    managerUrl:ZETA.staySafari,
    primary:'Stay용 링크 복사',
    copyFirst:true,
    badge:'Stay for Safari 추천',
    summary:'링크를 복사해 Stay for Safari의 + → Link에 붙여넣습니다.',
    steps:['원하는 스크립트의 “Stay용 링크 복사”를 누릅니다.','Stay for Safari를 열고 + → Link를 선택합니다.','복사된 .user.js 주소를 붙여넣고 저장/활성화합니다.','Safari 확장에서 Stay를 허용한 뒤 Zeta를 새로고침합니다.']
  };
  if(platform==='ios-edge')return {
    manager:'Stay for Mobile',
    managerUrl:ZETA.stayEdge,
    primary:'Stay용 링크 복사',
    copyFirst:true,
    badge:'Stay for Mobile 추천',
    summary:'링크를 복사해 Stay for Mobile에 등록합니다.',
    steps:['원하는 스크립트의 “Stay용 링크 복사”를 누릅니다.','Edge의 Stay for Mobile을 열어 새 스크립트/Link 추가를 선택합니다.','복사된 .user.js 주소를 붙여넣고 저장/활성화합니다.','Zeta 탭을 새로고침해 적용 여부를 확인합니다.']
  };
  if(platform==='android')return {
    manager:'Tampermonkey',
    managerUrl:ZETA.tampermonkey,
    primary:'Tampermonkey로 설치',
    copyFirst:false,
    badge:'Tampermonkey 추천',
    summary:'노란 설치 버튼을 누르면 Tampermonkey 설치 화면이 열립니다.',
    steps:['Tampermonkey를 설치/활성화합니다.','원하는 스크립트의 설치 버튼을 누릅니다.','Tampermonkey 설치 화면에서 설치를 확인합니다.','Zeta를 새로고침합니다.']
  };
  return {
    manager:'Tampermonkey',
    managerUrl:ZETA.tampermonkey,
    primary:'Tampermonkey로 설치',
    copyFirst:false,
    badge:'Tampermonkey 추천',
    summary:'노란 설치 버튼을 누르면 Tampermonkey 설치 화면이 열립니다.',
    steps:['Tampermonkey를 설치/활성화합니다.','원하는 스크립트의 설치 버튼을 누릅니다.','Tampermonkey 설치 화면에서 설치를 확인합니다.','Zeta를 새로고침합니다.']
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

function installScript(url,name){
  const meta=platformInstallMeta();
  if(meta.copyFirst){
    copyText(url,`${name} 링크를 복사했어요.`).then(()=>showInstallGuide(name,url));
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
    const primary=document.createElement(meta.copyFirst?'button':'a');
    primary.className=`btn btn-primary${compact?' btn-sm':''}`;primary.textContent=meta.primary;
    if(meta.copyFirst){
      primary.type='button';
      primary.addEventListener('click',()=>installScript(url,name));
    }else{
      primary.href=url;
      primary.setAttribute('data-userscript-install','1');
    }
    box.appendChild(primary);
    const copy=document.createElement('button');
    copy.type='button';copy.className=`btn btn-light${compact?' btn-sm':''}`;copy.textContent='링크 복사';
    copy.addEventListener('click',()=>copyText(url,`${name} 링크를 복사했어요.`));
    box.appendChild(copy);
    if(!compact && box.dataset.bookmark){
      const bm=document.createElement('a');bm.className='btn btn-soft';bm.href=box.dataset.bookmark;bm.textContent='북마클릿 버전';box.appendChild(bm);
    }
    syncScriptVersion(box,url);
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
  document.querySelectorAll('[data-manager-link]').forEach(a=>{a.href=manager.managerUrl;a.textContent=`${manager.manager} 준비 ↗`});
  document.querySelectorAll('[data-platform-preview-note]').forEach(x=>{
    x.textContent=mode==='auto'?`자동 감지 중 · ${platformName(detected)}`:`수동 미리보기 · ${PLATFORM_OPTIONS[mode].label}`;
  });
  renderScriptActions();
}

function mountPlatformBar(){
  const mount=document.getElementById('platform-mount');
  if(!mount)return;
  mount.innerHTML=`<div class="platform-card"><div class="platform-top"><div><span class="platform-label">현재 설치 환경</span><div class="platform-current"><strong data-platform-name></strong><span data-platform-badge></span></div><p data-platform-summary></p></div><a class="manager-link" data-manager-link target="_blank" rel="noopener"></a></div><div class="platform-switch" aria-label="설치 환경 선택">${Object.entries(PLATFORM_OPTIONS).map(([key,v])=>`<button type="button" data-platform-option="${key}">${v.label}</button>`).join('')}</div><div class="platform-foot"><span><b>감지:</b> <span data-platform-detected></span></span><span data-platform-preview-note></span><span>다르면 직접 선택하세요.</span></div></div>`;
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
  const RAW={theme:ZETA.raw+'zeta-kakaotalk-theme.user.js',mask:ZETA.raw+'zeta-capture-user-mask.user.js',room:ZETA.raw+'zeta-room-manager.user.js',full:ZETA.raw+'zeta-fullscreen.user.js'};
  return {
    theme:`javascript:(async()=>{const k="__zetaKakaoBookmarklet",u="${RAW.theme}",n="Zeta 카톡 테마";if(location.hostname!=="zeta-ai.io"&&!location.hostname.endsWith(".zeta-ai.io"))return alert("제타 페이지에서 실행해줘");if(window[k])return alert(n+" 이미 실행 중");try{window[k]=1;const r=await fetch(u+"?bm="+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);(0,eval)(await r.text());alert(n+" 적용됨\\n새로고침하면 해제됨")}catch(e){delete window[k];alert(n+" 실행 실패: "+e.message)}})();`,
    mask:`javascript:(async()=>{const k="__zetaMaskBookmarklet",u="${RAW.mask}",n="캡처 이름 가리기";if(location.hostname!=="zeta-ai.io"&&!location.hostname.endsWith(".zeta-ai.io"))return alert("제타 페이지에서 실행해줘");if(window[k])return alert(n+" 이미 실행 중");try{window[k]=1;const r=await fetch(u+"?bm="+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);(0,eval)(await r.text());alert(n+" 적용됨\\n새로고침하면 해제됨")}catch(e){delete window[k];alert(n+" 실행 실패: "+e.message)}})();`,
    both:`javascript:(async()=>{if(location.hostname!=="zeta-ai.io"&&!location.hostname.endsWith(".zeta-ai.io"))return alert("제타 페이지에서 실행해줘");const L=async(k,u)=>{if(window[k])return true;window[k]=1;const r=await fetch(u+"?bm="+Date.now(),{cache:"no-store"});if(!r.ok){delete window[k];throw Error("HTTP "+r.status)};(0,eval)(await r.text())};try{await L("__zetaKakaoBookmarklet","${RAW.theme}");await L("__zetaMaskBookmarklet","${RAW.mask}");alert("테마 + 이름 가리기 적용됨\\n새로고침하면 해제됨")}catch(e){alert("실행 실패: "+e.message)}})();`,
    room:`javascript:(async()=>{const k="__zetaRoomManagerBookmarklet",u="${RAW.room}",n="Room Manager";if(location.hostname!=="zeta-ai.io"&&!location.hostname.endsWith(".zeta-ai.io"))return alert("제타 페이지에서 실행해줘");if(window[k])return alert(n+" 이미 실행 중");try{window[k]=1;const r=await fetch(u+"?bm="+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);(0,eval)(await r.text());alert(n+" 적용됨\\n새로고침하면 다시 실행해야 함")}catch(e){delete window[k];alert(n+" 실행 실패: "+e.message)}})();`,
    full:`javascript:(async()=>{const k="__zetaFullscreenBookmarklet",u="${RAW.full}",n="Zeta Fullscreen";if(location.hostname!=="zeta-ai.io"&&!location.hostname.endsWith(".zeta-ai.io"))return alert("제타 페이지에서 실행해줘");if(window[k])return alert(n+" 이미 실행 중");try{window[k]=1;const r=await fetch(u+"?bm="+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);(0,eval)(await r.text());alert(n+" 버튼 준비됨\\n화면의 ⛶ 버튼을 눌러줘")}catch(e){delete window[k];alert(n+" 실행 실패: "+e.message)}})();`
  };
}

window.ZetaSite={...ZETA,toast,copyText,bindCopies,detectPlatform,getPlatform,getPlatformMode,setPlatformMode,platformName,platformInstallMeta,renderScriptActions,showInstallGuide,getBookmarklets};
document.addEventListener('DOMContentLoaded',()=>{mountPlatformBar();bindCopies();renderScriptActions()});
window.addEventListener('zeta:platformchange',()=>renderPlatformUI());
