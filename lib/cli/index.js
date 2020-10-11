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

    const { collectedSpecFiles, filesGivenThroughFileOption } = collectFiles(
      fileCollectParams
    );

    if (collectedSpecFiles.length === 0 && filesGivenThroughFileOption.length === 0) {
      console.log(
        yellow('Based on your Mocha configuration, no spec files were matched!')
      );
      debug('file collect params: %O', fileCollectParams);
      process.exit();
    }

    let filteredFiles = [];
    if (collectedSpecFiles.length) {
      // note: filter list won't display files that are given through --file option
      filteredFiles = await promptFilter(collectedSpecFiles);
    }

    if (isDebugEnabled()) lineBreak(2);
    debug('filtered files: %O', filteredFiles);

    // add files given through --file to be ran first
    const filesToBeTest = filesGivenThroughFileOption.concat(filteredFiles);
    debug('files to be test: %O', filesToBeTest);

    await switchToTestRunnerMode(
      filesToBeTest,
      { collectedSpecFiles, filesGivenThroughFileOption },
      options
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
