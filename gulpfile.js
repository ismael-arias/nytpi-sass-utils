"use strict";

var gulp = require("gulp");
var eslint = require("gulp-eslint");
var config = require("eyeglass-dev-eslint");
var bump = require('gulp-bump');

gulp.task("lint", function() {
  return gulp.src(["*.js"])
      .pipe(eslint(config))
      .pipe(eslint.formatEach("stylish", process.stderr))
      .pipe(eslint.failOnError());
});

gulp.task("default", ["lint"]);

// semver bump tasks
gulp.task('bump:patch', function(){
    gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest('./'));
});

gulp.task('bump:minor', function(){
    gulp.src('./package.json')
        .pipe(bump({type: 'minor'}))
        .pipe(gulp.dest('./'));
});

gulp.task('bump:major', function(){
    gulp.src('./package.json')
        .pipe(bump({type: 'major'}))
        .pipe(gulp.dest('./'));
});
