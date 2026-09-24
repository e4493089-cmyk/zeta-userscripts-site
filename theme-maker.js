const BASE_THEME_URL = 'https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts/main/zeta-kakaotalk-theme.user.js';
const CUSTOM_THEME_LOADER_URL = 'https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts-site/main/zeta-custom-theme.user.js';
const CUSTOM_THEME_SETTINGS_KEY = 'zeta-custom-theme:settings:v1';
const CUSTOM_THEME_LOADER_VERSION = '1.4.1';

const $ = selector => document.querySelector(selector);
const accentPicker = $('#accentPicker');
const accentHex = $('#accentHex');
const otherPicker = $('#otherPicker');
const otherHex = $('#otherHex');
const bgPicker = $('#bgPicker');
const bgHex = $('#bgHex');
const fontSize = $('#fontSize');
const meBorder = $('#meBorder');
const meBorderControls = $('#meBorderControls');
const meBorderPicker = $('#meBorderPicker');
const meBorderHex = $('#meBorderHex');
const meBorderWidth = $('#meBorderWidth');
const otherBorder = $('#otherBorder');
const otherBorderControls = $('#otherBorderControls');
const otherBorderPicker = $('#otherBorderPicker');
const otherBorderHex = $('#otherBorderHex');
const otherBorderWidth = $('#otherBorderWidth');

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
function getBorderWidth(input) { return Math.max(.5, Math.min(5, Number(input?.value) || 1)); }
function currentSettings() {
  return {
    bubble: accentPicker.value.slice(1).toUpperCase(),
    other: otherPicker.value.slice(1).toUpperCase(),
    bg: bgPicker.value.slice(1).toUpperCase(),
    fs: String(getFontSize()),
    mb: meBorder?.checked ? '1' : '0',
    mbc: (meBorderPicker?.value || '#53636C').slice(1).toUpperCase(),
    mbw: String(getBorderWidth(meBorderWidth)),
    ob: otherBorder?.checked ? '1' : '0',
    obc: (otherBorderPicker?.value || '#53636C').slice(1).toUpperCase(),
    obw: String(getBorderWidth(otherBorderWidth))
  };
}

function currentSettingsQuery() {
  return new URLSearchParams(currentSettings()).toString();
}

function remoteLoaderBody(cacheKey) {
  const params = currentSettingsQuery();
  return `(async()=>{try{localStorage.setItem(${JSON.stringify(CUSTOM_THEME_SETTINGS_KEY)},${JSON.stringify(params)});const u=${JSON.stringify(CUSTOM_THEME_LOADER_URL)},r=await fetch(u+"?${cacheKey}="+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);(0,eval)(await r.text())}catch(e){console.error("[ZETA Custom Theme Loader]",e)}})();`;
}

function buildStandaloneScript() {
  const s=currentSettings();
  return `// ==UserScript==
// @name         ZETA Custom Theme
// @namespace    zeta-custom-theme-maker
// @version      ${CUSTOM_THEME_LOADER_VERSION}
// @description  ZETA Theme Maker 생성본 · 내 말풍선 #${s.bubble} · 캐릭터 말풍선 #${s.other} · 배경 #${s.bg} · 글씨 ${s.fs}px
// @match        https://zeta-ai.io/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

${remoteLoaderBody('stay')}
`;
}

