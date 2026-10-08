function runCompiledCustomTheme(fallback, query, baseVersion, compile) {
  const BASE='https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts/main/zeta-kakaotalk-theme.user.js';
  const key='zeta-custom-theme:compiled:v2:'+query;
  const AGE=86400000;
  const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch(_){return null}};
  const write=value=>{try{localStorage.setItem(key,JSON.stringify(value))}catch(_){}};
  const version=source=>source.match(/^\s*\/\/\s*@version\s+([^\s]+)\s*$/m)?.[1]||'';
  const newer=(a,b)=>{const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0))return(x[i]||0)>(y[i]||0)}return false};
  let saved=read(), current=fallback, currentVersion=baseVersion;
  if(saved&&typeof saved.source==='string'&&saved.version&& !newer(baseVersion,saved.version)) {
    try{new Function(saved.source);current=saved.source;currentVersion=saved.version}catch(_){saved=null}
  }
  try{(0,eval)(current)}catch(e){if(current===fallback)throw e;(0,eval)(fallback);currentVersion=baseVersion;saved=null}
  // Executed only after the full local theme has been applied.
  const now=Date.now();
  if(!saved||!Number.isFinite(saved.checkedAt)||newer(baseVersion,saved.version)) {
    write({source:current===fallback?fallback:current,version:currentVersion,checkedAt:now});
    return;
  }
  if(now-saved.checkedAt>=0&&now-saved.checkedAt<AGE)return;
  write({...saved,checkedAt:now});
  (async()=>{try{
    const res=await fetch(BASE,{cache:'no-cache'});if(!res.ok)throw Error('HTTP '+res.status);
    const source=await res.text(), nextVersion=version(source);
    if(!nextVersion)throw Error('Invalid theme version');
    if(newer(nextVersion,currentVersion)) {
      const compiled=compile(source,query);
      write({source:compiled,version:nextVersion,checkedAt:Date.now()});
    }
  }catch(e){console.error('[ZETA Custom Theme Update]',e)}})();
}
