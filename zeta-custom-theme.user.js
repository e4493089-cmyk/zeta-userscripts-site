// ==UserScript==
// @name         ZETA Custom Theme
// @namespace    zeta-custom-theme-maker
// @version      1.4.6
// @description  ZETA Theme Maker에서 만든 커스텀 테마
// @match        https://zeta-ai.io/*
// @updateURL    https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts-site/main/zeta-custom-theme.user.js
// @run-at       document-start
// @grant        GM_info
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(() => {
  'use strict';
  const BASE='https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts/main/zeta-kakaotalk-theme.user.js';
  const clamp=(v,min=0,max=255)=>Math.max(min,Math.min(max,v));
  const hexToRgb=hex=>{hex=hex.replace('#','');const n=parseInt(hex,16);return{r:n>>16&255,g:n>>8&255,b:n&255}};
  const rgbToHex=({r,g,b})=>'#'+[r,g,b].map(v=>clamp(Math.round(v)).toString(16).padStart(2,'0')).join('').toUpperCase();
  const mix=(a,b,t)=>{const x=hexToRgb(a),y=hexToRgb(b);return rgbToHex({r:x.r+(y.r-x.r)*t,g:x.g+(y.g-x.g)*t,b:x.b+(y.b-x.b)*t})};
  const luminance=hex=>{const{r,g,b}=hexToRgb(hex),f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
  const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  const textFor=bg=>{const dark='#191919',light='#FFFFFF',darkRatio=contrast(bg,dark),lightRatio=contrast(bg,light);if(Math.max(darkRatio,lightRatio)>=4.5)return darkRatio>=lightRatio?dark:light;return'#000000'};
  const rgbToHsl=hex=>{const{r,g,b}=hexToRgb(hex);let R=r/255,G=g/255,B=b/255;const max=Math.max(R,G,B),min=Math.min(R,G,B);let h=0,s=0,l=(max+min)/2,d=max-min;if(d){s=d/(1-Math.abs(2*l-1));if(max===R)h=60*(((G-B)/d)%6);else if(max===G)h=60*((B-R)/d+2);else h=60*((R-G)/d+4);if(h<0)h+=360}return{h,s,l}};
  const hslToHex=(h,s,l)=>{h=((h%360)+360)%360;s=Math.max(0,Math.min(1,s));l=Math.max(0,Math.min(1,l));const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let r=0,g=0,b=0;if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}return rgbToHex({r:(r+m)*255,g:(g+m)*255,b:(b+m)*255})};
  const norm=v=>/^#?[0-9a-f]{6}$/i.test(v||'')?('#'+String(v).replace('#','')).toUpperCase():null;
  function sourceParams(){
    try{
      const info=typeof GM_info!=='undefined'?GM_info:null;
      const urls=[info?.script?.downloadURL,info?.scriptUpdateURL,info?.script?.updateURL,info?.script?.fileURL];
      for(const u of urls){if(u&&/^https?:/i.test(u)){const p=new URL(u).searchParams;if(p.has('bubble')||p.has('other')||p.has('bg')||p.has('fs')||p.has('border')||p.has('bc')||p.has('bw')||p.has('mb')||p.has('mbc')||p.has('mbw')||p.has('ob')||p.has('obc')||p.has('obw'))return p}}
    }catch(_){}
    return new URLSearchParams(location.search);
  }
  const SETTINGS_KEY='zeta-custom-theme:settings:v1';
  let p=sourceParams();
  const settingNames=['bubble','other','bg','fs','border','bc','bw','mb','mbc','mbw','ob','obc','obw'];
  const hasInstallSettings=settingNames.some(key=>p.has(key));
  try{
    if(hasInstallSettings){
      const saved=new URLSearchParams();
      settingNames.forEach(key=>{if(p.has(key))saved.set(key,p.get(key))});
      const value=saved.toString();
      if(typeof GM_setValue==='function')GM_setValue(SETTINGS_KEY,value);
      localStorage.setItem(SETTINGS_KEY,value);
    }else{
      let saved='';
      if(typeof GM_getValue==='function')saved=GM_getValue(SETTINGS_KEY,'')||'';
      if(!saved)saved=localStorage.getItem(SETTINGS_KEY)||'';
      if(saved)p=new URLSearchParams(saved);
    }
  }catch(_){}
  const ACCENT=norm(p.get('bubble'))||'#FEE500',OTHER=norm(p.get('other'))||'#FFFFFF',CHAT=norm(p.get('bg'))||'#B2C7D9',FONT_SIZE=clamp(Number(p.get('fs'))||15,12,20);
  const LEGACY_BORDER=p.get('border')==='1',LEGACY_COLOR=norm(p.get('bc'))||'#53636C',LEGACY_WIDTH=Math.max(.5,Math.min(5,Number(p.get('bw'))||1));
  const ME_BORDER=p.has('mb')?p.get('mb')==='1':LEGACY_BORDER,ME_BORDER_COLOR=norm(p.get('mbc'))||LEGACY_COLOR,ME_BORDER_WIDTH=Math.max(.5,Math.min(5,Number(p.get('mbw'))||LEGACY_WIDTH));
  const OTHER_BORDER=p.has('ob')?p.get('ob')==='1':LEGACY_BORDER,OTHER_BORDER_COLOR=norm(p.get('obc'))||LEGACY_COLOR,OTHER_BORDER_WIDTH=Math.max(.5,Math.min(5,Number(p.get('obw'))||LEGACY_WIDTH));
  function recolorHex(source){const src=source.toUpperCase();if(src==='#FEE500')return ACCENT;if(src==='#F5DC00')return luminance(ACCENT)>.55?mix(ACCENT,'#000000',.08):mix(ACCENT,'#FFFFFF',.10);if(src==='#B2C7D9')return CHAT;const s=rgbToHsl(src),a=rgbToHsl(ACCENT),c=rgbToHsl(CHAT),redish=(s.h>=340||s.h<=18)&&s.s>.28;if(redish)return src;if(s.h>=28&&s.h<=82&&s.s>.12){let sat=Math.max(.10,Math.min(1,a.s*(.58+s.s*.42)));return hslToHex(a.h,sat,s.l)}const coolGray=s.s<.18||((s.h>=165&&s.h<=235)&&s.s<.48);if(coolGray){if(s.l>.975)return'#FFFFFF';if(s.l<.055)return hslToHex(c.h,Math.min(.12,c.s*.25),s.l);let strength=s.l>.82?.18:s.l<.30?.34:.28,sat=Math.min(.34,c.s*strength+s.s*.22);return hslToHex(c.h,sat,s.l)}return src}
  function transformCss(css){
    const fixedStart=css.indexOf('    html.${ROOM_LIST_ACTIVE},');
    const fixed=fixedStart>=0?css.slice(fixedStart):'';
    if(fixedStart>=0)css=css.slice(0,fixedStart);
    let out=css.replace(/#[0-9a-fA-F]{6}\b/g,recolorHex);
    const accentRgb=hexToRgb(ACCENT);
    out=out.replace(/rgba\(\s*254\s*,\s*229\s*,\s*0\s*,\s*([0-9.]+)\s*\)/gi,(_,a)=>`rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},${a})`);
    out=out.replace(/rgb\(\s*254\s*,\s*229\s*,\s*0\s*\)/gi,`rgb(${accentRgb.r},${accentRgb.g},${accentRgb.b})`);
    const hover=luminance(ACCENT)>.55?mix(ACCENT,'#000000',.08):mix(ACCENT,'#FFFFFF',.10),meText=textFor(ACCENT),aiText=textFor(OTHER),aiAction=mix(aiText,OTHER,.34),aiSoft=mix(OTHER,aiText,.08),aiLine=mix(OTHER,aiText,.16),surface=luminance(CHAT)<.28?mix(CHAT,'#FFFFFF',.86):mix('#FFFFFF',CHAT,.025),surface2=mix(surface,CHAT,.08),line=mix(surface,textFor(surface),.10),sub=mix(textFor(surface),CHAT,.45),chatText=textFor(CHAT),chatSub=mix(chatText,CHAT,.28),chatMuted=mix(chatText,CHAT,.48),chatGlass=mix(CHAT,chatText,.12),chatLine=mix(CHAT,chatText,.20),userAction=mix(meText,ACCENT,.28),userSoft=mix(ACCENT,meText,.10),userLine=mix(ACCENT,meText,.20);
    out+=`\n\n:root{--kt-yellow:${ACCENT};--kt-yellow-hover:${hover};--kt-chat:${CHAT};--kt-chat-text:${chatText};--kt-chat-sub:${chatSub};--kt-chat-muted:${chatMuted};--kt-chat-glass:${chatGlass};--kt-chat-line:${chatLine};--kt-white:${surface};--kt-soft:${surface2};--kt-soft2:${mix(surface2,CHAT,.08)};--kt-text:${textFor(surface)};--kt-sub:${sub};--kt-muted:${mix(textFor(surface),surface,.55)};--kt-line:${line};--kt-user-dialogue:${meText};--kt-user-action:${userAction};--kt-user-soft:${userSoft};--kt-user-line:${userLine};--kt-ai-dialogue:${aiText};--kt-ai-action:${aiAction};--kt-ai-soft:${aiSoft};--kt-ai-line:${aiLine};}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-me{background:${ACCENT}!important;color:${meText}!important}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other{background:${OTHER}!important;color:${aiText}!important}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other p,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat strong,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat b,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat .font-bold{color:${aiText}!important}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other em,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other em [class*="text-primary-"],html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other em [data-placeholder]{color:${aiAction}!important}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat code{color:${aiText}!important;background:${aiSoft}!important;border-color:${aiLine}!important}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat blockquote,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat blockquote p{color:${aiText}!important;background:${aiSoft}!important}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat a{color:${aiText}!important;text-decoration:underline!important}\nhtml.kt-chat-theme-active [data-testid="chat-send-button"],html.kt-chat-theme-active .kt-profile-select-button{background:${ACCENT}!important;color:${meText}!important}\nhtml.kt-chat-theme-active main#contents,html.kt-chat-theme-active [role="log"][aria-label="Chat messages"],html.kt-chat-theme-active .kt-chat-header-layer,html.kt-chat-theme-active .kt-top-spacer{background:${CHAT}!important}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"] .chat,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"] p,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"] em,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"] li,html.kt-chat-theme-active [data-sentry-component="NarratorBubble"] .chat,html.kt-chat-theme-active [data-sentry-component="NarratorBubble"] p,html.kt-chat-theme-active [data-sentry-component="NarratorBubble"] em,html.kt-chat-theme-active [data-sentry-component="NarratorBubble"] li{font-size:${FONT_SIZE}px!important}\n`;
    if(ME_BORDER)out+=`\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-me{border:${ME_BORDER_WIDTH}px solid ${ME_BORDER_COLOR}!important}\n`;
    if(OTHER_BORDER)out+=`\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other{border:${OTHER_BORDER_WIDTH}px solid ${OTHER_BORDER_COLOR}!important}\n`;
    out+=fixed;
    out+=firstPaintCss(ACCENT,OTHER,CHAT,FONT_SIZE,ME_BORDER,ME_BORDER_COLOR,ME_BORDER_WIDTH,OTHER_BORDER,OTHER_BORDER_COLOR,OTHER_BORDER_WIDTH);
    return out;
  }
function firstPaintCss(accent, other, chat, fs, mb, mbc, mbw, ob, obc, obw) {
  const me=textFor(accent), ai=textFor(other), ct=textFor(chat);
  const scope='html.kt-chat-theme-active';
  let css=`${scope},${scope} body,${scope} main#contents,${scope} [role="log"][aria-label="Chat messages"]{background:${chat}!important;color:${ct}!important;color-scheme:light!important}`;
  for(const [side,bg,fg,border,bc,bw] of [['RightTextContent',accent,me,mb,mbc,mbw],['LeftTextContent',other,ai,ob,obc,obw]]) {
    const bubble=`${scope} [data-sentry-component="${side}"] [data-sentry-component="ChatBubbleContainer"]`;
    css+=`${bubble}{background:${bg}!important;color:${fg}!important;border:${border?bw+'px solid '+bc:'0'}!important}`;
    css+=`${bubble} .chat,${bubble} p,${bubble} strong,${bubble} b,${bubble} a{color:${fg}!important}`;
    css+=`${bubble} em,${bubble} em [class*="text-primary-"],${bubble} em [data-placeholder]{color:${mix(fg,bg,side==='RightTextContent'?.28:.34)}!important}`;
  }
  css+=`${scope} [data-sentry-component="NarratorBubble"] .chat,${scope} [data-sentry-component="NarratorBubble"] p{color:${mix(ct,chat,.28)}!important}`;
  css+=`${scope} [data-sentry-component="ChatBubbleContainer"] .chat,${scope} [data-sentry-component="ChatBubbleContainer"] p,${scope} [data-sentry-component="ChatBubbleContainer"] em,${scope} [data-sentry-component="ChatBubbleContainer"] li,${scope} [data-sentry-component="NarratorBubble"] .chat,${scope} [data-sentry-component="NarratorBubble"] p{font-size:${fs}px!important}`;
  const surface=luminance(chat)<.28?mix(chat,'#FFFFFF',.86):mix('#FFFFFF',chat,.025), soft=mix(surface,chat,.08), ink=textFor(surface), line=mix(surface,ink,.10), muted=mix(ink,surface,.55);
  const composer=`${scope} [data-sentry-component="ChatComposer"]`, box=`${composer} div:has(> textarea[aria-label="내용 입력하기"])`, input=`${composer} textarea[aria-label="내용 입력하기"]`;
  css+=`${composer},${composer}>div:last-child{background:${surface}!important;color:${ink}!important;border-top-color:${line}!important}`;
  css+=`${box}{background:${soft}!important;border:1px solid ${line}!important}`;
  css+=`${input}{background:transparent!important;color:${ink}!important;caret-color:${ink}!important;border:0!important}${input}::placeholder{color:${muted}!important;opacity:1!important}`;
  const rooms='html.kt-room-list-active';
  css+=`${rooms},${rooms} body,${rooms} main#contents,${rooms} [data-sentry-component="RoomList"],${rooms} [data-sentry-component="RoomList"]>[data-sentry-component="WrappedDiv"]{background:#F4F5F6!important;color:#191919!important;color-scheme:light!important}`;
  css+=`${rooms} header[data-sentry-component="Header"],${rooms} [data-sentry-component="ScrappedPlotsPreview"],${rooms} :is([testid^="room-list-item-"],[data-testid^="room-list-item-"]){background:#FFFFFF!important;color:#191919!important;border-color:#E7E9EB!important}`;
  css+=`${rooms} header[data-sentry-component="Header"] :is(nav,span,button,a,svg){color:#2B3136!important}${rooms} :is([testid^="room-list-item-"],[data-testid^="room-list-item-"]) :is(.body1,.font-medium){color:#252A2E!important}${rooms} :is([testid^="room-list-item-"],[data-testid^="room-list-item-"]) [class*="text-white/"]{color:#7D878E!important;opacity:1!important}${rooms} [testid="room-highlight-card"]{display:none!important}`;
  return css;
}
  // Apply chosen colors synchronously, before any network request or marker pass.
  let boot=document.getElementById('zeta-custom-theme-bootstrap');
  if(!boot){boot=document.createElement('style');boot.id='zeta-custom-theme-bootstrap';(document.head||document.documentElement).appendChild(boot)}
  boot.textContent=firstPaintCss(ACCENT,OTHER,CHAT,FONT_SIZE,ME_BORDER,ME_BORDER_COLOR,ME_BORDER_WIDTH,OTHER_BORDER,OTHER_BORDER_COLOR,OTHER_BORDER_WIDTH);
  document.documentElement.classList.toggle('kt-chat-theme-active',/^\/[^/]+\/rooms\/[^/]+\/?$/.test(location.pathname));
  document.documentElement.classList.toggle('kt-room-list-active',/^\/[^/]+\/rooms\/?$/.test(location.pathname));
  const CACHE_KEY='zeta-custom-theme:base-source:v1';
  const CACHE_AGE=24*60*60*1000;
  function activate(source){
    const token='  const CSS = `',start=source.indexOf(token);
    if(start<0)throw Error('CSS start');
    const cssStart=start+token.length,end=source.indexOf('\n  `;',cssStart);
    if(end<0)throw Error('CSS end');
    let css=transformCss(source.slice(cssStart,end));
    // Custom bubble colors also apply before the deferred marker pass.
    for(const [marker,side] of [['kt-other','LeftTextContent'],['kt-me','RightTextContent']]){
      const old=`[data-sentry-component="ChatBubbleContainer"].${marker}`;
      css=css.split(old).join(`:is(${old}, [data-sentry-component="${side}"] [data-sentry-component="ChatBubbleContainer"])`);
    }
    let script=source.slice(0,cssStart)+css+source.slice(end);
    script=script.replace("const STYLE_ID = 'zeta-kakaotalk-theme-style';","const STYLE_ID = 'zeta-custom-theme-style';");
    (0,eval)(script);
    boot.remove();
  }
  (async()=>{
    let cached=null,activated=false;
    try{cached=JSON.parse(localStorage.getItem(CACHE_KEY)||'null')}catch(_){}
    if(cached&&typeof cached.source==='string'){
      try{activate(cached.source);activated=true}catch(_){}
      if(activated&&Date.now()-cached.savedAt>=0&&Date.now()-cached.savedAt<CACHE_AGE)return;
    }
    try{
      const res=await fetch(BASE,{cache:'no-cache'});
      if(!res.ok)throw Error('HTTP '+res.status);
      const source=await res.text();
      if(!source.includes("const STYLE_ID = 'zeta-kakaotalk-theme-style';")||!source.includes('  const CSS = `'))throw Error('Invalid theme source');
      if(!activated)activate(source);
      // An already-running runtime keeps its matching CSS; refreshed source is used next visit.
      try{localStorage.setItem(CACHE_KEY,JSON.stringify({source,savedAt:Date.now()}))}catch(_){}
    }catch(e){console.error('[ZETA Custom Theme]',e)}
  })();
})();
