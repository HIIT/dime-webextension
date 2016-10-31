import ineed from 'ineed';

function checkUrlLength(entity) {
  return entity.url.length < 254 && entity.text.length;
}

function getLinks(html, url) { // eslint-disable-line no-unused-vars
  return new Promise((resolve) => {
    const links = ineed.collect.images.hyperlinks.fromHtml(html);
    resolve({
      images: links.images.map(i => ({ url: `http://${i.src}`, text: i.alt })).filter(checkUrlLength).slice(0, 50),
      hyperLinks: links.hyperlinks.map(i => ({ url: (i.href.indexOf('http') === -1) ? url + i.href : i.href, text: i.text })).filter(checkUrlLength).slice(0, 50),
    });
  });
}

window.getLinks = getLinks;
