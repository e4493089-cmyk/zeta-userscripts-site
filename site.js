const ZETA={
  repo:'https://github.com/e4493089-cmyk/zeta-userscripts',
  raw:'https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts/main/',
  pages:'https://e4493089-cmyk.github.io/zeta-userscripts-site/'
};

let toastTimer;
function toast(message){
  const el=document.getElementById('toast');
  if(!el)return;
  el.textContent=message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),1700);
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
window.ZetaSite={...ZETA,toast,copyText,bindCopies};
document.addEventListener('DOMContentLoaded',bindCopies);
