"use strict";
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const minifyCss = require('gulp-minify-css');

const config = {
    sass: {
        entry: "src/scss/main.scss",
        location: "src/scss/**/*.scss",
        destination: "public/css",
        autoprefixer: {
            browsers: ['last 2 versions']
        }
    }
};

gulp.task('default', ['watch', 'sass'], () => {
    console.log('Running all tasks');
});

gulp.task('sass', () => {
    gulp.src(config.sass.entry)
        .pipe(sass())
        .pipe(autoprefixer(config.sass.autoprefixer))
        .pipe(minifyCss())
        .pipe(gulp.dest(config.sass.destination));
});

gulp.task('watch', ['sass'], () => {
    console.log('Watching for sass changes under ' + config.sass.location);
    gulp.watch(config.sass.location, ['sass']);
});
