# Web extensions for different browsers

[Safari extension](http://www.hiit.fi/g/reknow/software/DiMeTracker.safariextz)
[Instructions for Chrome extension installation](https://github.com/HIIT/dime-webextension/wiki/Chrome-extension).

### Features of the Chrome Extension

* Archiving data when you are surfing the internet. The extension will send scraped data to dime-server. For example, if you visit [HIIT](http://www.hiit.fi), this [JSON](https://github.com/chenhunghan/dime-webextension/blob/master/src/resources/hiit.json) will be archived in your DiMe. The JSON contains:
    * the title of the page.
    * the url of the page.
    * a list of 5 tags, which are generated based on the frequency in the page.
    * a list of plain texts in the page.
    * a list of 50 frequent terms in the page.
    * a list of hyperlinks in the page.
    * a list of image urls (the ``src`` of the image HTML tag) in the page.
* A button on the bar to toggle the scraping and archiving.
 
### Development of the DiMe Chrome Extension

1. install node.js <https://nodejs.org/en/>
2. ``npm install`` to fetch all the necessary npm packages
4. ``npm start``
5. go to ``chrome://extensions/``, enable Developer mode, click ``Load unpack extension``, and point the path to ``./build/chrome``
6. edit source files in ``./src/chrome``
    * There is no need to refresh to see new changes if you are working on ``./src/chrome/dime.logger``. 
    * However, if you intent to edit ``./src/chrome/dime.background`` or ``./src/chrome/dime.content``, it is necessary to manually click ``Reload`` in ``chrome://extensions/``
    * In ``chrome://extensions/``, click ``Inspect views: background page`` to show the console messages and errors from ``./src/chrome/dime.background``
    * Console messages and errors in other js files will show in normal console in the tabs.
7. To build the packed as ``.crx``, firstly generate your own .pem (see <https://developer.chrome.com/extensions/packaging> and place it in ``./src/certs/`` with the filename ``chrome.pem`` and ``npm run build``. The ``dime-chrome-extension-v*.crx`` should show up in ``./dist/chrome``


