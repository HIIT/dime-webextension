;(function(undefined) {

  function injectScript() {
    var script = document.createElement('script'),
        body = document.getElementsByTagName('body')[0],
        workerscript = document.createElement('script');

    workerscript.src = chrome.runtime.getURL('RankTermsWebWorker.js');
    workerscript.type = 'text/javascript';
    workerscript.setAttribute('chrome', 'true');
    workerscript.setAttribute('id', 'worker-script')
    // Appending to body
    body.appendChild(workerscript);

    script.src = chrome.runtime.getURL('dime.logger.js');
    script.type = 'text/javascript';
    script.setAttribute('chrome', 'true');
    // Appending to body
    body.appendChild(script);

    window.addEventListener('message', function(event) {
      if(event.data && event.data.type && event.data.type === 'fromInjectedJStoHook') {
        console.log('hooking is done')
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
          if (request.data.url) {
              console.log('url changed, parsing page')
              window.postMessage({
                type: 'fromContentScriptNotifyURLChanged',
                message: request.data.url
              }, '*');
          }
        });

      }

    });
  }
  // Requesting variables from background page
  chrome.runtime.sendMessage({variable: 'enabled'}, function(response) {
    if (response.enabled)
      injectScript();
  });
}).call(this);
