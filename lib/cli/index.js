const loadOptions = require('../mocha/load-options');
const collectFiles = require('../mocha/collect-files');
const promptFilter = require('./filter');
const switchToTestRunnerMode = require('./test-runner');

(async () => {
  try {
    const options = loadOptions(process.argv.slice(2));

    const {
      ignore = [],
      extension = [],
      file = [],
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

    const files = collectFiles(fileCollectParams);
    if (!files.length) {
      // todo: add a proper message
      process.exit(1);
    }

    const matchedFiles = await promptFilter(files, options);

    switchToTestRunnerMode();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
