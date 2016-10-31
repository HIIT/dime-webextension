import readability from 'readability-js';

function getArticle(document) { // eslint-disable-line no-unused-vars
  return new Promise((resolve) => {
    readability(document.innerHTML, (err, article) => {
      resolve(article);
    });
  });
}

window.getArticle = getArticle;
