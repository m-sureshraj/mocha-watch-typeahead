const Autocomplete = require('./Autocomplete');

function autoComplete(options) {
  return new Promise((resolve, reject) => {
    const autocomplete = new Autocomplete(options);

    autocomplete.on('submit', matches => {
      resolve(matches);
    });
  });
}

module.exports = {
  autoComplete,
  Autocomplete,
};
