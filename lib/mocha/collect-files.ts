// Original implementation - https://github.com/mochajs/mocha/blob/v8.1.3/lib/cli/collect-files.js

import path from 'path';

import debugModule from 'debug';
import mm from 'micromatch'; // Mocha uses minimatch
import lookupFiles from 'mocha/lib/cli/lookup-files';
import { constants } from 'mocha/lib/errors';

const debug = debugModule('typeahead:collect-files');

export interface Files {
  collectedSpecFiles: string[];
  filesGivenThroughFileOption: string[];
}

interface CollectFilesInput {
  ignore: string[];
  extension: string[];
  file: string[];
  recursive: boolean;
  sort: boolean;
  spec: string[];
}

interface UnmatchedFile {
  message: string;
  pattern: string;
}

export default function collectFiles({
  ignore,
  extension,
  file,
  recursive,
  sort,
  spec,
}: CollectFilesInput): Files {
  let files: string[] = [];
  const unmatched: UnmatchedFile[] = [];

  spec.forEach(arg => {
    let newFiles: ReturnType<typeof lookupFiles>;

    try {
      newFiles = lookupFiles(arg, extension, recursive);
    } catch (err) {
      if (err.code === constants.NO_FILES_MATCH_PATTERN) {
        unmatched.push({ message: err.message, pattern: err.pattern });
        return;
      }

      throw err;
    }

    files = files.concat(
      // Filter ignored (--ignore) paths from the files
      // Note that the following filter handling logic is a bit different than the Mocha implementation
      newFiles.filter(fileName => !mm.contains(fileName, ignore))
    );
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
}
