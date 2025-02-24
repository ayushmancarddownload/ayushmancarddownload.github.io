   const iframe = document.getElementById("gameFrame");
        const loading = document.getElementById("loading");

        iframe.onload = function () {
            loading.style.display = "none"; // Hide loading text
            iframe.style.display = "block"; // Show iframe
        };
