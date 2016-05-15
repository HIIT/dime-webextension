import $ from 'jquery'
import ineed from 'ineed'
import _ from 'underscore'

import React from 'react'
import ReactDOM from 'react-dom'
//import { Provider } from 'react-redux'
//import { createStore, applyMiddleware } from 'redux'
//import ReduxPromise from 'redux-promise'

import readability from 'readability-js'
import cheerio from 'cheerio'
//import reducers from './UI/reducers'
import App from './UI/app'
import getTextTokens from './getTextTokens'

//const pageTexts = ineed.collect.texts.fromHtml(document.body.parentNode.innerHTML).texts
var timer = function(name) {
    var start = new Date();
    return {
        stop: function() {
            var end  = new Date();
            var time = end.getTime() - start.getTime();
            console.log(name, 'finished in', time, 'ms');
        }
    }
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
            url: $('meta[property="og:url"]').attr('content'),
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
function getArticle() {
    return new Promise((resolve, reject) => {
        readability(document.body.innerHTML, (err, article, meta) => {
            resolve(article);
        });
    })
}
async function compile() {
    let pageData = {}
    let article = await getArticle()
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
        pageData.abstract = article.excerpt
        pageData.HTML = articleHTML
        pageData.text = content
        pageData.imgURLs = innedCollection.images
        pageData.hyperLinks =  innedCollection.hyperlinks
        pageData.pageURL = window.location.href
        pageData.title = document.title
        pageData.openGraphProtocol = await getOpenGraphProtocol()
        pageData.metaTags = await getMetaTags()
    }
    return pageData

}
compile().then((pageData)=> {
    if (_.isEmpty(pageData) || pageData.text.length < 100) {
        console.log('no valuable text content found, send title/url/plain HTML only')
        const pageDataWithDimeStructure = {
            '@type': 'DesktopEvent',
            type: 'http://www.semanticdesktop.org/ontologies/2010/01/25/nuao/#UsageEvent',
            actor: 'DiMe browser extension',
            start: Date.now(),
            origin: '0:0:0:0:0:0:0:1',
            targettedResource: {
                '@type': 'Document',
                isStoredAs: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo/#RemoteDataObject',
                mimeType: 'text/html',
                plainTextContent: document.all[0].innerText,
                type: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo/#HtmlDocument',
                uri: window.location.href,
                title: document.title,
            }
        }
        window.postMessage({
            type: 'pageDataWithDimeStructure',
            payload: pageDataWithDimeStructure
        }, '*')
        console.log('simple page data sent to dime')
        return
    }
    const pageDataWithDimeStructure = {
        '@type': 'DesktopEvent',
        type: 'http://www.semanticdesktop.org/ontologies/2010/01/25/nuao/#UsageEvent',
        actor: 'DiMe browser extension',
        start: Date.now(),
        origin: '0:0:0:0:0:0:0:1',
        targettedResource: {
            title: pageData.title,
            '@type': 'Document',
            type: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo/#PlainTextDocument',
            tags: pageData.tags,
            isStoredAs: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo/#RemoteDataObject',
            mimeType: 'application/json',
            plainTextContent: JSON.stringify(_.omit(pageData), 'title', 'pageURL', 'tags'),
            uri: pageData.pageURL,
        }
    }
    //var data = JSON.stringify(dataWithDimeStructure, undefined, 4)
    //var blob = new Blob([data], {type: 'text/json'}),
    //    e    = document.createEvent('MouseEvents'),
    //    a    = document.createElement('a')
    //a.download = 'hiit.json'
    //a.href = window.URL.createObjectURL(blob)
    //a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
    //e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    //a.dispatchEvent(e)
    window.postMessage({
        type: 'pageDataWithDimeStructure',
        payload: pageDataWithDimeStructure
    }, '*')
    console.log('page data sent to dime, init UI')
    let dimeUIRoot = document.createElement('div');
    dimeUIRoot.setAttribute('class','dimeUIRoot');
    document.body.appendChild(dimeUIRoot)
    //const store = createStore(reducers)
    ReactDOM.render(
            <div>
                <App pageData={pageData} />
            </div>
        , document.querySelector('.dimeUIRoot'));
})