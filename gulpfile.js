// const gulp = require("gulp");
// series 串行 , 执行完一个再一个
// parallel 并行, 可以一起执行
// dest 目的
const { src, dest, watch, series, parallel } = require('gulp');
const babel = require('gulp-babel');
const del = require('del');
const terser = require('gulp-terser');


const clean = () => {
    return del(["dist"])
}

const jsTask = () => {
    return src("./lib/**/*.js", { base: "./lib" })
        .pipe(babel({
            presets: [
                [
                    "@babel/preset-env",
                    {
                        "targets": {
                            "node": "10"
                        }
                    }
                ]
            ]
        }))
        // .pipe(terser({mangle: {toplevel: true}, ie8: true, safari10: true}))
        .pipe(terser({mangle: {toplevel: true}}))
        .pipe(dest("./dist"))
}

const buildraw = series(clean, jsTask);

module.exports = {
    buildraw
}