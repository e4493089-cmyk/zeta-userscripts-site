const REPO='https://github.com/e4493089-cmyk/zeta-userscripts';
const RAW='https://raw.githubusercontent.com/e4493089-cmyk/zeta-userscripts/main/';

function toast(msg){
  const el=document.getElementById('toast'); if(!el)return;
  el.textContent=msg;el.classList.add('show');clearTimeout(window.__zt);
  window.__zt=setTimeout(()=>el.classList.remove('show'),1500);
}
async function copyText(text,msg='복사했어요.'){
  try{await navigator.clipboard.writeText(text)}catch(e){const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}
  toast(msg);
}
function bindCopies(){document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>copyText(b.dataset.copy,b.dataset.message||'주소를 복사했어요.')))}
window.ZetaSite={REPO,RAW,toast,copyText,bindCopies};
document.addEventListener('DOMContentLoaded',bindCopies);
