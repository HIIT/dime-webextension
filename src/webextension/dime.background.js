// import $ from 'jquery';
import DomURL from 'domurl';
import ineed from 'ineed';
import _ from 'underscore';
import readability from 'readability-js';
// import cheerio from 'cheerio';
import getTextTokens from './getTextTokens';

const browser = chrome; // eslint-disable-line no-undef

// Default Settings
const defaultSettings = {
  apiUrl: 'http://localhost:8080/api',
  username: 'testuser',
  password: 'testuser123',
  skipSites: 'localhost:8080\n',
  enable: true,
};

// Set defaultSettings when browser.storage.get return null
browser.storage.local.get((v) => {
  if (typeof v.apiUrl === 'undefined') browser.storage.local.set({ apiUrl: defaultSettings.apiUrl });
  if (typeof v.username === 'undefined') browser.storage.local.set({ username: defaultSettings.username });
  if (typeof v.password === 'undefined') browser.storage.local.set({ password: defaultSettings.password });
  if (typeof v.skipSites === 'undefined') browser.storage.local.set({ skipSites: defaultSettings.skipSites });
  if (typeof v.enable === 'undefined') browser.storage.local.set({ enable: true });
});

browser.storage.onChanged.addListener((changes) => {
  if (typeof changes.enable !== 'undefined') {
    if (changes.enable.newValue) {
      browser.browserAction.setIcon({ path: {
        16: 'icon16.png',
        19: 'icon19.png',
        32: 'icon32.png',
        38: 'icon38.png',
        64: 'icon64.png',
      } });
    } else {
      browser.browserAction.setIcon({ path: {
        16: 'icon-disabled-16.png',
        19: 'icon-disabled-19.png',
        32: 'icon-disabled-32.png',
        38: 'icon-disabled-38.png',
        64: 'icon-disabled-64.png',
      } });
    }
  }
});

browser.browserAction.onClicked.addListener(() => {
  checkDiMeAlive().then((alive) => {
    if (alive) {
      checkEnable().then((v) => {
        browser.storage.local.set({ enable: !v });
      });
    }
  });
});

let visitedURL = null;
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status && changeInfo.status === 'complete' && tab.url && tab.url !== 'chrome://newtab/') {
    if (tab.url === visitedURL) {
      // console.log('a duplicated url: ' +  visitedURL)
    } else {
      // console.log(visitedURL);
      // console.log(tab.url);
      visitedURL = tab.url;
      // console.log('call init')
      init(tabId, tab);
    }
  }
});

function setIconByConnectionStatus(disconneted) {
  if (disconneted) {
    browser.browserAction.setIcon({ path: {
      16: 'icon-disconnected-16.png',
      19: 'icon-disconnected-19.png',
      32: 'icon-disconnected-32.png',
      38: 'icon-disconnected-38.png',
      64: 'icon-disconnected-64.png',
    } });
  } else {
    checkEnable().then((enable) => {
      if (enable) {
        browser.browserAction.setIcon({ path: {
          16: 'icon16.png',
          19: 'icon19.png',
          32: 'icon32.png',
          38: 'icon38.png',
          64: 'icon64.png',
        } });
      } else {
        browser.browserAction.setIcon({ path: {
          16: 'icon-disabled-16.png',
          19: 'icon-disabled-19.png',
          32: 'icon-disabled-32.png',
          38: 'icon-disabled-38.png',
          64: 'icon-disabled-64.png',
        } });
      }
    });
  }
}

function checkDiMeAlive() {
  return new Promise((resolve) => {
    browser.storage.local.get(['apiUrl'], (items) => {
      const { apiUrl } = items;
      if (apiUrl) {
        const req = new XMLHttpRequest();
        req.open('GET', `${apiUrl}/ping`, true);
        req.onreadystatechange = () => {
          if (req.status === 200 && req.readyState === 4) {
            // console.log('dime-server is alive');
            const disconnected = false;
            setIconByConnectionStatus(disconnected);
            resolve(true);
          } else if (req.readyState === 4) {
            const disconnected = true;
            setIconByConnectionStatus(disconnected);
            browser.storage.local.get(['apiUrl'], () => {
              // console.log(`connection with dime at ${items.apiUrl} error`);
            });
            resolve(false);
          }
        };
        req.send();
      }
    });
  });
}

function checkEnable() {
  return new Promise((resolve) => {
    browser.storage.local.get(['enable'], (v) => {
      resolve(v.enable);
    });
  });
}

function checkBlockList(tab) {
  return new Promise((resolve) => {
    browser.storage.local.get(['skipSites'], (v) => {
      const skipSiteArray = [];
      const currentURL = new DomURL(tab.url);
      const hostPlusPort = currentURL.host + ((currentURL.port.length > 0) ? `:${currentURL.port}` : '');
      for (const line of v.skipSites.split('\n')) {
        if (line !== '') {
          skipSiteArray.push(line);
        }
      }
      const WWWskipSiteArray = skipSiteArray.map(i => `www.${i}`);
      if (skipSiteArray.indexOf(hostPlusPort) === -1 && WWWskipSiteArray.indexOf(hostPlusPort) === -1 && skipSiteArray.indexOf(hostPlusPort) === -1) {
        resolve(true);
      } else {
        // console.log('url in blocklist')
        resolve(false);
      }
    });
  });
}
async function init(tabId, tab) {
  const alive = await checkDiMeAlive();
  const enable = await checkEnable();
  const notInBlockList = await checkBlockList(tab);
  // console.log("notInBlockList = " + notInBlockList)
  if (alive && enable && notInBlockList) {
    // console.log(tab)
    browser.tabs.sendMessage(tabId, tab);
    // console.log('tab data sent to content script');
  }
}

