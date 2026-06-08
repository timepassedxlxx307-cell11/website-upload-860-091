(function () {
    function queryAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
            button.textContent = nav.classList.contains('is-open') ? '×' : '☰';
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = queryAll('.hero-slide', root);
        var dots = queryAll('[data-hero-dot]', root);
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
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
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initCardFilter() {
        var section = document.querySelector('[data-filter-section]');
        var list = document.querySelector('[data-card-list]');
        if (!section || !list) {
            return;
        }
        var input = section.querySelector('[data-card-search]');
        var year = section.querySelector('[data-year-filter]');
        var region = section.querySelector('[data-region-filter]');
        var type = section.querySelector('[data-type-filter]');
        var cards = queryAll('.movie-card', list);
        var empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '没有匹配的影片，请调整筛选条件。';

        function valueOf(control) {
            return control ? control.value.trim().toLowerCase() : '';
        }

        function apply() {
            var keyword = valueOf(input);
            var yearValue = valueOf(year);
            var regionValue = valueOf(region);
            var typeValue = valueOf(type);
            var visible = 0;
            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (yearValue && String(card.getAttribute('data-year')).toLowerCase() !== yearValue) {
                    ok = false;
                }
                if (regionValue && String(card.getAttribute('data-region')).toLowerCase() !== regionValue) {
                    ok = false;
                }
                if (typeValue && String(card.getAttribute('data-type')).toLowerCase() !== typeValue) {
                    ok = false;
                }
                card.classList.toggle('is-hidden-card', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (visible === 0 && !empty.parentNode) {
                list.appendChild(empty);
            }
            if (visible > 0 && empty.parentNode) {
                empty.parentNode.removeChild(empty);
            }
        }

        [input, year, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }

    window.setupMoviePlayer = function (url) {
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('[data-player-button]');
        var hls = null;
        var prepared = false;

        if (!video || !url) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (_, data) {
                    if (!data || !data.fatal || !hls) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        hls = null;
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else {
                video.src = url;
            }
        }

        function play() {
            prepare();
            video.setAttribute('controls', 'controls');
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initCardFilter();
    });
}());
