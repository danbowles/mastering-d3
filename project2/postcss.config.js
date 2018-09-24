module.exports = {
  plugins: {
    'postcss-cssnext': {},
    'postcss-import': {},
    'postcss-preset-env': {
      browsers: 'last 2 versions',
    },
    'postcss-custom-media': {
      preserve: true,
      importFrom: {
        customMedia: {
          '--small-viewport': 'max-width(100px)',
        },
      },
      exportTo: 'src/styles/custom-media.css',
    },
  },
};
