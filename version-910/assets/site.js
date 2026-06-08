
(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            var target = form.getAttribute('action') || './search.html';
            if (query) {
                window.location.href = target + '?q=' + encodeURIComponent(query);
            } else {
                window.location.href = target;
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
    }

    if (slides.length) {
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
            });
        }
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function filterCards(root, query) {
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
        var normalized = (query || '').toLowerCase().trim();
        var visible = 0;

        cards.forEach(function (card) {
            var matched = !normalized || card.textContent.toLowerCase().indexOf(normalized) !== -1;
            card.classList.toggle('is-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });

        var empty = root.querySelector('[data-empty-state]');
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    document.querySelectorAll('[data-card-filter-form]').forEach(function (form) {
        var root = form.closest('main') || document;
        var input = form.querySelector('[data-card-filter-input]');

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            filterCards(root, input ? input.value : '');
        });

        if (input) {
            input.addEventListener('input', function () {
                filterCards(root, input.value);
            });
        }
    });

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var input = searchPage.querySelector('[data-card-filter-input]');
        if (input) {
            input.value = query;
        }
        filterCards(searchPage, query);
    }
}());
