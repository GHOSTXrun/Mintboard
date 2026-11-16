(() => {
"use strict";
const wallets = {
  backpack: {name:"Backpack", url:"https://backpack.app/"},
  phantom: {name:"Phantom", url:"https://phantom.com/download"}
};
function providerFor(id) {
  if (id === "phantom") {
    const p = window.phantom?.solana;
    return p?.isPhantom ? p : window.solana?.isPhantom ? window.solana : null;
  }
  const p = window.backpack?.solana || window.backpack;
  return typeof p?.connect === "function" ? p : window.solana?.isBackpack ? window.solana : null;
}
class WalletSession {
  constructor(change) { this.change=change; this.provider=null; this.address=""; this.id=""; this.busy=false; this.error=""; this.listeners=[]; this.generation=0; }
  notify(){ this.change(); }
  clear(){ for(const [event,handler] of this.listeners) this.provider?.removeListener?.(event,handler); this.listeners=[]; this.provider=null; this.address=""; this.id=""; }
  bind(p){
    const account=key=>{ if(this.provider!==p)return; if(key){this.address=key.toString();this.notify();}else{this.clear();this.notify();} };
    const disconnect=()=>{if(this.provider===p){this.clear();this.notify();}};
    p.on?.("accountChanged",account); p.on?.("disconnect",disconnect);
    this.listeners=[["accountChanged",account],["disconnect",disconnect]];
  }
  async connect(id){
    if(this.busy || this.address)return;
    const p=providerFor(id);
    if(!p){this.error=wallets[id].name+" was not detected. Enable the extension for this site, then try again.";this.notify();return;}
    this.busy=true;this.error="";this.notify();const generation=++this.generation;
    try {
      const response=await p.connect();
      if(generation!==this.generation)return;
      const address=(response?.publicKey || p.publicKey)?.toString();
      if(!address)throw new Error("No Solana account was returned. Unlock your wallet and select a Solana account.");
      this.clear();this.provider=p;this.address=address;this.id=id;this.bind(p);
    } catch(error) {
      if(generation!==this.generation)return;
      this.error=error?.code===4001 || /reject|cancel/i.test(error?.message||"") ? "Connection cancelled. You can try again." : error?.message || "Unable to connect. Unlock your wallet and try again.";
    } finally { if(generation===this.generation){this.busy=false;this.notify();} }
  }
  async disconnect(){
    if(this.busy)return;const p=this.provider;this.busy=true;this.error="";this.notify();
    try{await p?.disconnect?.();this.clear();}
    catch(error){this.error="Could not disconnect. Please try again.";}
    finally{this.busy=false;this.notify();}
  }
  destroy(){++this.generation;this.clear();this.busy=false;}
}
class MintboardWallet extends HTMLElement {
  static Session=WalletSession;
  constructor(){super();this.attachShadow({mode:"open"});this.session=new WalletSession(()=>this.render());}
  connectedCallback(){
    if(this.ready)return;this.ready=true;
    this.shadowRoot.innerHTML = `
<style>
:host{display:inline-flex;flex-shrink:0;font-family:ui-monospace,monospace;color:#caff81;font-size:12px}*{box-sizing:border-box}[hidden]{display:none!important}button,a{font:inherit}button{cursor:pointer;border:1px solid #a347ff;background:#29103e;color:#caff81;padding:9px 13px}button:hover{border-color:#a3ff00;background:#391956}button:focus-visible,a:focus-visible{outline:2px solid #a3ff00;outline-offset:3px}button:disabled{opacity:.55;cursor:wait}.trigger{white-space:nowrap;min-height:32px;border-color:#a3ff00;background:#a3ff00;color:#170b25;font-weight:700}.trigger:hover{background:#c3ff64}.mobile{display:none}dialog{color:#d9baff;background:#1b0b2d;border:1px solid #a347ff;border-radius:16px;padding:24px;width:min(420px,calc(100vw - 32px));margin:auto;box-shadow:0 0 80px #a347ff33;max-height:90dvh;overflow:auto}dialog::backdrop{background:#090312b8;backdrop-filter:blur(7px)}h2{color:#a3ff00;font-size:22px;margin:0 30px 8px 0}p{font-size:12px;line-height:1.6;margin:8px 0 18px}.close{position:absolute;right:14px;top:12px;border:0;background:transparent;padding:8px;font-size:20px}.choices{display:grid;gap:12px}.choice{display:flex;align-items:center;justify-content:space-between;width:100%;padding:16px;border-radius:8px;text-align:left;font-weight:700;font-size:15px}.choice small{font-size:11px;color:#d6afff}.badge{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;margin-right:10px;font-size:18px;background:#a347ff;color:white}.backpack .badge{background:#e83d4c}.message{color:#e5beff;min-height:20px;margin:14px 0 0;overflow-wrap:anywhere}.account{padding:16px;border:1px solid #a347ff66;border-radius:8px;margin-top:14px}output{display:block;overflow-wrap:anywhere;color:#a3ff00;line-height:1.6;font-size:13px;margin:10px 0 16px}.actions{display:flex;gap:8px;flex-wrap:wrap}a{color:#c08aff;text-decoration:underline}.install{display:flex;gap:16px;font-size:11px;margin-top:18px}
@media(max-width:639px){.desktop{display:none}.mobile{display:inline}.trigger{font-size:11px;padding:7px 9px}}
</style>
<button class="trigger" type="button" aria-haspopup="dialog"><span class="desktop">Connect wallet</span><span class="mobile">Wallet</span></button>
<dialog aria-labelledby="wallet-title">
<button class="close" type="button" aria-label="Close wallet dialog">×</button>
<h2 id="wallet-title">Connect wallet</h2>
<p class="intro">Choose your Solana wallet.</p>
<div class="choices">
<button class="choice backpack" data-wallet="backpack" type="button"><span><span class="badge" aria-hidden="true">B</span>Backpack</span><small></small></button>
<button class="choice phantom" data-wallet="phantom" type="button"><span><span class="badge" aria-hidden="true">P</span>Phantom</span><small></small></button>
</div>
<div class="account" hidden><strong class="wallet-name"></strong><output aria-label="Connected Solana address"></output><div class="actions"><button class="copy" type="button">Copy address</button><button class="disconnect" type="button">Disconnect</button></div></div>
<p class="message" role="status" aria-live="polite"></p>
<div class="install"><a href="https://backpack.app/" target="_blank" rel="noopener noreferrer">Get Backpack ↗</a><a href="https://phantom.com/download" target="_blank" rel="noopener noreferrer">Get Phantom ↗</a></div>
</dialog>
`;
    this.dialog=this.shadowRoot.querySelector("dialog");
    this.shadowRoot.querySelector(".trigger").onclick=()=>{this.render();this.dialog.showModal();};
    this.shadowRoot.querySelector(".close").onclick=()=>this.dialog.close();
    this.dialog.addEventListener("click",event=>{if(event.target===this.dialog){const r=this.dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)this.dialog.close();}});
    this.dialog.addEventListener("keydown",event=>event.stopPropagation());
    for(const button of this.shadowRoot.querySelectorAll("[data-wallet]"))button.onclick=()=>this.session.connect(button.dataset.wallet);
    this.shadowRoot.querySelector(".disconnect").onclick=()=>this.session.disconnect();
    this.shadowRoot.querySelector(".copy").onclick=async()=>{try{await navigator.clipboard.writeText(this.session.address);this.session.error="Address copied.";this.render();}catch{this.session.error="Unable to copy. Select the address above.";this.render();}};
    this.render();
  }
  disconnectedCallback(){this.session.destroy();this.dialog?.close();this.ready=false;}
  render(){
    if(!this.ready)return;const s=this.session,r=this.shadowRoot,connected=!!s.address;
    r.querySelector(".desktop").textContent=connected?s.address.slice(0,4)+"…"+s.address.slice(-4):"Connect wallet";
    r.querySelector(".mobile").textContent=connected?s.address.slice(0,3)+"…"+s.address.slice(-3):"Wallet";
    r.querySelector(".trigger").title=connected?wallets[s.id].name+": "+s.address:"Connect Backpack or Phantom";
    r.querySelector("h2").textContent=connected?"Wallet connected":"Connect wallet";
    r.querySelector(".intro").textContent=connected?"Solana · "+wallets[s.id].name:"Choose your Solana wallet.";
    r.querySelector(".choices").hidden=connected;r.querySelector(".account").hidden=!connected;r.querySelector(".install").hidden=connected;
    r.querySelector("output").textContent=s.address;r.querySelector(".wallet-name").textContent=connected?wallets[s.id].name:"";
    r.querySelector(".message").textContent=s.busy?"Confirm in your wallet…":s.error;
    for(const button of r.querySelectorAll("[data-wallet]")){button.disabled=s.busy;button.querySelector("small").textContent=providerFor(button.dataset.wallet)?"Detected":"Not detected";}
    r.querySelector(".disconnect").disabled=s.busy;
  }
}
if(!customElements.get("mintboard-wallet"))customElements.define("mintboard-wallet",MintboardWallet);
})();