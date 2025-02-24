function toggleFullscreen() {
    const gameContainer = document.querySelector(".game-container");
    const gameFrame = document.getElementById("gameFrame");

    if (document.fullscreenElement) {
        document.exitFullscreen().then(() => {
            gameFrame.style.width = "100%";
            gameFrame.style.height = "450px";
        });
    } else {
        gameContainer.requestFullscreen().then(() => {
            gameFrame.style.width = "100vw";
            gameFrame.style.height = "100vh";
        });
    }
}
