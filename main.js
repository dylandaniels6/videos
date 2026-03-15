(function () {
  const STORAGE_KEY = 'dylan-videos-data';
  const INTRO_KEY   = 'dylan-site-intro';
  const grid       = document.getElementById('grid');
  const introEl    = document.getElementById('intro');

  const DEFAULT_INTRO = { title: '100 of my favorite videos', description: 'test test test' };

  function getIntro() {
    try {
      const saved = localStorage.getItem(INTRO_KEY);
      if (saved) {
        const o = JSON.parse(saved);
        if (o && (o.title != null || o.description != null))
          return { title: o.title || '', description: o.description || '' };
      }
    } catch (_) {}
    return { ...DEFAULT_INTRO };
  }

  function renderIntro() {
    const intro = getIntro();
    const escape = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const nl2br = (s) => escape(s).replace(/\n/g, '<br>');
    introEl.innerHTML = `
      <h1 class="intro-title">${nl2br(intro.title)}</h1>
      <p class="intro-description">${nl2br(intro.description)}</p>
    `;
  }

  // Normalize DB row to app shape
  function rowToVideo(row) {
    return {
      id: row.id,
      title: row.title || '',
      description: row.description || '',
      category: row.category || 'life',
      instagramUrl: row.instagram_url || '',
      thumbnail: row.thumbnail || ''
    };
  }

  // Use Supabase if configured, else localStorage, else videos.js
  function getVideosSync() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { videos } = JSON.parse(saved);
        if (Array.isArray(videos) && videos.length) return videos;
      }
    } catch (_) {}
    return window.VIDEOS || [];
  }

  function getVideos() {
    if (typeof SUPABASE_URL === 'string' && SUPABASE_URL && typeof SUPABASE_ANON_KEY === 'string' && SUPABASE_ANON_KEY) {
      const { createClient } = supabase;
      return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        .from('videos')
        .select('id, title, description, category, instagram_url, thumbnail')
        .order('sort_order', { ascending: true })
        .then(({ data, error }) => {
          if (error || !data || !data.length) return getVideosSync();
          return data.map(rowToVideo);
        });
    }
    return Promise.resolve(getVideosSync());
  }

  // ── Mobile modal (tap to read description, then watch or close) ───
  const cardModal = document.getElementById('card-modal');
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const isMobile = () => mobileQuery.matches;

  function openCardModal(v, position) {
    if (!cardModal) return;
    const escape = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const nl2br = (s) => escape(s).replace(/\n/g, '<br>');
    document.getElementById('card-modal-number').textContent = String(position).padStart(2, '0') + '/100';
    document.getElementById('card-modal-title').innerHTML = nl2br(v.title || '');
    document.getElementById('card-modal-description').innerHTML = nl2br(v.description || '') || '<span style="opacity:0.6">No description</span>';
    const watchEl = document.getElementById('card-modal-watch');
    watchEl.href = v.instagramUrl || '#';
    cardModal.classList.add('is-open');
    cardModal.setAttribute('aria-hidden', 'false');
  }

  function closeCardModal() {
    if (!cardModal) return;
    cardModal.classList.remove('is-open');
    cardModal.setAttribute('aria-hidden', 'true');
  }

  function setupCardModal() {
    if (!cardModal) return;
    cardModal.querySelector('.card-modal-close').addEventListener('click', closeCardModal);
    cardModal.querySelector('.card-modal-backdrop').addEventListener('click', closeCardModal);
    document.getElementById('card-modal-watch').addEventListener('click', function() {
      closeCardModal();
    });
  }

  // ── Build grid ──────────────────────────────
  function renderGrid(videos) {
    grid.innerHTML = '';

    videos.forEach((v, i) => {
      const a = document.createElement('a');
      a.className   = 'card';
      a.href        = v.instagramUrl;
      a.target      = '_blank';
      a.rel         = 'noopener noreferrer';
      a.style.animationDelay = `${Math.min(i * 0.04, 0.8)}s`;

      const placeholder = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect fill="#0e0e0e" width="400" height="500"/><text x="50%" y="50%" fill="#444" font-family="sans-serif" font-size="14" text-anchor="middle" dy=".3em">Thumbnail</text></svg>');
      const escape = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const nl2br = (s) => escape(s).replace(/\n/g, '<br>');
      const titleHtml = nl2br(v.title || '');
      const descHtml = nl2br(v.description || '');
      a.innerHTML = `
        <img src="${v.thumbnail}" alt="${v.title}" loading="lazy" onerror="this.src=this.dataset.fallback" data-fallback="${placeholder}" />
        <div class="card-overlay">
          <span class="card-id">${String(i + 1).padStart(2, '0')}/100</span>
          <span class="card-title">${titleHtml}</span>
          ${descHtml ? `<span class="card-description">${descHtml}</span>` : ''}
        </div>
        <div class="card-ext">
          <svg viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </div>
      `;

      a.addEventListener('click', function(e) {
        if (isMobile()) {
          e.preventDefault();
          e.stopPropagation();
          openCardModal(v, i + 1);
        }
      }, false);

      a.addEventListener('touchstart', function(e) {
        if (isMobile()) {
          e.preventDefault();
          openCardModal(v, i + 1);
        }
      }, { passive: false });

      grid.appendChild(a);
    });
  }

  let currentVideos = [];

  // ── Init ─────────────────────────────────────
  setupCardModal();
  renderIntro();
  getVideos().then(function (videos) {
    currentVideos = videos;
    renderGrid(currentVideos);
  });
})();
