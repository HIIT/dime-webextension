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

// Ping DiMe
var pingDiMe = function() {
    var req = new XMLHttpRequest();
    req.open("GET", apiUrl + "/ping");
    req.send(null);
}

// Log a visited web page to DiMe
var logToDiMe = function(url, title, plainTextContent) {
    var domain = domainFromUrl(url);
    for (var skipUrl of skipSites) {
        if (domain.indexOf(skipUrl) >= 0) {
            console.log('DiMe logger: skipping ' + url)
            return;
        }
    }

    console.log('DiMe logger: logging ' + url);
    var data = JSON.stringify({
        '@type': 'DesktopEvent',
        type: 'http://www.semanticdesktop.org/ontologies/2010/01/25/nuao#UsageEvent',
        actor: 'DiMe browser extension',
        start: Date.now(),
        targettedResource: {
            '@type': 'Document',
            isStoredAs: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#RemoteDataObject',
            mimeType: 'text/html', 
            plainTextContent: plainTextContent,
            type: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#Document', 
            uri: url, 
            title: title,
            plainTextContent: plainTextContent
        }
    });
    var req = new XMLHttpRequest();
    req.addEventListener('load', function() {
        if (this.status >= 400)
            console.log('Error: ' + this.statusText);
    })
    
    req.open('POST', settings.apiUrl + '/data/event');
    req.setRequestHeader('Content-type', 'application/json');
    req.setRequestHeader('Authorization', 'Basic ' + 
                         btoa(settings.username + ':' + settings.password));
    req.send(data);
}

// Handle message from page content
chrome.runtime.onMessage.addListener(function(message) {
    logToDiMe(message.uri, message.title, message.text);
})

// Load settings on startup
document.addEventListener('DOMContentLoaded', updateSettings);

// Update settings when changed by the user
chrome.storage.onChanged.addListener(settingsChangeListener);
