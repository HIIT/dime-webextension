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

import {settings} from './dime.common'

;(function() {
    var localEnableVar = settings.enable

    function setIcon () {
        chrome.storage.local.get(['enable'], (items)=> {
            let {enable} = items
            if (typeof(enable) === "boolean")
                if (enable)
                    chrome.browserAction.setIcon(
                        {path: {'19': 'icons/icon19.png',
                            '38': 'icons/icon38.png'}});
                else
                    chrome.browserAction.setIcon(
                        {path: {'19': 'icons/icon19-disabled.png',
                            '38': 'icons/icon38-disabled.png'}});
        })
    }
    function checkDiMeAlive () {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['apiUrl'], (items)=> {
                let {apiUrl} = items
                var req = new XMLHttpRequest();
                req.open("GET", apiUrl + "/ping", true)
                req.onreadystatechange = function() {
                    if (req.status == 200) {
                        resolve(req)
                    } else {
                        reject(req)
                    }
                }
                req.send()
            })
        })

    }

    chrome.storage.local.get((items)=> {
        let {apiUrl, username, password, skipSites, enable} = items
        if (apiUrl) {} else { chrome.storage.local.set({apiUrl: settings.apiUrl}) }
        if (username) {} else { chrome.storage.local.set({username: settings.username}) }
        if (password) {} else { chrome.storage.local.set({password: settings.password}) }
        if (skipSites) {} else { chrome.storage.local.set({skipSites: settings.skipSites}) }
        if (typeof(enable) === "boolean") {
            localEnableVar = enable
        } else { chrome.storage.local.set({enable: settings.enable}, setIcon) }
    })


    checkDiMeAlive().then((req)=> {
        setIcon ()
        chrome.storage.local.set({disconnected: false})
    }).catch((req) => {
        chrome.storage.local.get(['apiUrl'], (items)=> {
            console.log(`connection with dime at ${items.apiUrl} error` )
            console.log(req)
            chrome.browserAction.setIcon(
                {path: {'19': 'icons/icon19-disconnected.png',
                    '38': 'icons/icon38-disconnected.png'}})
        })
        chrome.storage.local.set({disconnected: true})
    })
    // Browser action
    chrome.browserAction.onClicked.addListener(function() {

        localEnableVar = !localEnableVar
        chrome.storage.local.set({enable: localEnableVar}, setIcon)

    });

    //detect URL changes
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
        if(changeInfo && changeInfo.status == "complete"){
            chrome.tabs.sendMessage(tabId, {data: tab})
        }
    });



    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.variable === 'enabled')
            checkDiMeAlive().then((req)=> {
                setIcon ()
                chrome.storage.local.set({disconnected: false})
            }).catch((req) => {
                chrome.storage.local.get(['apiUrl'], (items)=> {
                    console.log(`connection with dime at ${items.apiUrl} error` )
                    console.log(req)
                    chrome.browserAction.setIcon(
                        {path: {'19': 'icons/icon19-disconnected.png',
                            '38': 'icons/icon38-disconnected.png'}})
                })
                chrome.storage.local.set({disconnected: true})
            })
            sendResponse({
                enabled: localEnableVar
            });

        if (request.dataWithDimeStructure) {
            chrome.storage.local.get(['apiUrl', 'username', 'password'], (items)=> {
                let {apiUrl, username, password} = items
                var req = new XMLHttpRequest();
                req.open('POST', apiUrl + '/data/event');
                req.setRequestHeader('Content-type', 'application/json');
                req.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
                req.onreadystatechange = function() {
                    if (req.status == 200 && req.readyState == 4) {
                        console.log(request.dataWithDimeStructure)
                        console.log('sent to dime')
                    }  else if ( req.readyState == 4 ) {
                        console.log(request.dataWithDimeStructure)
                        console.log('error occurs when sent to dime server')
                        console.log(req)
                    }
                }
                req.send(JSON.stringify(request.dataWithDimeStructure));
            })
        }
    });


}).call(this);
