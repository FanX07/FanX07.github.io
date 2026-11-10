const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const typed=document.querySelector('#typed'), words=['products','interactions','AI experiences'];let word=0,pos=words[0].length,deleting=true;
function type(){let text=words[word];typed.textContent=text.slice(0,pos);if(deleting){pos--;if(pos<0){deleting=false;word=(word+1)%words.length;pos=0;setTimeout(type,350);return}}else{pos++;if(pos>text.length){deleting=true;setTimeout(type,2000);return}}setTimeout(type,deleting?42:85)}if(!reduced)setTimeout(type,2200);
const quotes=['Start with curiosity. Keep making.','Make the complex feel simple.','A little care goes a long way.'];let q=0;document.querySelector('#inspiration').addEventListener('click',()=>{const el=document.querySelector('#quote');el.hidden=false;el.textContent=quotes[q++%quotes.length]});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('arrived');observer.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.hanger').forEach(card=>{observer.observe(card);const hit=card.querySelector('.card-hit'), front=card.querySelector('.front'), back=card.querySelector('.back'), pendulum=card.querySelector('.pendulum');function flip(value){hit.classList.toggle('flipped',value);front.setAttribute('aria-hidden',String(value));back.setAttribute('aria-hidden',String(!value));front.inert=value;back.inert=!value}flip(false);hit.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')flip(true)});hit.addEventListener('focus',()=>flip(true));hit.addEventListener('blur',()=>flip(false));let frame;hit.addEventListener('pointermove',e=>{if(reduced||e.pointerType==='touch')return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const r=hit.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));hit.style.setProperty('--px',x*100+'%');hit.style.setProperty('--py',y*100+'%');hit.style.setProperty('--rx',(0.5-y)*18+'deg');hit.style.setProperty('--ry',(x-.5)*18+'deg');hit.style.setProperty('--illumination','.78');pendulum.style.setProperty('--sway',(x-.5)*2.3+'deg')})});hit.addEventListener('pointerleave',()=>{flip(false);cancelAnimationFrame(frame);hit.style.setProperty('--rx','0deg');hit.style.setProperty('--ry','0deg');hit.style.setProperty('--illumination','0');pendulum.style.setProperty('--sway','0deg');pendulum.animate([{transform:'rotate('+getComputedStyle(card).getPropertyValue('--rest')+')'},{transform:'rotate(1deg)'},{transform:'rotate('+getComputedStyle(card).getPropertyValue('--rest')+')'}],{duration:900,easing:'ease-out'})})});

