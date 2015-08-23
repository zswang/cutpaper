/* jshint node:true */
'use strict';
// generated on 2015-05-16 using generator-gulp-webapp 0.2.0
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('images', function () {
  return gulp.src('src/img/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('release/img'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'release']));
gulp.task('default', ['clean', 'images'], function () {
  return gulp.src('src/*.html')
    .pipe($.jdists())
    .pipe(gulp.dest('release'));
});