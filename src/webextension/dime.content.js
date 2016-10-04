chrome.runtime.onMessage.addListener((tab) => { // eslint-disable-line no-undef
  if (tab.status === 'complete') {
    console.log(tab)
    chrome.runtime.sendMessage({ // eslint-disable-line no-undef
      document: {
        innerHTML: document.body.innerHTML,
        title: document.title,
        innerText: document.all[0].innerText,
      },
      url: window.location.href,
    });
  }
});
