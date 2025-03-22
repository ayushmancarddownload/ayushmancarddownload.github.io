<script>
document.addEventListener("DOMContentLoaded", function () {
    let engagementTime = localStorage.getItem("engagementTime") || 0;
    let active = false;
    let lastActiveTime = Date.now();
    let iframe = document.querySelector("iframe"); // Iframe select karein

    function startTracking() {
        if (!active) {
            active = true;
            lastActiveTime = Date.now();
        }
    }

    function stopTracking() {
        if (active) {
            engagementTime += Date.now() - lastActiveTime;
            localStorage.setItem("engagementTime", engagementTime);
            active = false;
        }
    }

    function sendToGA() {
        if (typeof gtag === "function") {
            let totalTime = (engagementTime / 1000).toFixed(2); // Milliseconds to seconds
            gtag("event", "game_engagement", {
                event_category: "User Engagement",
                event_label: window.location.pathname,
                value: totalTime
            });
            console.log("GA Event Sent: Game Engagement Time -", totalTime, "seconds");
        }
    }

    // Jab iframe focus me ho (User game khel raha hai)
    iframe.addEventListener("mouseenter", startTracking);
    iframe.addEventListener("mouseleave", stopTracking);

    // Jab page minimize ho ya tab switch kare
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            stopTracking();
        } else {
            lastActiveTime = Date.now();
        }
    });

    // Page close hone se pehle stop kare
    window.addEventListener("beforeunload", stopTracking);

    // Har 10 second me data GA4 me bheje
    setInterval(() => {
        sendToGA();
    }, 500);
});
</script>
