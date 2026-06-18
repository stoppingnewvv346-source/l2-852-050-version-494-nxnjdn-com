(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var stream = video ? video.getAttribute('data-stream') : '';
    var attached = false;
    var hls = null;

    function attachStream() {
      if (!video || !stream || attached) {
        return;
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      attachStream();
      player.classList.add('is-playing');
      if (video) {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    }
  });
})();
