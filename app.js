// Share the build's cache version with the dictionary so new locales arrive together.
const { content } = await import(`./content.js${new URL(import.meta.url).search}`);
const localeSuffix = new RegExp(`-(${Object.keys(content).join('|')})$`);

const dialog = document.querySelector('.image-dialog');
const dialogImage = dialog.querySelector('img');
let language = 'en';
let openingButton;

function resolveLanguage() {
  const anchorLanguage = location.hash.match(localeSuffix)?.[1];
  const queryLanguage = new URLSearchParams(location.search).get('lang');
  return anchorLanguage || (Object.hasOwn(content, queryLanguage) ? queryLanguage : 'en');
}

function applyLanguage(scroll = false) {
  language = resolveLanguage();
  document.documentElement.lang = language;
  document.title = content[language].title;
  document.querySelector('meta[name="description"]').content = content[language].description;
  document.querySelectorAll('[data-locale]').forEach(section => { section.hidden = section.dataset.locale !== language; });
  if (scroll && location.hash) {
    document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }
}

document.querySelectorAll('[data-language]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const nextLanguage = link.dataset.language;
    const nextHash = location.hash.replace(localeSuffix, `-${nextLanguage}`) || '#top';
    history.pushState(null, '', `?lang=${nextLanguage}${nextHash}`);
    applyLanguage(true);
  });
});

document.querySelectorAll('[data-image]').forEach(button => {
  button.addEventListener('click', () => {
    const gallery = button.closest('.gallery');
    const main = gallery.querySelector('.gallery-main');
    main.src = `assets/${button.dataset.image}.jpg`;
    main.alt = button.dataset.alt;
    gallery.querySelectorAll('[data-image]').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
  });
});

document.querySelectorAll('[data-enlarge]').forEach(button => {
  button.addEventListener('click', () => {
    openingButton = button;
    const source = button.querySelector('img');
    dialogImage.src = source.src;
    dialogImage.alt = source.alt;
    dialog.querySelector('p').textContent = source.alt;
    dialog.querySelector('button').textContent = content[language].closeImage;
    dialog.setAttribute('aria-label', content[language].galleryLabel);
    dialog.showModal();
  });
});
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  }
});
dialog.addEventListener('close', () => { openingButton?.focus({preventScroll:true}); });
window.addEventListener('hashchange', () => applyLanguage(true));
window.addEventListener('popstate', () => applyLanguage(true));
applyLanguage(Boolean(location.hash));
