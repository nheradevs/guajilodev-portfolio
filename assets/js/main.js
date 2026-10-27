const LANG_KEY = 'lang';

const TEXT = {
  es: { copy: 'Copiar', copied: 'Copiado', failed: 'No se pudo copiar', band: 'Esta página también está en español.', bandLink: 'Leer en español', close: 'Cerrar' },
  en: { copy: 'Copy', copied: 'Copied', failed: 'Could not copy', band: 'This page is also available in English.', bandLink: 'Read in English', close: 'Dismiss' },
};

const pageLang = document.documentElement.lang === 'en' ? 'en' : 'es';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function readPref() {
  try {
    return localStorage.getItem(LANG_KEY);
  } catch {
    return null;
  }
}

function writePref(value) {
  try {
    localStorage.setItem(LANG_KEY, value);
  } catch {
    // Almacenamiento bloqueado: la preferencia no se guarda y no pasa nada más
  }
}

function initMenu() {
  const header = $('[data-header]');
  const button = $('[data-menu-button]');
  if (!header || !button) return;

  const isOpen = () => button.getAttribute('aria-expanded') === 'true';
  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    header.toggleAttribute('data-menu-open', open);
  };

  button.addEventListener('click', () => setOpen(!isOpen()));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      button.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (isOpen() && !header.contains(event.target)) setOpen(false);
  });

  header.addEventListener('click', (event) => {
    if (isOpen() && event.target.closest('a[href^="#"]')) setOpen(false);
  });

  window.matchMedia('(min-width: 56em)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

function initPinnedHeader() {
  const header = $('[data-header]');
  const hero = $('[data-hero]');
  if (!header || !hero || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(([entry]) => {
    const passed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    header.classList.toggle('is-pinned', passed);
  });
  observer.observe(hero);
}

function initLangBand() {
  const links = $$('[data-lang-link]');
  links.forEach((link) => {
    link.addEventListener('click', () => writePref(link.getAttribute('hreflang')));
  });

  if (readPref()) return;

  const browser = (navigator.language || '').slice(0, 2).toLowerCase();
  const wanted = browser === 'es' ? 'es' : 'en';
  if (wanted === pageLang) return;

  const target = links.find((link) => link.getAttribute('hreflang') === wanted);
  if (!target) return;

  const strings = TEXT[wanted];
  const band = document.createElement('aside');
  band.className = 'c-langband';
  band.lang = wanted;
  band.setAttribute('aria-label', wanted === 'en' ? 'Language' : 'Idioma');

  const text = document.createElement('p');
  text.textContent = `${strings.band} `;
  const link = document.createElement('a');
  link.href = target.getAttribute('href');
  link.hreflang = wanted;
  link.textContent = strings.bandLink;
  link.addEventListener('click', () => writePref(wanted));
  text.append(link);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'c-langband__close';
  close.textContent = strings.close;
  close.addEventListener('click', () => {
    writePref(pageLang);
    band.remove();
  });

  band.append(text, close);
  document.body.append(band);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.className = 'u-visually-hidden';
  document.body.append(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  if (!ok) throw new Error('copy failed');
}

function initCopyButtons() {
  const strings = TEXT[pageLang];
  $$('[data-copy]').forEach((block) => {
    const code = $('code', block);
    if (!code) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'c-code__copy';
    button.textContent = strings.copy;

    const status = document.createElement('span');
    status.className = 'u-visually-hidden';
    status.setAttribute('aria-live', 'polite');

    let timer;
    const show = (message) => {
      button.textContent = message;
      status.textContent = message;
      clearTimeout(timer);
      timer = setTimeout(() => {
        button.textContent = strings.copy;
        status.textContent = '';
      }, 2000);
    };

    button.addEventListener('click', async () => {
      try {
        await copyText(code.textContent);
        show(strings.copied);
      } catch {
        show(strings.failed);
      }
    });

    block.append(button, status);
  });
}

initMenu();
initPinnedHeader();
initLangBand();
initCopyButtons();
