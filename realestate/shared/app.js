// shared/app.js — vanilla, no React. Renders nav/footer, manages lang+mode+preset
// across pages via localStorage. Each page calls Okumiya.init(currentPage).

(function () {
  const LS = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('okumiya:' + k)) ?? d; } catch (e) { return d; } },
    set(k, v) { localStorage.setItem('okumiya:' + k, JSON.stringify(v)); },
  };

  const PAGES = [
    { id: 'home',       file: 'index.html',      key: 'home' },
    { id: 'about',      file: 'about.html',      key: 'about' },
    { id: 'services',   file: 'services.html',   key: 'services' },
    { id: 'properties', file: 'properties.html', key: 'properties' },
    { id: 'faq',        file: 'faq.html',        key: 'faq' },
    { id: 'contact',    file: 'contact.html',    key: 'contact' },
  ];

  const PRESETS = [
    { id: 'hi',    name: { ja: '緋', en: 'Hi', zh: '緋' }, sw: '#9b1c1c' },
    { id: 'ai',    name: { ja: '藍', en: 'Ai', zh: '藍' }, sw: '#1d3557' },
    { id: 'moegi', name: { ja: '萌黄', en: 'Moegi', zh: '萌黄' }, sw: '#2f5d3a' },
    { id: 'kuchi', name: { ja: '朽葉', en: 'Kuchiba', zh: '朽葉' }, sw: '#a8654b' },
    { id: 'sumi',  name: { ja: '墨', en: 'Sumi', zh: '墨' }, sw: '#1a1a1a' },
  ];

  const NAV_LABELS = {
    ja: { home: 'ホーム', about: '私たちについて', services: 'サービス', properties: '物件', faq: 'よくある質問', contact: 'お問い合わせ' },
    en: { home: 'Home', about: 'About', services: 'Services', properties: 'Listings', faq: 'FAQ', contact: 'Contact' },
    zh: { home: '首页', about: '关于我们', services: '服务', properties: '房源', faq: '常见问题', contact: '联系我们' },
  };

  function applyTheme() {
    const lang = LS.get('lang', 'ja');
    const mode = LS.get('mode', 'light');
    const preset = LS.get('preset', 'kuchi');
    const type = LS.get('type', 'mincho');
    document.documentElement.setAttribute('data-mode', mode);
    document.documentElement.setAttribute('data-preset', preset);
    document.documentElement.setAttribute('data-type', type);
    document.documentElement.setAttribute('lang', lang);
  }

  function set(key, value) { LS.set(key, value); applyTheme(); render(); }

  // ─── SVG: Sakurajima silhouette ───
  function sakurajimaSVG(opts) {
    const { color = 'currentColor', accent = false } = opts || {};
    return `
    <svg viewBox="0 0 1600 360" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 280 L120 270 L260 250 L380 240 L520 232 L640 226 L780 222 L900 220 L1040 224 L1180 230 L1320 240 L1460 250 L1600 260 L1600 360 L0 360 Z" fill="${color}" opacity="0.18"/>
      <path d="M0 300 L100 286 L220 268 L340 252 L460 244 L580 236 L700 232 L820 234 L940 240 L1060 246 L1180 254 L1300 268 L1420 280 L1540 290 L1600 296 L1600 360 L0 360 Z" fill="${color}" opacity="0.32"/>
      <path d="M0 360 L0 322 L120 318 L240 312 L360 306 L500 296 L620 282 L720 260 L800 232 L860 198 L900 168 L944 146 L980 132 L1010 130 L1040 142 L1066 162 L1086 188 L1112 220 L1148 248 L1188 268 L1240 282 L1300 290 L1380 296 L1460 302 L1540 308 L1600 312 L1600 360 Z" fill="${accent ? 'var(--accent)' : color}" opacity="${accent ? 0.92 : 0.85}"/>
      <path d="M988 130 C 982 112, 996 100, 992 84 C 988 70, 1002 62, 1000 48" stroke="${color}" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round"/>
    </svg>`;
  }

  function hankoSVG(label, size = 84) {
    return `
    <span class="hanko" style="
      width:${size}px;height:${size}px;
      display:inline-flex;align-items:center;justify-content:center;
      color:#fff;background:var(--accent);border-radius:50%;
      font-family:var(--display);font-weight:600;font-size:${size * 0.3}px;
      box-shadow:inset 0 0 0 3px rgba(255,255,255,.55), 0 6px 18px -8px rgba(0,0,0,.4);
      transform:rotate(-6deg);position:relative;flex-shrink:0;">
      <span style="position:relative;z-index:1">${label}</span>
      <span style="position:absolute;inset:5px;border-radius:50%;border:1.5px solid rgba(255,255,255,.35)"></span>
    </span>`;
  }

  // ─── nav rendering ───
  function renderNav(currentPage, theme = 'A') {
    const lang = LS.get('lang', 'ja');
    const labels = NAV_LABELS[lang];
    const links = PAGES.map((p) => `
      <a href="${p.file}" class="${p.id === currentPage ? 'active' : ''}">${labels[p.key]}</a>
    `).join('');

    const langPill = `
      <div class="tool-pill" role="group" aria-label="language">
        ${['ja','en','zh'].map(l => `
          <button data-lang="${l}" class="${lang === l ? 'on' : ''}">${l === 'ja' ? '日本語' : l === 'en' ? 'EN' : '中文'}</button>
        `).join('')}
      </div>`;

    const mode = LS.get('mode', 'light');
    const modeBtn = `<button class="tool-icon" data-mode-toggle aria-label="toggle mode">${mode === 'light' ? '○' : '●'}</button>`;
    const menuBtn = `<button class="nav-burger" data-menu-open aria-label="open menu">
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M0 1h18M0 7h18M0 13h18"/></svg>
    </button>`;

    return `
    <nav class="nav" data-theme="${theme}">
      <a href="index.html" class="nav-brand">
        <b>おくみや</b>
        <span class="vrule"></span>
        <span class="mono">OKUMIYA · KAGOSHIMA</span>
      </a>
      <div class="nav-links">${links}</div>
      <div class="nav-tools">
        ${langPill}
        ${modeBtn}
        ${menuBtn}
      </div>
    </nav>
    <div class="menu" data-menu>
      <div class="menu-head">
        <span class="mono" style="font-size:11px;letter-spacing:.18em;color:var(--ink-3);text-transform:uppercase">Menu</span>
        <button class="tool-icon" data-menu-close aria-label="close">×</button>
      </div>
      <div class="menu-links">
        ${PAGES.map((p, i) => `
          <a href="${p.file}" ${p.id === currentPage ? 'style="color:var(--accent)"' : ''}>
            <span>${labels[p.key]}</span>
            <small>0${i + 1}</small>
          </a>`).join('')}
      </div>
      <div class="menu-foot">
        ${langPill}
        ${modeBtn}
      </div>
    </div>
    `;
  }

  function renderFooter() {
    const lang = LS.get('lang', 'ja');
    const t = window.OKUMIYA_I18N[lang];
    const labels = NAV_LABELS[lang];
    return `
    <footer class="foot">
      <div class="foot-grid">
        <div>
          <div style="font-family:var(--display);font-size:24px;font-weight:600;letter-spacing:.02em">おくみや株式会社</div>
          <p style="margin-top:14px;color:var(--ink-3);font-size:13px;line-height:1.7;max-width:36ch">
            ${lang === 'ja' ? '鹿児島市・地域密着の不動産事務所。住まいとお金、両方の道しるべ。' : lang === 'en' ? 'A neighborhood real-estate agency in Kagoshima, guiding both home and finances.' : '鹿儿岛本地深耕的不动产事务所。一并为您规划房子与家庭财务。'}
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:18px">
            ${['FP','宅建','住ロ'].map(c => `<span class="tag">${c}</span>`).join('')}
          </div>
        </div>
        <div>
          <h4>${lang === 'ja' ? 'メニュー' : lang === 'en' ? 'Menu' : '导航'}</h4>
          ${PAGES.map(p => `<a href="${p.file}">${labels[p.key]}</a>`).join('')}
        </div>
        <div>
          <h4>${lang === 'ja' ? '連絡先' : lang === 'en' ? 'Contact' : '联系'}</h4>
          <a>${t.contact.tel}</a>
          <a>${t.contact.mail}</a>
          <p style="font-size:13px;color:var(--ink-3);margin-top:10px;line-height:1.6">${t.contact.addr}</p>
        </div>
        <div>
          <h4>${lang === 'ja' ? '資格' : lang === 'en' ? 'Credentials' : '资质'}</h4>
          ${t.profile.certs.map(c => `<a><span class="mono" style="color:var(--accent);font-size:10px;letter-spacing:.14em">${c.code}</span>　${c.name}</a>`).join('')}
        </div>
      </div>
      <div class="foot-bottom">
        <span>${t.footer.license}</span>
        <span>${t.footer.copy}</span>
      </div>
    </footer>`;
  }

  // ─── floating Tweaks (color preset + type toggle, accessible from any page) ───
  function renderToolsFloat() {
    const preset = LS.get('preset', 'kuchi');
    const type = LS.get('type', 'mincho');
    const lang = LS.get('lang', 'ja');
    return `
    <div class="tools-float" data-tools-float>
      <button class="tools-fab" data-tools-toggle aria-label="design controls">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="9" r="2.2"/>
          <path d="M9 1v3M9 14v3M1 9h3M14 9h3M3.3 3.3l2 2M12.7 12.7l2 2M3.3 14.7l2-2M12.7 5.3l2-2"/>
        </svg>
      </button>
      <div class="tools-pop" data-tools-pop>
        <div class="tools-row">
          <span class="tools-h">${lang === 'ja' ? '伝統色' : lang === 'en' ? 'Color' : '色彩'}</span>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${PRESETS.map(p => `
              <button data-preset="${p.id}" aria-label="${p.id}"
                style="width:26px;height:26px;border-radius:50%;border:${preset === p.id ? '2px solid var(--ink)' : '1px solid var(--rule)'};background:${p.sw};cursor:pointer;padding:0"></button>
            `).join('')}
          </div>
        </div>
        <div class="tools-row">
          <span class="tools-h">${lang === 'ja' ? '書体' : lang === 'en' ? 'Type' : '字体'}</span>
          <div class="tool-pill">
            <button data-type="mincho" class="${type === 'mincho' ? 'on' : ''}">${lang === 'zh' ? '明朝' : '明朝'}</button>
            <button data-type="gothic" class="${type === 'gothic' ? 'on' : ''}">${lang === 'zh' ? '黑体' : 'ゴシック'}</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  // inject CSS for the floating tools (one time)
  if (!document.getElementById('okumiya-tools-css')) {
    const s = document.createElement('style');
    s.id = 'okumiya-tools-css';
    s.textContent = `
      .tools-float{position:fixed;right:16px;bottom:16px;z-index:80}
      .tools-fab{width:46px;height:46px;border-radius:50%;border:1px solid var(--rule);
        background:var(--bg);color:var(--ink);box-shadow:0 8px 24px -10px rgba(0,0,0,.3);}
      .tools-pop{position:absolute;right:0;bottom:56px;background:var(--bg);border:1px solid var(--rule);
        border-radius:14px;padding:14px;min-width:240px;box-shadow:0 16px 40px -12px rgba(0,0,0,.25);
        display:none;}
      .tools-float.open .tools-pop{display:block}
      .tools-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:6px 0}
      .tools-row + .tools-row{border-top:1px solid var(--rule-soft);padding-top:10px;margin-top:6px}
      .tools-h{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-3)}
    `;
    document.head.appendChild(s);
  }

  // ─── wire up handlers ───
  function bindHandlers() {
    document.body.addEventListener('click', (e) => {
      const t = e.target.closest('button, a');
      if (!t) return;

      if (t.matches('[data-lang]')) { set('lang', t.dataset.lang); }
      else if (t.matches('[data-mode-toggle]')) { set('mode', LS.get('mode', 'light') === 'light' ? 'dark' : 'light'); }
      else if (t.matches('[data-preset]')) { set('preset', t.dataset.preset); }
      else if (t.matches('[data-type]')) { set('type', t.dataset.type); }
      else if (t.matches('[data-menu-open]')) { document.querySelector('[data-menu]').classList.add('open'); }
      else if (t.matches('[data-menu-close]')) { document.querySelector('[data-menu]').classList.remove('open'); }
      else if (t.matches('[data-tools-toggle]')) { document.querySelector('[data-tools-float]').classList.toggle('open'); }
    });
  }

  // re-render text when state changes
  let currentPage = 'home';
  let pageRenderer = null;
  function render() {
    const navHost = document.querySelector('[data-nav-host]');
    const footHost = document.querySelector('[data-foot-host]');
    const toolsHost = document.querySelector('[data-tools-host]');
    if (navHost) navHost.innerHTML = renderNav(currentPage);
    if (footHost) footHost.innerHTML = renderFooter();
    if (toolsHost) toolsHost.innerHTML = renderToolsFloat();
    if (pageRenderer) pageRenderer();
  }

  function init(opts) {
    currentPage = opts.page || 'home';
    pageRenderer = opts.render || null;
    applyTheme();
    render();
    bindHandlers();
  }

  window.Okumiya = { init, set, LS, PAGES, PRESETS, NAV_LABELS, sakurajimaSVG, hankoSVG, applyTheme };
})();
