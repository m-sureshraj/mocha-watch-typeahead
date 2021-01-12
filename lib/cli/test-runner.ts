import readline from 'readline';

import debugModule from 'debug';

import type { Key, ReRunner, Run, MochaOptions } from './Types';
import type { Files } from '../mocha/collect-files';

import { RunnerState } from './Types';
import { printTestRunnerUsage } from './print';
import { run } from '../mocha/run';
import { hideCursor, isDebugEnabled, lineBreak, showCursor } from './util';
import promptFilter from './filter';

const debug = debugModule('typeahead:test-runner');

interface KeypressHandlerInput {
  rl: readline.Interface;
  reRunner: ReRunner;
  files: Files;
}

let isInFilterMode = false;
let boundedKeypressHandler: (...args: [unknown, Key]) => Promise<void>;
let filesToBeTest: string[] = [];

function getInitializedReadline() {
  if (process.stdin.isTTY) process.stdin.setRawMode?.(true);

  const rl = readline.createInterface({
    input: process.stdin,
    escapeCodeTimeout: 50,
  });
  readline.emitKeypressEvents(process.stdin, rl);

  return rl;
}

function closeReadline(rl: readline.Interface) {
  if (process.stdin.isTTY) process.stdin.setRawMode?.(false);

  process.stdin.removeListener('keypress', boundedKeypressHandler);
  rl.close();
}

function waitForTestsToStop(reRunner: ReRunner): Promise<void> {
  return new Promise(resolve => {
    const runner = reRunner.getRunner();

    if (!runner || runner.state !== RunnerState.running) {
      debug('tests have already stopped');
      return resolve();
    }

    debug('aborting test execution');
    const _runner = runner.abort();

    const id = setInterval(() => {
      if (_runner.state !== RunnerState.running) {
        debug('waiting for tests to stop');
        clearInterval(id);
        resolve();
      }
    }, 500); // No specific reason. Just a random timeout
  });
}

async function handleKeypress(
  { rl, reRunner, files }: KeypressHandlerInput,
  _: unknown,
  key: Key
) {
  // Ctrl + c || Esc
  if ((key.ctrl && key.name === 'c') || key.name === 'escape') {
    process.exit();
  }

  if (key.name === 'f') {
    debug('switching to filter mode');
    closeReadline(rl);
    isInFilterMode = true;

    await waitForTestsToStop(reRunner);

    const newFilteredFiles = await promptFilter(files.collectedSpecFiles);

    if (isDebugEnabled()) lineBreak(2);
    debug('new filtered files: %O', newFilteredFiles);

    filesToBeTest = files.filesGivenThroughFileOption.concat(newFilteredFiles);
    debug('new files to be test: %O', filesToBeTest);

    // switch back to test runner
    isInFilterMode = false;

    boundedKeypressHandler = handleKeypress.bind(null, {
      rl: getInitializedReadline(),
      files,
      reRunner,
    });
    process.stdin.on('keypress', boundedKeypressHandler);

    printTestRunnerUsage();
    hideCursor();

    debug('Scheduling a run');
    reRunner.scheduleRun(filesToBeTest);
  }
}

export default async function switchToTestRunnerMode(
  _filesToBeTest: string[],
  files: Files,
  mochaOptions: MochaOptions
): Promise<void> {
  filesToBeTest = _filesToBeTest;
  const rl = getInitializedReadline();

  try {
    const { watcher, reRunner }: Run = await run(mochaOptions);

    watcher.on('ready', () => {
      reRunner.run(filesToBeTest);
    });

    watcher.on('all', () => {
      if (isInFilterMode) {
        debug("Don't schedule a run in filter mode.");
        return;
      }

      reRunner.scheduleRun(filesToBeTest);
    });

    process.on('exit', () => {
      showCursor();
    });

    process.on('SIGINT', () => {
      showCursor();
      process.exit(128 + 2);
    });

    boundedKeypressHandler = handleKeypress.bind(null, { rl, files, reRunner });
    process.stdin.on('keypress', boundedKeypressHandler);

    printTestRunnerUsage();
    hideCursor();
  } catch (error) {
    console.error(`\n${error.stack || `Error: ${error.message || error}`}`);
    process.exit(1);
  }
}
