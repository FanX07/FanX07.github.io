(() => {
  const gate = document.getElementById('netease-access');
  const gallery = document.getElementById('netease-private-gallery');
  const form = document.getElementById('netease-unlock-form');
  if (!gate || !gallery || !form) return;
  const input = document.getElementById('netease-passcode');
  const submit = form.querySelector('[type=submit]');
  const error = document.getElementById('netease-access-error');
  const toggle = document.getElementById('netease-password-toggle');
  const viewer = document.getElementById('netease-image-viewer');
  let urls = [];
  let pending = false;
  toggle.addEventListener('click', () => {
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    toggle.textContent = visible ? 'Hide' : 'Show';
    toggle.setAttribute('aria-pressed', String(visible));
    input.focus();
  });
  input.addEventListener('input', () => {
    error.textContent = '';
    input.removeAttribute('aria-invalid');
  });
  function closeViewer() { viewer.close(); viewer.querySelector('img').removeAttribute('src'); }
  viewer.querySelector('button').addEventListener('click', closeViewer);
  viewer.addEventListener('click', event => { if (event.target === viewer) closeViewer(); });
  function lock() {
    if (viewer.open) closeViewer();
    gallery.replaceChildren(); gallery.hidden = true; gate.hidden = false;
    urls.forEach(url => URL.revokeObjectURL(url)); urls = [];
    input.value = ''; input.type = 'password'; toggle.textContent = 'Show'; toggle.setAttribute('aria-pressed','false');
    gate.scrollIntoView({block:'center'}); input.focus();
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !input.value) return;
    pending = true; submit.disabled = true; submit.textContent = 'Unlocking…'; error.textContent = '';
    try {
      if (!window.crypto?.subtle) throw new Error('unsupported');
      const response = await fetch('/assets/netease-case-study.enc', {cache:'no-cache'});
      if (!response.ok) throw new Error('network');
      const data = new Uint8Array(await response.arrayBuffer());
      const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(input.value), 'PBKDF2', false, ['deriveKey']);
      const key = await crypto.subtle.deriveKey({name:'PBKDF2', salt:data.slice(4,20), iterations:310000, hash:'SHA-256'}, keyMaterial, {name:'AES-GCM',length:256}, false, ['decrypt']);
      let decrypted;
      try { decrypted = await crypto.subtle.decrypt({name:'AES-GCM',iv:data.slice(20,32)},key,data.slice(32)); }
      catch { throw new Error('password'); }
      const pages = JSON.parse(new TextDecoder().decode(decrypted));
      const toolbar = document.createElement('div'); toolbar.className='private-gallery__toolbar';
      const label = document.createElement('span'); label.textContent=`FULL CASE STUDY · ${pages.length} PAGES`;
      const relock = document.createElement('button'); relock.type='button'; relock.textContent='Lock again'; relock.addEventListener('click',lock);
      toolbar.append(label,relock); const fragment=document.createDocumentFragment(); fragment.append(toolbar);
      for (const [index,page] of pages.entries()) {
        const bytes = Uint8Array.from(atob(page.data), character=>character.charCodeAt(0));
        const url=URL.createObjectURL(new Blob([bytes],{type:'image/webp'})); urls.push(url);
        const figure=document.createElement('figure'); figure.dataset.page=page.number;
        const button=document.createElement('button'); button.type='button'; button.className='private-gallery__image-button'; button.setAttribute('aria-label',`Expand page ${page.number}: ${page.title}`);
        const image=document.createElement('img'); const isWorkflowPage=/design\s*workflow/i.test(page.title||''); image.src=isWorkflowPage?'/assets/netease-design-workflow.png':url; image.alt=page.title; image.width=isWorkflowPage?1920:page.width; image.height=isWorkflowPage?1080:page.height; image.loading=index===0?'eager':'lazy'; image.decoding='async';
        button.append(image); button.addEventListener('click',()=>{const expanded=viewer.querySelector('img');expanded.src=url;expanded.alt=page.title;viewer.showModal();});
        const caption=document.createElement('figcaption'); caption.textContent=`${String(index+1).padStart(2,'0')} / ${pages.length}`;
        figure.append(button,caption);fragment.append(figure);
      }
      gallery.replaceChildren(fragment); input.value=''; gate.hidden=true; gallery.hidden=false;
      gallery.scrollIntoView({block:'start'}); relock.focus({preventScroll:true});
    } catch (failure) {
      error.textContent = failure.message==='password' ? 'That passcode doesn’t match. Please try again.' : 'Unable to unlock right now. Please check your connection and try again.';
      if(failure.message==='password') { input.setAttribute('aria-invalid','true');input.select(); }
    } finally { pending=false;submit.disabled=false;submit.textContent='Unlock →'; }
  });
})();
