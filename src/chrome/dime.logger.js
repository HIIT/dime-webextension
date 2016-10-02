window.postMessage({
  type: 'document',
  payload: {
    innerHTML: document.body.innerHTML,
    title: document.title,
    innerText: document.all[0].innerText,
  },
}, '*');
