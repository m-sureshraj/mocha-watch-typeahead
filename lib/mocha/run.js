const Mocha = require('mocha');
const {
  handleRequires,
  validatePlugin,
  loadRootHooks,
} = require('mocha/lib/cli/run-helpers');

const { watchRun } = require('./watch-run');

async function run(options = {}) {
  await preRun(options);

  const mocha = new Mocha(options);
  const watchOptions = {
    extension: options.extension || [],
    watchFiles: options.watchFiles,
    watchIgnore: options.watchIgnore,
  };

  return watchRun(mocha, watchOptions);
}

async function preRun(options) {
  // https://github.com/mochajs/mocha/blob/v8.1.3/lib/cli/run.js#L341
  try {
    // load requires first, because it can impact "plugin" validation
    const rawRootHooks = await handleRequires(options.require);
    validatePlugin(options, 'reporter', Mocha.reporters);
    validatePlugin(options, 'ui', Mocha.interfaces);

    if (rawRootHooks && rawRootHooks.length) {
      options.rootHooks = await loadRootHooks(rawRootHooks);
    }
  } catch (err) {
    // this could be a bad --require, bad reporter, ui, etc.
    console.error(err);
    process.exit(1);
  }
}

module.exports = {
  run,
};
