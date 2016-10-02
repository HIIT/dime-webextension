### Features

* Archiving browersing data to DiMe server.
* Icon showing DiMe's status (alive/disconnected).
* Enable/Disable archiving by clicking

### Development

1. install node.js <https://nodejs.org/en/>.
2. ``npm install`` to fetch all NPM packages.
4. ``npm start`` to activate development enviorment.
5. go to ``chrome://extensions/``, enable Developer mode, click ``load unpack extension``, and point the path to ``./build/chrome``
6. edit source files in ``./src/chrome``
    * There is no need to refresh to see new changes if you are working on ``./src/chrome/dime.logger``.
    * However, if you intent to edit ``./src/chrome/dime.background`` or ``./src/chrome/dime.content``, it is ***necessary*** to manually click the 'Reload' button.
    * In ``chrome://extensions/``, click ``Inspect views: background page`` to show the console messages and errors from ``./src/chrome/dime.background``
    * Console messages and errors in other js files will show in brower console.

### Build

#### Chrome

1. To build the distributable Chrome extension (``.crx``), firstly generate your own .pem (see <https://developer.chrome.com/extensions/packaging> and place it in ``./src/certs/`` with the filename ``chrome.pem``
2. ``npm run build``. The ``dime-chrome-extension-v[version number].crx`` will show up in ``./dist/chrome``
