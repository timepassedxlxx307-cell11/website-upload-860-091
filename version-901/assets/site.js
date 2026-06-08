const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
  const slides = Array.from(hero.querySelectorAll(".hero-slide"));
  const dots = Array.from(hero.querySelectorAll(".hero-dot"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let index = 0;
  let timer = null;

  const showSlide = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });
  };

  const start = () => {
    timer = window.setInterval(() => showSlide(index + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      stop();
      showSlide(Number(dot.dataset.slideTo || 0));
      start();
    });
  });

  if (prev) {
    prev.addEventListener("click", () => {
      stop();
      showSlide(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      stop();
      showSlide(index + 1);
      start();
    });
  }

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  start();
}

const normalize = (value) => (value || "").toString().trim().toLowerCase();
const searchInputs = Array.from(document.querySelectorAll(".site-search-input"));
const filterButtons = Array.from(document.querySelectorAll(".filter-chip"));
const cards = Array.from(document.querySelectorAll(".movie-card, .compact-card"));
let activeFilter = "";

const applyFilters = () => {
  const query = normalize(searchInputs.map((input) => input.value).find(Boolean) || "");
  cards.forEach((card) => {
    const text = normalize(`${card.dataset.title || ""} ${card.dataset.meta || ""} ${card.textContent || ""}`);
    const matchesQuery = !query || text.includes(query);
    const matchesFilter = !activeFilter || text.includes(activeFilter);
    card.hidden = !(matchesQuery && matchesFilter);
  });
};

searchInputs.forEach((input) => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q) {
    input.value = q;
  }
  input.addEventListener("input", applyFilters);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = normalize(button.dataset.filter || "");
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    applyFilters();
  });
});

applyFilters();

const attachStream = async (video) => {
  const stream = video.dataset.stream;
  if (!stream || video.dataset.ready === "true") {
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = stream;
    video.dataset.ready = "true";
    return;
  }

  try {
    const module = await import("./hls-vendor-bbsaiqh1.js");
    const Hls = module.H;
    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsPlayer = hls;
      video.dataset.ready = "true";
      return;
    }
  } catch (error) {
  }

  video.src = stream;
  video.dataset.ready = "true";
};

const playVideo = async (video, overlay) => {
  await attachStream(video);
  if (overlay) {
    overlay.hidden = true;
  }
  video.controls = true;
  try {
    await video.play();
  } catch (error) {
    if (overlay) {
      overlay.hidden = false;
    }
  }
};

Array.from(document.querySelectorAll(".video-frame")).forEach((frame) => {
  const video = frame.querySelector("video");
  const overlay = frame.querySelector(".play-overlay");
  if (!video) {
    return;
  }
  if (overlay) {
    overlay.addEventListener("click", () => playVideo(video, overlay));
  }
  video.addEventListener("click", () => playVideo(video, overlay));
});
