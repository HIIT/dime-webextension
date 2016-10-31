const browser = chrome; // eslint-disable-line no-undef
const backgroundPage = window;
import { checkEnable, checkBlockList } from './content.stateCheckers';

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  initSendTabDataToContentScript(tabId, changeInfo, tab);
});

async function initSendTabDataToContentScript(tabId, changeInfo, tab) {
  if (changeInfo.status && changeInfo.status === 'complete' && tab.url && tab.url !== 'chrome://newtab/') {
    const enable = await checkEnable();
    if (!enable) {
      return;
    }
    const notInBlockList = await checkBlockList(tab);
    if (!notInBlockList) {
      return;
    }
    const alive = await backgroundPage.checkDiMeAlive();
    if (!alive) {
      return;
    }
    browser.tabs.sendMessage(tabId, tab);
    browser.storage.local.set({ currentPageSaved: false });
  }
}
