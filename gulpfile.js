var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var del = require('del');
var utilities = require('gulp-util');
var buildProduction = utilities.env.production;
var lib = require('bower-files')({
  "overrides":{
    "bootstrap" : {
      "main" : [
        "less/bootstrap.less",
        "dist/css/bootstrap.css",
        "dist/js/bootstrap.js"
      ]
    },
    "mocha" : {
      "main" : []
    },
    "chai" : {
      "main" : []
    }
  }
});

var browserSyncServe = require('browser-sync').create();
var browserSyncTestServe = require('browser-sync').create();

gulp.task('jshint', function() {
  return gulp.src(['js/*.js', 'spec/*.js', '*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('concatInterface', function() {
  return gulp.src(['./js/*-interface.js'])
    .pipe(concat('allConcat.js'))
    .pipe(gulp.dest('./tmp'));
});

gulp.task('jsBrowserify', ['concatInterface'], function() {
  return browserify({ entries: ['./tmp/allConcat.js'] })
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./build/js'));
});

gulp.task('minifyScripts', ['jsBrowserify'], function() {
  return gulp.src('./build/js/app.js')
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
});

gulp.task('jsBower', function () {
  return gulp.src(lib.ext('js').files)
    .pipe(concat('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
});

gulp.task('cssBower', function() {
  return gulp.src(lib.ext('css').files)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('./build/css'));
});

gulp.task('bowerProduction', ['jsBower', 'cssBower']);

gulp.task('clean', function() {
  return del(['build', 'tmp']);
});

gulp.task('build', ['clean'], function() {
  if (buildProduction) {
    gulp.start('minifyScripts');
  } else {
    gulp.start('jsBrowserify');
  }
  gulp.start('bowerProduction');
});

gulp.task('serve', function() {
  browserSyncServe.init({
    server: {
      baseDir: './',
      index: 'index.html'
    }
  });

  gulp.watch(['js/*.js'], ['jsBuild']);
  gulp.watch(['bower.json'], ['bowerBuild']);
  gulp.watch(['*.html'], ['htmlBuild']);
});

gulp.task('jsBuild', ['jsBrowserify', 'jshint'], function() {
  browserSyncServe.reload();
});

gulp.task('bowerBuild', ['bowerProduction'], function() {
  browserSyncServe.reload();
});

gulp.task('htmlBuild', function() {
  browserSyncServe.reload();
});

gulp.task('testServe', function() {
  browserSyncTestServe.init({
    server: {
      baseDir: './',
      index: '/spec/spec-runner.html'
    }
  });

  gulp.watch(['js/*.js'], ['jsBuild']);
  gulp.watch(['spec/specs.js', 'spec/spec-runner.html'], ['specBuild']);
});

gulp.task('specBuild', function() {
  browserSyncTestServe.reload();
});
