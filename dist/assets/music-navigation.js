/* Keep the top-level audio instance alive while same-origin pages navigate. */
(() => {
 'use strict';
 if(location.protocol==='file:')return;
 const base=new URL('../',document.currentScript.src);
 const isSite=url=>url.origin===base.origin&&url.pathname.startsWith(base.pathname)&&['','index.html','works.html','works-local-preview.html','music.html'].includes(url.pathname.slice(base.pathname.length));
 const anchor=event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return null;
  const a=event.target.closest?.('a[href]');
  if(!a||a.hasAttribute('download')||a.target&&a.target!=='_self')return null;
  const url=new URL(a.href,location.href);
  if(!isSite(url)||url.pathname===location.pathname&&url.search===location.search)return null;
  return url;
 };
 if(window.frameElement?.dataset.tianyuPage==='true'){
  const parent=window.parent.tianyuMusicNavigation;
  if(!parent)return;
  document.addEventListener('click',event=>{parent.interact(event);const url=anchor(event);if(url){event.preventDefault();parent.navigate(url.href)}},true);
  for(const type of ['touchend','keydown'])document.addEventListener(type,event=>parent.interact(event),true);
  for(const name of ['pushState','replaceState']){
   const native=history[name].bind(history);
   history[name]=function(...args){const result=native(...args);parent.sync(location.href,document.title);return result};
  }
  addEventListener('hashchange',()=>parent.sync(location.href,document.title));
  return;
 }
 let frame=null;
 const sync=(url,title)=>{
  const next=new URL(url,location.href);if(!isSite(next))return;
  history.replaceState({tianyuPage:true},'',next.href);if(title)document.title=title;
 };
 const navigate=(href,push=true)=>{
  const target=new URL(href,location.href);if(!isSite(target))return;
  if(!frame){
   window.motionKit?.wheel?.stop();
   for(const node of [...document.body.children])if(!node.classList.contains('tianyu-music'))node.hidden=true;
   frame=document.createElement('iframe');frame.className='tianyu-page-frame';frame.dataset.tianyuPage='true';frame.title='网站内容';
   frame.addEventListener('load',()=>{try{sync(frame.contentWindow.location.href,frame.contentDocument.title)}catch{}});
   document.documentElement.classList.add('tianyu-page-shell');document.body.append(frame);
  }
  if(push)history.pushState({tianyuPage:true},'',target.href);
  frame.src=target.href;
 };
 window.tianyuMusicNavigation={navigate,sync,interact(event){if(event.isTrusted)window.dispatchEvent(new CustomEvent('tianyu:music-gesture',{detail:event}))}};
 document.addEventListener('click',event=>{const url=anchor(event);if(url){event.preventDefault();navigate(url.href)}},true);
 addEventListener('popstate',event=>{if(frame){event.stopImmediatePropagation();navigate(location.href,false)}},true);
 addEventListener('hashchange',event=>{if(frame)event.stopImmediatePropagation()},true);
})();
