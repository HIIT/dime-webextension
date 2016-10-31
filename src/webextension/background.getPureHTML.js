import cheerio from 'cheerio';

function getPureHTML(rawHTML) { // eslint-disable-line no-unused-vars
  return new Promise((resolve) => {
    const pureHTML = cheerio.load(rawHTML)('*').removeAttr('class').removeAttr('id').removeAttr('style').html();
    resolve(pureHTML);
  });
}

window.getPureHTML = getPureHTML;
