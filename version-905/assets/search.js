(function () {
    function getParam(name) {
        var value = new URLSearchParams(window.location.search).get(name);
        return value ? value.trim() : '';
    }

    function unique(items, key) {
        var seen = [];
        items.forEach(function (item) {
            var value = item[key];
            if (value && seen.indexOf(value) === -1) {
                seen.push(value);
            }
        });
        return seen.sort(function (a, b) {
            return String(a).localeCompare(String(b), 'zh-CN');
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function createCard(movie) {
        var card = document.createElement('article');
        card.className = 'movie-card';

        var link = document.createElement('a');
        link.className = 'poster-link';
        link.href = movie.file;

        var img = document.createElement('img');
        img.src = movie.cover;
        img.alt = movie.title;
        img.loading = 'lazy';

        var play = document.createElement('span');
        play.className = 'play-mark';
        play.textContent = '▶';

        link.appendChild(img);
        link.appendChild(play);

        var body = document.createElement('div');
        body.className = 'movie-card-body';

        var title = document.createElement('h3');
        var titleLink = document.createElement('a');
        titleLink.href = movie.file;
        titleLink.textContent = movie.title;
        title.appendChild(titleLink);

        var meta = document.createElement('p');
        meta.className = 'movie-meta';
        meta.textContent = movie.year + ' · ' + movie.region + ' · ' + movie.type;

        var desc = document.createElement('p');
        desc.className = 'movie-desc';
        desc.textContent = movie.desc;

        var tags = document.createElement('div');
        tags.className = 'tag-list';
        movie.tags.slice(0, 3).forEach(function (tag) {
            var span = document.createElement('span');
            span.textContent = tag;
            tags.appendChild(span);
        });

        body.appendChild(title);
        body.appendChild(meta);
        body.appendChild(desc);
        body.appendChild(tags);
        card.appendChild(link);
        card.appendChild(body);
        return card;
    }

    function initSearchPage() {
        var movies = window.SITE_MOVIES || [];
        var input = document.getElementById('searchInput');
        var region = document.getElementById('regionFilter');
        var type = document.getElementById('typeFilter');
        var year = document.getElementById('yearFilter');
        var form = document.querySelector('[data-search-form]');
        var results = document.getElementById('searchResults');
        var defaultHot = document.querySelector('[data-default-hot]');

        if (!input || !results) {
            return;
        }

        fillSelect(region, unique(movies, 'region'));
        fillSelect(type, unique(movies, 'type'));
        fillSelect(year, unique(movies, 'year').sort(function (a, b) { return b - a; }));

        input.value = getParam('q');

        function apply() {
            var keyword = input.value.trim().toLowerCase();
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';
            var items = movies.filter(function (movie) {
                var text = [movie.title, movie.desc, movie.region, movie.type, movie.genre, movie.tags.join(' ')].join(' ').toLowerCase();
                if (keyword && text.indexOf(keyword) === -1) {
                    return false;
                }
                if (regionValue && movie.region !== regionValue) {
                    return false;
                }
                if (typeValue && movie.type !== typeValue) {
                    return false;
                }
                if (yearValue && String(movie.year) !== String(yearValue)) {
                    return false;
                }
                return true;
            });

            results.innerHTML = '';
            var hasFilter = keyword || regionValue || typeValue || yearValue;
            if (defaultHot) {
                defaultHot.style.display = hasFilter ? 'none' : '';
            }
            if (!hasFilter) {
                return;
            }
            if (items.length === 0) {
                var empty = document.createElement('div');
                empty.className = 'empty-state';
                empty.textContent = '没有匹配的影片，请换一个关键词。';
                results.appendChild(empty);
                return;
            }
            items.slice(0, 240).forEach(function (movie) {
                results.appendChild(createCard(movie));
            });
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                apply();
            });
        }
        [input, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    document.addEventListener('DOMContentLoaded', initSearchPage);
}());
