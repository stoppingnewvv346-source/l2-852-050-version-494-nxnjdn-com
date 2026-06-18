(function () {
    var header = document.getElementById('siteHeader');
    var toggle = document.querySelector('.menu-toggle');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 18) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle && header) {
        toggle.addEventListener('click', function () {
            var open = header.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showHero(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function startHero() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showHero(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showHero(index - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showHero(index + 1);
                startHero();
            });
        }

        showHero(0);
        startHero();
    }

    var searchInput = document.querySelector('.js-card-search');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var activeFilter = 'all';

    function applyCards() {
        if (!cards.length) {
            return;
        }
        var term = searchInput ? searchInput.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var matchText = !term || text.indexOf(term) !== -1;
            var matchFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
            card.classList.toggle('is-hidden-by-filter', !(matchText && matchFilter));
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            searchInput.value = q;
        }
        searchInput.addEventListener('input', applyCards);
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeFilter = chip.getAttribute('data-filter') || 'all';
            chips.forEach(function (item) {
                item.classList.toggle('active', item === chip);
            });
            applyCards();
        });
    });

    applyCards();
})();

function initMoviePlayer(source) {
    var shell = document.querySelector('[data-player]');
    if (!shell) {
        return;
    }

    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var prepared = false;
    var hls = null;

    function attach() {
        if (!video || prepared) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        prepared = true;
    }

    function play() {
        attach();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        video.setAttribute('controls', 'controls');
        var action = video.play();
        if (action && typeof action.catch === 'function') {
            action.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', play);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!prepared || video.paused) {
                play();
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
