chrome.runtime.onMessage.addListener(notify);

function pingDiMe() {
    var req = new XMLHttpRequest();
    req.open("GET", "http://localhost:8080/api/ping");
    req.send(null);
}

function logToDiMe(url, title, plainTextContent){
    var data = JSON.stringify({
        '@type': "DesktopEvent",
        type: "http://www.semanticdesktop.org/ontologies/2010/01/25/nuao#UsageEvent",
        actor: "DiMe browser extension",
        start: Date.now(),
        targettedResource: {
            @type: "Document",
            isStoredAs: "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#RemoteDataObject",
            mimeType: "text/html", 
            plainTextContent: plainTextContent,
            type: "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#Document", 
            url: url, 
            title: title, 
            plainTextContent: plainTextContent
        }
    });
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/api/data/event);
    xhr.send(data);
}

function notify(message) {
    console.log("NOTIFY " + message.url);
    // pingDiMe();
}
