'use strict';

import gulp from 'gulp'
import crx from 'gulp-crx-pack'
import rseq  from 'run-sequence'
//import clean from 'gulp-clean'
import manifest from './src/chrome/manifest.json'
import fs from 'fs';

gulp.task('chrome', function () {
    gulp.src('./build/chrome')
        .pipe(crx({
            privateKey: fs.readFileSync('./src/certs/chrome.pem', 'utf8'),
            filename: 'dime-chrome-extension-v' + manifest.version + '.crx'
        }))
        .pipe(gulp.dest('./dist/chrome'));
});

gulp.task('default', function() {
    return rseq(['chrome']);
});