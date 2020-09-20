const loadOptions = require('./mocha/load-options');
const { run } = require('./mocha/run');

// const collectFiles = require('./mocha/collect-files');

const options = loadOptions(process.argv.slice(2));

// const {
//   ignore = [],
//   extension = [],
//   file = [],
//   recursive = false,
//   sort = false,
//   spec = [],
//   watchFiles = [],
// } = options;

// const fileCollectParams = {
//   ignore,
//   extension,
//   file,
//   recursive,
//   sort,
//   spec,
// };

// console.log(collectFiles(fileCollectParams));

(async () => {
  try {
    await run(options);
  } catch (error) {
    console.error(`\n${error.stack || `Error: ${error.message || error}`}`);
    process.exit(1);
  }
})();

// Notes
// * By default, mocha cli will watch following files [ '**/*.js', '**/*.cjs', '**/*.mjs' ]
