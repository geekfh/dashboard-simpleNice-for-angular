var gulp = require('gulp');
var gulpLoader = require('gulp-load-plugins');
var del = require('del');

var $ = gulpLoader();
var angularTemplateCache = require('gulp-angular-templatecache');


gulp.task('del', () => {
    return del('build');
});



var tplHeader = 'angular.module("App").run(["$templateCache", function($templateCache) {';
gulp.task('cache', function() {
    return gulp.src('src/tpl/**/*.html')
        .pipe($.htmlmin({collapseWhitespace: true}))
        .pipe(angularTemplateCache({
            root: 'tpl/',
            templateHeader: tplHeader
        }))
        .pipe(gulp.dest('build/static/script/'));
});

gulp.task('copy_lib', () => {
    gulp.src([
        'node_modules/angular/angular.min.js',
        'node_modules/angular/angular.min.js.map',
        'node_modules/angular-ui-router/release/angular-ui-router.min.js',
        'node_modules/angular-material/angular-material.min.js',
        'node_modules/angular-cookies/angular-cookies.min.js'
    ])
    .pipe(gulp.dest('build/static/script'))

});


gulp.task('watch', () => {
    gulp.watch('src/tpl/**/*.html', ['cache']);
    gulp.watch('src/**/*.js', ['build']);
    gulp.watch('src/**/*.css', ['build']);
});

gulp.task('build', () => {
    var assets = $.useref.assets();

    var jsfilter = $.filter(['**/*.js', '!node_modules'], {
        restore: true
    });
    var cssfilter = $.filter('**/*.css', {
        restore: true
    });

    return gulp.src('src/index.html')
        .pipe(assets)

    .pipe(jsfilter)
        .pipe($.jsmin())
        .pipe(jsfilter.restore)

    .pipe(cssfilter)
        .pipe($.csso())
        .pipe(cssfilter.restore)

        .pipe($.rev())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())

    .pipe(gulp.dest('build'));
});

// gulp.task('default', ['build', 'cache', 'copy_lib', 'watch']);
gulp.task('default', ['build', 'cache']);
