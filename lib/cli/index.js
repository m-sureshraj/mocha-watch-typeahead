const debug = require('debug')('cli');

const loadOptions = require('../mocha/load-options');
const collectFiles = require('../mocha/collect-files');
const promptFilter = require('./filter');
const switchToTestRunnerMode = require('./test-runner');
const { isDebugEnabled, lineBreak } = require('./util');

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

    const collectedFiles = collectFiles(fileCollectParams);
    if (!collectedFiles.length) {
      console.log('Based on your Mocha configuration, no spec files were matched!');
      debug('file collect params: %O', fileCollectParams);
      process.exit(1);
    }

    const filteredFiles = await promptFilter(collectedFiles);

    if (isDebugEnabled()) lineBreak(2);

    await switchToTestRunnerMode(filteredFiles, collectedFiles, options);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
