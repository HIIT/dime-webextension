const chrome = chrome;

function injectScript() {
  const script = document.createElement('script');
  const body = document.getElementsByTagName('body')[0];
  script.src = chrome.runtime.getURL('dime.logger.js');
  script.type = 'text/javascript';
  script.setAttribute('chrome', 'true');
  body.appendChild(script);
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type && event.data.type === 'document') {
      chrome.runtime.sendMessage({ document: event.data.payload, url: window.location.href });
      // console.log('send document to background script');
    }
  });
}
chrome.runtime.onMessage.addListener((request) => {
  if (request.data.status === 'complete') {
    injectScript();
  }
});
