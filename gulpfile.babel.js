import gulp from 'gulp';
import zip from 'gulp-zip';
import rseq from 'run-sequence';
import crx from 'gulp-crx-pack';
import fs from 'fs';

gulp.task('chrome-crx', () => {
  gulp.src('./build/webextension/**/*')
    .pipe(crx({
      privateKey: fs.readFileSync('./src/certs/key.pem', 'utf8'),
      filename: 'dime-chrome-extension.crx',
    }))
    .pipe(gulp.dest('./dist/chrome'));
});

gulp.task('chrome-zip', () => {
  gulp.src(['./dist/chrome/dime-chrome-extension.crx', './src/certs/key.pem'])
    .pipe(zip('dime-chrome-extension.zip'))
    .pipe(gulp.dest('./dist/chrome'));
});


gulp.task('safari', () => {
  gulp.src('./build/safari/**/*')
    .pipe(gulp.dest('./dist/safari/dime-safari-extension.safariextension'));
});

gulp.task('default', () => rseq(['chrome']));
