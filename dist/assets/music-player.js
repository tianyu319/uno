(() => {
 'use strict';
 if(window.frameElement?.dataset.tianyuPage==='true')return;
 const script=document.currentScript,base=new URL('../',script.src),asset=p=>new URL(p,base).href;
 const shell=document.createElement('aside');shell.className='tianyu-music';shell.setAttribute('aria-label','音乐播放器');
 shell.innerHTML='<section class="music-panel" id="music-panel" aria-label="音乐歌单" hidden><div class="music-heading"><span>随听 · TIANYU</span><button class="music-close" aria-label="收起音乐播放器">×</button></div><div class="music-empty">歌单暂无歌曲。</div><div class="music-engine"></div><p class="music-status" role="status">正在准备音乐…</p></section><div class="music-dock"><button class="music-play" aria-label="播放音乐">▶</button><button class="music-expand" aria-controls="music-panel" aria-expanded="false">音乐 · 展开</button></div>';
 document.body.append(shell);
 const $=s=>shell.querySelector(s),panel=$('.music-panel'),play=$('.music-play'),expand=$('.music-expand'),status=$('.music-status');let ap=null,restoring=false,cancelAutoplay=()=>{};
 const key='tianyu-music-state-v1',escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const storage={get(){try{return JSON.parse(sessionStorage.getItem(key)||'null')}catch{return null}},set(v){try{sessionStorage.setItem(key,JSON.stringify(v))}catch{}}};
 const setOpen=open=>{panel.hidden=!open;expand.setAttribute('aria-expanded',String(open));};
 expand.onclick=()=>setOpen(panel.hidden);$('.music-close').onclick=()=>{setOpen(false);expand.focus()};
 shell.addEventListener('keydown',e=>{if(e.key==='Escape'){setOpen(false);expand.focus()}});
 const save=()=>{if(!ap||ap.audio.src.startsWith('blob:'))return;storage.set({id:ap.list.audios[ap.list.index]?.id,time:ap.audio.currentTime,volume:ap.audio.volume})};
 function startAutoplay(instance){
  let active=true;
  const events=['click','touchend','keydown'];
  const delegated=event=>retry(event.detail);
  const remove=()=>{events.forEach(type=>document.removeEventListener(type,retry,true));window.removeEventListener('tianyu:music-gesture',delegated)};
  const retry=event=>{if(!event.isTrusted||shell.contains(event.target)||event.type==='keydown'&&!['Enter',' '].includes(event.key))return;remove();attempt()};
  const attempt=()=>{
   if(!active||ap!==instance)return;
   const result=instance.audio.play();
   if(result&&typeof result.catch==='function')result.then(()=>{if(active)cancelAutoplay()}).catch(error=>{
    if(!active||error.name==='AbortError')return;
    if(error.name==='NotAllowedError'){
     status.textContent='浏览器需先点击页面或播放按钮，音乐才会开始。';
     events.forEach(type=>document.addEventListener(type,retry,true));
     window.addEventListener('tianyu:music-gesture',delegated);
    }else status.textContent='音乐暂时无法自动播放，可点击播放按钮重试。';
   });
  };
  cancelAutoplay=()=>{active=false;remove()};attempt();
 }
 function show(tracks){
  cancelAutoplay();
  if(ap){ap.destroy();ap=null}$('.music-engine').replaceChildren();
  if(!tracks.length){$('.music-empty').hidden=false;play.textContent='▶';play.setAttribute('aria-label','播放音乐');return}
  $('.music-empty').hidden=true;
  const restored=storage.get();
  const safe=tracks.map(t=>({...t,name:escape(t.name),artist:escape(t.artist),url:asset(t.url),cover:asset('assets/music/cover.svg')}));
  ap=new APlayer({container:$('.music-engine'),theme:'#ff7a1a',autoplay:false,preload:'none',volume:restored?.volume??.5,loop:'all',listFolded:false,listMaxHeight:180,audio:safe,storageName:'tianyu-music-volume'});
  if(restored){const i=tracks.findIndex(t=>t.id===restored.id);if(i>=0){restoring=true;ap.list.switch(i);restoring=false;ap.audio.addEventListener('loadedmetadata',()=>{if(Number.isFinite(ap.audio.duration))ap.audio.currentTime=Math.min(restored.time||0,Math.max(0,ap.audio.duration-.1))},{once:true})}}
  const update=()=>{play.textContent=ap.audio.paused?'▶':'Ⅱ';play.setAttribute('aria-label',ap.audio.paused?'播放音乐':'暂停音乐');expand.textContent=tracks[ap.list.index]?.name||'音乐 · 展开'};
  ap.on('play',()=>{cancelAutoplay();update();status.textContent='正在播放';});ap.on('pause',()=>{update();save();});ap.on('listswitch',()=>{update();if(!restoring)save()});ap.on('timeupdate',save);ap.on('error',()=>{status.textContent='这首歌曲暂时无法播放，请换一首或检查音频文件。'});update();
  status.textContent='正在尝试自动播放…';
  startAutoplay(ap);
 }
 play.onclick=()=>{cancelAutoplay();if(ap)ap.toggle();else setOpen(true)};
 shell.addEventListener('click',event=>{if(event.target.closest('.music-engine'))cancelAutoplay()},true);
 window.addEventListener('pagehide',save);
 const embedded=document.getElementById('music-library');
 const load=location.protocol==='file:'?Promise.resolve(embedded?JSON.parse(embedded.textContent):{tracks:[]}):fetch(asset('assets/music/library.json'),{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('playlist');return r.json()});
 load.then(data=>show(data.tracks||[])).catch(()=>{status.textContent='歌单暂时无法加载，请稍后刷新重试。'});
})();
