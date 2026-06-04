import Script from "next/script";
import { getEmbeddedCommit } from "@/lib/embedded-commit";

export function BuildLabelBoot() {
  const embedded = getEmbeddedCommit() ?? "";

  return (
    <Script
      id="aeterna-build-label-boot"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
window.__AETERNA_COMMIT__=${JSON.stringify(embedded)};
(function(){
  function ok(s){return /^[0-9a-f]{7}$/i.test((s||'').trim());}
  function set(id){
    var el=document.getElementById('aeterna-build-label');
    if(el) el.textContent=id;
  }
  function apply(){
    if(ok(window.__AETERNA_COMMIT__)) { set(window.__AETERNA_COMMIT__.toLowerCase()); return true; }
    return false;
  }
  function fetchTxt(){
    fetch('/commit-hash.txt?'+Date.now(),{cache:'no-store'})
      .then(function(r){return r.text();})
      .then(function(t){ if(ok(t)) set(t.trim().toLowerCase()); })
      .catch(function(){});
  }
  if(!apply()) fetchTxt();
  document.addEventListener('DOMContentLoaded',function(){ apply()||fetchTxt(); });
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='visible') apply()||fetchTxt();
  });
})();
`,
      }}
    />
  );
}
