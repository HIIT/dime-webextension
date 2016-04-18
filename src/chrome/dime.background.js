;(function(undefined) {

    var _globals = {
        enabled: true
    };
    // Browser action
    chrome.browserAction.onClicked.addListener(function() {
        // Changing icon and disabling
        if (_globals.enabled)
            chrome.browserAction.setIcon(
                {path: {'19': 'icons/icon19-disabled.png',
                    '38': 'icons/icon38-disabled.png'}});
        else
            chrome.browserAction.setIcon(
                {path: {'19': 'icons/icon19.png',
                    '38': 'icons/icon38.png'}});

        _globals.enabled = !_globals.enabled;
    });
    // Receiving variable requests
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.variable === 'enabled')
            sendResponse({
                enabled: _globals.enabled
            });
    });

    //detect URL changes
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
        if(changeInfo && changeInfo.status == "complete"){
            chrome.tabs.sendMessage(tabId, {data: tab})
        }
    });

    // Exporting to window
    window.globals = _globals;
}).call(this);
