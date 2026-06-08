(function () {
  const body = document.body;
  const mobileNav = document.querySelector('.mobile-nav');
  const menuButton = document.querySelector('.menu-toggle');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const searchPanel = document.querySelector('.search-panel');
  const searchInput = document.querySelector('#global-search');
  const searchResults = document.querySelector('.search-results');
  const openButtons = document.querySelectorAll('.search-toggle');
  const closeButton = document.querySelector('.search-close');

  function renderSearch(query) {
    if (!searchResults) {
      return;
    }
    const items = Array.isArray(window.SEARCH_ITEMS) ? window.SEARCH_ITEMS : [];
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      searchResults.innerHTML = '';
      return;
    }
    const matched = items.filter(function (item) {
      return [item.title, item.region, item.year, item.type, item.genre].join(' ').toLowerCase().includes(keyword);
    }).slice(0, 24);
    if (!matched.length) {
      searchResults.innerHTML = '<div class="empty-result show">没有找到匹配影片</div>';
      return;
    }
    searchResults.innerHTML = matched.map(function (item) {
      return '<a class="search-result-item" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><span class="search-result-title">' + escapeHtml(item.title) + '</span>' +
        '<span class="search-result-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + '</span></span>' +
        '</a>';
    }).join('');
  }

  function openSearch() {
    if (!searchPanel || !searchInput) {
      return;
    }
    searchPanel.classList.add('open');
    searchPanel.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
    setTimeout(function () {
      searchInput.focus();
    }, 30);
  }

  function closeSearch() {
    if (!searchPanel) {
      return;
    }
    searchPanel.classList.remove('open');
    searchPanel.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
  }

  openButtons.forEach(function (button) {
    button.addEventListener('click', openSearch);
  });
  if (closeButton) {
    closeButton.addEventListener('click', closeSearch);
  }
  if (searchPanel) {
    searchPanel.addEventListener('click', function (event) {
      if (event.target === searchPanel) {
        closeSearch();
      }
    });
  }
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let heroIndex = 0;
  let heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    heroTimer = setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (heroTimer) {
        clearInterval(heroTimer);
      }
      showHero(index);
      startHero();
    });
  });
  showHero(0);
  startHero();

  const filterBars = document.querySelectorAll('.filter-bar');
  filterBars.forEach(function (bar) {
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const empty = document.querySelector('.empty-result');
    function runFilter() {
      const q = (bar.querySelector('[data-filter="query"]')?.value || '').trim().toLowerCase();
      const type = bar.querySelector('[data-filter="type"]')?.value || '';
      const year = bar.querySelector('[data-filter="year"]')?.value || '';
      const region = bar.querySelector('[data-filter="region"]')?.value || '';
      let visible = 0;
      cards.forEach(function (card) {
        const hay = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year, card.dataset.type].join(' ').toLowerCase();
        const ok = (!q || hay.includes(q)) &&
          (!type || card.dataset.type === type) &&
          (!year || card.dataset.year === year) &&
          (!region || card.dataset.region === region);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }
    bar.querySelectorAll('input, select').forEach(function (field) {
      field.addEventListener('input', runFilter);
      field.addEventListener('change', runFilter);
    });
  });

  window.initPlayer = function (source, videoId) {
    const video = document.getElementById(videoId || 'movie-video');
    if (!video || !source) {
      return;
    }
    const shell = video.closest('.player-shell');
    const playButton = shell ? shell.querySelector('.player-cover-button') : null;
    const message = shell ? shell.querySelector('.player-message') : null;
    let attached = false;

    function setMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text || '';
      message.classList.toggle('show', Boolean(text));
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage('播放加载失败，请稍后重试');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage('播放加载失败，正在重试');
            hls.recoverMediaError();
          } else {
            setMessage('播放暂时不可用');
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        setMessage('播放暂时不可用');
      }
    }

    function begin() {
      attach();
      if (playButton) {
        playButton.classList.add('hide');
      }
      video.controls = true;
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (playButton) {
            playButton.classList.remove('hide');
          }
        });
      }
    }

    if (playButton) {
      playButton.addEventListener('click', begin);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });
    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('hide');
      }
    });
  };

  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char];
    });
  }
})();
