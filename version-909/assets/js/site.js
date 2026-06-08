(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-nav]");
        if (menuButton && nav) {
            menuButton.addEventListener("click", function () {
                nav.classList.toggle("is-open");
                document.body.classList.toggle("no-scroll", nav.classList.contains("is-open"));
            });
        }

        document.querySelectorAll("img.movie-poster, .rank-thumb img, .related-item img, .hero-poster img").forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("poster-hidden");
            });
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var previous = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(target) {
                if (!slides.length) {
                    return;
                }
                index = (target + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5600);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
            });

            if (previous) {
                previous.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var yearFilter = document.querySelector("[data-year-filter]");
        var typeFilter = document.querySelector("[data-type-filter]");
        var items = Array.prototype.slice.call(document.querySelectorAll(".filter-item"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (filterInput && initialQuery) {
            filterInput.value = initialQuery;
        }

        function filterItems() {
            var query = filterInput ? filterInput.value.trim().toLowerCase() : "";
            var year = yearFilter ? yearFilter.value : "";
            var type = typeFilter ? typeFilter.value : "";

            items.forEach(function (item) {
                var haystack = (item.getAttribute("data-search") || "").toLowerCase();
                var itemYear = item.getAttribute("data-year") || "";
                var itemType = item.getAttribute("data-type") || "";
                var ok = true;

                if (query && haystack.indexOf(query) === -1) {
                    ok = false;
                }
                if (year && itemYear !== year) {
                    ok = false;
                }
                if (type && itemType.indexOf(type) === -1) {
                    ok = false;
                }

                item.classList.toggle("hidden-card", !ok);
            });
        }

        if (filterInput) {
            filterInput.addEventListener("input", filterItems);
        }
        if (yearFilter) {
            yearFilter.addEventListener("change", filterItems);
        }
        if (typeFilter) {
            typeFilter.addEventListener("change", filterItems);
        }
        if (filterInput || yearFilter || typeFilter) {
            filterItems();
        }
    });
})();
