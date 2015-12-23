var save_options = function() {
  var apiUrl = document.getElementById('api_url').value;
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;

  chrome.storage.local.set({
      apiUrl: apiUrl,
      username: username,
      password: password
  }, function() {
    var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
          status.textContent = '';
      }, 750);
  });
}

var restore_options = function() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.local.get({
      apiUrl: "http://localhost:8080/api",
      username: "testuser",
      password: "testuser123"
  }, function(items) {
    document.getElementById('api_url').value = items.apiUrl;
    document.getElementById('username').value = items.username;
    document.getElementById('password').value = items.password;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
