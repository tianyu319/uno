/*
 * Hero starfield. Meteor head / gradient-tail visual adapted from Magic UI (MIT):
 * https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/meteors.tsx
 * License retained at assets/vendor/magicui/LICENSE.
 */
(() => {
  const hero = document.getElementById('hero');
  if (!hero || hero.querySelector('.hero__sky')) return;
  const sky = document.createElement('div');
  sky.className = 'hero__sky';
  sky.setAttribute('aria-hidden', 'true');
  const zones = ['full'].map(side => {
    const zone = document.createElement('div');
    zone.className = 'hero__sky-zone hero__sky-zone--' + side;
    sky.append(zone);
    return zone;
  });
  hero.prepend(sky);
  const mobile = matchMedia('(max-width: 899px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const random = (min, max) => min + Math.random() * (max - min);
  let visible = hero.getBoundingClientRect().bottom > 0;
  let timer = null;
  let flight = null;
  let meteor = null;

  function populate() {
    zones.forEach(zone => {
      const stars = document.createDocumentFragment();
      const count = mobile.matches ? 90 : 250;
      for (let i = 0; i < count; i++) {
        const star = document.createElement('span');
        const bright = Math.random() > .82;
        star.className = 'sky-star' + (bright ? ' sky-star--bright' : '') + (Math.random() < .1 ? ' sky-star--warm' : '');
        star.style.cssText = `left:${random(.5, 99.5)}%;top:${random(.5, 99.5)}%;--star-size:${bright ? random(2, 2.7) : random(1, 1.8)}px;--star-glow:${bright ? 9 : 5}px;--star-low:${random(.06, .16)};--star-high:${bright ? 1 : random(.72, .95)};--star-duration:${random(1.1, 2.4)}s;--star-delay:${random(-8, 0)}s;`;
        stars.append(star);
      }
      zone.replaceChildren(stars);
    });
  }
  function stopMeteor() {
    clearTimeout(timer);
    timer = null;
    flight?.cancel();
    flight = null;
    meteor?.remove();
    meteor = null;
  }
  function isRunning() { return visible && !document.hidden && !reduced.matches; }
  function schedule(first = false) {
    if (!isRunning() || timer !== null) return;
    timer = setTimeout(() => {
      timer = null;
      shoot();
      schedule();
    }, first ? random(1300, 2200) : random(3000, 5800));
  }
  function shoot() {
    const box = sky.getBoundingClientRect();
    if (!box.width || !isRunning()) return;
    const rightward = Math.random() < .5;
    const tail = Math.min(180, box.width * .26);
    const startX = rightward ? -12 : box.width + 12;
    const endX = rightward ? box.width + tail + 12 : -tail - 12;
    const startY = box.height * random(.1, .28);
    const endY = box.height * random(.52, .72);
    const dx = endX - startX, dy = endY - startY;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const color = Math.random() < .5 ? '#ffffff' : '#ff8a36';
    meteor = document.createElement('span');
    meteor.className = 'sky-meteor';
    meteor.dataset.color = color === '#ffffff' ? 'white' : 'orange';
    meteor.style.cssText = `left:${startX}px;top:${startY}px;--meteor-color:${color};--meteor-angle:${angle}deg;--meteor-tail:${tail}px;`;
    const trail = document.createElement('span');
    trail.className = 'sky-meteor__trail';
    meteor.append(trail);
    sky.append(meteor);
    flight = meteor.animate([
      { transform: 'translate(0, 0)', opacity: 0 },
      { offset: .05, opacity: .95 },
      { offset: .95, opacity: .95 },
      { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }
    ], { duration: random(2300, 2800), easing: 'linear' });
    const current = meteor;
    flight.onfinish = () => {
      current.remove();
      if (meteor === current) { meteor = null; flight = null; }
    };
  }
  function sync() {
    sky.classList.toggle('is-paused', !isRunning());
    if (isRunning()) schedule(true); else stopMeteor();
  }
  mobile.addEventListener('change', () => { stopMeteor(); populate(); sync(); });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  addEventListener('pagehide', () => { visible = false; sync(); });
  addEventListener('pageshow', () => { visible = hero.getBoundingClientRect().bottom > 0; sync(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(hero);
  }
  populate();
  sync();
})();
