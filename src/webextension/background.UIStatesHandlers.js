const browser = chrome; // eslint-disable-line no-undef

// Reflect Bar Icon stastus by the value in storage.enable
browser.storage.onChanged.addListener((v) => {
  // Set Icon as "disabled" when storage.enable is false
  browser.browserAction.setIcon({ path: {
    16: 'icon16.png',
    19: 'icon19.png',
    32: 'icon32.png',
    38: 'icon38.png',
    64: 'icon64.png',
  } });
  if (typeof v.currentPageSaved !== 'undefined' && v.currentPageSaved.newValue) {
    browser.browserAction.setIcon({ path: {
      16: 'icon-saved-16.png',
      19: 'icon-saved-19.png',
      32: 'icon-saved-32.png',
      38: 'icon-saved-38.png',
      64: 'icon-saved-64.png',
    } });
  }
  if (typeof v.enable !== 'undefined' && !v.enable.newValue) {
    browser.browserAction.setIcon({ path: {
      16: 'icon-disabled-16.png',
      19: 'icon-disabled-19.png',
      32: 'icon-disabled-32.png',
      38: 'icon-disabled-38.png',
      64: 'icon-disabled-64.png',
    } });
  }
  // Set Icon as "disconnected" when storage.alive is false
  if (typeof v.alive !== 'undefined' && !v.alive.newValue) {
    browser.browserAction.setIcon({ path: {
      16: 'icon-disconnected-16.png',
      19: 'icon-disconnected-19.png',
      32: 'icon-disconnected-32.png',
      38: 'icon-disconnected-38.png',
      64: 'icon-disconnected-64.png',
    } });
  }
});
