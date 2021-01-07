// Custom type definitions for unexposed internal methods from Mocha v8.1.3

import type { MochaOptions } from '../../lib/mocha/load-options';

declare module 'mocha/lib/cli/lookup-files' {
  export = lookupFiles;

  function lookupFiles(
    filepath: string,
    extensions?: string[],
    recursive?: boolean
  ): string[];
}

declare module 'mocha/lib/errors' {
  export = errors;

  interface Constants {
    NO_FILES_MATCH_PATTERN: string;
  }

  namespace errors {
    const constants: Constants;
  }
}

declare module 'mocha/lib/cli/options' {
  export declare function loadOptions(argv: string[]): { [key: string]: unknown };
}

declare module 'mocha/lib/cli/run-helpers' {
  declare function handleRequires(requires?: string[]): Promise<unknown>;

  declare function validatePlugin(
    options: MochaOptions,
    pluginType: string,
    map?: { [key: string]: unknown }
  ): void;

  declare function loadRootHooks(
    rootHooks: unknown[]
  ): Promise<{ [key: string]: unknown }>;
}
