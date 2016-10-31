// Save values from HTML form to storage
function saveOptions() {
  const apiUrl = document.getElementById('api_url').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const skipSites = document.getElementById('skip_sites').value;
  chrome.storage.local.set({ apiUrl, username, password, skipSites }, () => { // eslint-disable-line no-undef
    const status = document.getElementById('status');
    status.textContent = 'DiMe Options Saved!';
    setTimeout(() => {
      status.textContent = '';
    }, 750);
  });
}

function restoreOptions() {
  chrome.storage.local.get(['apiUrl', 'username', 'password', 'skipSites'], (items) => { // eslint-disable-line no-undef
    const { apiUrl, username, password, skipSites } = items;
    document.getElementById('api_url').value = apiUrl;
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
    document.getElementById('skip_sites').value = skipSites;
  });
}

// Load settings on startup
document.addEventListener('DOMContentLoaded', restoreOptions);

// Save settings when user clicks "save"
document.getElementById('save').addEventListener('click', saveOptions);
