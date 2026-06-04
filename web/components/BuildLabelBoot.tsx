import Script from "next/script";

export function BuildLabelBoot() {
  return (
    <Script
      id="aeterna-build-label-boot"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
(function(){
  function ok(s){return /^[0-9a-f]{7}$/i.test((s||'').trim());}
  function set(id){
    var el=document.getElementById('aeterna-build-label');
    if(el) el.textContent=id;
  }
  function tryUrl(url,cb){
    fetch(url,{cache:'no-store'}).then(function(r){return r.ok?r.text():'';})
      .then(function(t){cb((t||'').trim());}).catch(function(){cb('');});
  }
  function fix(){
    tryUrl('/commit-hash.txt?t='+Date.now(),function(t){
      if(ok(t)){set(t.toLowerCase());return;}
      fetch('/api/build-label',{cache:'no-store'}).then(function(r){return r.json();})
        .then(function(j){if(ok(j.label)) set(j.label.toLowerCase());}).catch(function(){});
    });
  }
  fix();
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='visible') fix();
  });
})();
`,
      }}
    />
  );
}
