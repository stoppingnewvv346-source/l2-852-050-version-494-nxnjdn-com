(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("mainNav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function startCarousel() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5800);
    }

    function stopCarousel() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        stopCarousel();
        showSlide(i);
        startCarousel();
      });
    });

    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        stopCarousel();
        showSlide(current - 1);
        startCarousel();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        stopCarousel();
        showSlide(current + 1);
        startCarousel();
      });
    }
    showSlide(0);
    startCarousel();

    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var q = input ? input.value.trim() : "";
        var target = form.getAttribute("data-target") || "./rankings.html";
        window.location.href = q ? target + "?q=" + encodeURIComponent(q) : target;
      });
    });

    var searchInput = document.getElementById("movieSearch");
    var yearFilter = document.getElementById("yearFilter");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    var empty = document.getElementById("emptyState");
    var params = new URLSearchParams(window.location.search);
    var initialQ = params.get("q");
    if (searchInput && initialQ) {
      searchInput.value = initialQ;
    }

    function applyFilters() {
      var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var year = yearFilter ? yearFilter.value : "";
      var visible = 0;
      items.forEach(function (item) {
        var text = (item.getAttribute("data-search") || "").toLowerCase();
        var itemYear = item.getAttribute("data-year") || "";
        var matchesText = !q || text.indexOf(q) !== -1;
        var matchesYear = !year || itemYear === year;
        var show = matchesText && matchesYear;
        item.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", applyFilters);
    }
    if (searchInput || yearFilter) {
      applyFilters();
    }
  });
})();
