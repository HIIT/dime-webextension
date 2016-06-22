/*
  Copyright (c) 2016 University of Helsinki

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

// Default settings
export const settings = {
    apiUrl: 'http://localhost:8080/api',
    username: 'testuser',
    password: 'testuser123',
    skipSites: [],
    enable: true
}

export var skipSites = [];

// Trim url to a simple domain name
function domainFromUrl (url) {
    url = url.trim();

    if (url.indexOf('http://') == 0)
        url = url.substring(7);
    if (url.indexOf('https://') == 0)
        url = url.substring(8);
    
    var slashPos = url.indexOf('/');
    if (slashPos >= 0)
        url = url.substr(0, slashPos);

    if (url.length < 3 && url.indexOf('.') === -1)
        url = '';

    return url;
}

// Update the internal skipSites list from the text field in settings
export function updateSkipSites(skipSitesText, apiUrl) {
    skipSites = [];
    var apiUrl = typeof apiUrl !== 'undefined' ?  apiUrl : settings.apiUrl;

    var apiDomain = domainFromUrl(apiUrl);
    var addApi = apiDomain !== '';

    for (var line of skipSitesText.split('\n')) {
        var domain = domainFromUrl(line);
        if (domain !== '') {
            skipSites.push(domain);
            if (domain === apiDomain)
                addApi = false;
        }
    }

    settings.skipSites = skipSites.join('\n');

    if (addApi)
        skipSites.push(apiDomain);

    // console.log("skipSites="+ skipSites);

    return skipSites;
}

// Update settings from local storage
export function updateSettings(callback) {
  chrome.storage.sync.get({
      apiUrl: settings.apiUrl,
      username: settings.username,
      password: settings.password,
      skipSites: settings.skipSites
  }, function(items) {
      settings.apiUrl = items.apiUrl;
      settings.username = items.username;
      settings.password = items.password;
      settings.skipSites = items.skipSites;
      updateSkipSites(settings.skipSites);
      if (typeof callback === 'function')
          callback(items);
  });
}

// Listener for settings changes by user
export function settingsChangeListener(changes, namespace) {
    if (namespace == 'local') {
        for (key in changes) {
            if (key in settings) {
                var value = changes[key].newValue;
                settings[key] = value;
                if (key === 'skipSites')
                    updateSkipSites(value);
            }
        }
    }
}
