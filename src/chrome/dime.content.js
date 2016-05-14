function injectScript() {
  let script = document.createElement('script')
  let body = document.getElementsByTagName('body')[0]
  script.src = chrome.runtime.getURL('dime.logger.js')
  script.type = 'text/javascript';
  script.setAttribute('chrome', 'true')
  body.appendChild(script);
  window.addEventListener('message', function(event) {
    if(event.data && event.data.type && event.data.type === 'pageDataWithDimeStructure') {
      chrome.runtime.sendMessage({dataWithDimeStructure: event.data.payload})
    }
  })
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.data.url) {
    console.log('tab url changed')
    chrome.storage.local.get(['skipSites'], (v)=> {
      let {skipSites} = v
      const notLocalhost = /^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/
      if (skipSites.indexOf(window.location.href.replace(/.*?:\/\//g, "")) === -1 && !notLocalhost.test(window.location.href))
        //console.log(`site is not in the filter list: ${skipSites}, continue`)
        injectScript();
    })
  }
})


