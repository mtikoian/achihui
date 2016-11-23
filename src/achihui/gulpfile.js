/// <binding AfterBuild='build2' Clean='build-clean2' />
var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    fs = require("fs"),
    del = require('del'),
    path = require('path'),
    runSequence = require('run-sequence');

var lib = "./wwwroot/libs/";
var app = "./wwwroot/app/";

var paths = {
    npm: './node_modules/',

    tsSource: './app/scripts/**/*.ts',
    tsOutput: app + 'js/',

    cssApp: app + 'css/',
    viewsApp: app + 'views/',
    localeApp: app + 'locales/',
    resApp: app + 'resources/',

    jsVendors: lib + 'js/',
    cssVendors: lib + 'css/',
    imgVendors: lib + 'img/',
    fontsVendors: lib + 'fonts/'
};

var tsProject = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
});

gulp.task('setup-vendors-js', function () {
    gulp.src([
        'core-js/client/*.js',
        'systemjs/dist/system*.js',
        'reflect-metadata/*.js',
        'rxjs/**/*.js',
        'zone.js/dist/*.js',
        '@angular/**/*.js',
        'moment/min/*.js',
        'ng2-translate/**/*.js',
        'angular2-in-memory-web-api/**/*.js',
        'jquery/dist/jquery*.js',
        'oidc-client/dist/*.js',
        'typescript/**/*.js'
    ], {
        cwd: "node_modules/**"
    })
    .pipe(gulp.dest(paths.jsVendors));
});

gulp.task('setup-vendors-css', function () {
    gulp.src([
      paths.npm + 'font-awesome/css/font-awesome*.css'
    ]).pipe(gulp.dest(paths.cssVendors));
});

gulp.task('setup-vendors-primeng', function () {
    gulp.src([
      paths.npm + 'primeng/resources/**/*.*'
    ]).pipe(gulp.dest(lib + 'primeng/resources/'));
});

gulp.task('setup-vendors-font', function () {
    gulp.src([
      paths.npm + 'font-awesome/fonts/FontAwesome.otf',
      paths.npm + 'font-awesome/fonts/fontawesome-webfont.eot',
      paths.npm + 'font-awesome/fonts/fontawesome-webfont.svg',
      paths.npm + 'font-awesome/fonts/fontawesome-webfont.ttf',
      paths.npm + 'font-awesome/fonts/fontawesome-webfont.woff',
      paths.npm + 'font-awesome/fonts/fontawesome-webfont.woff2'
    ]).pipe(gulp.dest(paths.fontsVendors));
});

gulp.task('setup-vendors', ['setup-vendors-js', 'setup-vendors-css', 'setup-vendors-font', 'setup-vendors-primeng']);

gulp.task('setup-environment', function (done) {
    gulp.src([
      'systemjs.config.js',
      'app/index.html',
      'app/logincallback.html',
      'app/logoutcallback.html',
      "app/resources/favicon.ico"
    ]).pipe(gulp.dest('./wwwroot/'));
});

gulp.task('build-view', function () {
    gulp.src([
        'app/views/**/*.html'
    ]).pipe(gulp.dest(paths.viewsApp));
});

gulp.task('build-css', function () {
    gulp.src([
        'app/css/**/*.css'
    ]).pipe(gulp.dest(paths.cssApp));
});

gulp.task('build-resource', function () {
    gulp.src([
        'app/resources/**/*.ico',
        'app/resources/**/*.png',
        'app/resources/**/*.jpg'
    ]).pipe(gulp.dest(paths.resApp));
});

gulp.task('build-locales', function () {
    gulp.src([
        'app/locales/**/*.json'
    ]).pipe(gulp.dest(paths.localeApp));
});

gulp.task('compile-typescript', function (done) {
    var tsResult = gulp.src([
       "app/scripts/**/*.ts"
    ])
     .pipe(tsProject(), undefined, ts.reporter.fullReporter());
    return tsResult.js.pipe(gulp.dest(paths.tsOutput));
});

gulp.task('watch.views', ['before-compile-view'], function () {
    return gulp.watch('app/views/*.html', ['before-compile-view']);
});
gulp.task('watch.css', ['before-compile-css'], function () {
    return gulp.watch('app/css/*.css', ['before-compile-css']);
});

gulp.task('watch.ts', ['compile-typescript'], function () {
    return gulp.watch('app/scripts/**/*.ts', ['compile-typescript']);
});

gulp.task('watch', ['watch.ts', 'watch.views', 'watch.css']);

gulp.task('clean-lib', function () {
    return del([lib]);
});
gulp.task('clean-app', function () {
    return del([app]);
});

gulp.task('build-clean', ['clean-lib', 'clean-app']);

//gulp.task('build-clean2', gulp.parallel('clean-lib', 'clean-app', function () {
//    // do more stuff
//    //done();
//}));

gulp.task('build', function () {
    runSequence('build-clean',
              ['setup-vendors', 'setup-environment', 'build-view', 'build-css', 'build-locales', 'build-resource', 'compile-typescript']);
});

//gulp.task('build-mid2', gulp.parallel('setup-vendors', 'setup-environment', 'build-view', 'build-css', 'build-locales', 'build-resource', 'compile-typescript', function () {
//    // do more stuff
//    //done();
//}));

//gulp.task('build2', gulp.series('build-clean2', 'build-mid2', function (done) {
//    // do more stuff
//    done();
//}
//));
