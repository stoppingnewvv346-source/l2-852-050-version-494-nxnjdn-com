(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      document.body.classList.toggle('menu-open', nav.classList.contains('open'));
    });
  }

  function setupBackToTop() {
    var button = document.querySelector('[data-back-top]');

    if (!button) {
      return;
    }

    window.addEventListener('scroll', function () {
      button.classList.toggle('show', window.scrollY > 420);
    });

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function setupHeroSlider() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5800);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    selectAll('[data-filter-panel]').forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = panel.querySelector('[data-filter-input]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var reset = panel.querySelector('[data-filter-reset]');
      var count = panel.querySelector('[data-filter-count]');
      var cards = selectAll('.filter-card', scope);

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : '';
      }

      function apply() {
        var keyword = valueOf(input);
        var selectedType = valueOf(type);
        var selectedYear = valueOf(year);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' ').toLowerCase();
          var cardType = (card.getAttribute('data-type') || '').toLowerCase();
          var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }

          if (selectedType && cardType.indexOf(selectedType) === -1) {
            matched = false;
          }

          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }

          card.classList.toggle('is-hidden', !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + ' 个结果';
        }
      }

      [input, type, year].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (type) {
            type.value = '';
          }
          if (year) {
            year.value = '';
          }
          apply();
        });
      }

      apply();
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <div class="poster-frame">',
      '      <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <div class="poster-overlay"><span class="poster-play">▶</span></div>',
      '      <span class="quality-badge">高清</span>',
      '    </div>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-card-kicker"><a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.year) + '</span></div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-tags">' + tags + '</div>',
      '    <div class="movie-card-footer"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var app = document.querySelector('[data-search-app]');

    if (!app || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var form = app.querySelector('[data-search-form]');
    var input = app.querySelector('[data-search-input]');
    var status = app.querySelector('[data-search-status]');
    var results = app.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function render() {
      var keyword = (input ? input.value : '').trim().toLowerCase();

      if (!keyword) {
        status.textContent = '请输入关键词开始搜索。';
        results.innerHTML = '';
        return;
      }

      var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        return [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 120);

      status.textContent = '找到 ' + matched.length + ' 个结果。';
      results.innerHTML = matched.map(createSearchCard).join('');
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input ? input.value.trim() : '';
        var nextUrl = query ? ('search.html?q=' + encodeURIComponent(query)) : 'search.html';
        window.history.replaceState({}, '', nextUrl);
        render();
      });
    }

    if (input) {
      input.addEventListener('input', render);
    }

    render();
  }

  function setupPlayers() {
    selectAll('.movie-player').forEach(function (player) {
      var video = player.querySelector('video');
      var trigger = player.querySelector('[data-player-trigger]');
      var source = player.getAttribute('data-video-src');
      var initialized = false;
      var hls = null;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (initialized) {
          return Promise.resolve();
        }

        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            window.setTimeout(resolve, 1400);
          });
        }

        video.src = source;
        return Promise.resolve();
      }

      function playVideo() {
        attachSource().then(function () {
          var playPromise = video.play();

          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              video.controls = true;
            });
          }

          player.classList.add('playing');
        });
      }

      if (trigger) {
        trigger.addEventListener('click', playVideo);
      }

      video.addEventListener('play', function () {
        player.classList.add('playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('playing');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  function setupShareButtons() {
    selectAll('[data-share-button]').forEach(function (button) {
      button.addEventListener('click', function () {
        var url = window.location.href;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            button.textContent = '已复制';
            window.setTimeout(function () {
              button.textContent = '复制链接';
            }, 1600);
          });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupBackToTop();
    setupHeroSlider();
    setupFilters();
    setupSearchPage();
    setupPlayers();
    setupShareButtons();
  });
})();
