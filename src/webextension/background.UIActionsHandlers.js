const browser = chrome; // eslint-disable-line no-undef
import { checkEnable } from './content.stateCheckers';

const backgroundPage = window;

// Set Icons as enable/disable and Set storage.enable when user click on the Bar Icon
browser.browserAction.onClicked.addListener(() => {
  backgroundPage.checkDiMeAlive().then((alive) => {
    if (alive) {
      checkEnable().then((v) => {
        browser.storage.local.set({ enable: !v });
      });
    }
  });
});
