const BASE_THEME_VERSION = '3.49.2';
const BASE_THEME_URL = 'https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts/f0f66290ba5a6fc4f7ece330679917c1d08559c0/zeta-kakaotalk-theme.user.js';

const $ = selector => document.querySelector(selector);
const accentPicker = $('#accentPicker');
const accentHex = $('#accentHex');
const otherPicker = $('#otherPicker');
const otherHex = $('#otherHex');
const bgPicker = $('#bgPicker');
const bgHex = $('#bgHex');
const fontSize = $('#fontSize');

function clamp(v, min = 0, max = 255) { return Math.max(min, Math.min(max, v)); }
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  const n = parseInt(hex, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(v => clamp(Math.round(v)).toString(16).padStart(2, '0')).join('').toUpperCase();
}
function mix(a, b, t) {
  const x = hexToRgb(a), y = hexToRgb(b);
  return rgbToHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t });
}
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
  return .2126 * f(r) + .7152 * f(g) + .0722 * f(b);
}
function textFor(bg) { return luminance(bg) > .48 ? '#191919' : '#FFFFFF'; }
function rgbToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  let R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min;
  let h = 0, s = 0, l = (max + min) / 2;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === R) h = 60 * (((G - B) / d) % 6);
    else if (max === G) h = 60 * ((B - R) / d + 2);
    else h = 60 * ((R - G) / d + 4);
    if (h < 0) h += 360;
  }
  return { h, s, l };
}
function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return rgbToHex({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 });
}
function norm(v) { return /^#?[0-9a-f]{6}$/i.test(v || '') ? ('#' + String(v).replace('#', '')).toUpperCase() : null; }
function getFontSize() { return clamp(Number(fontSize?.value) || 15, 12, 20); }

function themeRuntime(A, O, C, F, U, notify) {
  const cl=(v,a=0,b=255)=>Math.max(a,Math.min(b,v));
  const h2r=h=>{h=h.replace('#','');const n=parseInt(h,16);return{r:n>>16&255,g:n>>8&255,b:n&255}};
  const r2h=o=>'#'+[o.r,o.g,o.b].map(v=>cl(Math.round(v)).toString(16).padStart(2,'0')).join('').toUpperCase();
  const mx=(a,b,t)=>{const x=h2r(a),y=h2r(b);return r2h({r:x.r+(y.r-x.r)*t,g:x.g+(y.g-x.g)*t,b:x.b+(y.b-x.b)*t})};
  const lum=h=>{const o=h2r(h),f=v=>(v/=255)<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);return .2126*f(o.r)+.7152*f(o.g)+.0722*f(o.b)};
  const txt=h=>lum(h)>.48?'#191919':'#FFFFFF';
  const r2s=h=>{const o=h2r(h),x=o.r/255,y=o.g/255,z=o.b/255,M=Math.max(x,y,z),m=Math.min(x,y,z),d=M-m;let H=0,S=0,L=(M+m)/2;if(d){S=d/(1-Math.abs(2*L-1));H=M===x?60*(((y-z)/d)%6):M===y?60*((z-x)/d+2):60*((x-y)/d+4);if(H<0)H+=360}return{h:H,s:S,l:L}};
  const s2h=(h,s,l)=>{h=((h%360)+360)%360;s=Math.max(0,Math.min(1,s));l=Math.max(0,Math.min(1,l));const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let r=0,g=0,b=0;if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}return r2h({r:(r+m)*255,g:(g+m)*255,b:(b+m)*255})};
  const rc=s=>{const q=s.toUpperCase();if(q==='#FEE500')return A;if(q==='#F5DC00')return lum(A)>.55?mx(A,'#000000',.08):mx(A,'#FFFFFF',.1);if(q==='#B2C7D9')return C;const s0=r2s(q),a=r2s(A),c=r2s(C),red=(s0.h>=340||s0.h<=18)&&s0.s>.28;if(red)return q;if(s0.h>=28&&s0.h<=82&&s0.s>.12)return s2h(a.h,Math.max(.1,Math.min(1,a.s*(.58+s0.s*.42))),s0.l);if(s0.s<.18||((s0.h>=165&&s0.h<=235)&&s0.s<.48)){if(s0.l>.975)return'#FFFFFF';if(s0.l<.055)return s2h(c.h,Math.min(.12,c.s*.25),s0.l);const st=s0.l>.82?.18:s0.l<.3?.34:.28;return s2h(c.h,Math.min(.34,c.s*st+s0.s*.22),s0.l)}return q};
  const custom=()=>{const hov=lum(A)>.55?mx(A,'#000000',.08):mx(A,'#FFFFFF',.1),surf=lum(C)<.28?mx(C,'#FFFFFF',.86):mx('#FFFFFF',C,.025),s2=mx(surf,C,.08),line=mx(surf,txt(surf),.1),sub=mx(txt(surf),C,.45),me=txt(A),ai=txt(O),aiAction=mx(ai,O,.34),aiSoft=mx(O,ai,.08),aiLine=mx(O,ai,.16);return '\n\n/* Zeta Theme Maker custom overrides */'
    +'\n:root{--kt-yellow:'+A+';--kt-yellow-hover:'+hov+';--kt-chat:'+C+';--kt-white:'+surf+';--kt-soft:'+s2+';--kt-soft2:'+mx(s2,C,.08)+';--kt-text:'+txt(surf)+';--kt-sub:'+sub+';--kt-muted:'+mx(txt(surf),surf,.55)+';--kt-line:'+line+';--kt-user-dialogue:'+me+';--kt-ai-dialogue:'+ai+';--kt-ai-action:'+aiAction+'}'
    +'\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-me{background:'+A+'!important;color:'+me+'!important}'
    +'\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other{background:'+O+'!important;color:'+ai+'!important}'
    +'\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other p,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat strong,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat b,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat .font-bold{color:'+ai+'!important}'
    +'\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other em,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other em [class*="text-primary-"],html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other em [data-placeholder]{color:'+aiAction+'!important}'
    +'\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat code{color:'+ai+'!important;background:'+aiSoft+'!important;border-color:'+aiLine+'!important}'
    +'\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat blockquote,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat blockquote p{color:'+ai+'!important;background:'+aiSoft+'!important}'
    +'\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat a{color:'+ai+'!important;text-decoration:underline!important}'
    +'\nhtml.kt-chat-theme-active [data-testid="chat-send-button"],html.kt-chat-theme-active .kt-profile-select-button{background:'+A+'!important;color:'+me+'!important}'
    +'\nhtml.kt-chat-theme-active main#contents,html.kt-chat-theme-active [role="log"][aria-label="Chat messages"],html.kt-chat-theme-active .kt-chat-header-layer,html.kt-chat-theme-active .kt-top-spacer{background:'+C+'!important}'
    +'\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"] .chat,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"] p,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"] em,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"] li,html.kt-chat-theme-active [data-sentry-component="NarratorBubble"] .chat,html.kt-chat-theme-active [data-sentry-component="NarratorBubble"] p,html.kt-chat-theme-active [data-sentry-component="NarratorBubble"] em,html.kt-chat-theme-active [data-sentry-component="NarratorBubble"] li{font-size:'+F+'px!important}';};
  (async()=>{try{const res=await fetch(U+'?custom='+Date.now(),{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);let s=await res.text(),t='  const CSS = `',i=s.indexOf(t);if(i<0)throw Error('CSS start');let b=i+t.length,e=s.indexOf('\n  `;',b);if(e<0)throw Error('CSS end');let css=s.slice(b,e).replace(/#[0-9a-fA-F]{6}\b/g,rc)+custom();s=s.slice(0,b)+css+s.slice(e);s=s.replace("const STYLE_ID = 'zeta-kakaotalk-theme-style';","const STYLE_ID = 'zeta-custom-theme-style';");(0,eval)(s);if(notify)alert('커스텀 테마 적용됨\n새로고침하면 해제됨')}catch(e){console.error('[Zeta Custom Theme]',e);if(notify)alert('테마 실행 실패: '+e.message)}})();
}

function buildStandaloneScript() {
  const A=accentPicker.value.toUpperCase(), O=otherPicker.value.toUpperCase(), C=bgPicker.value.toUpperCase(), F=getFontSize();
  return `// ==UserScript==
// @name         Zeta Custom Theme (${A} · ${O} · ${C} · ${F}px)
// @namespace    zeta-custom-theme-maker
// @version      1.2.4
// @description  Zeta Theme Maker 생성본 · 내 말풍선 ${A} · 캐릭터 말풍선 ${O} · 배경 ${C} · 글씨 ${F}px
// @match        https://zeta-ai.io/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(${themeRuntime.toString()})(${JSON.stringify(A)},${JSON.stringify(O)},${JSON.stringify(C)},${F},${JSON.stringify(BASE_THEME_URL)},false);
`;
}

function downloadGeneratedScript() {
  const script=buildStandaloneScript(), a=accentPicker.value.slice(1).toLowerCase(), o=otherPicker.value.slice(1).toLowerCase(), c=bgPicker.value.slice(1).toLowerCase();
  const blob=new Blob([script],{type:'text/javascript;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=`zeta-custom-theme-${a}-${o}-${c}-${getFontSize()}px.user.js`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);ZetaSite.toast('.user.js 파일을 만들었어요.');
}
function customThemeInstallURL() {
  const u=new URL('zeta-custom-theme.user.js',location.href);
  u.searchParams.set('bubble',accentPicker.value.slice(1).toUpperCase());
  u.searchParams.set('other',otherPicker.value.slice(1).toUpperCase());
  u.searchParams.set('bg',bgPicker.value.slice(1).toUpperCase());
  u.searchParams.set('fs',String(getFontSize()));
  return u.href;
}
function installGeneratedTheme(){window.location.href=customThemeInstallURL();}
function generateBookmarklet(){const A=accentPicker.value.toUpperCase(),O=otherPicker.value.toUpperCase(),C=bgPicker.value.toUpperCase(),F=getFontSize(),U=BASE_THEME_URL;return 'javascript:('+themeRuntime.toString()+')('+[A,O,C,F,U,true].map(v=>JSON.stringify(v)).join(',')+')';}

function applyFromURL(){
  const p=new URLSearchParams(location.search),a=norm(p.get('bubble')||''),o=norm(p.get('other')||''),b=norm(p.get('bg')||''),f=Number(p.get('fs'));
  if(a){accentPicker.value=a;accentHex.value=a}
  if(o){otherPicker.value=o;otherHex.value=o}
  if(b){bgPicker.value=b;bgHex.value=b}
  if(Number.isFinite(f)&&f>=12&&f<=20)fontSize.value=String(f);
}
function render(){
  const accent=accentPicker.value.toUpperCase(),other=otherPicker.value.toUpperCase(),chat=bgPicker.value.toUpperCase(),fontPx=getFontSize();
  accentHex.value=accent;otherHex.value=other;bgHex.value=chat;
  $('#accentValue').textContent=accent;$('#otherValue').textContent=other;$('#bgValue').textContent=chat;$('#fontSizeValue').textContent=fontPx;
  const root=document.documentElement.style,surface=luminance(chat)<.28?mix(chat,'#FFFFFF',.86):'#FFFFFF',surface2=mix(surface,chat,.08),line=mix(surface,textFor(surface),.10),sub=mix(textFor(surface),chat,.45),otherText=textFor(other),meText=textFor(accent),accentHover=luminance(accent)>.55?mix(accent,'#000000',.08):mix(accent,'#FFFFFF',.10);
  root.setProperty('--accent',accent);root.setProperty('--chat',chat);root.setProperty('--theme-surface',surface);root.setProperty('--theme-surface2',surface2);root.setProperty('--theme-line',line);root.setProperty('--theme-sub',sub);root.setProperty('--theme-other',other);root.setProperty('--theme-otherText',otherText);root.setProperty('--theme-meText',meText);root.setProperty('--theme-accentHover',accentHover);root.setProperty('--theme-text',textFor(surface));root.setProperty('--theme-font-size',fontPx+'px');
  document.querySelectorAll('.quick-swatches').forEach(group=>{const target=group.dataset.target,current=target==='accent'?accent:target==='other'?other:chat;group.querySelectorAll('button[data-color]').forEach(btn=>btn.classList.toggle('active',btn.dataset.color.toUpperCase()===current));});
}
function setColors(a,o,b){accentPicker.value=a;otherPicker.value=o;bgPicker.value=b;render();}
function bindHex(input,picker){input.addEventListener('change',()=>{const v=norm(input.value);if(v){picker.value=v;render()}else input.value=picker.value.toUpperCase()});input.addEventListener('keydown',e=>{if(e.key==='Enter'){input.blur()}});}

accentPicker.addEventListener('input',render);otherPicker.addEventListener('input',render);bgPicker.addEventListener('input',render);fontSize.addEventListener('input',render);
bindHex(accentHex,accentPicker);bindHex(otherHex,otherPicker);bindHex(bgHex,bgPicker);
document.querySelectorAll('.quick-swatches').forEach(group=>group.addEventListener('click',e=>{const btn=e.target.closest('button[data-color]');if(!btn)return;const picker=group.dataset.target==='accent'?accentPicker:group.dataset.target==='other'?otherPicker:bgPicker;picker.value=btn.dataset.color;render();}));
document.querySelectorAll('.preset').forEach(btn=>btn.addEventListener('click',()=>setColors(btn.dataset.a,btn.dataset.o,btn.dataset.b)));
$('#resetTheme').addEventListener('click',()=>{fontSize.value='15';setColors('#FEE500','#FFFFFF','#B2C7D9')});
$('#downloadScript').addEventListener('click',()=>{try{downloadGeneratedScript()}catch(e){console.error(e);ZetaSite.toast('스크립트 생성에 실패했어요.')}});
$('#installScript').addEventListener('click',()=>{try{installGeneratedTheme()}catch(e){console.error(e);ZetaSite.toast('설치 링크를 열지 못했어요.')}});
$('#copyBookmarklet').addEventListener('click',()=>{try{ZetaSite.copyText(generateBookmarklet(),'북마클릿 링크를 복사했어요.')}catch(e){console.error(e);ZetaSite.toast('북마클릿 생성에 실패했어요.')}});

applyFromURL();
render();
