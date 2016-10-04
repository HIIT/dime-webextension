### Features

* Archiving browersing history to DiMe server.
* Icons showing DiMe server's status (alive/disconnected).
* Enable/Disable archiving

#### Development


##### Setup Development Environment

1. Install node.js <https://nodejs.org/en/>.
2. Go to the root of the folder; ``npm install`` to fetch all NPM packages.

##### Run Webpack/Babel

0. The extension is written in ES2015+(the next generation Javascript), the Javascript files need to be compiled into ES5 sytax before for better compatbility. We choose [Babel](https://babeljs.io/) as the compiler and [Webpack](https://webpack.github.io/) as the module bundler.
1. ``npm start`` activates enviorment.
2. (optional) ``npm start`` will run two NPM scripts concurrently. One script is for Webextension(Chrome/Firefox/Opera/Edge)=``dev:webextension``. It will watch the source files in ``./src/webextension``. Another script is for Safari extension(``dev:safari``). You could ``npm run dev:webextension`` if not foucsing on Safari extension developement.
3. There will be folders in ``./build`` such as ``./build/safari`` and ``./build/safari``. These folders contain compiled(from ES2015 to ES5) but unpacked extension. You could load these unpacked extnesions in browsers. See below for detailed instructions for Chrome, Firefox and Safari.

##### Load Unpacked Extnesions in Chrome

1. Go to ``chrome://extensions/``, enable Developer mode, click ``load unpack extension``, and point the path to ``./build/webextension``
2. Edit files in ``./src/webextension``, webpack-dev-server will automatcally repack the extension.
    * If you edit ``./src/webextension/dime.background`` or ``./src/webextension/dime.content``, it is ***necessary*** to manually 'Reload' the extension.
3. To see console messages and errors from ``./src/webextension/dime.background``. Go to ``chrome://extensions/``, click ``Inspect views: background page``.
4. Console messages and errors in ``dime.content`` will appear in normal console of browser.

##### Load Unpacked Extnesions in Firefox

0. You should consider using Chrome instead since in Firefox, the Webextension debugging tool is still not ready.
1. Enter ``about:debugging`` in the URL bar.
2. Click ``Load Temporary Add-on``.
3. Open ``./src/webextension/`` directory and select any file.
4. See more details and instructions in  [MDN][https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Temporary_Installation_in_Firefox]

##### Load Unpacked Extnesions in Safari

0. Currently, it is not possible to load uppacked extension in Safari. You have to pack it in a folder with extnesion of with extension of “safariextension”.
1. To do so, ``npm run build:safari``, a folder with extension of “safariextension” will appear ``./dist/safari``.
2. Open Safari Extension Builder. See [How](https://developer.apple.com/library/content/documentation/Tools/Conceptual/SafariExtensionGuide/UsingExtensionBuilder/UsingExtensionBuilder.html).
4. In Safari Extension Builder, click ``+`` and ``Add Extension``, load the folder generated in step 2.
5. Click ``Install``.

#### Distribution

#### Distribute as Chrome Extensions (.crx)

>As of Chrome 44, no external installs are allowed from a path to a local .crx on Mac (see Continuing to protect Chrome users from malicious extensions). (from [here](https://developer.chrome.com/extensions/hosting))

1. HIIT distubuter should has the offical ``key.pem`` file. If you want to distubute you could generate your own ``.pem`` (see <https://developer.chrome.com/extensions/packaging>
2. Place ``key.pem ``in ``./src/certs/``. Note that the filename has to be ``key.pem``.
3. (optional) Edit the version number in ``./src/webextension/manifest.json``.
4. ``npm run dist:chrome``. The ``dime-chrome-extension.zip`` will show up in ``./dist/chrome``.
5. Upload the ZIP file using the [Chrome Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).
6. See more details on [Chrome Devloper](https://developer.chrome.com/extensions/packaging#upload) website.

#### Distribute as Firefox Add-on (.xpi)

1. ``npm run build:webextension``
2. HIIT distubuter should has the offical API key(JWT issuer) and API secret(JWT secret).
2. Build and sign the extension by ``npm run dist:firefox -- --api-key=[your-API-key] --api-secret=[your-API-secret]``.
3. A .xpi file should appear in ``./dist/firefox``
4. see more details on [MDN]<https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext>.
