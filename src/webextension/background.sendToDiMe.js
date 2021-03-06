
const browser = chrome; // eslint-disable-line no-undef
const backgroundPage = window;

function sendToDiMe(dataWithDimeStructure) {
  browser.storage.local.get(['apiUrl', 'username', 'password'], (items) => {
    const { apiUrl, username, password } = items;
    const req = new XMLHttpRequest();
    req.open('POST', `${apiUrl}/data/event`);
    req.setRequestHeader('Content-type', 'application/json');
    req.setRequestHeader('Authorization', `Basic ${btoa(`${username}:${password}`)}`);
    req.onreadystatechange = () => {
      if (req.status === 200 && req.readyState === 4) {
        browser.storage.local.set({ currentPageSaved: true });
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

async function compile(document, url) {
  const article = await backgroundPage.getArticle(document);
  if (article && article.content) {
    const plainTextContent = article.content.text().replace(/(\r\n|\n|\r)/gm, ' ');
    const [frequentTerms, pureHTML, openGraphProtocol, metaTags] = await Promise.all([
      backgroundPage.getFrequentWords(plainTextContent, 100),
      backgroundPage.getPureHTML(article.content.html()),
      backgroundPage.getOpenGraphProtocol(),
      backgroundPage.getMetaTags(),
    ]);
    let links;
    try {
      links = await backgroundPage.getLinks(pureHTML, url);
    } catch (err) {
      links = { images: [], hyperLinks: [] };
    }
    const uri = url;
    const HTML = pureHTML;
    const abstract = article.excerpt;
    const imgURLs = links.images;
    const hyperLinks = links.hyperLinks;
    const title = document.title;
    return {
      '@type': 'DesktopEvent',
      type: 'http://www.semanticdesktop.org/ontologies/2010/01/25/nuao/#UsageEvent',
      actor: 'DiMe Browser Extension',
      origin: browser.runtime.id,
      start: Date.now(),
      targettedResource: {
        '@type': 'WebDocument',
        title,
        isStoredAs: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo/#RemoteDataObject',
        type: 'http://www.semanticdesktop.org/ontologies/2007/03/22/nfo/#HtmlDocument',
        mimeType: 'text/html',
        plainTextContent,
        uri,
        frequentTerms,
        HTML,
        abstract,
        imgURLs,
        hyperLinks,
        openGraphProtocol,
        metaTags,
      },
    };
  }
  return null;
}

browser.runtime.onMessage.addListener((request) => {
  const { document, url } = request;
  compile(document, url).then((dataWithDimeStructure) => {
    if (dataWithDimeStructure == null || dataWithDimeStructure.plainTextContent < 100) {
      const simplePageDataWithDimeStructure = {
        '@type': 'DesktopEvent',
        type: 'http://www.semanticdesktop.org/ontologies/2010/01/25/nuao/#UsageEvent',
        actor: 'DiMe Browser Extension',
        origin: browser.runtime.id,
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
      sendToDiMe(simplePageDataWithDimeStructure);
      console.log('simple page data sent to DiMe.'); // eslint-disable-line no-console
      console.log(simplePageDataWithDimeStructure); // eslint-disable-line no-console
      return;
    }
    sendToDiMe(dataWithDimeStructure);
    console.log('page data sent to DiMe.'); // eslint-disable-line no-console
    console.log(dataWithDimeStructure); // eslint-disable-line no-console
  });
});
