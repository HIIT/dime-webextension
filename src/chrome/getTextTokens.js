import _ from 'underscore'
import Tokenizer from 'tokenize-text'
import stopWords from 'stopwords'
import treebank from 'talisman/tokenizers/words/treebank'
//import lancaster from 'talisman/stemmers/lancaster'
import porter from 'talisman/stemmers/porter'

export default function getTextTokens (content) {
    var punctuationReg = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g
    var spaceReg = /\s+/g
    var numberReg = /[0-9]/g
    content = content.replace(punctuationReg, '').replace(numberReg,'').replace(spaceReg, ' ')
    let tokens = treebank(content).map((word)=> {
        return porter(word)
    })
    return _.difference(tokens, stopWords.english)
}
