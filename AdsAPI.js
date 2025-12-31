window.addEventListener('message', event => {
    // IMPORTANT: check the origin of the data! 
    console.log(event.origin);

    if (event.origin.startsWith('https://kingal.net') || event.origin.startsWith('https://gaamess.com') || event.origin.startsWith('https://gaamess.mx') || event.origin.startsWith('https://gaamess.ch') || event.origin.startsWith('https://gaamess.de') || event.origin.startsWith('https://gaamess.es') || event.origin.startsWith('https://gaamess.fr') || event.origin.startsWith('https://topgames.ai') || event.origin.startsWith('https://gaamess.dk') || event.origin.startsWith('https://gaamess.nl') || event.origin.startsWith('https://crazygames.gg') || event.origin.startsWith('https://gaamess.cc') || event.origin.startsWith('https://femoi.uk') || event.origin.startsWith('https://femoi.dk') || event.origin.startsWith('https://mybestgames.net') || event.origin.startsWith('https://gamesim.net') || event.origin.startsWith('https://mybestgames.dk') || event.origin.startsWith('https://gudplay.es') || event.origin.startsWith('https://friv.gg') || event.origin.startsWith('https://aking.io') || event.origin.startsWith('https://aking.es') || event.origin.startsWith('https://aking.dk') || event.origin.startsWith('https://m.mixgame.net') || event.origin.startsWith('https://femoi.fr') || event.origin.startsWith('https://gaamess.kr') || event.origin.startsWith('https://gaamess.fun') || event.origin.startsWith('https://gaamess.io') || event.origin.startsWith('https://gaamess.us') || event.origin.startsWith('https://coolmathplay.com') || event.origin.startsWith('https://poki.ac') ) {
        // The data was sent from your site.
        // Data sent with postMessage is stored in event.data:
        //console.log(event.data);
        if (event.data == "Poki_Pause") {
            window._AWAY_DEBUG_PLAYER_.player.pause();
        }

        if (event.data == "Poki_Resume") {
            window._AWAY_DEBUG_PLAYER_.player.unPause();
            window.flash.commercialBreakCompleted();
        }

        if (event.data == "Flash_Pause") {
            document.querySelector("#container").querySelector("ruffle-player").shadowRoot.host.instance.pause();
        }

        if (event.data == "Flash_Resume") {
            document.querySelector("#container").querySelector("ruffle-player").shadowRoot.host.instance.play();
        }

        if (event.data == "C3_Pause") {
            c3_runtimeInterface._GetLocalRuntime().SetSuspended(true);
        }

        if (event.data == "C3_Resume") {
            c3_runtimeInterface._GetLocalRuntime().SetSuspended(false);
        }

        if (event.data == "C2_Pause") {
            window["cr_setSuspended"](true);
            cr.plugins_.Audio.prototype.acts.SetMasterVolume(1000000000);
        }

        if (event.data == "C2_Resume") {
            window["cr_setSuspended"](false);
            cr.plugins_.Audio.prototype.acts.SetMasterVolume(0);
        }


    } else {
        // The data was NOT sent from your site! 
        // Be careful! Do not use it. This else branch is
        // here just for clarity, you usually shouldn't need it.
        return;
    }
});

function showAd(platform) {
    //get the approved domain to sent request.
    var url = (window.location != window.parent.location) ?
        document.referrer :
        document.location.href;

    if (platform == "Flash") {
        window.parent.postMessage("Flash_ShowAd", url);
        return;
    }

    if (platform == "C3") {
        window.parent.postMessage("C3_ShowAd", url);
        return;
    }

    if (platform == "C2") {
        window.parent.postMessage("C2_ShowAd", url);
        return;
    }

    if (platform == "Poki") {
        window.parent.postMessage("Poki_ShowAd", url);
        return;
    }

    if (platform == "none") {
        window.parent.postMessage("none", url);
        return;
    }
}