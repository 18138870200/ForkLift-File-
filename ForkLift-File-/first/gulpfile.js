var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var fs = require('fs');     //file system
var argv = require('yargs').argv;
var historyApiFallback = require('connect-history-api-fallback'); //resolve html5Mode problem: refresh page will receive 404
var browserSync = require('browser-sync').create();

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('backend', function() {
    var env = argv.env || 'dev',
        jsonPath = 'config/application-' + env + '.json',
        jsonData = JSON.parse(fs.readFileSync(jsonPath)),
        jsonKeys = Object.getOwnPropertyNames(jsonData),
        objectContent = '';

    for(var i in jsonKeys) {
        var index = +i, 
            key = jsonKeys[index],
            isLast = index === jsonKeys.length - 1;
        objectContent += "        " + key + ": '" + jsonData[key] + "'" + (isLast ? "" : ",") + "\n";
    }

    var backendContent = "(function() {\n"
        + "    angular.module('starter').constant('backendUrl', {\n"
        + objectContent
        + "    });\n"
        + "})();";

    //生成backend.js文件
    fs.writeFileSync('www/js/constants/backendUrl.js', backendContent);
});

//在浏览器上运行
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: 'www',
            middleware: [historyApiFallback()]
        },
        host: 'localhost',
        port: argv.port || 8101,
        https: undefined,
        ghostMode: false,
        logPrefix: 'BS',
        open: false,
        notify: false
    });
});