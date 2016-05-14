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

function setIconByConnectionStatus (disconneted) {
    if (disconneted) {
        chrome.browserAction.setIcon({path: {'19': 'icon19-disconnected.png', '38': 'icon38-disconnected.png'}})
    } else {
        checkEnable().then((enable)=> {
            if (enable) {
                chrome.browserAction.setIcon({path: {'19': 'icon19.png', '38': 'icon38.png'}})
            } else {
                chrome.browserAction.setIcon({path: {'19': 'icon19-disabled.png', '38': 'icon38-disabled.png'}})
            }
        })
    }
}

chrome.storage.onChanged.addListener((changes) => {
    if (typeof changes.enable !== "undefined") {
        if (changes.enable.newValue) {
            chrome.browserAction.setIcon({path: {'19': 'icon19.png', '38': 'icon38.png'}})
        } else {
            chrome.browserAction.setIcon({path: {'19': 'icon19-disabled.png', '38': 'icon38-disabled.png'}})
        }
    }
})

chrome.browserAction.onClicked.addListener(() => {
    checkDiMeAlive ().then((alive)=> {
        if (alive) {
            checkEnable().then((v)=> {
                chrome.storage.sync.set({'enable': !v})
            })
        }
    })
})

chrome.storage.sync.get((v)=> {
    let {apiUrl, username, password, skipSites, enable} = v
    apiUrl = apiUrl || chrome.storage.sync.set({'apiUrl': settings.apiUrl})
    username = username ||  chrome.storage.sync.set({'username': settings.username})
    password = password || chrome.storage.sync.set({'password': settings.password})
    skipSites = skipSites ||  chrome.storage.sync.set({'skipSites': settings.skipSites})
    if (typeof enable === 'undefined') chrome.storage.sync.set({'enable': true})
})

function checkDiMeAlive () {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['apiUrl'], (items)=> {
            let {apiUrl} = items
            if (apiUrl) {
                var req = new XMLHttpRequest()
                req.open("GET", apiUrl + "/ping", true)
                req.onreadystatechange = function() {
                    if (req.status === 200 && req.readyState === 4) {
                        console.log('dime-server is alive')
                        const disconnected = false
                        //chrome.storage.local.set({'disconnected': disconnected})
                        setIconByConnectionStatus(disconnected)
                        resolve(true)
                    }
                    else if (req.readyState === 4) {
                        const disconnected = true
                        //chrome.storage.local.set({'disconnected': disconnected})
                        setIconByConnectionStatus(disconnected)
                        chrome.storage.sync.get(['apiUrl'], (items)=> {console.log(`connection with dime at ${items.apiUrl} error` )})
                        resolve(false)
                    }
                }
                req.send()
            }
        })
    })

}

function unblockEvalinScrtipSrc () {
    console.log('unblocking eval() in script src by overwritten meta in HTML headers')
    //modified from https://github.com/medialab/artoo/blob/master/chrome/background.js
    chrome.webRequest.onHeadersReceived.addListener(
        function(details) {
            var possibleHeaders = [
                'x-webkit-csp',
                'content-security-policy'
            ]
            var i, l, o;
            for (i = 0, l = details.responseHeaders.length; i < l; i++) {
                o = details.responseHeaders[i];
                if (~possibleHeaders.indexOf(o.name.toLowerCase()))
                    o.value =
                        "default-src *;" +
                        "script-src * 'unsafe-inline' 'unsafe-eval';" +
                        "connect-src * 'unsafe-inline' 'unsafe-eval;" +
                        "style-src * 'unsafe-inline;";
            }
            return {
                responseHeaders: details.responseHeaders
            };
        },
        {
            urls: ['http://*/*', 'https://*/*'],
            types: [
                'main_frame',
                'sub_frame',
                'stylesheet',
                'script',
                'image',
                'object',
                'xmlhttprequest',
                'other'
            ]
        },
        ['blocking', 'responseHeaders']
    )

}

function checkEnable () {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['enable'], (v)=> {
            resolve(v.enable)
        })
    })
}

async function init (tabId, tab) {
    let alive = await checkDiMeAlive()
    let enable = await checkEnable()
    if (alive && enable) {
        unblockEvalinScrtipSrc()
        chrome.tabs.sendMessage(tabId, {data: tab})
    }
}

checkDiMeAlive ()
//detect URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status && changeInfo.status === 'complete') {
        init(tabId, tab)
    }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.dataWithDimeStructure) {
        chrome.storage.sync.get(['apiUrl', 'username', 'password'], (items)=> {
            let {apiUrl, username, password} = items
            var req = new XMLHttpRequest()
            req.open('POST', apiUrl + '/data/event')
            req.setRequestHeader('Content-type', 'application/json')
            req.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password))
            req.onreadystatechange = function() {
                if (req.status == 200 && req.readyState == 4) {
                    console.log(request.dataWithDimeStructure)
                    console.log('sent to dime')
                }  else if ( req.readyState == 4 ) {
                    //console.log(request.dataWithDimeStructure)
                    console.log('error occurs when sent to dime server')
                    console.log(req)
                }
            }
            req.send(JSON.stringify(request.dataWithDimeStructure))
        })
    }
})
