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
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(next);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var typeSelect = panel.querySelector('[data-type-filter]');
    var yearSelect = panel.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function matches(card, query, typeValue, yearValue) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardType = card.getAttribute('data-type') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var queryMatch = !query || text.indexOf(query) !== -1;
      var typeMatch = !typeValue || cardType === typeValue || cardRegion === typeValue;
      var yearMatch = !yearValue || cardYear === yearValue;
      return queryMatch && typeMatch && yearMatch;
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : '';
      var yearValue = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        card.hidden = !matches(card, query, typeValue, yearValue);
      });
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });
})();
