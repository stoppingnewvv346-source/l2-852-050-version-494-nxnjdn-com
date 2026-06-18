(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = Number(dot.getAttribute("data-hero-dot"));
                show(next);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        start();
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
        scopes.forEach(function (scope) {
            var container = document.querySelector("[data-card-container]");
            if (!container) {
                return;
            }
            var input = scope.querySelector("[data-filter-input]");
            var region = scope.querySelector("[data-region-filter]");
            var type = scope.querySelector("[data-type-filter]");
            var year = scope.querySelector("[data-year-filter]");
            var sort = scope.querySelector("[data-sort-select]");
            var empty = document.querySelector("[data-empty-state]");
            var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
            var initialQuery = getQueryValue("q");

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var q = normalize(input ? input.value : "");
                var selectedRegion = region ? region.value : "";
                var selectedType = type ? type.value : "";
                var selectedYear = year ? year.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
                        ok = false;
                    }
                    if (selectedType && card.getAttribute("data-type") !== selectedType) {
                        ok = false;
                    }
                    if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            function sortCards() {
                if (!sort) {
                    return;
                }
                var mode = sort.value;
                var ordered = cards.slice();
                ordered.sort(function (a, b) {
                    var ay = Number(a.getAttribute("data-year")) || 0;
                    var by = Number(b.getAttribute("data-year")) || 0;
                    var at = a.getAttribute("data-title") || "";
                    var bt = b.getAttribute("data-title") || "";
                    if (mode === "year-desc") {
                        return by - ay;
                    }
                    if (mode === "year-asc") {
                        return ay - by;
                    }
                    if (mode === "title") {
                        return at.localeCompare(bt, "zh-Hans-CN");
                    }
                    return cards.indexOf(a) - cards.indexOf(b);
                });
                ordered.forEach(function (card) {
                    container.appendChild(card);
                });
                cards = ordered;
                apply();
            }

            [input, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            if (sort) {
                sort.addEventListener("change", sortCards);
            }
            apply();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