// A slow walking companion; a double click places its beret in the page.
// Click an empty area to offer/take the hat; desserts are eaten only on arrival.
(()=>{
 const pet=document.querySelector('#pudding-pet'),hat=document.querySelector('#pudding-hat');
 let x=Math.max(12,innerWidth/2-390),y=220,tx=x,ty=y,last=0,walk=false;
 let hatState='absent',goal=null,eatingUntil=0;
 const interactive='a,button,input,textarea,select,summary,label,video,audio,iframe,[role="button"],[role="checkbox"],[contenteditable="true"],.card-hit';
 const clamp=(v,a,b)=>Math.min(Math.max(v,a),Math.max(a,b));
 function bounds(){return {w:pet.offsetWidth||32,h:pet.offsetHeight||32}}
 function moveTo(px,py){const {w,h}=bounds();tx=clamp(px-w/2,8,innerWidth-w-8);ty=clamp(py-h/2,8,innerHeight-h-8)}
 function resetHat(){hatState='absent';pet.classList.remove('wearing-hat');hat.classList.remove('visible');if(goal?.type==='hat'){goal=null;tx=x;ty=y}}
 function eat(food){
  if(food.dataset.eaten||eatingUntil)return;
  if(hatState==='placed')resetHat();
  pet.classList.add('pet-active');goal={type:'food',food};
 }
 document.addEventListener('pointermove',e=>{if(goal?.type==='inspiration'&&!e.target.closest('.wisdom'))goal=null;if(e.pointerType==='touch'||goal||eatingUntil)return;moveTo(e.clientX-34,e.clientY+42)});
 document.querySelector('#inspiration').addEventListener('click',()=>{if(hatState==='placed')resetHat();pet.classList.add('pet-active');goal={type:'inspiration'}});
 document.addEventListener('click',e=>{
  const food=e.target.closest('.dessert-shelf figure');
  if(food){eat(food);return}
  if(e.target.closest(interactive)||window.getSelection()?.toString().trim())return;
  pet.classList.add('pet-active');
  if(hatState!=='absent'){resetHat();return}
  if(eatingUntil)return;
  hatState='placed';goal={type:'hat',x:clamp(e.clientX,24,innerWidth-24),y:clamp(e.clientY,30,innerHeight-35)};
  hat.style.left=(goal.x-6)+'px';hat.style.top=(goal.y-4)+'px';hat.classList.add('visible');
 });
 document.addEventListener('keydown',e=>{
  const food=e.target.closest('.dessert-shelf figure');
  if(food&&(e.key==='Enter'||e.key===' ')){e.preventDefault();eat(food)}
  if(e.key==='Escape'){if(hatState==='placed')resetHat();goal=null;tx=x;ty=y}
 });
 function frame(now){
  const dt=Math.min((now-last)/1000,.05)||.016;last=now;
  if(goal?.type==='inspiration'){const q=document.querySelector('#quote'),r=q.getBoundingClientRect();if(q.hidden||r.bottom<0||r.top>innerHeight){goal=null;tx=x;ty=y}else moveTo(r.left+16,r.top+r.height/2)}
  if(goal?.type==='hat'){const {h}=bounds();moveTo(goal.x,goal.y+h*.28)}
  if(goal?.type==='food'){
   const food=goal.food,r=food.getBoundingClientRect();
   if(!food.isConnected||food.dataset.eaten||r.bottom<0||r.top>innerHeight){goal=null;tx=x;ty=y}
   else moveTo(r.left+r.width/2,r.top+r.height/2);
  }
  const dx=tx-x,dy=ty-y,d=Math.hypot(dx,dy),moving=d>2&&!eatingUntil;
  if(Math.abs(dx)>1)pet.classList.toggle('facing-left',dx<0);
  if(moving){const step=Math.min(d,83*dt);x+=dx/d*step;y+=dy/d*step}
  if(moving!==walk){walk=moving;pet.classList.toggle('walking',walk&&!reduced)}
  const wearing=pet.classList.contains('wearing-hat');
  pet.querySelector('.idle-drawing').style.display=!moving&&wearing?'inline':'none';
  pet.querySelector('.front-idle').style.display=!moving&&!wearing?'inline':'none';
  pet.querySelectorAll('.walking-drawing').forEach((g,i)=>{g.style.display=moving&&i===Math.floor(now/280)%2?'inline':'none';g.setAttribute('transform',dx<0?'translate(655 10) scale(-5.15 4.2)':'translate(55 10) scale(5.15 4.2)')});
  pet.style.transform='translate3d('+x+'px,'+y+'px,0)';
  if(goal&&goal.type!=='inspiration'&&d<3){
   if(goal.type==='hat'){hatState='worn';pet.classList.add('wearing-hat');hat.classList.remove('visible')}
   else{const food=goal.food;food.dataset.eaten='true';food.setAttribute('aria-hidden','true');food.removeAttribute('tabindex');food.removeAttribute('role');food.dispatchEvent(new CustomEvent('dessert-eaten',{bubbles:true}));pet.classList.add('eating');eatingUntil=now+650}
   goal=null;
  }
  if(eatingUntil&&now>=eatingUntil){eatingUntil=0;pet.classList.remove('eating')}
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
 addEventListener('resize',()=>{const {w,h}=bounds();x=clamp(x,8,innerWidth-w-8);y=clamp(y,8,innerHeight-h-8);tx=x;ty=y;if(hatState==='placed')resetHat()});
})();


// Fit a whole number of 18px doodles, separated by exactly 24px.
(()=>{const shelf=document.querySelector('.dessert-shelf');const doodles=[
['Pudding','<path d="M8 8h16l3 17c-6 4-16 4-22 0Zm0 0c0-4 16-4 16 0M7 12c4 3 5-2 8 0s5-2 10 0M11 18v1m10-1v1m-7 3q2 2 4 0M3 27q13 6 26 0"/>'],
['Cookie','<path d="M24 8c-4 1-6-2-6-5C9 1 2 8 3 17c1 10 10 15 19 10 8-4 9-13 2-19ZM9 10l2 2m7 5 2-1m-10 7 2-2m11-1 1 1m-9-14 1 1"/>'],
['Donut','<path d="M29 16c0 8-5 13-13 13S3 24 3 16 8 3 16 3s13 5 13 13Z"/><path d="M26 14c1 3-3 3-3 6-1 4-4 1-6 4-3 3-4-1-7-1-4-1-1-4-3-7-2-4 2-4 3-7 2-3 5 0 7-1 4-2 4 3 7 3Z"/><path d="M21 16c0 7-10 7-10 0s10-7 10 0ZM12 7l1 2m12 9-2 1m-10 6 1-2"/>'],
['Cake','<path d="m3 14 19-9 7 18-26 5ZM3 14v14m0-9 24-7M4 24l23-8"/><path d="M17 7c-5-3-1-7 2-4 3-3 7 1 3 4m-3-4 2-2"/>'],
['Pie','<path d="M3 16h26l-4 12H7ZM5 15c0-14 22-14 22 0M7 10l14 6M13 5l13 6M7 16 20 5m-6 11L25 8M3 17q3-4 6 0 3-4 6 0 3-4 6 0 3-4 6 0"/>'],
['Cupcake','<path d="m7 17 3 12h12l3-12ZM7 17c-6-4-2-8 1-8 0-5 5-6 8-3 3-6 9-1 8 3 6 0 8 6 2 8ZM13 21l1 5m5-5-1 5M15 4c-3-4 4-5 3 0"/>'],
['Swiss roll','<path d="M5 23c-6-13 2-20 11-19 11 0 15 10 11 19ZM10 21c-8-12 14-18 13-4 0 7-11 6-9 0 1-3 5-3 5 0M2 25c0 6 28 6 28 0Z"/>'],
['Coffee','<path d="M5 11h19v12c0 7-19 7-19 0Zm19 2c9-3 9 12 0 9M7 10c0-4 16-4 16 0M10 3q-3 3 0 5m7-7q-3 3 0 5M11 18v1m7-1v1m-5 3q2 2 4 0"/>']];let count=-1;const eaten=new Set();shelf.addEventListener('dessert-eaten',e=>eaten.add(Number(e.target.dataset.foodIndex)));function draw(){const n=Math.max(1,Math.floor((shelf.clientWidth+24)/42));if(n===count)return;count=n;shelf.innerHTML=Array.from({length:n},(_,i)=>{const [name,paths]=doodles[i%doodles.length],gone=eaten.has(i);return '<figure data-food-index="'+i+'"'+(gone?' data-eaten="true" aria-hidden="true"':' role="button" tabindex="0" aria-label="Feed '+name+' to Pudding Dog"')+'><svg viewBox="0 0 32 32" aria-hidden="true">'+paths+'</svg></figure>'}).join('')}new ResizeObserver(draw).observe(shelf);draw()})();

(()=>{if(reduced)return;const svg=document.querySelector('#mouse-trail');let points=[],raf=0;document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;points.push({x:e.clientX,y:e.clientY,t:performance.now()});points=points.slice(-42);if(!raf)raf=requestAnimationFrame(draw)});function draw(now){points=points.filter(p=>now-p.t<430);let markup='';for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],opacity=Math.max(0,1-(now-b.t)/430)*.38;markup+='<path d="M'+a.x+' '+a.y+'L'+b.x+' '+b.y+'" opacity="'+opacity+'"/>'}svg.innerHTML=markup;if(points.length)raf=requestAnimationFrame(draw);else raf=0}document.addEventListener('pointerleave',()=>{points=[];svg.innerHTML=''})})();

