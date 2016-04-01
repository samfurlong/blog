var gulp = require('gulp');
var shell = require('gulp-shell');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');
var prefixer = require('gulp-autoprefixer');
var connect = require('gulp-connect');
var cp = require('child_process');

var base_path = './';
var src = base_path + '_dev/src';
var dist = base_path + 'assets';
var paths = {
    js: src + '/js/*.js',
    scss: [
      src +'/sass/*.scss',
      src +'/sass/**/* .scss',
      src +'/sass/**/**/*.scss'
    ],
    jekyll: [
      'index.html',
      '_posts/*',
      '_layouts/*',
      '_includes/*' ,
      'assets/*',
      'assets/**/*'
    ]
  };


// Compile sass to css
gulp.task('compile-sass', function(){
  return gulp.src(paths.scss)
    .pipe(plumber(function(error) {
        gutil.log(gutil.colors.red(error.message));
        gulp.task('compile-sass').emit('end');
    }))
    .pipe(sass())
    .pipe(prefixer('last 3 versions', 'ie 9'))
    .pipe(minifyCSS())
    .pipe(rename({dirname: dist + '/css'}))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scss, ['compile-sass']);
});

// Task for building blog when something changed:
// gulp.task('build', shell.task(['bundle exec jekyll build --watch']));
// Or if you don't use bundle:
gulp.task('jekyll-build', shell.task(['jekyll build --watch']));

// Task for serving blog with Browsersync
gulp.task('browsersync-serve', function () {
    browserSync.init({server: {baseDir: '_site/'}});
    // Reloads page when some of the already built files changed:
    gulp.watch('_site/**/*.*').on('change', browserSync.reload);
});

// Run Jekll Build and Browsersync
gulp.task('jekyll-watch', ['jekyll-build', 'browsersync-serve']);

// Run all tasks
gulp.task('default', ['watch', 'jekyll-watch']);
