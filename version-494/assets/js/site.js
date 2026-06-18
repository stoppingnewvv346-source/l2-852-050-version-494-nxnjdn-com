(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
      });
    });

    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var clearButton = document.querySelector('[data-filter-clear]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

  function applyFilter() {
    if (!filterInput || !cards.length) {
      return;
    }

    var query = filterInput.value.trim().toLowerCase();

    cards.forEach(function (card) {
      var terms = (card.getAttribute('data-terms') || '') + ' ' + (card.getAttribute('data-title') || '');
      card.classList.toggle('is-filter-hidden', query !== '' && terms.indexOf(query) === -1);
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (clearButton && filterInput) {
    clearButton.addEventListener('click', function () {
      filterInput.value = '';
      applyFilter();
      filterInput.focus();
    });
  }

  var video = document.querySelector('[data-player]');
  var trigger = document.querySelector('[data-player-trigger]');

  if (video) {
    var stream = video.getAttribute('data-stream');
    var hlsInstance = null;
    var isReady = false;
    var wantsPlay = false;

    function initializePlayer() {
      if (!stream || isReady) {
        return;
      }

      isReady = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (wantsPlay) {
            video.play().catch(function () {});
          }
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hlsInstance) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
            hlsInstance = null;
            isReady = false;
          }
        });
      } else {
        video.src = stream;
      }
    }

    function requestPlay() {
      wantsPlay = true;
      initializePlayer();
      video.play().catch(function () {});

      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    }

    initializePlayer();

    if (trigger) {
      trigger.addEventListener('click', requestPlay);
    }

    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        requestPlay();
      }
    });
  }
})();
