// Original implementation - https://github.com/mochajs/mocha/blob/v8.1.3/lib/cli/collect-files.js

const path = require('path');

const { lookupFiles } = require('mocha/lib/cli');
const { NO_FILES_MATCH_PATTERN } = require('mocha/lib/errors').constants;
const mm = require('micromatch'); // Mocha uses minimatch
const debug = require('debug')('mocha:watch:collect-files');

module.exports = function collectFiles({
  ignore,
  extension,
  file,
  recursive,
  sort,
  spec,
}) {
  let files = [];
  const unmatched = [];

  spec.forEach(arg => {
    let newFiles;
    try {
      newFiles = lookupFiles(arg, extension, recursive);
    } catch (err) {
      if (err.code === NO_FILES_MATCH_PATTERN) {
        unmatched.push({ message: err.message, pattern: err.pattern });
        return;
      }

      throw err;
    }

    if (typeof newFiles !== 'undefined') {
      if (typeof newFiles === 'string') {
        newFiles = [newFiles];
      }

      // Filter ignored (--ignore) paths from the files
      // Note that the following filter handling logic is a bit different than the Mocha implementation
      newFiles = newFiles.filter(fileName => !mm.contains(fileName, ignore));
    }

    files = files.concat(newFiles);
  });

  const fileArgs = file.map(filepath => path.resolve(filepath));
  files = files.map(filepath => path.resolve(filepath));

  if (sort) files.sort();

  debug('collected spec files (in order): ', files);
  debug('files given through --file option: ', fileArgs);

  if (!files.length) debug('no test files found');
  if (unmatched.length) debug('unmatched files: ', unmatched);

  return {
    collectedSpecFiles: files,
    filesGivenThroughFileOption: fileArgs,
  };
};
