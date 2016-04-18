import Tokenizer from 'tokenize-text'
import stopWords from 'stopwords'
const tokenize = new Tokenizer();
function getFrequenentWords(wordsArray, cutOff) {
    let frequencies = {}
    for (let word of wordsArray) {
        frequencies[word] = frequencies[word] || 0;
        frequencies[word]++;
    }
    let words = Object.keys( frequencies );
    return words.sort((a,b) => {
        return frequencies[b] -frequencies[a];
    }).slice(0,cutOff);
}
const englishReg = /^[A-Za-z]*$/;

var timer = function(name) {
    var start = new Date();
    return {
        stop: function() {
            var end  = new Date();
            var time = end.getTime() - start.getTime();
            console.log(name, 'finished in', time, 'ms');
        }
    }
};
const englishStopWords = stopWords.english
self.addEventListener('message', function(message) {
    if (message.data.type === 'pageTexts') {
        var timerTokenize = timer('tokenization');
        let pageTexts = JSON.parse(message.data.text)
        let tokens = _.compact(_.flatten(pageTexts.map((content) => {
            return tokenize.words()(content.toString()).map((token) => {
                if (englishReg.test(token.value))
                    return token.value.toLowerCase()
            })
        })))
        let terms = _.difference(tokens, englishStopWords);
        timerTokenize.stop()
        self.postMessage({
            type: 'purifiedText',
            id: message.data.id,
            termsRanked:getFrequenentWords(terms,50)
        }, '*');
    }
}, false);