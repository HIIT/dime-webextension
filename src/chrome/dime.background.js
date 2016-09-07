import domurl from 'domurl'
import $ from 'jquery'
import ineed from 'ineed'
import _ from 'underscore'
import readability from 'readability-js'
import cheerio from 'cheerio'
import getTextTokens from './getTextTokens'

const defaultSettings = {
    apiUrl: 'http://localhost:8080/api',
    username: 'testuser',
    password: 'testuser123',
    skipSites: ['localhost:8080'],
    enable: true
}

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
    apiUrl = apiUrl || chrome.storage.sync.set({'apiUrl': defaultSettings.apiUrl})
    username = username ||  chrome.storage.sync.set({'username': defaultSettings.username})
    password = password || chrome.storage.sync.set({'password': defaultSettings.password})
    skipSites = skipSites ||  chrome.storage.sync.set({'skipSites': defaultSettings.skipSites})
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

function checkBlockList (tab) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['skipSites'], (v)=> {
            let skipSiteArray = []
            let currentURL = new domurl(tab.url)
            let hostPlusPort = currentURL.host + ((currentURL.port.length > 0)? (':'+ currentURL.port) : '')

            for (let line of v.skipSites.split('\n')) {
              if (line !== '') {
                  skipSiteArray.push(line);
              }
            }
            let WWWskipSiteArray = skipSiteArray.map((i)=> {return 'www.' + i})
            if (skipSiteArray.indexOf(hostPlusPort) === -1 && WWWskipSiteArray.indexOf(hostPlusPort) === -1 && skipSiteArray.indexOf(hostPlusPort) === -1) {
                resolve(true)
            } else {
                console.log('url in blocklist')
                resolve(false)
            }
        })
    })
}
async function init (tabId, tab) {
    let alive = await checkDiMeAlive()
    let enable = await checkEnable()
    let notInBlockList = await checkBlockList (tab)
    //console.log("notInBlockList = " + notInBlockList)

    if (alive && enable && notInBlockList) {
        //console.log(tab)
        unblockEvalinScrtipSrc()
        chrome.tabs.sendMessage(tabId, {data: tab})
        console.log('tab data sent to content script')
    }
}

checkDiMeAlive ()
//detect URL changes
var visitedURL = null
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status && changeInfo.status === 'complete' && tab.url) {
        //console.log(changeInfo)
        //console.log(tabId)
        //console.log(tab.url)
        if (tab.url === visitedURL) {
            console.log('a duplicated url: ' +  visitedURL)

        } else {
            console.log(visitedURL)
            console.log(tab.url)
            visitedURL = tab.url
            //console.log('call init')
            init(tabId, tab)
        }

    }
})

