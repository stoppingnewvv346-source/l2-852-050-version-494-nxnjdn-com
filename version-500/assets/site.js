(function () {
  function each(selector, callback) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), callback);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyMovieFilter(scope) {
    var root = scope || document;
    var search = root.querySelector('.movie-search');
    var region = root.querySelector('.movie-region-filter');
    var year = root.querySelector('.movie-year-filter');
    var keyword = normalize(search && search.value);
    var regionValue = normalize(region && region.value);
    var yearValue = normalize(year && year.value);

    each('.movie-card', function (card) {
      if (!root.contains(card)) {
        return;
      }

      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (regionValue && cardRegion.indexOf(regionValue) === -1) {
        matched = false;
      }

      if (yearValue && cardYear !== yearValue) {
        matched = false;
      }

      card.classList.toggle('is-hidden', !matched);
    });
  }

  var menuButton = document.querySelector('.menu-button');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var headerSearch = document.querySelector('.header-search .movie-search');
  if (headerSearch) {
    headerSearch.addEventListener('input', function () {
      applyMovieFilter(document);
    });
  }

  each('.movie-filter-area', function (area) {
    each('.movie-search, .movie-region-filter, .movie-year-filter', function (control) {
      if (area.contains(control)) {
        control.addEventListener('input', function () {
          applyMovieFilter(area);
        });
        control.addEventListener('change', function () {
          applyMovieFilter(area);
        });
      }
    });
  });

  var slides = document.querySelectorAll('.hero-slide');
  var dots = document.querySelectorAll('.hero-dot');
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    each('.hero-slide', function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });
    each('.hero-dot', function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  window.initMoviePlayer = function (videoId, buttonId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var started = false;

    function begin() {
      if (!video || !sourceUrl) {
        return;
      }

      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
        started = true;
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', begin);
    }
    if (overlay) {
      overlay.addEventListener('click', begin);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started || video.paused) {
          begin();
        }
      });
    }
  };
})();
