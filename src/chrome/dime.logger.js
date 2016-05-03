import $ from 'jquery'
import ineed from 'ineed'
import _ from 'underscore'

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
        const pageTexts = ineed.collect.texts.fromHtml(document.body.parentNode.innerHTML).texts
        function getFrequentTerms () {
            return new Promise ((resolve, reject) => {
                const id = Math.random().toString(36).substr(2, 5)
                window.postMessage({
                    type: 'pageTexts',
                    text: JSON.stringify(pageTexts),
                    id: id
                }, '*');
                console.log('page text send to worker')
                window.addEventListener('message', (event) => {
                    if (event.data.id === id && event.data.type === 'purifiedText') {
                        console.log('received result from worker')
                        resolve(event.data.termsRanked)
                    }
                })
            })
        }
        function getImageURLs() {
            return new Promise((resolve, reject) => {
                resolve(ineed.collect.images.fromHtml(document.body.parentNode.innerHTML).images)
            })
        }
        function getHyperlinks() {
            return new Promise((resolve, reject) => {
                resolve(ineed.collect.hyperlinks.fromHtml(document.body.parentNode.innerHTML).hyperlinks)
            })
        }
        function getTitle() {
            return new Promise((resolve, reject) => {
                resolve(ineed.collect.title.fromHtml(document.body.parentNode.innerHTML).title)
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
        async function compile() {
            let pageData = {}
            console.log('start parsing')
            try {
                pageData.frequentTerms = await getFrequentTerms()
                pageData.imageURLs = await getImageURLs();
                pageData.hyperlinks = await getHyperlinks();
                pageData.title = await getTitle();
                pageData.openGraphProtocol = await getOpenGraphProtocol();
                pageData.metaTags = await getMetaTags();
            } catch (error) {
                console.log(error)
            }
            pageData.pageTexts = pageTexts
            pageData.pageURL = pageURL

            console.log('page parsing is done.')
            return pageData
        }
        compile().then((pageData)=>{
            //window.postMessage({
            //    type: 'compiledResult',
            //    pageData: pageData
            //}, '*');
            injectUI(pageData)
        })
    }
})

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import ReduxPromise from 'redux-promise'

import reducers from './UI/reducers'
import App from './UI/app'

function injectUI(pageData) {
    let dimeUIRoot = document.createElement('div');
    dimeUIRoot.setAttribute('class','dimeUIRoot');
    document.body.appendChild(dimeUIRoot)
    const createStoreWithMiddleware = applyMiddleware(ReduxPromise)(createStore);
    const store = createStoreWithMiddleware(
        reducers
    )
    ReactDOM.render(
        <Provider store={store}>
            <App pageData={pageData}/>
        </Provider>
        , document.querySelector('.dimeUIRoot'));
}