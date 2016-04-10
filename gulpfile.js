var gulp = require('gulp');
var shell = require('gulp-shell');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');
var imageMin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var prefixer = require('gulp-autoprefixer');
var connect = require('gulp-connect');
var cp = require('child_process');

// Declare the paths
// Glob patterns by file type
paths = {};
paths.allFilesPattern = '/**/*.*';
paths.sassPattern = '/**/*.scss';
paths.jsPattern = '/**/*.js';
paths.imagePattern = '/**/*.+(jpg|JPG|jpeg|JPEG|png|PNG|svg|SVG|gif|GIF|webp|WEBP|tif|TIF)';
paths.markdownPattern = '/**/*.+(md|MD|markdown|MARKDOWN)';
paths.htmlPattern = '/**/*.html';
paths.xmlPattern = '/**/*.xml';

paths.base_path = './';
paths.src = paths.base_path + '_dev/src';
paths.dist = paths.base_path + 'assets';

// JS Paths
paths.js = paths.src + '/js/*.js';
// Sass Paths
paths.scssSrc = paths.src + '/sass' + paths.sassPattern;
paths.scssDist = paths.dist + '/css';
// Images Paths
paths.imagesSrc = paths.src + '/images' + paths.imagePattern;
paths.imagesDest = paths.dist + '/images';
// Images Paths
paths.jsSrc = paths.src + '/js' + paths.jsPattern;
paths.jsDest = paths.dist + '/js';
// jekyll Paths
paths.browser_sync_files = '_site' + paths.allFilesPattern;
paths.jekyll = [
  'index.html',
  '_posts/*',
  '_layouts/*',
  '_includes/*',
  'assets/*',
  'assets/**/*'
];


// Compile sass to css
gulp.task('compile-sass', function() {
  return gulp.src(paths.scssSrc)
    .pipe(plumber(function(error) {
      gutil.log(gutil.colors.red(error.message));
      gulp.task('compile-sass').emit('end');
    }))
    .pipe(sass())
    .pipe(prefixer())
    .pipe(minifyCSS())
    .pipe(rename({
      dirname: paths.scssDist
    }))
    .pipe(gulp.dest('./'));
});

// Creates optimized versions of images,
// then outputs to appropriate location(s)
gulp.task('compile-images', function() {
  return gulp.src(paths.imagesSrc)
    .pipe(imageMin({
  			progressive: true,
  			svgoPlugins: [{removeViewBox: false}],
  			use: [pngquant()]
  		}))
    .pipe(gulp.dest(paths.imagesDest))
    .pipe(browserSync.stream())
    .on('error', gutil.log);
});

// Watch assets for local development
gulp.task('watch-assets', function() {
  gulp.watch(paths.scssSrc, ['compile-sass']);
  gulp.watch(paths.imagesSrc, ['compile-images']);
  gulp.watch(paths.jsSrc, ['webpack-build']);
});

// Watch assets for production env
gulp.task('watch-assets-prod', function() {
  gulp.watch(paths.scssSrc, ['compile-sass']);
  gulp.watch(paths.imagesSrc, ['compile-images']);
  gulp.watch(paths.jsSrc, ['webpack-prod']);
});

// Task for compiling JS Modules using webpack
// Must have webpack installed globaly "npm install -g webpack"
gulp.task('webpack-build', shell.task(['webpack']));
gulp.task('webpack-prod', shell.task(['NODE_ENV=production webpack']));

// Task for building blog when something changed:
// gulp.task('build', shell.task(['bundle exec jekyll build --watch']));
// Or if you don't use bundle:
gulp.task('jekyll-build', shell.task(['jekyll build --watch']));

// Task for serving blog with Browsersync
gulp.task('browsersync-serve', function() {
  browserSync.init({
    server: {
      baseDir: '_site/'
    }
  });
  // Reloads page when some of the already built files changed:
  gulp.watch(paths.browser_sync_files).on('change', browserSync.reload);
});

// Run Jekll Build and Browsersync
gulp.task('jekyll-watch', ['jekyll-build', 'browsersync-serve']);

// Run all tasks
gulp.task('default', ['webpack-prod', 'watch-assets', 'jekyll-watch']);

// Same as Gulp default, except doesnt minify javascript for easier debugging
gulp.task('debug', ['webpack-build', 'watch-assets', 'jekyll-watch']);
