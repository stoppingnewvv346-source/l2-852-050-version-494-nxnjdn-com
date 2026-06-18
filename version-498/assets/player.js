(function () {
  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playOverlay");
    if (!video || !streamUrl) {
      return;
    }

    var loaded = false;
    var player = null;

    function bindVideo() {
      if (loaded) {
        return;
      }
      loaded = true;
      var HlsClass = window.HlsBundle && window.HlsBundle.H;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (HlsClass && HlsClass.isSupported()) {
        player = new HlsClass({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        player.loadSource(streamUrl);
        player.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback() {
      bindVideo();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(function () {
          video.controls = true;
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
      overlay.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          startPlayback();
        }
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (player && typeof player.destroy === "function") {
        player.destroy();
        player = null;
      }
    });
  };
})();
