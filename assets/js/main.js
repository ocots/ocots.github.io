// Main JS for Olivier Cots — personal website
(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('primary-menu');
  const yearEl = document.getElementById('year');
  const pubList = document.getElementById('pub-list');
  const pubLoading = document.getElementById('pub-loading');
  const pubFallback = document.getElementById('pub-fallback');

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

  // Fetch latest publications from HAL (idHal: ocots)
  // API docs: https://api.archives-ouvertes.fr/docs/search
  async function loadHALPublications() {
    if (!pubList) return;
    // If opened as a local file, some browsers restrict cross-origin fetch or CORS.
    // Show a helpful hint and bail early.
    if (location.protocol === 'file:') {
      if (pubLoading) pubLoading.remove();
      if (pubFallback) {
        pubFallback.style.display = 'block';
        pubFallback.innerHTML = 'To load publications automatically, open this site via a local server (e.g., <code>python3 -m http.server</code>) or deploy to GitHub Pages.';
      }
      return;
    }
    try {
      const params = new URLSearchParams({
        q: 'authIdHal_s:ocots OR authIdHal_i:ocots OR authFullName_t:"Olivier Cots"',
        rows: '8',
        sort: 'producedDate_tdate desc',
        wt: 'json',
        fl: [
          'title_s',
          'authFullName_s',
          'producedDate_tdate',
          'publicationDate_s',
          'journalTitle_s',
          'doiId_s',
          'arxivId_s',
          'uri_s',
          'halId_s',
          'linkExtUrl_s'
        ].join(',')
      });

      const url = `https://api.archives-ouvertes.fr/search/?${params.toString()}`;
      let res = await fetch(url, { headers: { 'accept': 'application/json' } });
      // Simple retry once on transient failure
      if (!res.ok) {
        await new Promise(r => setTimeout(r, 400));
        res = await fetch(url, { headers: { 'accept': 'application/json' } });
      }
      if (!res.ok) throw new Error('HAL API error');
      const data = await res.json();
      const docs = (data && data.response && data.response.docs) || [];

      // Clear loading state
      if (pubLoading) pubLoading.remove();

      if (!docs.length) {
        if (pubFallback) pubFallback.style.display = 'block';
        return;
      }

      const items = docs.map(doc => {
        const title = Array.isArray(doc.title_s) ? doc.title_s[0] : (doc.title_s || 'Untitled');
        const date = doc.producedDate_tdate || doc.publicationDate_s || '';
        const year = date ? String(date).slice(0, 4) : '';
        const journal = Array.isArray(doc.journalTitle_s) ? doc.journalTitle_s[0] : (doc.journalTitle_s || '');
        const uri = Array.isArray(doc.uri_s) ? doc.uri_s[0] : (doc.uri_s || '');
        const halId = Array.isArray(doc.halId_s) ? doc.halId_s[0] : (doc.halId_s || '');
        const linkExt = Array.isArray(doc.linkExtUrl_s) ? doc.linkExtUrl_s[0] : (doc.linkExtUrl_s || '');

        // Prefer HAL doc page, then provided URI, then ext link
        const bestLink = halId ? `https://hal.science/${encodeURIComponent(halId)}` : (uri || linkExt || '#');
        const doi = Array.isArray(doc.doiId_s) ? doc.doiId_s[0] : (doc.doiId_s || '');
        const arxiv = Array.isArray(doc.arxivId_s) ? doc.arxivId_s[0] : (doc.arxivId_s || '');

        const parts = [];
        if (journal) parts.push(journal);
        if (year) parts.push(year);
        const meta = parts.join(' — ');

        const li = document.createElement('li');
        li.className = 'pub-item';
        li.innerHTML = `
          <a class="pub-title" href="${bestLink}" target="_blank" rel="noopener">${escapeHTML(title)}</a>
          ${meta ? `<div class="pub-meta muted">${escapeHTML(meta)}</div>` : ''}
          <div class="pub-links">
            ${doi ? `<a href="https://doi.org/${encodeURIComponent(doi)}" target="_blank" rel="noopener">DOI ↗</a>` : ''}
            ${arxiv ? `<a href="https://arxiv.org/abs/${encodeURIComponent(arxiv)}" target="_blank" rel="noopener">arXiv ↗</a>` : ''}
            ${halId ? `<a href="https://hal.science/${encodeURIComponent(halId)}" target="_blank" rel="noopener">HAL ↗</a>` : ''}
          </div>
        `;
        return li;
      });

      pubList.replaceChildren(...items);
    } catch (e) {
      if (pubLoading) pubLoading.remove();
      if (pubFallback) pubFallback.style.display = 'block';
      // Optional: console.warn('HAL fetch failed', e);
    }
  }

  function escapeHTML(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // Defer HAL load to idle to avoid blocking UI
  if (window.requestIdleCallback) {
    requestIdleCallback(loadHALPublications, { timeout: 2000 });
  } else {
    setTimeout(loadHALPublications, 0);
  }
})();
