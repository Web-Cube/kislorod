const gulp          = require('gulp')
const sass          = require('gulp-sass')
const cleanCSS      = require('gulp-clean-css')
const concat        = require('gulp-concat')
const minify_js     = require('gulp-minify')
const del           = require('del')
const browserSync   = require('browser-sync')
const nodemon       = require('gulp-nodemon')
const rev           = require('gulp-rev')
const revCollector  = require('gulp-rev-collector')
const gutil         = require('gulp-util')
const rimraf        = require('rimraf')
const revOutdated   = require('gulp-rev-outdated')
const path          = require('path')
const through       = require('through2')
const runSequence   = require('run-sequence')

function cleaner() {
    return through.obj(function(file, enc, cb){
        rimraf( path.resolve( (file.cwd || process.cwd()), file.path), function (err) {
            if (err) {
                this.emit('error', new gutil.PluginError('Cleanup old files', err));
            }
            this.push(file);
            cb();
        }.bind(this));
    });
}

gulp.task('js_min', () => {
    return gulp
        .src([
			'node_modules/vue/dist/vue.min.js',
			'node_modules/jquery/dist/jquery.min.js',
			'node_modules/jquery-ui/ui/widget.js',
			'node_modules/jquery-ui/ui/widgets/mouse.js',
            'node_modules/jquery-ui/ui/widgets/slider.js',

            'public/src/js/jquery.arcticmodal-0.3.min.js',
			'public/src/js/components/jquery.ui.touch-punch.min.js',
			'public/src/js/components/jquery.fancybox.js',
			'public/src/js/components/jquery.maskedinput.js',
			'public/src/js/components/jquery.form.js',
			'public/src/js/components/slick.js',
			'public/src/js/components/parsley.min.js',
			'public/src/js/data.js',
			'public/src/js/google_map.js',
			'public/src/js/welcome.js',
        ])
        .pipe(concat('app.js'))
        .pipe(minify_js({
            ext:{
                min:'.min.js'
            }
        }))
        .pipe(gulp.dest('public/'))
        .on('end', () => {
            del.sync([
                'public/app.js',
            ]);
        })
})

gulp.task('css_min', () => {
    return gulp
        .src([
            'public/src/css_static/jquery.arcticmodal-0.3.css',
            'public/src/css/app.css'
        ])
        .pipe(concat('app.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('public/'))
})

gulp.task('rev', () => {
    return gulp.src(['public/app.min.css', 'public/app.min.js'])
        .pipe(rev())
        .pipe(gulp.dest('public/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('public/manifest/'))
})

gulp.task('rev_collector', () => {
    return gulp.src(['public/manifest/**/*.json', 'views/layouts/layout.pug'])
        .pipe( revCollector({
            replaceReved: true
        }))
        .pipe( gulp.dest('views/layouts/') )
})

gulp.task('rev_clean', function() {
    return gulp.src( ['public/*.*'], {read: false})
        .pipe( revOutdated(1) )
        .pipe( cleaner() );
});

// gulp.task('production', (callback) => {
//     runSequence(
//         ['js_min', 'css_min'],
//         'rev',
//         'rev_collector',
//         'rev_clean',
//         callback
//     )
// })







gulp.task('sass', function () {
    return gulp
        .src([
            'public/src/sass/**/*.scss'
        ])
        .pipe(sass())
        .pipe(gulp.dest('public/src/css'))
});

gulp.task('watch', () => {
    gulp.watch('public/src/sass/**/*.scss', gulp.series('sass'))
})

gulp.task('bs', /* ['nodemon'], */ function() {
	browserSync.init(null, {
		proxy: "http://localhost:3000",
        files: [
            'views/**/*.*',
            'public/src/css/**/*.*',
            'public/src/js/**/*.*'
        ],
        port: 7000
	});
});

gulp.task('nodemon', function (cb) {
	var started = false;
	return nodemon({
		script: 'app.js'
	}).on('start', function () {
		if (!started) {
			cb();
			started = true; 
		} 
	});
});