import _ from 'underscore';
// import Tokenizer from 'tokenize-text';
import stopWords from 'stopwords';
import treebank from 'talisman/tokenizers/words/treebank';
// import lancaster from 'talisman/stemmers/lancaster'
// import porter from 'talisman/stemmers/porter';

export default function getTextTokens(content) {
  const punctuationReg = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
  const spaceReg = /\s+/g;
  const numberReg = /[0-9]/g;
  const pureContent = content.replace(punctuationReg, '').replace(numberReg, '').replace(spaceReg, ' ');
  const tokens = treebank(pureContent);
  return _.difference(tokens, stopWords.english);
}
