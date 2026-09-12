// ==UserScript==
// @name         Zeta Custom Theme
// @namespace    zeta-custom-theme-maker
// @version      1.2.8
// @description  Zeta Theme Maker에서 만든 커스텀 테마
// @match        https://zeta-ai.io/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  'use strict';
  const BASE='https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts/3ab89847565202bf241b8ba49adb3c4d8c662334/zeta-kakaotalk-theme.user.js';
  const clamp=(v,min=0,max=255)=>Math.max(min,Math.min(max,v));
  const hexToRgb=hex=>{hex=hex.replace('#','');const n=parseInt(hex,16);return{r:n>>16&255,g:n>>8&255,b:n&255}};
  const rgbToHex=({r,g,b})=>'#'+[r,g,b].map(v=>clamp(Math.round(v)).toString(16).padStart(2,'0')).join('').toUpperCase();
  const mix=(a,b,t)=>{const x=hexToRgb(a),y=hexToRgb(b);return rgbToHex({r:x.r+(y.r-x.r)*t,g:x.g+(y.g-x.g)*t,b:x.b+(y.b-x.b)*t})};
  const luminance=hex=>{const{r,g,b}=hexToRgb(hex),f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
  const textFor=bg=>luminance(bg)>.48?'#191919':'#FFFFFF';
  const rgbToHsl=hex=>{const{r,g,b}=hexToRgb(hex);let R=r/255,G=g/255,B=b/255;const max=Math.max(R,G,B),min=Math.min(R,G,B);let h=0,s=0,l=(max+min)/2,d=max-min;if(d){s=d/(1-Math.abs(2*l-1));if(max===R)h=60*(((G-B)/d)%6);else if(max===G)h=60*((B-R)/d+2);else h=60*((R-G)/d+4);if(h<0)h+=360}return{h,s,l}};
  const hslToHex=(h,s,l)=>{h=((h%360)+360)%360;s=Math.max(0,Math.min(1,s));l=Math.max(0,Math.min(1,l));const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let r=0,g=0,b=0;if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}return rgbToHex({r:(r+m)*255,g:(g+m)*255,b:(b+m)*255})};
  const norm=v=>/^#?[0-9a-f]{6}$/i.test(v||'')?('#'+String(v).replace('#','')).toUpperCase():null;
  function sourceParams(){
    try{
      const info=typeof GM_info!=='undefined'?GM_info:null;
      const urls=[info?.script?.downloadURL,info?.scriptUpdateURL,info?.script?.updateURL,info?.script?.fileURL];
      for(const u of urls){if(u&&/^https?:/i.test(u)){const p=new URL(u).searchParams;if(p.has('bubble')||p.has('other')||p.has('bg')||p.has('fs')||p.has('border')||p.has('bc')||p.has('bw'))return p}}
    }catch(_){}
    return new URLSearchParams(location.search);
  }
  const p=sourceParams(),ACCENT=norm(p.get('bubble'))||'#FEE500',OTHER=norm(p.get('other'))||'#FFFFFF',CHAT=norm(p.get('bg'))||'#B2C7D9',FONT_SIZE=clamp(Number(p.get('fs'))||15,12,20),BORDER=p.get('border')==='1',BORDER_COLOR=norm(p.get('bc'))||'#53636C',BORDER_WIDTH=Math.max(.5,Math.min(5,Number(p.get('bw'))||1));
  function recolorHex(source){const src=source.toUpperCase();if(src==='#FEE500')return ACCENT;if(src==='#F5DC00')return luminance(ACCENT)>.55?mix(ACCENT,'#000000',.08):mix(ACCENT,'#FFFFFF',.10);if(src==='#B2C7D9')return CHAT;const s=rgbToHsl(src),a=rgbToHsl(ACCENT),c=rgbToHsl(CHAT),redish=(s.h>=340||s.h<=18)&&s.s>.28;if(redish)return src;if(s.h>=28&&s.h<=82&&s.s>.12){let sat=Math.max(.10,Math.min(1,a.s*(.58+s.s*.42)));return hslToHex(a.h,sat,s.l)}const coolGray=s.s<.18||((s.h>=165&&s.h<=235)&&s.s<.48);if(coolGray){if(s.l>.975)return'#FFFFFF';if(s.l<.055)return hslToHex(c.h,Math.min(.12,c.s*.25),s.l);let strength=s.l>.82?.18:s.l<.30?.34:.28,sat=Math.min(.34,c.s*strength+s.s*.22);return hslToHex(c.h,sat,s.l)}return src}
  function transformCss(css){
    let out=css.replace(/#[0-9a-fA-F]{6}\b/g,recolorHex);
    const hover=luminance(ACCENT)>.55?mix(ACCENT,'#000000',.08):mix(ACCENT,'#FFFFFF',.10),meText=textFor(ACCENT),aiText=textFor(OTHER),aiAction=mix(aiText,OTHER,.34),aiSoft=mix(OTHER,aiText,.08),aiLine=mix(OTHER,aiText,.16),surface=luminance(CHAT)<.28?mix(CHAT,'#FFFFFF',.86):mix('#FFFFFF',CHAT,.025),surface2=mix(surface,CHAT,.08),line=mix(surface,textFor(surface),.10),sub=mix(textFor(surface),CHAT,.45);
    out+=`\n\n:root{--kt-yellow:${ACCENT};--kt-yellow-hover:${hover};--kt-chat:${CHAT};--kt-white:${surface};--kt-soft:${surface2};--kt-soft2:${mix(surface2,CHAT,.08)};--kt-text:${textFor(surface)};--kt-sub:${sub};--kt-muted:${mix(textFor(surface),surface,.55)};--kt-line:${line};--kt-user-dialogue:${meText};--kt-ai-dialogue:${aiText};--kt-ai-action:${aiAction};}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-me{background:${ACCENT}!important;color:${meText}!important}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other{background:${OTHER}!important;color:${aiText}!important}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other p,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat strong,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat b,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat .font-bold{color:${aiText}!important}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other em,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other em [class*="text-primary-"],html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other em [data-placeholder]{color:${aiAction}!important}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat code{color:${aiText}!important;background:${aiSoft}!important;border-color:${aiLine}!important}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat blockquote,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat blockquote p{color:${aiText}!important;background:${aiSoft}!important}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other .chat a{color:${aiText}!important;text-decoration:underline!important}\nhtml.kt-chat-theme-active [data-testid="chat-send-button"],html.kt-chat-theme-active .kt-profile-select-button{background:${ACCENT}!important;color:${meText}!important}\nhtml.kt-chat-theme-active main#contents,html.kt-chat-theme-active [role="log"][aria-label="Chat messages"],html.kt-chat-theme-active .kt-chat-header-layer,html.kt-chat-theme-active .kt-top-spacer{background:${CHAT}!important}\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"] .chat,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"] p,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"] em,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"] li,html.kt-chat-theme-active [data-sentry-component="NarratorBubble"] .chat,html.kt-chat-theme-active [data-sentry-component="NarratorBubble"] p,html.kt-chat-theme-active [data-sentry-component="NarratorBubble"] em,html.kt-chat-theme-active [data-sentry-component="NarratorBubble"] li{font-size:${FONT_SIZE}px!important}\n`;
    if(BORDER)out+=`\nhtml.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-me,html.kt-chat-theme-active [data-sentry-component="ChatBubbleContainer"].kt-other{border:${BORDER_WIDTH}px solid ${BORDER_COLOR}!important}\n`;
    return out;
  }
  (async()=>{try{const res=await fetch(BASE+'?custom='+Date.now(),{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);let script=await res.text();const token='  const CSS = `',start=script.indexOf(token);if(start<0)throw Error('CSS start');const cssStart=start+token.length,end=script.indexOf('\n  `;',cssStart);if(end<0)throw Error('CSS end');script=script.slice(0,cssStart)+transformCss(script.slice(cssStart,end))+script.slice(end);script=script.replace("const STYLE_ID = 'zeta-kakaotalk-theme-style';","const STYLE_ID = 'zeta-custom-theme-style';");(0,eval)(script)}catch(e){console.error('[Zeta Custom Theme]',e)}})();
})();
