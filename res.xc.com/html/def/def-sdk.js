window.PokiSDK = {
  init: function () {
    console.log('__init');
    return new Promise(((r, c) => { r(); }));
  },
  initWithVideoHB: function () {
    console.log('__initWithVideoHB');
    return new Promise(((r, c) => { r(); }));
  },
  commercialBreak: function () {
    console.log('__commercialBreak');
    return new Promise(((r, c) => { r(); }));
  },
  rewardedBreak: function (pauseFn) {
    // 发送分享请求到父窗口
    if (window.parent) {
      window.parent.postMessage({
        type: 'SHOW_SHARE_DIALOG'
      }, 'https://xc.com'); // 必须指定目标origin
    }
    if (typeof pauseFn === 'function') pauseFn();
    return new Promise((resolve, reject) => {
      // 监听父窗口响应
      const messageHandler = (event) => {
        // 安全验证
        if (event.origin !== 'https://xc.com') return;

        if (event.data.type === 'XC_GAME_INIT') {
          window.removeEventListener('message', messageHandler);
          if (event.data.success) {
            resolve(event.data.result);
          } else {
            reject(event.data.error);
          }
        }
      };
      window.addEventListener('message', messageHandler);
      // 通知父窗口初始化游戏
      if (window.parent) {
        window.parent.postMessage({
          type: 'XC_GAME_INIT_REQUEST'
        }, 'https://xc.com');
      }
    });
  },
  displayAd: function () { console.log('__displayAd'); },
  destroyAd: function () { console.log('__doNothing'); },
  getLeaderboard: function () { console.log('__handleAutoResolvePromise'); },
  shareableURL: function () {
    console.log('__shareableURL');
    return new Promise(((r, c) => { c(); }));
  },
  getURLParam: function (e) {
    console.log('e:' + e);
    return '';
  },
  getLanguage: function () { return navigator.language.toLowerCase().split('-')[0]; },
  isAdBlocked: function () { console.log('__isAdBlocked'); },


  captureError: function () { console.log('__captureError'); },
  customEvent: function () { console.log('__customEvent'); },
  gameInteractive: function () { console.log('__gameInteractive'); },
  gameLoadingFinished: function () { console.log('__gameLoadingFinished'); },
  gameLoadingProgress: function () { console.log('__gameLoadingProgress'); },
  gameLoadingStart: function () { console.log('__gameLoadingStart'); },
  gameplayStart: function () { console.log('__gameplayStart'); },
  gameplayStop: function () { console.log('__gameplayStop'); },
  happyTime: function () { console.log('__happyTime'); },

  setDebug: function () { console.log('__setDebug'); },
  logError: function () { console.log('__logError'); },
  setLogging: function () { console.log('__setLogging'); },
  setPlayerAge: function () { console.log('__setPlayerAge'); },
  setPlaytestCanvas: function () { console.log('__setPlaytestCanvas'); },

  measure: function () { console.log('__measure'); },
  muteAd: function () { console.log('__muteAd'); },
  roundEnd: function () { console.log('__roundEnd'); },
  roundStart: function () { console.log('__roundStart'); },
  sendHighscore: function () { console.log('__sendHighscore'); },
  setDebugTouchOverlayController: function () { console.log('__setDebugTouchOverlayController'); },
  enableEventTracking: function () { console.log('__enableEventTracking'); },

  playtestSetCanvas: function () { console.log('__playtestSetCanvas'); },
  playtestCaptureHtmlOnce: function () { console.log('__playtestCaptureHtmlOnce'); },
  playtestCaptureHtmlForce: function () { console.log('__playtestCaptureHtmlForce'); },
  playtestCaptureHtmlOn: function () { console.log('__playtestCaptureHtmlOn'); },
  playtestCaptureHtmlOff: function () { console.log('__playtestCaptureHtmlOff'); },
}
