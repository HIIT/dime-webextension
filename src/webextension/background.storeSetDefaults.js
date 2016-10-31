const browser = chrome; // eslint-disable-line no-undef
const defaultSettings = {
  apiUrl: 'http://localhost:8080/api',
  username: 'testuser',
  password: 'testuser123',
  skipSites: 'localhost:8080\n',
  enable: true,
  alive: false,
  currentPageSaved: false,
};

// Set defaultSettings when browser.storage.get return null
browser.storage.local.get((v) => {
  if (typeof v.apiUrl === 'undefined') browser.storage.local.set({ apiUrl: defaultSettings.apiUrl });
  if (typeof v.username === 'undefined') browser.storage.local.set({ username: defaultSettings.username });
  if (typeof v.password === 'undefined') browser.storage.local.set({ password: defaultSettings.password });
  if (typeof v.skipSites === 'undefined') browser.storage.local.set({ skipSites: defaultSettings.skipSites });
  if (typeof v.enable === 'undefined') browser.storage.local.set({ enable: defaultSettings.enable });
  if (typeof v.alive === 'undefined') browser.storage.local.set({ alive: defaultSettings.alive });
  if (typeof v.currentPageSaved === 'undefined') browser.storage.local.set({ currentPageSaved: defaultSettings.currentPageSaved });
});
