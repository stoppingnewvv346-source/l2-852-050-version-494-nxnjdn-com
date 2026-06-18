(function () {
    window.initMoviePlayer = function (url) {
        var video = document.getElementById("movieVideo");
        var button = document.querySelector("[data-play-button]");
        var message = document.querySelector("[data-player-message]");
        var hls = null;
        var prepared = false;

        function showMessage(value) {
            if (!message) {
                return;
            }
            message.textContent = value;
            message.classList.add("show");
        }

        function hideButton() {
            if (button) {
                button.classList.add("hidden");
            }
        }

        function prepare() {
            if (prepared || !video || !url) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage("播放遇到问题，请稍后再试");
                    }
                });
            } else {
                showMessage("播放遇到问题，请稍后再试");
            }
        }

        function play() {
            prepare();
            hideButton();
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (button) {
                        button.classList.remove("hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!prepared) {
                    play();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    };
})();
