var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');                            
var minifyCss = require('gulp-minify-css');                     

var base = '.'
var src = base+'/less/**/*.less'

gulp.task('concat', function() {                                
    gulp.src([src])    
        .pipe(less())
        .pipe(minifyCss())                                      
        .pipe(gulp.dest(base+'/css'))
});

var docs_src = './docs/less/**/*.less'
gulp.task('docs-concat', function() {                                
    gulp.src([docs_src])    
        .pipe(less())
        .pipe(minifyCss())                                      
        .pipe(gulp.dest('./docs/css'))
});

gulp.task('watch', function() {
  gulp.watch(src, ['concat']);
  gulp.watch(docs_src, ['docs-concat']);
});

gulp.task('default', ['concat', 'docs-concat']);