// Phones: fit the whole 1512px artboard to the screen, trimming the empty side margins so the work reads larger.
function caseFit(shell){const canvas=shell.querySelector('.design-canvas')||shell.firstElementChild,w=shell.clientWidth;if(!canvas||!w)return w;if(innerWidth>700){canvas.style.marginLeft='';return w}let crop=+canvas.dataset.mobileCrop;if(!(crop>=0)){const box=canvas.getBoundingClientRect(),k=box.width/1512;if(!k)return w;const edges=[];canvas.querySelectorAll('p,img,video').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height)return;const l=(r.left-box.left)/k,rt=1512-(r.right-box.left)/k;if(l<0||rt<0||r.width/k>1300)return;edges.push(l,rt)});if(edges.length<8)return w;edges.sort((a,b)=>a-b);crop=Math.max(0,Math.min(170,Math.round(edges[Math.floor(edges.length*.03)]-24)));canvas.dataset.mobileCrop=crop}canvas.style.marginLeft=-crop+'px';const eff=w*1512/(1512-2*crop);shell.style.setProperty('--fit-scale',Math.min(1,eff/1512));return eff}
const canvases=[...document.querySelectorAll('.canvas-shell')];function resize(){for(const shell of canvases){if(!shell.clientWidth)continue;const c=shell.firstElementChild,s=Math.min(1,caseFit(shell)/1512);c.style.zoom=s;shell.style.height=Number(c.dataset.designHeight)*s+'px'}}new ResizeObserver(resize).observe(document.querySelector('main'));resize();
function hotspot(canvas,x,y,w,h,label,fn){const b=document.createElement('button');b.className='bax-action';b.setAttribute('aria-label',label);b.style.cssText=`left:${x}px;top:${y}px;width:${w}px;height:${h}px`;b.onclick=fn;canvas.append(b);return b}
let approachIndex=0,approachAnimations=[];
function switchApproach(i){
 if(i===approachIndex)return;
 const previous=panels[approachIndex],next=panels[i];
 const old=new Map([...previous.querySelectorAll('p')].map(p=>[p.textContent.trim(),p.getBoundingClientRect()]));
 const keyboard=previous.contains(document.activeElement);
 approachAnimations.forEach(a=>a.cancel());approachAnimations=[];
 approachIndex=i;panels.forEach((p,j)=>{p.hidden=i!==j;p.setAttribute('aria-hidden',String(i!==j))});resize();
 panels.forEach(p=>p.querySelectorAll('[role="button"]').forEach((b,j)=>{b.setAttribute('aria-pressed',String(i===j));b.setAttribute('tabindex',i===j?'0':'-1')}));
 if(keyboard)next.querySelectorAll('[role="button"]')[i]?.focus({preventScroll:true});
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const scale=next.querySelector('.design-canvas').getBoundingClientRect().width/1512;
 let n=0;
 next.querySelectorAll('p').forEach(el=>{const before=old.get(el.textContent.trim()),after=el.getBoundingClientRect();
 if(before){const dx=(before.left-after.left)/scale,dy=(before.top-after.top)/scale;
 if(Math.abs(dx)+Math.abs(dy)>1)approachAnimations.push(el.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:440,easing:'cubic-bezier(.22,1,.36,1)'}));
 }else{approachAnimations.push(el.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,delay:Math.min(n++*30,120),fill:'backwards',easing:'cubic-bezier(.22,1,.36,1)'}))}
 });
}
const panels=[...document.querySelectorAll('.approach-panel')];panels.forEach(p=>{for(const el of p.querySelectorAll('p')){const t=el.textContent.trim().replace(/\s+/g,' ');const i=['Active: Shuttle','Weapon · Silk','Passive · Swift & Still'].indexOf(t);if(i<0)continue;const b=el.parentElement;b.setAttribute('role','button');b.setAttribute('tabindex','0');b.setAttribute('aria-label',['Active approach','Weapon approach','Passive approach'][i]);b.style.cursor='pointer';const choose=()=>switchApproach(i);b.onclick=choose;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose()}}}});
for(const [slug,h] of [['active',895],['weapon',1629],['passive',1230]]){const c=document.querySelector('#'+slug+' .design-canvas'),detail=document.querySelector('#'+slug+'-details');const b=hotspot(c,420,h-205,670,160,'Toggle '+slug+' design details',()=>{detail.hidden=!detail.hidden;b.setAttribute('aria-expanded',String(!detail.hidden));resize()});b.setAttribute('aria-expanded','false')}
const timers=new Map(),visible=new Set(),observer=new IntersectionObserver(entries=>{for(const e of entries){const v=e.target;if(e.isIntersecting&&e.intersectionRatio>=.35&&!document.hidden){visible.add(v);if(!timers.has(v)&&v.paused)timers.set(v,setTimeout(()=>{timers.delete(v);if(visible.has(v)&&!document.hidden)v.play().catch(()=>{})},800))}else{visible.delete(v);clearTimeout(timers.get(v));timers.delete(v);v.pause()}}},{threshold:[0,.35]});
for(const [id,src] of [['1:1691','intro'],['10:238','process'],['39:11439','final']]){const slot=document.querySelector(`[data-node-id="${id}"]`),v=document.createElement('video');v.src=({'intro':'assets/bax/intro-web.m4v','process':'assets/bax/process-web.m4v','final':'assets/bax/final-web.m4v'})[src];v.className='case-video';v.muted=true;v.defaultMuted=true;v.playsInline=true;v.loop=true;v.preload='metadata';v.controls=false;slot.classList.add('media-slot');slot.append(v);observer.observe(v)}document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('video').forEach(v=>v.pause());else document.querySelectorAll('video').forEach(v=>{observer.unobserve(v);observer.observe(v)})});
document.querySelectorAll('.bookmark-nav a').forEach(a=>a.onclick=e=>{e.preventDefault();(()=>{const t=document.querySelector(a.hash);if(t.matches('details'))t.open=true;resize();t.scrollIntoView({behavior:'smooth'})})()});
const marks=[...document.querySelectorAll('.bookmark-nav a')];function sync(){let id='overview';for(const s of document.querySelectorAll('main>section,main>details'))if(s.getBoundingClientRect().top<innerHeight*.35)id=s.id;marks.forEach(a=>a.classList.toggle('active',a.hash==='#'+id))}addEventListener('scroll',sync,{passive:true});sync();