function downloadGeneratedScript() {
  const script=buildStandaloneScript(),s=currentSettings();
  const blob=new Blob([script],{type:'text/javascript;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;
  link.download=`zeta-custom-theme-${s.bubble.toLowerCase()}-${s.other.toLowerCase()}-${s.bg.toLowerCase()}-${s.fs}px.js`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  ZetaSite.toast('Stay용 .js 파일을 만들었어요.');
}

function customThemeInstallURL() {
  const u=new URL(CUSTOM_THEME_LOADER_URL);
  Object.entries(currentSettings()).forEach(([key,value])=>u.searchParams.set(key,value));
  return u.href;
}

function installGeneratedTheme() {
  window.location.href=customThemeInstallURL();
}

function generateBookmarklet() {
  const body=remoteLoaderBody('bm');
  if(body.includes('#'))throw new Error('bookmarklet contains unsafe #');
  return 'javascript:'+body;
}

async function syncBaseThemeVersion() {
  const el=document.querySelector('#baseThemeVersion');
  if(!el)return;
  try{
    const res=await fetch(BASE_THEME_URL+'?version='+Date.now(),{cache:'no-store'});
    if(!res.ok)throw Error('HTTP '+res.status);
    const text=await res.text();
    const version=text.match(/^\s*\/\/\s*@version\s+([^\s]+)\s*$/m)?.[1];
    el.textContent=version?'base '+version:'base 최신';
  }catch(_){
    el.textContent='base 최신';
  }
}

function applyFromURL(){
  const p=new URLSearchParams(location.search),a=norm(p.get('bubble')||''),o=norm(p.get('other')||''),b=norm(p.get('bg')||''),f=Number(p.get('fs'));
  const legacy=p.get('border'),legacyColor=norm(p.get('bc')||''),legacyWidth=Number(p.get('bw'));
  const mb=p.get('mb')??legacy,mbc=norm(p.get('mbc')||'')||legacyColor,mbw=Number(p.get('mbw')??legacyWidth);
  const ob=p.get('ob')??legacy,obc=norm(p.get('obc')||'')||legacyColor,obw=Number(p.get('obw')??legacyWidth);
  if(a){accentPicker.value=a;accentHex.value=a}
  if(o){otherPicker.value=o;otherHex.value=o}
  if(b){bgPicker.value=b;bgHex.value=b}
  if(Number.isFinite(f)&&f>=12&&f<=20)fontSize.value=String(f);
  if(meBorder&&(mb==='1'||mb==='0'))meBorder.checked=mb==='1';
  if(otherBorder&&(ob==='1'||ob==='0'))otherBorder.checked=ob==='1';
  if(mbc&&meBorderPicker){meBorderPicker.value=mbc;if(meBorderHex)meBorderHex.value=mbc}
  if(obc&&otherBorderPicker){otherBorderPicker.value=obc;if(otherBorderHex)otherBorderHex.value=obc}
  if(Number.isFinite(mbw)&&mbw>=.5&&mbw<=5&&meBorderWidth)meBorderWidth.value=String(mbw);
  if(Number.isFinite(obw)&&obw>=.5&&obw<=5&&otherBorderWidth)otherBorderWidth.value=String(obw);
}
function render(){
  const accent=accentPicker.value.toUpperCase(),other=otherPicker.value.toUpperCase(),chat=bgPicker.value.toUpperCase(),fontPx=getFontSize();
  const meBorderOn=!!meBorder?.checked,meBorderColor=(meBorderPicker?.value||'#53636C').toUpperCase(),meBorderPx=getBorderWidth(meBorderWidth);
  const otherBorderOn=!!otherBorder?.checked,otherBorderColor=(otherBorderPicker?.value||'#53636C').toUpperCase(),otherBorderPx=getBorderWidth(otherBorderWidth);
  accentHex.value=accent;otherHex.value=other;bgHex.value=chat;
  $('#accentValue').textContent=accent;$('#otherValue').textContent=other;$('#bgValue').textContent=chat;$('#fontSizeValue').textContent=fontPx;
  if(meBorderHex)meBorderHex.value=meBorderColor;if($('#meBorderValue'))$('#meBorderValue').textContent=meBorderColor;if($('#meBorderWidthValue'))$('#meBorderWidthValue').textContent=String(meBorderPx);if(meBorderControls)meBorderControls.hidden=!meBorderOn;
  if(otherBorderHex)otherBorderHex.value=otherBorderColor;if($('#otherBorderValue'))$('#otherBorderValue').textContent=otherBorderColor;if($('#otherBorderWidthValue'))$('#otherBorderWidthValue').textContent=String(otherBorderPx);if(otherBorderControls)otherBorderControls.hidden=!otherBorderOn;
  const root=document.documentElement.style,surface=luminance(chat)<.28?mix(chat,'#FFFFFF',.86):'#FFFFFF',surface2=mix(surface,chat,.08),line=mix(surface,textFor(surface),.10),sub=mix(textFor(surface),chat,.45),otherText=textFor(other),meText=textFor(accent),accentHover=luminance(accent)>.55?mix(accent,'#000000',.08):mix(accent,'#FFFFFF',.10);
  root.setProperty('--accent',accent);root.setProperty('--chat',chat);root.setProperty('--theme-surface',surface);root.setProperty('--theme-surface2',surface2);root.setProperty('--theme-line',line);root.setProperty('--theme-sub',sub);root.setProperty('--theme-other',other);root.setProperty('--theme-otherText',otherText);root.setProperty('--theme-meText',meText);root.setProperty('--theme-accentHover',accentHover);root.setProperty('--theme-text',textFor(surface));root.setProperty('--theme-font-size',fontPx+'px');root.setProperty('--theme-me-border-width',meBorderOn?(meBorderPx+'px'):'0px');root.setProperty('--theme-me-border-color',meBorderColor);root.setProperty('--theme-other-border-width',otherBorderOn?(otherBorderPx+'px'):'0px');root.setProperty('--theme-other-border-color',otherBorderColor);
  document.querySelectorAll('.quick-swatches').forEach(group=>{const target=group.dataset.target,current=target==='accent'?accent:target==='other'?other:chat;group.querySelectorAll('button[data-color]').forEach(btn=>btn.classList.toggle('active',btn.dataset.color.toUpperCase()===current));});
}
function setColors(a,o,b){accentPicker.value=a;otherPicker.value=o;bgPicker.value=b;render();}
function bindHex(input,picker){input.addEventListener('change',()=>{const v=norm(input.value);if(v){picker.value=v;render()}else input.value=picker.value.toUpperCase()});input.addEventListener('keydown',e=>{if(e.key==='Enter'){input.blur()}});}

accentPicker.addEventListener('input',render);otherPicker.addEventListener('input',render);bgPicker.addEventListener('input',render);fontSize.addEventListener('input',render);
[meBorder,meBorderPicker,meBorderWidth,otherBorder,otherBorderPicker,otherBorderWidth].filter(Boolean).forEach(x=>x.addEventListener('input',render));
bindHex(accentHex,accentPicker);bindHex(otherHex,otherPicker);bindHex(bgHex,bgPicker);if(meBorderHex&&meBorderPicker)bindHex(meBorderHex,meBorderPicker);if(otherBorderHex&&otherBorderPicker)bindHex(otherBorderHex,otherBorderPicker);
document.querySelectorAll('.quick-swatches').forEach(group=>group.addEventListener('click',e=>{const btn=e.target.closest('button[data-color]');if(!btn)return;const picker=group.dataset.target==='accent'?accentPicker:group.dataset.target==='other'?otherPicker:bgPicker;picker.value=btn.dataset.color;render();}));
document.querySelectorAll('.preset').forEach(btn=>btn.addEventListener('click',()=>setColors(btn.dataset.a,btn.dataset.o,btn.dataset.b)));
$('#resetTheme').addEventListener('click',()=>{fontSize.value='15';if(meBorder)meBorder.checked=false;if(otherBorder)otherBorder.checked=false;if(meBorderPicker)meBorderPicker.value='#53636C';if(otherBorderPicker)otherBorderPicker.value='#53636C';if(meBorderWidth)meBorderWidth.value='1';if(otherBorderWidth)otherBorderWidth.value='1';setColors('#FEE500','#FFFFFF','#B2C7D9')});
$('#downloadScript').addEventListener('click',()=>{try{downloadGeneratedScript()}catch(e){console.error(e);ZetaSite.toast('커스텀 테마 파일을 만들지 못했어요.')}});
$('#installScript').addEventListener('click',()=>{try{installGeneratedTheme()}catch(e){console.error(e);ZetaSite.toast('커스텀 테마 설치 링크를 열지 못했어요.')}});
$('#copyBookmarklet').addEventListener('click',()=>{try{ZetaSite.copyText(generateBookmarklet(),'북마클릿 링크를 복사했어요.')}catch(e){console.error(e);ZetaSite.toast('북마클릿 링크를 만들지 못했어요.')}});

applyFromURL();
render();
syncBaseThemeVersion();
