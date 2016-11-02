import _ from 'underscore';
// import Tokenizer from 'tokenize-text';
import stopWords from 'stopwords';
import treebank from 'talisman/tokenizers/words/treebank';
// import lancaster from 'talisman/stemmers/lancaster'
// import porter from 'talisman/stemmers/porter';

function getFrequentWords(content, numberOfWords) { // eslint-disable-line no-unused-vars
  return new Promise((resolve) => {
    const tokensWithOutStopWords = getTextTokens(content);
    const frequencies = {};
    for (const word of tokensWithOutStopWords) {
      frequencies[word] = frequencies[word] || 0;
      frequencies[word] += 1;
    }
    const wordsss = Object.keys(frequencies);
    const wordsRankedByFrequent = wordsss.sort((a, b) => frequencies[b] - frequencies[a]).slice(0, numberOfWords);
    resolve(wordsRankedByFrequent);
  });
}

function logerThan50(text) {
  return text.length < 50;
}

function getTextTokens(content) { // eslint-disable-line no-unused-vars
  const punctuationReg = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
  const spaceReg = /\s+/g;
  const numberReg = /[0-9]/g;
  const pureContent = content.replace(punctuationReg, '').replace(numberReg, '').replace(spaceReg, ' ');
  const tokens = treebank(pureContent).filter(logerThan50).map(token => token.toLowerCase());
  return _.difference(tokens, stopWords.english);
}

window.getFrequentWords = getFrequentWords;