function sendToDiMe (dataWithDimeStructure) {
    chrome.storage.sync.get(['apiUrl', 'username', 'password'], (items)=> {
            let {apiUrl, username, password} = items
            var req = new XMLHttpRequest()
            req.open('POST', apiUrl + '/data/event')
            req.setRequestHeader('Content-type', 'application/json')
            req.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password))
            req.onreadystatechange = function() {
                if (req.status == 200 && req.readyState == 4) {
                    console.log(dataWithDimeStructure)
                    console.log('sent to dime')
                }  else if ( req.readyState == 4 ) {
                    //console.log(request.dataWithDimeStructure)
                    console.log(dataWithDimeStructure)
                    console.log('error occurs when sent to dime server')
                    console.log(req)
                }
            }
            req.send(JSON.stringify(dataWithDimeStructure))
        })

}
function getFrequentWords(content, numberOfWords) {
    return new Promise((resolve) => {
        let tokensWithOutStopWords = getTextTokens(content)
        let frequencies = {}
        for (let word of tokensWithOutStopWords) {
            frequencies[word] = frequencies[word] || 0;
            frequencies[word]++;
        }
        let words = Object.keys( frequencies );
        let wordsRankedByFrequent = words.sort((a,b) => {
            return frequencies[b] -frequencies[a];
        }).slice(0,numberOfWords)
        resolve(wordsRankedByFrequent)
    })
}
function getOpenGraphProtocol() {
    return new Promise((resolve, reject) => {
        resolve(_.pick({
            title: $('meta[property="og:title"]').attr('content'),
            type: $('meta[property="og:type"]').attr('content'),
            image: $('meta[property="og:image"]').attr('content'),
            //url: $('meta[property="og:url"]').attr('content'),
            site_name: $('meta[property="og:site_name"]').attr('content'),
            audio: $('meta[property="og:audio"]').attr('content'),
            video: $('meta[property="og:video"]').attr('content'),
            description: $('meta[property="og:description"]').attr('content'),
            determiner: $('meta[property="og:determiner"]').attr('content'),
            locale: $('meta[property="og:locale"]').attr('content'),
        }, _.identity))
    })
}
function getMetaTags() {
    return new Promise((resolve, reject) => {
        resolve($("head meta").map(function (index,meta) {
            if (meta.name && meta.content)
                return {
                    name: meta.name,
                    content: meta.content
                }
        }).toArray())
    })
}
function getArticle(document) {
    return new Promise((resolve, reject) => {
        readability(document.innerHTML, (err, article, meta) => {
            resolve(article);
        });
    })
}
async function compile(document, url) {
    let pageData = {}
    let article = await getArticle(document)
    if (article && article.content) {
        let content = article.content.text()
        let frequentTerms = await getFrequentWords(content, 10)
        let articleHTML = cheerio.load(article.content.html())('*').removeAttr('class').removeAttr('id').removeAttr('style').html()
        let innedCollection = ineed.collect.images.hyperlinks.fromHtml(articleHTML)
        pageData.tags = frequentTerms.slice(0,8).map((term)=> {
            return {
                '@type': 'Tag',
                text: term,
                //auto: true,
                //date: Date.now()
            }
        })
        pageData.frequentTerms = frequentTerms
        if (article.excerpt) {pageData.abstract = article.excerpt}
        pageData.HTML = articleHTML
        pageData.plainTextContent = content
        pageData.imgURLs = innedCollection.images.map((i)=> { return {url: 'http:' + i.src, text: i.alt }})
        pageData.hyperLinks =  innedCollection.hyperlinks.map((i)=> { return {url: (i.href.indexOf('http') === -1)? url + i.href: i.href, text: i.text}})
        pageData.pageURL = url
        //pageData.openGraphProtocol = await getOpenGraphProtocol()
        //pageData.metaTags = await getMetaTags()
        pageData.title = document.title
        pageData.document = document
    }
    return pageData

}
var compiledURL = null
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.document && request.url !== compiledURL) {
        let {document, url} = request
        compiledURL = url
        //console.log(request)
        //console.log(document)
        compile(document, url).then((pageData)=> {
            if (_.isEmpty(pageData) || pageData.plainTextContent.length < 100) {
                //console.log('no valuable text content found, send title/url/plain HTML only')
                const simplePageDataWithDimeStructure = {
                    '@type': 'DesktopEvent',
                    type: 'http://www.semanticdesktop.org/ontologies/2010/01/25/nuao/#UsageEvent',
                    actor: 'DiMe browser extension',
                    start: Date.now(),
                    targettedResource: {
                        '@type': 'WebDocument',
                        title: document.title,
                        isStoredAs: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo/#RemoteDataObject',
                        type: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo/#HtmlDocument',
                        mimeType: 'text/html',
                        plainTextContent: document.innerText,
                        uri: url,
                    }
                }
                sendToDiMe(simplePageDataWithDimeStructure)
                console.log('simple page data sent to dime')
                return
            }
            const pageDataWithDimeStructure = {
                '@type': 'DesktopEvent',
                type: 'http://www.semanticdesktop.org/ontologies/2010/01/25/nuao/#UsageEvent',
                actor: 'DiMe browser extension',
                start: Date.now(),
                targettedResource: {
                    '@type': 'WebDocument',
                    title: pageData.document.title,
                    isStoredAs: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo/#RemoteDataObject',
                    type: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo/#HtmlDocument',
                    mimeType: 'text/html',
                    tags: pageData.tags,
                    plainTextContent: pageData.plainTextContent,
                    uri: pageData.pageURL,
                    frequentTerms: pageData.frequentTerms,
                    HTML: pageData.HTML,
                    abstract: pageData.abstract,
                    imgURLs: pageData.imgURLs,
                    hyperLinks: pageData.hyperLinks,
                    //OpenGraphProtocol: pageData.openGraphProtocol,
                    //MetaTags: pageData.MetaTags,
                }
            }
            sendToDiMe(pageDataWithDimeStructure)
        })
    }
    else {
        console.log('url has been compiled, skip.')
    }
    //if (request.dataWithDimeStructure) {
    //    //console.log(request.dataWithDimeStructure)
    //    chrome.storage.sync.get(['apiUrl', 'username', 'password'], (items)=> {
    //        let {apiUrl, username, password} = items
    //        var req = new XMLHttpRequest()
    //        req.open('POST', apiUrl + '/data/event')
    //        req.setRequestHeader('Content-type', 'application/json')
    //        req.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password))
    //        req.onreadystatechange = function() {
    //            if (req.status == 200 && req.readyState == 4) {
    //                console.log(request.dataWithDimeStructure)
    //                console.log('sent to dime')
    //            }  else if ( req.readyState == 4 ) {
    //                //console.log(request.dataWithDimeStructure)
    //                console.log(request.dataWithDimeStructure)
    //                console.log('error occurs when sent to dime server')
    //                console.log(req)
    //            }
    //        }
    //
    //        req.send(JSON.stringify(request.dataWithDimeStructure))
    //    })
    //}
})
