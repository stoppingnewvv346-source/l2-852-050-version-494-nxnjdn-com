(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });

    function setupMenu() {
        var header = document.querySelector(".site-header");
        var button = document.querySelector(".menu-toggle");
        if (!header || !button) {
            return;
        }
        button.addEventListener("click", function () {
            var open = header.classList.toggle("menu-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slider = document.querySelector(".hero-slider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-control.prev");
        var next = slider.querySelector(".hero-control.next");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", play);
        play();
    }

    function setupFilters() {
        var panel = document.querySelector(".filter-panel");
        var grid = document.querySelector("[data-search-grid]");
        if (!panel || !grid) {
            return;
        }
        var input = panel.querySelector(".site-search");
        var filters = Array.prototype.slice.call(panel.querySelectorAll(".site-filter"));
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".searchable-card"));
        var empty = document.querySelector(".empty-result");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial && input) {
            input.value = initial;
        }

        function matches(card) {
            var query = input ? input.value.trim().toLowerCase() : "";
            var pool = [
                card.textContent || "",
                card.getAttribute("data-title") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-type") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-genre") || "",
                card.getAttribute("data-tags") || ""
            ].join(" ").toLowerCase();
            if (query && pool.indexOf(query) === -1) {
                return false;
            }
            for (var i = 0; i < filters.length; i += 1) {
                var filter = filters[i];
                var value = filter.value;
                var field = filter.getAttribute("data-filter");
                if (value && (card.getAttribute("data-" + field) || "") !== value) {
                    return false;
                }
            }
            return true;
        }

        function apply() {
            var shown = 0;
            cards.forEach(function (card) {
                var ok = matches(card);
                card.hidden = !ok;
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        filters.forEach(function (filter) {
            filter.addEventListener("change", apply);
        });
        apply();
    }

    function setupPlayer() {
        var video = document.getElementById("moviePlayer");
        var cover = document.getElementById("playCover");
        var message = document.getElementById("playerMessage");
        var mediaUrl = window.__currentStream || "";
        if (!video || !cover || !mediaUrl) {
            return;
        }
        var prepared = false;
        var hls = null;

        function showMessage(value) {
            if (!message) {
                return;
            }
            message.textContent = value;
            message.hidden = !value;
        }

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = mediaUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(mediaUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage("视频暂时无法播放，请稍后再试");
                    }
                });
                return;
            }
            video.src = mediaUrl;
        }

        function start() {
            prepare();
            cover.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            var action = video.play();
            if (action && action.catch) {
                action.catch(function () {
                    showMessage("点击视频区域继续播放");
                });
            }
        }

        cover.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!prepared || video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
}());
