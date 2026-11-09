(() => {
  const categories = {poster:'商业海报',commerce:'电商视觉',brand:'品牌视觉',local:'本地生活',packaging:'包装设计',illustration:'文创/插画',social:'效果图'};
  const grid = document.getElementById('project-grid');
  const count = document.getElementById('result-count');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const detail = document.getElementById('project-detail');
  const viewer = document.getElementById('image-viewer');
  const zoomButton = document.getElementById('toggle-zoom');
  const canvas = document.querySelector('.image-canvas');
  let projects = [], activeFilter = 'all', currentId = null, trigger = null;
  const visibleProjects = () => {
    if (activeFilter !== 'all') return projects.filter(p => p.category === activeFilter);
    // Interleave the categories deterministically, keeping detail navigation in the same order.
    const recent = projects.filter(p => p.addedAt);
    const groups = Object.keys(categories).map(category => projects.filter(p => p.category === category && !p.addedAt));
    const mixed = [...recent];
    for (let i = 0; i < Math.max(0, ...groups.map(group => group.length)); i++) {
      groups.forEach(group => { if (group[i]) mixed.push(group[i]); });
    }
    return mixed;
  };
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let observer = null;
  if ('IntersectionObserver' in window && !motion.matches) {
    document.documentElement.classList.add('reveal-ready');
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
    }), {threshold:0.08});
    document.querySelectorAll('.reveal').forEach(n => observer.observe(n));
  }
  const updateURL = () => {
    const url = new URL(location.href);
    if (activeFilter === 'all') url.searchParams.delete('category'); else url.searchParams.set('category',activeFilter);
    url.hash = currentId ? 'case=' + currentId : '';
    history.replaceState(null,'',url);
  };
  const syncScrollLock = () => {
    const locked = detail.open || viewer.open;
    document.body.style.overflow = locked ? 'hidden' : '';
    if (locked) window.motionKit?.wheel?.stop();else window.motionKit?.wheel?.start();
  };
  let masonryObserver = null;
  let masonryFrame = null;
  const layoutMasonry = () => {
    masonryFrame = null;
    const measurements = [...grid.querySelectorAll('.project-card')].map(card => ({
      card, span: Math.ceil(card.querySelector('.project-card__button').getBoundingClientRect().height + 40)
    }));
    measurements.forEach(({card, span}) => card.style.setProperty('--masonry-span', span));
    updateProgress();
  };
  const scheduleMasonry = () => {
    if (masonryFrame === null) masonryFrame = requestAnimationFrame(layoutMasonry);
  };
  const observeMasonry = () => {
    masonryObserver?.disconnect();
    layoutMasonry();
    if ('ResizeObserver' in window) {
      masonryObserver ??= new ResizeObserver(scheduleMasonry);
      grid.querySelectorAll('.project-card__button').forEach(button => masonryObserver.observe(button));
    }
  };
  addEventListener('resize', scheduleMasonry);
  (document.fonts?.ready ?? Promise.resolve()).then(scheduleMasonry);
  function render() {
    grid.dataset.category = activeFilter;
    const fragment = document.createDocumentFragment();
    visibleProjects().forEach((p,index) => {
      const card = document.createElement('article');card.className = 'project-card reveal';
      card.dataset.category = p.category;
      const button = document.createElement('button');button.type='button';button.className='project-card__button';button.dataset.project=p.id;
      const placeholder = p.placeholder !== false;
      button.setAttribute('aria-label','查看'+p.title+(placeholder?'，展示示意':''));
      // All strings below come from the local authored project catalogue.
      const media = document.createElement('div');media.className='project-card__media';
      const portraitPlaceholder = !p.width && ['poster','commerce','packaging'].includes(p.category);
      if (p.width && p.height) {
        media.style.aspectRatio = p.width + ' / ' + p.height;
      } else if (portraitPlaceholder) {
        media.classList.add('project-card__media--portrait');
        media.style.aspectRatio = '3 / 4';
      }
      const image = document.createElement('img');image.src=p.image;image.alt=p.title+(placeholder?'，模板示意图片，非个人作品':'');image.loading=index<2?'eager':'lazy';image.decoding='async';image.width=p.width || 1200;image.height=p.height || 900;
      if (portraitPlaceholder) { image.width = 900; image.height = 1200; }
      const arrow=document.createElement('span');arrow.className='project-card__arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
      const picture=document.createElement('picture');
      if(p.mobileImage){const source=document.createElement('source');source.media='(max-width: 899px)';source.srcset=p.mobileImage;picture.append(source);}
      picture.append(image);media.append(picture,arrow);
      const meta=document.createElement('div');meta.className='project-card__meta';
      const heading=document.createElement('h2');heading.textContent=p.title;
      const badge=document.createElement('span');badge.textContent=placeholder?'展示示意':'作品展示';meta.append(heading,badge);
      const caption=document.createElement('p');caption.className='project-card__caption';caption.textContent=p.focus;
      button.append(media,meta,caption);button.addEventListener('click',()=>{trigger=button;openProject(p.id);});card.append(button);fragment.append(card);
    });
    if (!visibleProjects().length) {
      const empty = document.createElement('p');
      empty.className = 'portfolio-note';
      empty.style.gridColumn = '1 / -1';
      empty.style.padding = '36px 0';
      empty.textContent = '该分类暂无案例。';
      fragment.append(empty);
    }
    grid.replaceChildren(fragment);
    observeMasonry();
    if(observer)grid.querySelectorAll('.reveal').forEach(n=>observer.observe(n));
    count.textContent=visibleProjects().length+' 个案例';
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===activeFilter)));
  }
  function openProject(id) {
    const p=projects.find(p=>p.id===id);if(!p)return;
    currentId=p.id;
    const visible=visibleProjects();
    document.getElementById('detail-position').textContent='案例预览 / '+(visible.findIndex(x=>x.id===id)+1)+' / '+visible.length;
    document.getElementById('detail-title').textContent=p.title;
    document.getElementById('detail-category').textContent=categories[p.category];
    document.getElementById('detail-description').textContent=p.description;
    document.getElementById('detail-focus').textContent=p.focus;
    const placeholder=p.placeholder !== false;
    document.getElementById('detail-notice').textContent=placeholder?'展示示意 · 非个人作品':categories[p.category]+' · 作品展示';
    document.getElementById('viewer-label').textContent=placeholder?'图片预览 · 模板示意':'图片预览 · '+p.title;
    const mobileSource=document.getElementById('detail-mobile-source');mobileSource.srcset=p.mobileImage || p.image;
    const image=document.getElementById('detail-image');image.src=p.image;image.alt=p.title+(placeholder?'，模板示意，非个人作品':'');
    if(!detail.open)detail.showModal();
    detail.scrollTop=0;syncScrollLock();updateURL();
  }
  function step(direction){const items=visibleProjects();const at=items.findIndex(p=>p.id===currentId);openProject(items[(at+direction+items.length)%items.length].id);}
  document.getElementById('previous-project').addEventListener('click',()=>step(-1));
  document.getElementById('next-project').addEventListener('click',()=>step(1));
  filters.forEach(button=>button.addEventListener('click',()=>{
    activeFilter=button.dataset.filter;currentId=null;render();updateURL();
  }));
  document.getElementById('detail-preview').addEventListener('click',()=>{
    const source=document.getElementById('detail-image');const image=document.getElementById('viewer-image');image.src=source.src;image.alt=source.alt;
    canvas.classList.remove('is-zoomed');zoomButton.setAttribute('aria-pressed','false');zoomButton.textContent='放大图片 ＋';
    viewer.showModal();syncScrollLock();
  });
  zoomButton.addEventListener('click',()=>{
    const zoomed=canvas.classList.toggle('is-zoomed');zoomButton.setAttribute('aria-pressed',String(zoomed));zoomButton.textContent=zoomed?'适应窗口 −':'放大图片 ＋';canvas.scrollTo(0,0);
  });
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.close).close()));
  detail.addEventListener('close',()=>{currentId=null;updateURL();syncScrollLock();if(trigger?.isConnected)trigger.focus();});
  viewer.addEventListener('close',syncScrollLock);
  for(const dialog of [detail,viewer])dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
  });
  detail.addEventListener('keydown',event=>{
    if(viewer.open||['BUTTON','A'].includes(document.activeElement.tagName)&&!['ArrowLeft','ArrowRight'].includes(event.key))return;
    if(event.key==='ArrowLeft'){event.preventDefault();step(-1);}if(event.key==='ArrowRight'){event.preventDefault();step(1);}
  });
  const progress=document.querySelector('.reading-progress');
  const updateProgress=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?Math.min(100,scrollY/max*100):0)+'%';};
  addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',updateProgress);
  function readURL(){const url=new URL(location.href);const category=url.searchParams.get('category') || document.body.dataset.defaultCategory;activeFilter=categories[category]?category:'all';const id=url.hash.startsWith('#case=')?url.hash.slice(6):null;const project=projects.find(p=>p.id===id);if(project&&activeFilter!=='all'&&project.category!==activeFilter)activeFilter=project.category;render();if(project)openProject(project.id);else if(detail.open)detail.close();}
  const embeddedCatalogue = document.getElementById('project-catalogue');
  const catalogue = location.protocol === 'file:' && embeddedCatalogue
    ? Promise.resolve().then(() => JSON.parse(embeddedCatalogue.textContent))
    : fetch('assets/projects.json', {cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('catalogue');return r.json();});
  Promise.all([catalogue]).then(([data])=>{
    projects=data.sort((a,b) => (b.addedAt || '').localeCompare(a.addedAt || ''));readURL();updateProgress();addEventListener('popstate',readURL);addEventListener('hashchange',readURL);
  }).catch(()=>{
    count.textContent='案例列表暂时无法加载';const message=document.createElement('p');message.textContent='请刷新页面重试，或通过邮箱联系我：cheonu319@qq.com。';grid.replaceChildren(message);
  });
})();
