import { checkEnable, checkBlockList } from './content.stateCheckers';
const browser = chrome; // eslint-disable-line no-undef

async function initTracking() {
  const enable = await checkEnable();
  if (!enable) {
    return;
  }
  chrome.runtime.onMessage.addListener((tabID, tab) => { // eslint-disable-line no-undef
    checkBlockList(tab).then((notInBlockList) => {
      if (notInBlockList) {
        browser.runtime.sendMessage({
          document: {
            innerHTML: document.body.innerHTML,
            title: document.title,
            innerText: document.all[0].innerText,
          },
          url: window.location.href,
        });
        return;
      }
    });
  });
}

initTracking();
