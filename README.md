#Dime-Webextension

Browser extension (Chrome, Firefox, Vivaldi, Opera, Microsoft Edge, and Safari) to track your digital footprint. Automatically archives the essential data (most frequent keywords, Meta Tags, plain text content and more) of the webpages you visit. Everything is stored in the [DiMe server](https://github.com/HIIT/dime-server), which you need to installed. It runs locally, and thus your data stays safe on your own computer.

#### Features

* Archiving browsing history to [DiMe server](https://github.com/HIIT/dime-server).
* Icons showing DiMe server's status (archived/DiMe is alive/DiMe is disconnected).
* Enable/Disable archiving by one-click.
* Support Chrome, Firefox(48+), Vivaldi Opera, and Microsoft Edge. Limited functions for Safari.

#### Development

##### 0. Setup Development Environment

1. Install node.js <https://nodejs.org/en/>.
2. Go to the root of the folder; ``npm install`` to fetch all NPM packages.

##### 1. Run Webpack/Babel

0. The extension is written in ES2015+ (the next generation Javascript), the Javascript files need to be compiled into ES5 syntax for better compatbility. We chose [Babel](https://babeljs.io/) as the compiler and [Webpack](https://webpack.github.io/) as the module bundler.
1. ``npm start`` activates enviorment.
2. (optional) ``npm start`` will run two NPM scripts concurrently. One script is for Webextension(Chrome/Firefox/Opera/Edge)=``dev:webextension``. It will watch the source files in ``./src/webextension``. Another script is for Safari extension(``dev:safari``). You could ``npm run dev:webextension`` if not foucsing on Safari extension developement.
3. There will be folders in ``./build`` such as ``./build/chrome`` and ``./build/safari``. These folders contain the compiled (from ES2015 to ES5) but unpacked extension. You could load these unpacked extensions in browsers. See below for detailed instructions for Chrome, Firefox and Safari.

##### 2. Load Unpacked Extensions
###### Load Unpacked Extensions in Chrome

1. Go to ``chrome://extensions/``, enable Developer mode, click ``Load unpacked extension...``, and point the path to ``./build/webextension``
2. Edit files in ``./src/webextension``, webpack-dev-server will automatcally repack the extension.
    * If you edit ``./src/webextension/dime.background`` or ``./src/webextension/dime.content``, it is ***necessary*** to manually 'Reload' the extension.
3. To see console messages and errors from ``./src/webextension/dime.background``. Go to ``chrome://extensions/``, click ``Inspect views: background page``.
4. Console messages and errors in ``dime.content`` will appear in normal console of browser.

###### Load Unpacked Extensions in Firefox

0. You should consider using Chrome instead since in Firefox, the Webextension debugging tool is still not ready.
1. Enter ``about:debugging`` in the URL bar.
2. Click ``Load Temporary Add-on``.
3. Open ``./src/webextension/`` directory and select any file.
4. See more [details and instructions in  MDN](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Temporary_Installation_in_Firefox)

###### Load Unpacked Extensions in Safari

0. Currently, it is not possible to load an unpacked extension in Safari. You have to pack it in a folder with the file extension of “safariextension”.
1. To do so, ``npm run build:safari``, a folder with the file extension of “safariextension” will appear in ``./dist/safari``.
2. Open Safari Extension Builder. For instructions, see [Apple's documentation](https://developer.apple.com/library/content/documentation/Tools/Conceptual/SafariExtensionGuide/UsingExtensionBuilder/UsingExtensionBuilder.html).
4. In Safari Extension Builder, click ``+`` and ``Add Extension``, load the folder generated in step 2.
5. Click ``Install``.

#### Distribution

##### Distribute as Chrome Extensions (.crx)

It is currently necessary to publish a signed extension on the Chrome Web Store.  Quoting from the [Chrome documentation](https://developer.chrome.com/extensions/hosting):

>As of Chrome 33, Windows users can only download extensions hosted in the Chrome Web store, except for installs via enterprise policy or developer mode (see Protecting Windows users from malicious extensions). As of Chrome 44, no external installs are allowed from a path to a local .crx on Mac...

1. The HIIT distributer has the offical ``key.pem`` file. If you want to distubute you could generate your own ``.pem`` (see <https://developer.chrome.com/extensions/packaging>
2. Place ``key.pem ``in ``./src/certs/``. Note that the filename has to be ``key.pem``.
3. (optional) Edit the version number in ``./src/webextension/manifest.json``.
4. ``npm run dist:chrome``. The ``dime-chrome-extension.zip`` will show up in ``./dist/chrome``.
5. Upload the ZIP file using the [Chrome Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).
6. See more details on [Chrome Devloper](https://developer.chrome.com/extensions/packaging#upload) website.

##### Distribute as Firefox Add-on (.xpi)

The extension needs to be signed by Mozilla.  Quoting from the [Firefox documentation](https://developer.mozilla.org/en-US/Add-ons/Distribution):

> Starting with Firefox 43 ... Extensions and multipackage installers that support Firefox need to be signed by Mozilla in order for them to be installable in release and beta versions of Firefox. ... Only Mozilla can sign your add-on so that Firefox will install it by default. Add-ons are signed by submitting them to AMO or using the API and passing either an automated or manual code review.

1. The HIIT distributer has the offical API key (JWT issuer) and API secret (JWT secret).
2. ``npm run build:webextension`` compile the source code.
2. Build and sign the extension by ``npm run dist:firefox -- --api-key=[your-API-key] --api-secret=[your-API-secret]``.
3. A .xpi file should appear in ``./dist/firefox``
4. See more details on [MDN](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext).
