(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function text(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            function start() {
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                start();
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot") || 0));
                    restart();
                });
            });

            show(0);
            start();
        }

        var input = document.querySelector("[data-filter-input]");
        var reset = document.querySelector("[data-filter-reset]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";

        function applyFilter(value) {
            var query = text(value);
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = text([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-category"),
                    card.textContent
                ].join(" "));
                var matched = !query || haystack.indexOf(query) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", shown === 0);
            }
        }

        if (input) {
            if (q) {
                input.value = q;
            }
            input.addEventListener("input", function () {
                applyFilter(input.value);
            });
            applyFilter(input.value);
        }

        if (reset && input) {
            reset.addEventListener("click", function () {
                input.value = "";
                applyFilter("");
            });
        }

        document.querySelectorAll("[data-filter-value]").forEach(function (button) {
            button.addEventListener("click", function () {
                if (input) {
                    input.value = button.getAttribute("data-filter-value") || "";
                    applyFilter(input.value);
                }
            });
        });
    });
})();
