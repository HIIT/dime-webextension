import DomURL from 'domurl';
const browser = chrome; // eslint-disable-line no-undef

export function checkEnable() { // eslint-disable-line no-unused-vars
  return new Promise((resolve) => {
    browser.storage.local.get(['enable'], (v) => {
      resolve(v.enable);
    });
  });
}

export function checkBlockList(tab) { // eslint-disable-line no-unused-vars
  return new Promise((resolve) => {
    browser.storage.local.get(['skipSites'], (v) => {
      const skipSiteArray = [];
      const currentURL = new DomURL(tab.url);
      const hostPlusPort = currentURL.host + ((currentURL.port.length > 0) ? `:${currentURL.port}` : '');
      for (const line of v.skipSites.split('\n')) {
        if (line !== '') {
          skipSiteArray.push(line);
        }
      }
      const WWWskipSiteArray = skipSiteArray.map(i => `www.${i}`);
      if (skipSiteArray.indexOf(hostPlusPort) === -1 && WWWskipSiteArray.indexOf(hostPlusPort) === -1 && skipSiteArray.indexOf(hostPlusPort) === -1) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}
