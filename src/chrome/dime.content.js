

  function injectScript() {
    var script = document.createElement('script'),
        body = document.getElementsByTagName('body')[0],
        workerscript = document.createElement('script');

    script.src = chrome.runtime.getURL('dime.logger.js');
    script.type = 'text/javascript';
    script.setAttribute('chrome', 'true');
    // Appending to body
    body.appendChild(script);

    window.addEventListener('message', (event) => {
      if(event.data && event.data.type && event.data.type === 'fromInjectedJStoHook') {
        console.log('hooking is done')
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
          console.log(`tabs.status = ${request.data.status}`)
          if (request.data.url) {
              console.log('url changed, parsing page')
              window.postMessage({
                type: 'fromContentScriptNotifyURLChanged',
                message: request.data.url
              }, '*');
          }
        });

        window.addEventListener('message', function(event) {
          if(event.data && event.data.type && event.data.type === 'compiledResult') {
            let {pageURL, frequentTerms, pageTexts, imageURLs, hyperlinks, title, openGraphProtocol, metaTags} = event.data.pageData
            let tags = frequentTerms.slice(0,5).map((term)=> {
              return {
                '@type': 'Tag',
                text: term,
                //auto: true,
                //date: Date.now()
              }
            })
            let dataWithDimeStructure = {
              '@type': 'DesktopEvent',
              type: 'http://www.semanticdesktop.org/ontologies/2010/01/25/nuao/#UsageEvent',
              actor: 'DiMe browser extension',
              start: Date.now(),
              targettedResource: {
                title: title,
                '@type': 'Document',
                type: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo/#PlainTextDocument',
                tags: tags,
                isStoredAs: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo/#RemoteDataObject',
                mimeType: 'application/json',
                plainTextContent: JSON.stringify({pageTexts, frequentTerms, imageURLs, hyperlinks, openGraphProtocol, metaTags}),
                uri: pageURL,
              }
            }
            //var data = JSON.stringify(dataWithDimeStructure, undefined, 4)
            //var blob = new Blob([data], {type: 'text/json'}),
            //    e    = document.createEvent('MouseEvents'),
            //    a    = document.createElement('a')
            //a.download = 'hiit.json'
            //a.href = window.URL.createObjectURL(blob)
            //a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
            //e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
            //a.dispatchEvent(e)
            chrome.runtime.sendMessage({dataWithDimeStructure: dataWithDimeStructure}, (response) => {
                //console.log(response)
            });

          }
        });

      }

    });
  }
  const notLocalhost = /^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/
  //Requesting variables from background page
  chrome.runtime.sendMessage({variable: 'enabled'}, function(response) {
    if (response.enabled)
      chrome.storage.local.get(['skipSites', 'disconnected'], (items)=> {
        let {skipSites, disconnected} = items
        if (disconnected)
          console.log('disconnected with dime, do nothing.')
        else
          if (skipSites.indexOf(window.location.href.replace(/.*?:\/\//g, "")) === -1 && !notLocalhost.test(window.location.href)) {
            console.log(`site is not in the filter list: ${skipSites}, continue`)
            injectScript();
          }
      })
    else
      console.log('dime extension is disable by user, wont do anything.')
  })
