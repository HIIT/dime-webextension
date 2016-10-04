// Register for the page loaded event (used as end script)
safari.application.addEventListener('message', handleMessage, false); // eslint-disable-line no-undef

const excludedHostnames = ['talkgadget.google.com', 'hangouts.google.com'];

function logToDiMe(url, title, plainTextContent) {
  // console.log('Logging to DiMe: ' + url + ' - \'' + title + '\'');
  const data = JSON.stringify({
    '@type': 'DesktopEvent',
    type: 'http://www.semanticdesktop.org/ontologies/2010/01/25/nuao/#UsageEvent',
    actor: 'DiMe Safari browser extension',
    start: Date.now(),
    targettedResource: {
      '@type': 'Document',
      isStoredAs: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo/#RemoteDataObject',
      mimeType: 'text/html',
      plainTextContent,
      type: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo/#HtmlDocument',
      uri: url,
      title,
    },
  });
  const req = new XMLHttpRequest();
  req.addEventListener('load', () => {
    if (this.status >= 400) {
      // console.log('Error: ' + this.statusText);
    }
  });

  // Note: username here is not actually used but is a placeholder. Actual username comes from keychain.
  const username = safari.extension.settings.username; // eslint-disable-line no-undef
  const password = safari.extension.settings.password; // eslint-disable-line no-undef
  const apiUrl = safari.extension.settings.apiUrl; // eslint-disable-line no-undef
  req.open('POST', `${apiUrl}/data/event`);
  req.setRequestHeader('Content-type', 'application/json');
  req.setRequestHeader('Authorization', `Basic ${btoa(`${username}:${password}`)}`);
  req.send(data);
}

function handleMessage(event) {
  // Check that name of event matches pageLoaded, which is what is sent from injected script
  // if, so call its handler
  if (event.name === 'pageLoaded') {
    handlePageLoadedMessage(event);
  }
}

function handlePageLoadedMessage(event) {
  const url = new URL(event.message.uri);
  const apiUrl = new URL(safari.extension.settings.apiUrl); // eslint-disable-line no-undef

  // Extra check is necessary because initial (default) settings are strings, but when modified are bool
  const trackApiUrl = xToBool(safari.extension.settings.trackApiUrl); // eslint-disable-line no-undef

  // Skip if we are logging the same url as dime's url and the relative option is not set
  if (url.hostname.indexOf(apiUrl.hostname) !== -1 && !trackApiUrl) {
    return;
  }

  // Extra check is necessary because initial (default) settings are strings, but when modified are bool
  const trackLocalhost = xToBool(safari.extension.settings.trackLocalhost); // eslint-disable-line no-undef

  // if url contains localhost, only send if we want to track localhost
  if (url.hostname.indexOf('localhost') !== -1 && !trackLocalhost) {
    return;
  }

  // Skip if we are in private browsing mode
  if (safari.application.activeBrowserWindow.activeTab.private) { // eslint-disable-line no-undef
    return;
  }

  // Skip hits to topsites
  if (url.protocol.indexOf('topsites') === 0) {
    return;
  }

  // Skip hits to favorites
  if (url.protocol.indexOf('favorites') === 0) {
    return;
  }

  // Skip excluded host names
  for (const i of excludedHostnames) {
    if (url.hostname.endsWith(excludedHostnames[i])) {
      return;
    }
  }

  // If we managed to get here, send to dime
  logToDiMe(event.message.uri, event.message.title, event.message.text);
}

function xToBool(x) {
  return x === true || String(x).toLowerCase() === 'true';
}
