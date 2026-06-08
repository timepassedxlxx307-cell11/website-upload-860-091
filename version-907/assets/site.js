(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function bindMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function bindHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var activeIndex = 0;
        var timer = null;
        function show(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === activeIndex);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === activeIndex);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(activeIndex + 1);
            }, 5600);
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(position);
                start();
            });
        });
        show(0);
        start();
    }

    function bindFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var year = scope.querySelector('[data-filter-year]');
            var type = scope.querySelector('[data-filter-type]');
            var category = scope.querySelector('[data-filter-category]');
            var count = scope.querySelector('[data-filter-count]');
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : '';
            }
            function apply() {
                var keyword = valueOf(input);
                var selectedYear = valueOf(year);
                var selectedType = valueOf(type);
                var selectedCategory = valueOf(category);
                var visible = 0;
                cards.forEach(function (card) {
                    var search = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                    var cardType = (card.getAttribute('data-type') || '').toLowerCase();
                    var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
                    var matched = true;
                    if (keyword && search.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        matched = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        matched = false;
                    }
                    if (selectedCategory && cardCategory !== selectedCategory) {
                        matched = false;
                    }
                    card.classList.toggle('is-filter-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = '当前显示 ' + visible + ' 部';
                }
            }
            [input, year, type, category].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', apply);
                    element.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function bindPlayer() {
        var shell = document.querySelector('[data-video-player]');
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.player-cover');
        var trigger = shell.querySelector('[data-play-trigger]');
        var streamUrl = shell.getAttribute('data-stream-url');
        var loaded = false;
        function loadStream() {
            if (!video || !streamUrl) {
                return;
            }
            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                loaded = true;
            }
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }
        if (trigger) {
            trigger.addEventListener('click', loadStream);
        }
        if (cover) {
            cover.addEventListener('click', loadStream);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!loaded || video.paused) {
                    loadStream();
                }
            });
        }
    }

    ready(function () {
        bindMenu();
        bindHero();
        bindFilters();
        bindPlayer();
    });
}());