// Four works per page; filtering preserves the original selected order.
(()=>{const cards=[...document.querySelectorAll('.hanger')],filters=[...document.querySelectorAll('[data-filter]')],nav=document.querySelector('.work-pagination'),status=document.querySelector('.work-page-status');const gallery=document.querySelector('.cards-scroll'),frame=document.createElement('div');frame.className='work-gallery-frame';gallery.before(frame);frame.append(gallery);function arrow(label,direction){const b=document.createElement('button');b.type='button';b.className='work-page-arrow '+direction;b.setAttribute('aria-label',label);b.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="'+(direction==='previous'?'M15 5 8 12l7 7':'m9 5 7 7-7 7')+'" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';frame.append(b);return b}const previous=arrow('Previous work page','previous'),next=arrow('Next work page','next');let category='all',page=0,hashJump=false;const phone=matchMedia('(max-width: 700px)');const track=gallery.querySelector('.track');let current=0,scrollTick=0;function visibleCards(){return cards.filter(c=>!c.hidden)}function scrollToCard(i,smooth=true){const list=visibleCards(),c=list[Math.max(0,Math.min(i,list.length-1))];if(!c)return;gallery.scrollTo({left:c.offsetLeft+c.offsetWidth/2-gallery.clientWidth/2,behavior:smooth&&!reduced?'smooth':'instant'})}function syncPhone(){if(!phone.matches)return;const list=visibleCards(),mid=gallery.scrollLeft+gallery.clientWidth/2;let best=0,dist=Infinity;list.forEach((c,i)=>{const d=Math.abs(c.offsetLeft+c.offsetWidth/2-mid);if(d<dist){dist=d;best=i}});current=best;previous.disabled=best===0;next.disabled=best===list.length-1;[...nav.children].forEach((b,i)=>b.setAttribute('aria-current',i===best?'page':'false'));status.textContent=`${best+1} / ${list.length}`}gallery.addEventListener('scroll',()=>{cancelAnimationFrame(scrollTick);scrollTick=requestAnimationFrame(syncPhone)},{passive:true});previous.onclick=()=>{if(phone.matches)return scrollToCard(current-1);if(page>0){page--;render()}};next.onclick=()=>{if(phone.matches)return scrollToCard(current+1);page++;render()};phone.addEventListener('change',()=>{page=0;render()});function render(){const matches=cards.filter(c=>category==='all'||c.dataset.category===category),pages=Math.max(1,Math.ceil(matches.length/4));if(phone.matches){previous.hidden=next.hidden=matches.length<=1;cards.forEach(c=>c.hidden=true);matches.forEach((c,i)=>{c.hidden=false;c.style.setProperty('--rest',[-2.2,1.5,-1.1,2][i%4]+'deg');c.style.setProperty('--drop',[66,123.6,84.72,138][i%4]+'px');c.classList.add('arrived')});track.dataset.count=matches.length;nav.replaceChildren();matches.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Work '+(i+1));b.onclick=()=>scrollToCard(i);nav.append(b)});filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));const target=hashJump?matches.find(c=>'#'+c.id===location.hash):null;hashJump=false;requestAnimationFrame(()=>{scrollToCard(target?matches.indexOf(target):0,false);syncPhone()});return}page=Math.min(page,pages-1);previous.hidden=next.hidden=pages<=1;previous.disabled=page===0;next.disabled=page===pages-1;cards.forEach(c=>c.hidden=true);matches.slice(page*4,page*4+4).forEach((c,i)=>{c.hidden=false;c.style.setProperty('--rest',[-2.2,1.5,-1.1,2][i]+'deg');c.style.setProperty('--rest',[-2.2,1.5,-1.1,2][i]+'deg');c.style.setProperty('--drop',[66,123.6,84.72,138][i]+'px');c.style.setProperty('--offset',[2.79,19.86,19.86,2.79][i]+'px');c.classList.add('arrived')});document.querySelector('.track').dataset.count=Math.min(4,matches.length-page*4);document.querySelector('.track').dataset.count=Math.min(4,matches.length-page*4);nav.replaceChildren();for(let i=0;i<pages;i++){const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Work page '+(i+1));b.setAttribute('aria-current',i===page?'page':'false');b.onclick=()=>{page=i;render()};nav.append(b)}status.textContent=`${page+1} / ${pages}`;filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)))}filters.forEach(b=>b.onclick=()=>{category=b.dataset.filter;page=0;render()});function revealHash(){hashJump=true;const target=cards.find(c=>'#'+c.id===location.hash);if(target){category='all';page=Math.floor(cards.indexOf(target)/4)}render()}addEventListener('hashchange',revealHash);revealHash()})();

// Resolve every hanging pin against the actual rail after filtering or resizing.
(()=>{const track=document.querySelector('.track'),rail=track.querySelector('.rail'),path=rail.querySelector('path');let frame;function connect(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const w=track.clientWidth;rail.setAttribute('viewBox',`0 0 ${w} 40`);const cards=[...track.querySelectorAll('.hanger:not([hidden])')];if(!cards.length)return;const xs=cards.map(c=>c.offsetLeft+c.offsetWidth/2),x0=xs[0],x1=xs.at(-1),span=x1-x0;path.setAttribute('d',span?`M ${x0} 13 Q ${(x0+x1)/2} 43 ${x1} 13`:`M ${x0-65} 13 Q ${x0} 33 ${x0+65} 13`);cards.forEach((c,i)=>{const t=span?(xs[i]-x0)/span:.5;const y=span?13+60*t*(1-t):23;c.style.setProperty('--offset',(y-13)+'px')})})}new ResizeObserver(connect).observe(track);new MutationObserver(connect).observe(track,{attributes:true,attributeFilter:['data-count']});document.querySelectorAll('[data-filter],.work-pagination').forEach(el=>el.addEventListener('click',connect));connect()})();

// Touch screens have no hover: describe the gestures that actually work there.
(()=>{const note=document.querySelector('.footnote span:last-child');const touch=matchMedia('(hover: none)');function label(){if(note)note.textContent=touch.matches?'SWIPE TO BROWSE · TAP TO EXPLORE':'HOVER TO FLIP · CLICK TO EXPLORE'}touch.addEventListener('change',label);label()})();