document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',resize));

// Figma's fixed 22px text boxes clipped the taller display typeface.
document.querySelectorAll('.bax-main p').forEach(el=>{if(parseFloat(getComputedStyle(el).fontSize)>=28){el.classList.add('bax-display-title');el.parentElement.classList.add('bax-title-box')}});

// Phones: a one-time nudge that the artboards can be pinched for detail.
if(innerWidth<=700&&matchMedia('(pointer: coarse)').matches){const hint=document.createElement('div');hint.className='zoom-hint';hint.textContent='Pinch to zoom into details';document.body.append(hint);const hide=()=>{hint.classList.add('gone');setTimeout(()=>hint.remove(),500)};setTimeout(hide,4200);addEventListener('touchstart',e=>{if(e.touches.length>1)hide()},{passive:true})}

// Phones: show the tapped chapter's name for a moment, like the desktop hover label.
(()=>{const nav=document.querySelector('.bookmark-nav');if(!nav)return;const toast=document.createElement('div');toast.className='bookmark-toast';toast.setAttribute('aria-hidden','true');document.body.append(toast);let timer;nav.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||innerWidth>700)return;toast.textContent=(a.querySelector('.bookmark-label')?.textContent||a.getAttribute('aria-label')||'').trim();if(!toast.textContent)return;document.querySelector('.zoom-hint')?.remove();toast.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),1600)})})();

// Scroll one step through the three approaches; release normal page scroll at both ends.
(()=>{const section=document.querySelector('#approach');let sum=0,last=0,lockedUntil=0;addEventListener('wheel',e=>{
 if(innerWidth<=700||e.ctrlKey||!section||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
 const r=section.getBoundingClientRect(),now=performance.now();if(r.top>120||r.bottom<Math.min(innerHeight*.65,r.height*.7)){sum=0;return}
 if(now<lockedUntil){e.preventDefault();return}
 const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1),dir=Math.sign(delta);if(!dir)return;
 if((dir>0&&approachIndex===panels.length-1)||(dir<0&&approachIndex===0)){sum=0;return}
 e.preventDefault();if(now-last>220||Math.sign(sum)!==dir)sum=0;last=now;sum+=delta;
 if(Math.abs(sum)>=65){switchApproach(approachIndex+dir);sum=0;lockedUntil=now+720}
 },{passive:false})})();

