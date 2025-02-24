// flscrn-gm.js
function toggleFullscreen() {
  const iframe = document.getElementById('gameFrame');
  if (!document.fullscreenElement) {
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.mozRequestFullScreen) {
      iframe.mozRequestFullScreen();
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
      iframe.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// scroll2top.js
window.onscroll = function() {
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
};

document.getElementById('scrollToTopBtn').onclick = function() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
};
