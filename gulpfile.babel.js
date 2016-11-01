import gulp from 'gulp';
import zip from 'gulp-zip';
import rseq from 'run-sequence';
import crx from 'gulp-crx-pack';
import fs from 'fs';
import clean from 'gulp-clean';

gulp.task('chrome-crx', () => {
  gulp.src('./build/webextension')
    .pipe(crx({
      privateKey: fs.readFileSync('./src/certs/key.pem', 'utf8'),
      filename: 'dime-chrome-extension.crx',
    }))
    .pipe(gulp.dest('./dist/chrome'));
});

gulp.task('chrome-zip-for-dist', () => {
  gulp.src(['./build/webextension/**/*', './src/certs/key.pem'])
    .pipe(zip('dime-chrome-extension.zip'))
    .pipe(gulp.dest('./dist/chrome'));
});


gulp.task('safari', () => {
  gulp.src('./build/safari/**/*')
    .pipe(gulp.dest('./dist/safari/dime-safari-extension.safariextension'));
});

gulp.task('clean:webextension', () => {
  gulp.src(['./build/webextension'], { read: false })
    .pipe(clean());
});

gulp.task('clean:safari', () => {
  gulp.src(['./build/safari', './dist/safari'], { read: false })
    .pipe(clean());
});

gulp.task('clean:chrome', () => {
  gulp.src(['./dist/chrome'], { read: false })
    .pipe(clean());
});

gulp.task('clean:firefox', () => {
  gulp.src(['./dist/firefox'], { read: false })
    .pipe(clean());
});

gulp.task('default', () => rseq(['chrome']));