checkDiMeAlive();

function sendToDiMe(dataWithDimeStructure) {
  browser.storage.local.get(['apiUrl', 'username', 'password'], (items) => {
    const { apiUrl, username, password } = items;
    const req = new XMLHttpRequest();
    req.open('POST', `${apiUrl}/data/event`);
    req.setRequestHeader('Content-type', 'application/json');
    req.setRequestHeader('Authorization', `Basic ${btoa(`${username}:${password}`)}`);
    req.onreadystatechange = () => {
      if (req.status === 200 && req.readyState === 4) {
        // console.log(dataWithDimeStructure)
        // console.log('sent to dime')
        browser.browserAction.setIcon({ path: {
          16: 'icon-saved-16.png',
          19: 'icon-saved-19.png',
          32: 'icon-saved-32.png',
          38: 'icon-saved-38.png',
          64: 'icon-saved-64.png',
        } });
      } else if (req.readyState === 4) {
        // console.log(request.dataWithDimeStructure)
        // console.log(dataWithDimeStructure)
        // console.log('error occurs when sent to dime server')
        // console.log(req)
      }
    };
    req.send(JSON.stringify(dataWithDimeStructure));
  });
}

function getFrequentWords(content, numberOfWords) {
  return new Promise((resolve) => {
    const tokensWithOutStopWords = getTextTokens(content);
    const frequencies = {};
    for (const word of tokensWithOutStopWords) {
      frequencies[word] = frequencies[word] || 0;
      frequencies[word] += 1;
    }
    const words = Object.keys(frequencies);
    const wordsRankedByFrequent = words.sort((a, b) => frequencies[b] - frequencies[a]).slice(0, numberOfWords);
    resolve(wordsRankedByFrequent);
  });
}

// function getOpenGraphProtocol() {
//   return new Promise((resolve) => {
//     resolve(_.pick({
//       title: $('meta[property="og:title"]').attr('content'),
//       type: $('meta[property="og:type"]').attr('content'),
//       image: $('meta[property="og:image"]').attr('content'),
//       // url: $('meta[property="og:url"]').attr('content'),
//       site_name: $('meta[property="og:site_name"]').attr('content'),
//       audio: $('meta[property="og:audio"]').attr('content'),
//       video: $('meta[property="og:video"]').attr('content'),
//       description: $('meta[property="og:description"]').attr('content'),
//       determiner: $('meta[property="og:determiner"]').attr('content'),
//       locale: $('meta[property="og:locale"]').attr('content'),
//     }, _.identity));
//   });
// }
// function getMetaTags() {
//   return new Promise((resolve) => {
//     resolve($('head meta').map((index, meta) => {
//       if (meta.name && meta.content) {
//         return {
//           name: meta.name,
//           content: meta.content,
//         };
//       }
//     }).toArray());
//   });
// }
function getArticle(document) {
  return new Promise((resolve) => {
    readability(document.innerHTML, (err, article) => {
      resolve(article);
    });
  });
}
async function compile(document, url) {
  const pageData = {};
  const article = await getArticle(document);
  if (article && article.content) {
    const content = article.content.text();
    const frequentTerms = await getFrequentWords(content, 10);
    const articleHTML = document.innerHTML;
    const innedCollection = ineed.collect.images.hyperlinks.fromHtml(articleHTML);
    pageData.tags = frequentTerms.slice(0, 8).map(term => ({ '@type': 'Tag', text: term }));
    pageData.frequentTerms = frequentTerms;
    if (article.excerpt) { pageData.abstract = article.excerpt; }
    pageData.HTML = articleHTML;
    pageData.plainTextContent = content;
    pageData.imgURLs = innedCollection.images.map(i => ({ url: `http:${i.src}`, text: i.alt }));
    pageData.hyperLinks = innedCollection.hyperlinks.map(i => ({ url: (i.href.indexOf('http') === -1) ? url + i.href : i.href, text: i.text }));
    pageData.pageURL = url;
    // pageData.openGraphProtocol = await getOpenGraphProtocol()
    // pageData.metaTags = await getMetaTags()
    pageData.title = document.title;
    pageData.document = document;
  }
  return pageData;
}

let compiledURL = null;
browser.runtime.onMessage.addListener((request) => {
  if (request.document && request.url !== compiledURL) {
    const { document, url } = request;
    compiledURL = url;
    // console.log(request)
    // console.log(document)
    compile(document, url).then((pageData) => {
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
        },
      };
      if (_.isEmpty(pageData) || pageData.plainTextContent.length < 100) {
        // console.log('no valuable text content found, send title/url/plain HTML only')
        sendToDiMe(simplePageDataWithDimeStructure);
        // console.log('simple page data sent to dime')
        return;
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
        },
      };
      sendToDiMe(pageDataWithDimeStructure);
    });
  } else { // console.log('url has been compiled, skip.')
  }
});
