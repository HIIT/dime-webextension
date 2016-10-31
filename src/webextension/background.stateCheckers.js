const browser = chrome; // eslint-disable-line no-undef

function checkDiMeAlive() { // eslint-disable-line no-unused-vars
  return new Promise((resolve) => {
    browser.storage.local.get(['apiUrl'], (items) => {
      const { apiUrl } = items;
      if (apiUrl) {
        const req = new XMLHttpRequest();
        req.open('GET', `${apiUrl}/ping`, true);
        req.onreadystatechange = () => {
          if (req.status === 200 && req.readyState === 4) {
            browser.storage.local.set({ alive: true });
            resolve(true);
          } else if (req.readyState === 4) {
            browser.storage.local.set({ alive: false });
            browser.storage.local.get(['apiUrl'], () => {
              console.log(`connection with dime at ${items.apiUrl} error`); // eslint-disable-line no-console
            });
            resolve(false);
          }
        };
        req.send();
      }
    });
  });
}

window.checkDiMeAlive = checkDiMeAlive;
