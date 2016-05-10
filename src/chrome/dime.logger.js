import $ from 'jquery'
import ineed from 'ineed'
import _ from 'underscore'
import Tokenizer from 'tokenize-text'
import stopWords from 'stopwords'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import ReduxPromise from 'redux-promise'

import readability from 'readability-js'
import cheerio from 'cheerio'
import reducers from './UI/reducers'
import App from './UI/app'

window.postMessage({
    type: 'fromInjectedJStoHook',
    text: 'hooking the communications...'
}, '*');

//var pageXHR = []
//function sniffAllXHR (request, response) {
//    let XHRequestURL = request.url
//    let XHResponseData = response.data
//    pageXHR.push({
//        url: XHRequestURL,
//        data: XHResponseData
//    })
//}
window.addEventListener('message', (event) => {
    if (event.data.type === 'fromContentScriptNotifyURLChanged') {
        //artoo.ajaxSniffer.after(sniffAllXHR);
        //setTimeout(() =>{
        //    console.log(pageXHR)
        //    pageXHR = []
        //}, 3000);
        const pageURL = event.data.message
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
        const englishReg = /^[A-Za-z]*$/
        const englishStopWords = stopWords.english
        function getTextTokens (content) {
            const tokenize = new Tokenizer()
            let tokens = tokenize.words()(content).map((token) => {return token.value})
            let tokensInEnglish = tokens.filter((token)=> {return englishReg.test(token.value)})
            let tokensWithOutStopWords =  _.difference(tokensInEnglish, englishStopWords)
            return tokensWithOutStopWords
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
            console.log('start parsing web page')
            let article = await getArticle()
            if (article) {
                let content = article.content.text()
                let frequentTerms = await getFrequentWords(content, 10)
                let articleHTML = cheerio.load(article.content.html())('*').removeAttr('class').removeAttr('id').removeAttr('style').html()
                let innedCollection = ineed.collect.images.hyperlinks.fromHtml(articleHTML)
                pageData.title = document.title
                pageData.tags = frequentTerms.slice(0,8).map((term)=> {
                    return {
                        '@type': 'Tag',
                        text: term,
                        //auto: true,
                        //date: Date.now()
                    }
                })
                pageData.abstract = article.excerpt
                pageData.HTML = articleHTML
                pageData.text = content
                pageData.openGraphProtocol = await getOpenGraphProtocol()
                pageData.metaTags = await getMetaTags()
                pageData.imgURL = innedCollection.images
                pageData.hyperLink =  innedCollection.hyperlinks
            }
            console.log('page parsing is done.')
            return pageData

        }
        compile().then((pageData)=> {
            console.log(pageData)
            window.postMessage({
                type: 'compiledResult',
                pageData: pageData
            }, '*');
            //if (Object.keys(pageData).length === 0 || pageData.text.length < 150) {
            //    console.log('no valuable text found on the page')
            //    return
            //}
            //let dimeUIRoot = document.createElement('div');
            //dimeUIRoot.setAttribute('class','dimeUIRoot');
            //document.body.appendChild(dimeUIRoot)
            //const store = createStore(reducers)
            //console.log(pageData)
            //ReactDOM.render(
            //    <Provider store={store}>
            //        <App pageData={pageData}/>
            //    </Provider>
            //    , document.querySelector('.dimeUIRoot'));
        })
    }
})