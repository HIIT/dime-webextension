var settings = {
    apiUrl: "http://localhost:8080/api",
    username: "testuser",
    password: "testuser123"
}

var pingDiMe = function() {
    var req = new XMLHttpRequest();
    req.open("GET", apiUrl + "/ping");
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
    
    req.open("POST", settings.apiUrl + "/data/event");
    req.setRequestHeader("Content-type", "application/json");
    req.setRequestHeader("Authorization", "Basic " + 
                         btoa(settings.username + ":" + settings.password));
    req.send(data);
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace == "local") {
        console.log("settings " + namespace);
        for (key in changes) {
            console.log("key " + key);
            if (key in settings) {
                console.log("changed key = " + changes[key].newValue);
                settings[key] = changes[key].newValue;
            }
        }
    }
});

chrome.runtime.onMessage.addListener(function(message) {
    logToDiMe(message.uri, message.title, message.text);
})
