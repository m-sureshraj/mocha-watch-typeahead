const Mocha = require('mocha');
const {
  handleRequires,
  validatePlugin,
  loadRootHooks,
} = require('mocha/lib/cli/run-helpers');

const { watchRun } = require('./watch-run');

async function run(options = {}) {
  await preRun(options);

  const {
    extension = [],
    ignore = [],
    file = [],
    // Todo: support parallel run
    // parallel = false,
    recursive = false,
    sort = false,
    spec = [],
  } = options;

  const fileCollectParams = {
    ignore,
    extension,
    file,
    recursive,
    sort,
    spec,
  };

  const mocha = new Mocha(options);

  return watchRun(mocha, options, fileCollectParams);
}

async function preRun(options) {
  // https://github.com/mochajs/mocha/blob/master/lib/cli/run.js#L337
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
