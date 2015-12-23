// logToDiMe(window.location.href, document.title, document.all[0].innerText);

chrome.runtime.sendMessage({
    'uri': window.location.href, 
    'title': document.title, 
    'text': document.all[0].innerText
})
