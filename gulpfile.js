const gulp = require('gulp');
const del = require('del');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const minify = require('gulp-minify');
const sass = require('gulp-sass')(require('sass'));
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const imagemin = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminPngquant = require('imagemin-pngquant');
const webp = require('gulp-webp');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const tailwindcss = require('tailwindcss');
const cleanCSS = require('gulp-clean-css');
const fs = require('fs');
const path = require('path');

const imageDirs = [
  path.join(__dirname, 'public/videos/video1'),
  path.join(__dirname, 'public/videos/video2'),
];

const paths = {
  dirs: {
    build: './public'
  },
  html: {
    src: ['./*.html'],
    watch: ['./*.html']
  },
  css: {
    src: './src/styles/style.scss',
    dest: './public/css',
    watch: ['./src/blocks/**/*.scss', './src/styles/**/*.scss', './src/styles/*.scss']
  },
  jsVendor: {
    src: ['./node_modules/jquery/dist/jquery.min.js', './src/plugins/*.js'],
    dest: './public/js',
    watch: './src/plugins/*.js',
  },
  js: {
    src: './src/blocks/**/*.js',
    dest: './public/js',
    watch: './src/blocks/**/*.js',
  },
  images: {
    src: ['./src/images/*', './src/images/**/*', './src/images/**/**/*'],
    dest: './public/img',
    watch: ['./src/images/*']
  },
  imagesWebp: {
    src: ['./src/images/*.{jpg,png}', './src/images/**/*.{jpg,png}'],
    dest: './public/img',
    watch: ['./src/images/*', './src/images/**/*']
  },
  fonts: {
    src: './src/fonts/*',
    dest: './public/fonts',
    watch: './src/fonts/*'
  },
  videos: {
    src: ['./src/videos/*', './src/videos/**/*'],
    dest: './public/videos',
    watch: './src/videos/*'
  },
};

gulp.task('generateConfig', function (done) {
  let totalImages = 0;
  let imagesPerFolder = {};

  imageDirs.forEach((dir, index) => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
      totalImages += files.length;
      imagesPerFolder[`folder${index + 1}`] = files.length;
    } else {
      console.warn(`⚠️ Warning: Folder not found - ${dir}`);
    }
  });

  const config = { totalImages, imagesPerFolder };
  fs.writeFileSync('./public/config.json', JSON.stringify(config, null, 2));
  console.log(`✅ Found ${totalImages} images across all folders. Saved to config.json`);

  done();
});

gulp.task('clean', function () {
  return del([paths.dirs.build]);
});

gulp.task('html', function () {
  return gulp.src(paths.html.src)
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('styles', function () {
  return gulp.src(paths.css.src)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe( postcss([
      tailwindcss('./tailwind.config.js'),
      require('autoprefixer'),
    ]) )
    .pipe(cleanCSS({ 
      compatibility: '*',
      // format: 'beautify',
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.css.dest))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('scriptsVendor', function () {
  return gulp.src(paths.jsVendor.src)
    .pipe(plumber())
    //.pipe(sourcemaps.init())
    .pipe(concat('vendor.js'))
    .pipe(minify())
    //.pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.jsVendor.dest))
    .pipe(browserSync.reload({
      stream: true
    }));

});

gulp.task('scripts', function () {
  return gulp.src(paths.js.src)
    .pipe(plumber())
    // .pipe(sourcemaps.init())
    .pipe(concat('scripts.js'))
    .pipe(minify())
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.js.dest))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('images', function () {
  return gulp.src(paths.images.src, {since: gulp.lastRun('images')})
    .pipe(plumber())
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true,
        optimizationLevel: 3
      }),
      imageminJpegRecompress({
        progressive: true,
        max: 90,
        min: 80
      }),
      imageminPngquant({
        quality: [0.8, 0.9]
      }),
      imagemin.svgo({plugins: [{removeViewBox: true}]})
    ]))
    .pipe(gulp.dest(paths.images.dest));
});

gulp.task('images-webp', function () {
  return gulp.src(paths.imagesWebp.src)
    .pipe(plumber())
    .pipe(webp({quality: 75}))
    .pipe(gulp.dest(paths.imagesWebp.dest));
});

gulp.task('fonts', function () {
  return gulp.src(paths.fonts.src)
    .pipe(plumber())
    .pipe(gulp.dest(paths.fonts.dest))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('videos', function () {
  return gulp.src(paths.videos.src)
    .pipe(plumber())
    .pipe(gulp.dest(paths.videos.dest))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('server', function () {
  browserSync.init({
    server: {
      baseDir: './'
    },
    reloadOnRestart: true
  });
  gulp.watch(paths.html.watch, gulp.parallel('html'));
  gulp.watch(paths.html.watch, gulp.parallel('styles'));
  gulp.watch(paths.css.watch, gulp.parallel('styles'));
  gulp.watch(paths.jsVendor.watch, gulp.parallel('scriptsVendor'));
  gulp.watch(paths.js.watch, gulp.parallel('scripts'));
  gulp.watch(paths.js.watch, gulp.parallel('styles'));
  gulp.watch(paths.images.watch, gulp.parallel('images'));
  gulp.watch(paths.fonts.watch, gulp.parallel('fonts'));
  // gulp.watch(paths.videos.watch, gulp.parallel('videos'));
  // gulp.watch('./public/videos/**/*', gulp.parallel('generateConfig'));
});

gulp.task('watch', function () {
  gulp.watch(paths.html.watch, gulp.parallel('html'));
  gulp.watch(paths.html.watch, gulp.parallel('styles'));
  gulp.watch(paths.css.watch, gulp.parallel('styles'));
  gulp.watch(paths.jsVendor.watch, gulp.parallel('scriptsVendor'));
  gulp.watch(paths.js.watch, gulp.parallel('scripts'));
  gulp.watch(paths.js.watch, gulp.parallel('styles'));
  gulp.watch(paths.images.watch, gulp.parallel('images'));
  gulp.watch(paths.fonts.watch, gulp.parallel('fonts'));
  // gulp.watch(paths.videos.watch, gulp.parallel('videos'));
  // gulp.watch(paths.webfonts.watch, gulp.parallel('webfonts'));
  // gulp.watch('./public/videos/**/*', gulp.parallel('generateConfig'));
});

gulp.task('dev', gulp.series(
  'clean',
  'styles',
  'scriptsVendor',
  'scripts',
  'fonts',
  // 'videos',
  'images',
  'images-webp',
  // 'generateConfig',
  'server'
));

gulp.task('build', gulp.series(
  'clean',
  'styles',
  'scriptsVendor',
  'scripts',
  'fonts',
  // 'videos',
  'images',
  'images-webp',
  // 'generateConfig',
));
