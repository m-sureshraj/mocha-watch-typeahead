const camelCase = require('camelcase');
const { loadOptions: mochaLoadOptions } = require('mocha/lib/cli');

const kebabCaseKeyRegex = /\w-\w/i;

// Mocha internally uses yargs lib to parse argument values.
// The following function will output a config similar to yargs lib output.

module.exports = function loadOptions(argv = []) {
  const options = mochaLoadOptions(argv);

  options.spec = options._; // assign positional arguments

  // substitute kebab-case keys
  const substitutedKeys = {};
  Object.keys(options).forEach(key => {
    if (kebabCaseKeyRegex.test(key)) {
      substitutedKeys[camelCase(key)] = options[key];
    }
  });

  return Object.assign(options, substitutedKeys);
};
