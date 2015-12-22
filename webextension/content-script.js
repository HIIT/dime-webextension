// logToDime(window.location.href, document.title, document.all[0].innerText);


function pingDiMe() {
    var req = new XMLHttpRequest();
    req.open("GET", "http://localhost:8080/api/ping");
    req.send(null);
}

pingDiMe();

chrome.runtime.sendMessage({"url": window.location.href});
