var gulp = require('gulp'),
    jshint = require('gulp-jshint');

gulp.task('hint', function () {
    return gulp.src('./app/**/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'));
});

gulp.task('default', ['hint']);
