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

import {settings, skipSites, updateSkipSites, updateSettings, settingsChangeListener} from './dime.common'

// Save values from HTML form to storage
var saveOptions = function() {
  var apiUrl = document.getElementById('api_url').value;
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  var skipSites = document.getElementById('skip_sites').value;
    
  updateSkipSites(skipSites, apiUrl);
  document.getElementById('skip_sites').value = settings.skipSites;

  chrome.storage.sync.set({
      apiUrl: apiUrl,
      username: username,
      password: password,
      skipSites: skipSites
  }, function() {
    var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
          status.textContent = '';
      }, 750);
  });
}

var restoreOptions = function() {
    updateSettings(function(items) {
        // Update values in HTML form
        document.getElementById('api_url').value = items.apiUrl;
        document.getElementById('username').value = items.username;
        document.getElementById('password').value = items.password;
        document.getElementById('skip_sites').value = items.skipSites;
    });
}

// Load settings on startup
document.addEventListener('DOMContentLoaded', restoreOptions);

// Save settings when user clicks "save"
document.getElementById('save').addEventListener('click', saveOptions);
