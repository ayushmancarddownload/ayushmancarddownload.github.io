const repoOwner = "ayushmancarddownload";  // 🔹 Aapka GitHub username
const repoName = "ayushmancarddownload.github.io";         // 🔹 Aapka GitHub repository ka naam
const branch = "main";                     // 🔹 Aapka branch (main ya master)

const versionFilePath = "/version.json";   // 🔹 Version file ka path

// ✅ Function: GitHub API se latest commit hash fetch karna
async function getLatestCommit() {
    try {
        let response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/commits/${branch}`);
        let data = await response.json();
        return data.sha.substring(0, 7);  // 🔹 Sirf pehle 7 characters lenge (commit hash)
    } catch (error) {
        console.error("❌ Commit fetch failed!", error);
        return null;
    }
}

// ✅ Function: Version.json file se latest version lena
async function getStoredVersion() {
    try {
        let response = await fetch(versionFilePath + "?t=" + new Date().getTime());  // Cache bypass ke liye query param
        let data = await response.json();
        return data.version;
    } catch (error) {
        console.error("❌ Version.json fetch failed!", error);
        return null;
    }
}

// ✅ Function: Cache busting implement karna
function updateCache(version) {
    console.log("🔄 Updating cache with version:", version);

    // CSS aur JS files ko reload karna
    document.querySelectorAll("link[rel='stylesheet']").forEach(link => {
        link.href = link.href.split("?")[0] + "?v=" + version;
    });

    document.querySelectorAll("script").forEach(script => {
        if (script.src) {
            script.src = script.src.split("?")[0] + "?v=" + version;
        }
    });

    // Images ko bhi refresh karna
    document.querySelectorAll("img").forEach(img => {
        img.src = img.src.split("?")[0] + "?v=" + version;
    });
}

// ✅ Function: Check if version has changed
async function checkForUpdates() {
    let latestVersion = await getLatestCommit();
    let storedVersion = await getStoredVersion();
    let savedVersion = localStorage.getItem("site-version");

    console.log("📌 Latest Version:", latestVersion);
    console.log("📌 Stored Version:", storedVersion);
    console.log("📌 Saved Version (localStorage):", savedVersion);

    if (!latestVersion || !storedVersion) {
        console.log("⚠️ Could not fetch version data. Skipping update check.");
        return;
    }

    // ✅ Agar pehli baar load ho raha hai, to latest version ko localStorage me save karein
    if (!savedVersion) {
        localStorage.setItem("site-version", latestVersion);
        console.log("🔹 First-time visit. Setting version in localStorage:", latestVersion);
        return;
    }

    // ✅ Agar version change ho gaya hai, to tabhi update karein aur refresh karein
    if (latestVersion !== savedVersion) {
        console.log("🚀 New update detected! Reloading...");
        updateCache(latestVersion);
        localStorage.setItem("site-version", latestVersion);
        setTimeout(() => location.reload(), 1000);  // Auto-refresh after 1 sec
    } else {
        console.log("✅ Site is up to date.");
    }
}

// ✅ Auto-run script on page load
checkForUpdates();
