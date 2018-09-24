const sizes = {
  xl: 80,
  lg: 64,
  md: 48,
  sm: 32,
};

module.exports.sizes = sizes;

const media = Object.keys(sizes)
  .reduce((accumulator, label) => {
    accumulator[`${label}Min`] = `@media (min-width: ${sizes[label] + 0.0625}rem)`; // eslint-disable-line max-len
    accumulator[`${label}Max`] = `@media (max-width: ${sizes[label]}rem)`;
    return accumulator;
  }, {});

module.exports.media = media;
