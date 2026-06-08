(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initCardFilters() {
    selectAll('[data-card-filter]').forEach(function (input) {
      var section = input.closest('.filter-panel');
      var cards = section ? selectAll('.movie-card', section) : [];
      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var matched = card.textContent.toLowerCase().indexOf(value) !== -1;
          card.classList.toggle('is-hidden-card', value && !matched);
        });
      });
    });
  }

  function initPlayers() {
    selectAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('.movie-video');
      var cover = shell.querySelector('.play-cover');
      var message = shell.querySelector('.player-message');
      if (!video || !cover) {
        return;
      }
      var streamUrl = video.getAttribute('data-stream');
      var player = null;
      var ready = false;
      var waitingPlay = false;

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add('is-visible');
      }

      function playWhenReady() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            showMessage('播放暂时无法启动，请再次点击播放。');
          });
        }
      }

      function loadStream(autoplay) {
        if (!streamUrl) {
          showMessage('播放暂时无法启动，请稍后再试。');
          return;
        }
        waitingPlay = !!autoplay;
        if (ready) {
          if (waitingPlay) {
            playWhenReady();
          }
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          ready = true;
          if (waitingPlay) {
            playWhenReady();
          }
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          player = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          player.loadSource(streamUrl);
          player.attachMedia(video);
          player.on(window.Hls.Events.MANIFEST_PARSED, function () {
            ready = true;
            if (waitingPlay) {
              playWhenReady();
            }
          });
          player.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                player.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                player.recoverMediaError();
              } else {
                showMessage('播放暂时无法启动，请稍后再试。');
              }
            }
          });
          return;
        }
        showMessage('播放暂时无法启动，请更换浏览器再试。');
      }

      cover.addEventListener('click', function () {
        cover.classList.add('is-hidden');
        loadStream(true);
      });

      video.addEventListener('play', function () {
        cover.classList.add('is-hidden');
        if (!ready) {
          loadStream(true);
        }
      });

      window.addEventListener('beforeunload', function () {
        if (player) {
          player.destroy();
        }
      });
    });
  }

  function makeResultCard(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<a class="movie-card" href="' + item.link + '">' +
      '<span class="poster-wrap">' +
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span><span class="play-dot">▶</span>' +
      '</span>' +
      '<span class="card-body">' +
      '<strong>' + escapeHtml(item.title) + '</strong>' +
      '<em>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</em>' +
      '<span class="card-desc">' + escapeHtml(item.oneLine) + '</span>' +
      '<span class="tag-row">' + tags + '</span>' +
      '</span>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initSearchPage() {
    var data = window.SITE_INDEX || [];
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var category = document.querySelector('[data-search-category]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    if (!form || !input || !results || !data.length) {
      return;
    }

    function apply() {
      var query = input.value.trim().toLowerCase();
      var selected = category ? category.value.trim() : '';
      var filtered = data.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.category, item.genre, item.tags.join(' '), item.oneLine].join(' ').toLowerCase();
        var categoryMatched = !selected || item.category === selected || item.tags.indexOf(selected) !== -1;
        var queryMatched = !query || text.indexOf(query) !== -1;
        return categoryMatched && queryMatched;
      }).slice(0, 120);
      if (title) {
        title.textContent = query || selected ? '搜索结果' : '推荐内容';
      }
      results.innerHTML = filtered.length ? filtered.map(makeResultCard).join('') : '<p class="empty-result">没有找到匹配内容，换个关键词再试。</p>';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    input.addEventListener('input', apply);
    if (category) {
      category.addEventListener('change', apply);
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      input.value = query;
      apply();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initCardFilters();
    initPlayers();
    initSearchPage();
  });
}());
