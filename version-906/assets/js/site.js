(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  let activeSlide = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === activeSlide);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === activeSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.dataset.heroDot || 0));
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(activeSlide - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(activeSlide + 1);
      startHero();
    });
  }

  showSlide(0);
  startHero();

  const filterInput = document.querySelector('[data-filter-input]');
  const filterYear = document.querySelector('[data-filter-year]');
  const resetButton = document.querySelector('[data-filter-reset]');
  const filterTargets = Array.from(document.querySelectorAll('.movie-card, .ranking-item'));

  function matchYear(value, year) {
    if (!value) {
      return true;
    }

    const numericYear = Number(year || 0);
    if (value === '2010') {
      return numericYear >= 2010 && numericYear < 2020;
    }
    if (value === '2000') {
      return numericYear >= 2000 && numericYear < 2010;
    }
    if (value === '1990') {
      return numericYear > 0 && numericYear < 2000;
    }
    return String(year || '') === value;
  }

  function applyFilters() {
    const keyword = (filterInput ? filterInput.value : '').trim().toLowerCase();
    const year = filterYear ? filterYear.value : '';

    filterTargets.forEach(function (item) {
      const text = [
        item.dataset.title,
        item.dataset.region,
        item.dataset.type,
        item.dataset.year,
        item.dataset.genre,
        item.dataset.category
      ].join(' ').toLowerCase();
      const visible = (!keyword || text.indexOf(keyword) !== -1) && matchYear(year, item.dataset.year);
      item.classList.toggle('is-hidden', !visible);
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }

  if (filterYear) {
    filterYear.addEventListener('change', applyFilters);
  }

  if (resetButton) {
    resetButton.addEventListener('click', function () {
      if (filterInput) {
        filterInput.value = '';
      }
      if (filterYear) {
        filterYear.value = '';
      }
      applyFilters();
    });
  }

  function attachPlayer(player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('.player-overlay');
    const url = player.dataset.videoUrl;
    let hls = null;

    function loadAndPlay() {
      if (!video || !url) {
        return;
      }

      if (!player.dataset.loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        player.dataset.loaded = 'true';
      }

      const playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          video.controls = true;
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', loadAndPlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          loadAndPlay();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  }

  document.querySelectorAll('.movie-player').forEach(attachPlayer);
})();
