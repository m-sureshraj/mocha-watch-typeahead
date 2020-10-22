import debugModule from 'debug';
import { yellow } from 'kleur';

import loadOptions from '../mocha/load-options';
import collectFiles from '../mocha/collect-files';
import promptFilter from './filter';
import switchToTestRunnerMode from './test-runner';
import { isDebugEnabled, lineBreak } from './util';

const debug = debugModule('typeahead-cli');

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

    let filteredFiles: string[] = [];
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
