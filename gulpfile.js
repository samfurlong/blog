var gulp = require('gulp');
var shell = require('gulp-shell');
var browserSync = require('browser-sync').create();

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
gulp.task('jekyll-reload', ['jekyll-build', 'browsersync-serve']);

// Run all tasks
gulp.task('default', ['jekyll-reload']);
