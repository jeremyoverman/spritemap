let gulp = require('gulp');
let ts = require('gulp-typescript');
let watch = require('gulp-watch');
let browserify = require('browserify');
let source = require('vinyl-source-stream');
let tsify = require('tsify');

const BUILT = './built';
const FILES = {
    all: './src/**/*',
    entry: './src/index.ts',
    files: [
        './src/**/*',
        '!./src/**/*.ts'
    ]
};

gulp.task('scripts', () => {
    return browserify({
        basedir: '.',
        debug: true,
        entries: [FILES.entry],
        cache: {},
        packageCache: {},
        standalone: 'SpriteSheet'
    })
    .plugin(tsify)
    .bundle()
    .on('error', err => console.log(err))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(BUILT));
});

gulp.task('copy-files', () => {
    gulp.src(FILES.files).pipe(gulp.dest(BUILT));

});


gulp.task('watch', () => {
    gulp.start('default');

    watch(FILES.all, () => {
        gulp.start('default');
    })
});

gulp.task('default', ['scripts', 'copy-files']);