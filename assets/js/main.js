// Main JS for Olivier Cots — personal website
(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('primary-menu');
  const yearEl = document.getElementById('year');

  // Update footer year
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme handling with localStorage and prefers-color-scheme
  const THEME_KEY = 'ocots-theme';
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const storedTheme = localStorage.getItem(THEME_KEY);
  const initialTheme = storedTheme || (prefersLight ? 'light' : 'dark');
  setTheme(initialTheme);

  function setTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      if (themeToggle) themeToggle.querySelector('.theme-icon').textContent = '☀️';
    } else {
      root.removeAttribute('data-theme');
      if (themeToggle) themeToggle.querySelector('.theme-icon').textContent = '🌙';
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      setTheme(isLight ? 'dark' : 'light');
    });
  }

  // Mobile nav toggle
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const open = navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    // Close menu on link click (mobile)
    navList.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Smooth anchor offset for sticky header
  const header = document.querySelector('.site-header');
  const headerHeight = () => header ? header.offsetHeight : 0;

  function scrollWithOffset(target) {
    const element = document.querySelector(target);
    if (!element) return;
    const y = element.getBoundingClientRect().top + window.pageYOffset - (headerHeight() + 10);
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href.length > 1) {
      e.preventDefault();
      scrollWithOffset(href);
      history.pushState(null, '', href);
    }
  });
})();
