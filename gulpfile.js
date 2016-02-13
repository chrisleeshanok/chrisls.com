"use strict";
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const minifyCss = require('gulp-minify-css');

const config = {
    sass: {
        entry: "src/scss/main.scss",
        destination: "public/css",
        autoprefixer: {
            browsers: ['last 2 versions']
        }
    }
};

gulp.task('default', ['sass'], () => {
    console.log('Running all tasks');
});

gulp.task('sass', () => {
    gulp.src(config.sass.entry)
        .pipe(sass())
        .pipe(autoprefixer(config.sass.autoprefixer))
        .pipe(minifyCss())
        .pipe(gulp.dest(config.sass.destination));
});
