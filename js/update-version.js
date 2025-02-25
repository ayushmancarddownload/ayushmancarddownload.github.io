const repoOwner = "ayushmancarddownload";  // 🔹 Aapka GitHub username
const repoName = "ayushmancarddownload.github.io";         // 🔹 Aapka GitHub repository ka naam
const branch = "main";                     // 🔹 Aapka branch (main ya master)

const versionFilePath = "/version.json";   // 🔹 Version file ka path

// ✅ GitHub API se latest commit ID fetch karna
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

// ✅ Version.json file update karna
async function updateVersionFile() {
    let latestVersion = await getLatestCommit();
    if (!latestVersion) return;

    let newVersionData = JSON.stringify({ version: latestVersion }, null, 2);

    // GitHub API ke through version.json update karna (manual process ke bina)
    console.log("✅ New version detected:", latestVersion);
    console.log("📌 Now manually update 'version.json' in GitHub repository.");
}

// ✅ Auto-update function call karein
updateVersionFile();
