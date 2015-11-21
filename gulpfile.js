var gulp = require('gulp');
var karma = require('karma').server;
var jshint = require('gulp-jshint');
var debug = require('gulp-debug');


var pkg = require('./package.json');
//var git = require('gulp-git');

gulp.task('lint', function() {

  return gulp.src('./src/**/*.js')
    .pipe(debug())
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('test', function(done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false
  }, done);
});



gulp.task('default', ['lint', 'test']);

