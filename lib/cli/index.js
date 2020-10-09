const debug = require('debug')('cli');
const { yellow } = require('kleur');

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
    debug('collected files: %O', collectedFiles);

    if (!collectedFiles.length) {
      console.log(
        yellow('Based on your Mocha configuration, no spec files were matched!')
      );
      debug('file collect params: %O', fileCollectParams);
      process.exit();
    }

    const filteredFiles = await promptFilter(collectedFiles);

    if (isDebugEnabled()) lineBreak(2);
    debug('filtered files: %O', filteredFiles);

    await switchToTestRunnerMode(filteredFiles, collectedFiles, options);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
