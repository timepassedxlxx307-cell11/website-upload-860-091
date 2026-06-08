(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var texts = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-text]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;
      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
          slide.classList.toggle("active", idx === current);
        });
        texts.forEach(function (text, idx) {
          text.classList.toggle("active", idx === current);
        });
        dots.forEach(function (dot, idx) {
          dot.classList.toggle("active", idx === current);
        });
      }
      function play() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }
      dots.forEach(function (dot, idx) {
        dot.addEventListener("click", function () {
          if (timer) {
            window.clearInterval(timer);
          }
          show(idx);
          play();
        });
      });
      show(0);
      play();
    }

    var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
    bars.forEach(function (bar) {
      var scope = bar.parentElement || document;
      var input = bar.querySelector("[data-search-input]");
      var category = bar.querySelector("[data-category-filter]");
      var year = bar.querySelector("[data-year-filter]");
      var region = bar.querySelector("[data-region-filter]");
      var list = scope.querySelector("[data-card-list]") || document;
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
      function value(el) {
        return el ? el.value.trim().toLowerCase() : "";
      }
      function apply() {
        var q = value(input);
        var c = value(category);
        var y = value(year);
        var r = value(region);
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardCategory = (card.getAttribute("data-category") || "").toLowerCase();
          var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
          var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
          var matched = true;
          if (q && text.indexOf(q) === -1) {
            matched = false;
          }
          if (c && cardCategory !== c) {
            matched = false;
          }
          if (y && cardYear !== y) {
            matched = false;
          }
          if (r && cardRegion !== r) {
            matched = false;
          }
          card.classList.toggle("is-filter-hidden", !matched);
        });
      }
      [input, category, year, region].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      var params = new URLSearchParams(window.location.search);
      if (input && params.get("q")) {
        input.value = params.get("q");
      }
      apply();
    });
  });
})();

function initMoviePlayer(videoId, layerId, sourceUrl) {
  var video = document.getElementById(videoId);
  var layer = document.getElementById(layerId);
  var initialized = false;
  var hls = null;
  if (!video || !sourceUrl) {
    return;
  }

  function restoreLayer() {
    if (layer) {
      layer.classList.remove("is-hidden");
    }
    initialized = false;
  }

  function startPlayback() {
    if (initialized) {
      video.play().catch(function () {});
      return;
    }
    initialized = true;
    if (layer) {
      layer.classList.add("is-hidden");
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      video.play().catch(restoreLayer);
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(restoreLayer);
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hls) {
          hls.destroy();
          hls = null;
          video.src = sourceUrl;
        }
      });
      return;
    }
    video.src = sourceUrl;
    video.play().catch(restoreLayer);
  }

  if (layer) {
    layer.addEventListener("click", startPlayback);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });
}
