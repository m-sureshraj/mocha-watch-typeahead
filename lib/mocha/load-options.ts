import camelCase from 'camelcase';
import debugModule from 'debug';
import { loadOptions as mochaLoadOptions } from 'mocha/lib/cli/options';

const debug = debugModule('typeahead:load-options');

const kebabCaseKeyRegex = /\w-\w/i;

// Note: `loadOptions` fn returns a few more options than the following interface.
// Though we only consume the following properties directly.
export interface MochaOptions {
  sort?: boolean;
  recursive?: boolean;
  file?: string[];
  extension?: string[];
  ignore?: string[];
  spec?: string[];
  [key: string]: unknown;
}

// Mocha internally uses yargs to parse argument values.
// The following function will output a config similar to yargs output.
export default function loadOptions(argv: string[]): MochaOptions {
  const options = mochaLoadOptions(argv);
  debug('Mocha loaded options: ', options);

  let updatedOptions: MochaOptions = {
    ...options,
    // assign positional arguments
    spec: [...(options._ as string[])],
  };

  // in yargs output, _ is an empty array
  updatedOptions._ = [];

  // substitute kebab-case keys
  const substitutedKeys: { [key: string]: unknown } = {};
  Object.keys(options).forEach(key => {
    if (kebabCaseKeyRegex.test(key)) {
      substitutedKeys[camelCase(key)] = options[key];
    }
  });

  updatedOptions = Object.assign(updatedOptions, substitutedKeys);

  debug('Mocha updated options: ', updatedOptions);
  return updatedOptions;
}
