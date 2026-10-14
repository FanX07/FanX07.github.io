
/* Mobile inline autoplay, with an explicit action when browser policy blocks it. */
(function () {
  function initPortfolioVideos() {
    document.querySelectorAll('video.renditions-video').forEach(function (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      var button;
      function hideButton() { if (button) { button.remove(); button = null; } }
      function showButton() {
        if (!video.paused || button) return;
        button = document.createElement('button');
        button.className = 'portfolio-video-play';
        button.type = 'button';
        button.textContent = '▶ Play video';
        button.setAttribute('aria-label', 'Play background video');
        button.addEventListener('click', function () {
          var playback = video.play();
          if (playback) playback.catch(function () { button.textContent = '▶ Retry video'; });
        });
        document.body.appendChild(button);
      }
      video.addEventListener('playing', hideButton);
      var playback = video.play();
      if (playback) playback.catch(showButton);
      setTimeout(showButton, 1500);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPortfolioVideos);
  else initPortfolioVideos();
})();

