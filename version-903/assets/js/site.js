document.addEventListener('DOMContentLoaded', function () {
  initMenu();
  initHero();
  initFilters();
});

function initMenu() {
  var button = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.mobile-nav');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

function initHero() {
  var hero = document.querySelector('.hero');
  if (!hero) {
    return;
  }
  var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
  if (slides.length < 2) {
    return;
  }
  var current = 0;
  var timer = null;
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }
  function play() {
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }
  function restart() {
    window.clearInterval(timer);
    play();
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      show(index);
      restart();
    });
  });
  play();
}

function initFilters() {
  var grid = document.getElementById('movieGrid');
  if (!grid) {
    return;
  }
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
  var input = document.querySelector('.movie-search');
  var filters = Array.prototype.slice.call(document.querySelectorAll('.movie-filter'));
  var empty = document.querySelector('.empty-state');
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }
  function apply() {
    var query = normalize(input ? input.value : '');
    var values = {};
    filters.forEach(function (filter) {
      values[filter.getAttribute('data-filter')] = filter.value;
    });
    var visible = 0;
    cards.forEach(function (card) {
      var searchText = normalize(card.getAttribute('data-search'));
      var ok = true;
      if (query && searchText.indexOf(query) === -1) {
        ok = false;
      }
      Object.keys(values).forEach(function (key) {
        if (values[key] && card.getAttribute('data-' + key) !== values[key]) {
          ok = false;
        }
      });
      card.hidden = !ok;
      if (ok) {
        visible += 1;
      }
    });
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }
  if (input) {
    input.addEventListener('input', apply);
  }
  filters.forEach(function (filter) {
    filter.addEventListener('change', apply);
  });
  apply();
}
