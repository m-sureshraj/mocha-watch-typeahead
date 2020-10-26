// Since we are using a few unexposed internal methods from Mocha,
// we can't utilize the existing @types/mocha type definition.

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
