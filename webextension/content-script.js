var pingDiMe = function() {
    var req = new XMLHttpRequest();
    req.open("GET", "http://localhost:8080/api/ping");
    req.send(null);
}

var logToDiMe = function(url, title, plainTextContent) {
    console.log("Logging to DiMe: " + url + " - \"" + title + "\"");
    var data = JSON.stringify({
        '@type': "DesktopEvent",
        type: "http://www.semanticdesktop.org/ontologies/2010/01/25/nuao#UsageEvent",
        actor: "DiMe browser extension",
        start: Date.now(),
        targettedResource: {
            '@type': "Document",
            isStoredAs: "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#RemoteDataObject",
            mimeType: "text/html", 
            plainTextContent: plainTextContent,
            type: "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#Document", 
            uri: url, 
            title: title, 
            plainTextContent: plainTextContent
        }
    });
    var req = new XMLHttpRequest();
    req.addEventListener("load", function() {
        if (this.status >= 400)
            console.log("Error: " + this.statusText);
    })
    req.open("POST", "http://localhost:8080/api/data/event");
    req.setRequestHeader("Content-type", "application/json");
    req.setRequestHeader("Authorization", "Basic " + btoa("testuser:testuser123"));
    req.send(data);
}

// pingDiMe();
logToDiMe(window.location.href, document.title, document.all[0].innerText);


// chrome.runtime.sendMessage({"url": window.location.href});
