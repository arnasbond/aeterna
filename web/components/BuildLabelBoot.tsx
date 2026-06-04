import Script from "next/script";

/** WebView: pakeičia seną deployment ID į commit hash prieš React. */
export function BuildLabelBoot() {
  return (
    <Script
      id="aeterna-build-label-boot"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
(function(){
  function fix(){
    fetch('/api/build-label',{cache:'no-store'})
      .then(function(r){return r.json();})
      .then(function(j){
        var id=(j&&j.label)||'';
        if(!/^[0-9a-f]{7}$/i.test(id)) return;
        id=id.toLowerCase();
        var el=document.getElementById('aeterna-build-label');
        if(el) el.textContent=id;
      })
      .catch(function(){});
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
