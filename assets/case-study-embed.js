(async function () {
  const host = document.querySelector('[data-case-study]');
  if (!host) return;
  const base = new URL('/projects/' + host.dataset.caseStudy + '/', location.origin);
  const root = host.attachShadow({ mode: 'open' });
  const nativeFetch = window.fetch.bind(window);
  const getText = async path => {
    const response = await nativeFetch(new URL(path, base), { cache: 'no-cache' });
    if (!response.ok) throw new Error('Unable to load case study: ' + path);
    return response.text();
  };
  try {
    const html = new DOMParser().parseFromString(await getText('index.html'), 'text/html');
    const cssNames = [...html.querySelectorAll('link[rel="stylesheet"]')].map(link => link.getAttribute('href'));
    const scripts = [...html.querySelectorAll('script[src]')].map(script => script.getAttribute('src'));
    html.querySelectorAll('script').forEach(script => script.remove());
    const cssFiles = await Promise.all(cssNames.map(getText));
    const fontStyles = [];
    const propertyStyles = [];
    const families = [];
    cssFiles.forEach((css, index) => {
      css = css.replaceAll('../fonts/', 'fonts/').replace(/url\(([^)]+)\)/g, (match, value) => {
        const path = value.trim().replace(/^['"]|['"]$/g, '');
        return /^(data:|https?:|#)/.test(path) ? match : 'url("' + new URL(path, new URL(cssNames[index], base)).href + '")';
      });
      for (const rule of css.matchAll(/@font-face\{[^}]+\}/g)) {
        fontStyles.push(rule[0]);
        const family = rule[0].match(/font-family:([^;]+)/)?.[1].replace(/^['"]|['"]$/g, '').replace(/\\:/g, ':');
        if (family) families.push(family);
      }
      // @property declarations are document scoped. Without these defaults,
      // Tailwind translate/rotate expressions become invalid inside a shadow tree.
      for (const rule of css.matchAll(/@property\s+[^{}]+\{[^}]*\}/g)) {
        propertyStyles.push(rule[0]);
      }
      const style = document.createElement('style');
      style.textContent = css;
      root.append(style);
    });
    // Font faces belong to the document; the Figma typography utilities stay scoped.
    const fonts = document.createElement('style');
    fonts.textContent = [...propertyStyles, ...fontStyles].join('\n');
    document.head.append(fonts);
    const layout = document.createElement('style');
    layout.textContent = `
      :host{display:block;position:relative;width:calc(100vw - 40px);margin-left:calc(50% - 50vw + 20px);min-width:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#171717}
      #viewer{display:grid;grid-template-columns:242px minmax(0,1fr);align-items:start;overflow:visible;width:100%}
      #sidebar{position:sticky;inset:auto;top:16px;width:auto;max-height:calc(100dvh - 32px);height:calc(100dvh - 32px);padding:18px 20px;z-index:20;box-sizing:border-box}
      #sidebar .case-brand,#toolbar{display:none!important}
      #sidebar h2{margin:0 0 24px}
      #reading-main{min-width:0;margin-left:0!important}
      #page-stage{overflow:visible;padding-top:0}
      .figma-page{scroll-margin-top:24px}
      :host([data-case-study="netease"]) .preview-locked#viewer{display:block}
      #lightbox{max-width:calc(100vw - 32px);max-height:calc(100dvh - 32px)}
      @media(min-width:1600px){#viewer{grid-template-columns:258px minmax(0,1fr)}}
      @media(max-width:800px){
        #viewer{display:block}
        #sidebar{position:relative;top:auto;height:auto;max-height:none;transform:none!important;width:auto;padding:16px 12px}
        #sidebar h2{margin-bottom:12px;font-size:18px}
        #contents{display:flex;gap:14px;overflow:auto;max-height:220px;flex:none}
        #contents details{min-width:180px;margin-bottom:8px}
        .nav-caption,.sidebar-footer{display:none}
      }
    `;
    root.append(layout);
    const content = document.createElement('div');
    content.innerHTML = html.body.innerHTML;
    root.append(content);
    await Promise.allSettled(families.map(family => document.fonts.load('16px ' + JSON.stringify(family))));
    const source = (await Promise.all(scripts.map(getText))).join('\n;\n')
      .replaceAll('Math.min(1120,available)', 'available')
      .replaceAll('Math.min(1120,s.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight))', '(s.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight))')
      .replaceAll('return manifest.assets[id].src;', 'return new URL(manifest.assets[id].src,caseBase).href;')
      .replaceAll('if(a.src)return a.src;', 'if(a.src)return new URL(a.src,caseBase).href;');
    const scopedDocument = new Proxy(document, {
      get(target, property) {
        if (property === 'querySelector' || property === 'querySelectorAll') return root[property].bind(root);
        const value = Reflect.get(target, property, target);
        return typeof value === 'function' ? value.bind(target) : value;
      }
    });
    const scopedFetch = (resource, options) => nativeFetch(new URL(resource, base), options);
    new Function('document', 'fetch', 'caseBase', source)(scopedDocument, scopedFetch, base);
  } catch (error) {
    console.error(error);
    const message = document.createElement('p');
    message.textContent = 'The case study could not load. Please refresh to try again.';
    root.append(message);
  }
})();
