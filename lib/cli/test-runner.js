const readline = require('readline');
const debug = require('debug')('test-runner');

const { printTestRunnerUsage } = require('./print');
const { run } = require('../mocha/run');
const { showCursor, hideCursor, isDebugEnabled, lineBreak } = require('./util');
const promptFilter = require('./filter');

let isInFilterMode = false;
let boundedKeypressHandler = null;
let filesToBeExecuted = [];

function getInitializedReadline() {
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  const rl = readline.createInterface({
    input: process.stdin,
    escapeCodeTimeout: 50,
  });
  readline.emitKeypressEvents(process.stdin, rl);

  return rl;
}

function closeReadline(rl) {
  if (process.stdin.isTTY) process.stdin.setRawMode(false);

  process.stdin.removeListener('keypress', boundedKeypressHandler);
  rl.close();
}

async function handleKeypress({ rl, reRunner, files }, _, key) {
  // Ctrl + c || Esc
  if ((key.ctrl && key.name === 'c') || key.name === 'escape') {
    process.exit();
  }

  if (key.name === 'f') {
    debug('switching to filter mode');
    closeReadline(rl);
    isInFilterMode = true;

    if (reRunner.runner) {
      debug('aborting test execution');
      reRunner.runner.abort();
    }

    const newFilteredFiles = await promptFilter(files.collectedSpecFiles);

    if (isDebugEnabled()) lineBreak(2);
    debug('new filtered files: %O', newFilteredFiles);

    filesToBeExecuted = files.filesGivenThroughFileOption.concat(newFilteredFiles);
    debug('new files to be executed: %O', filesToBeExecuted);

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
    reRunner.scheduleRun(filesToBeExecuted);
  }
}

async function switchToTestRunnerMode(_filesToBeExecuted, files, mochaOptions) {
  filesToBeExecuted = _filesToBeExecuted;
  const rl = getInitializedReadline();

  try {
    const { watcher, reRunner } = await run(mochaOptions);

    watcher.on('ready', () => {
      reRunner.run(filesToBeExecuted);
    });

    watcher.on('all', () => {
      if (isInFilterMode) return;

      reRunner.scheduleRun(filesToBeExecuted);
    });

    process.on('exit', () => {
      showCursor();
    });

    process.on('SIGINT', () => {
      showCursor();
      process.exit(128 + 2);
    });

    // why not inline callback? because we need the handler ref to remove later.
    boundedKeypressHandler = handleKeypress.bind(null, { rl, files, reRunner });
    process.stdin.on('keypress', boundedKeypressHandler);

    printTestRunnerUsage();
    hideCursor();
  } catch (error) {
    console.error(`\n${error.stack || `Error: ${error.message || error}`}`);
    process.exit(1);
  }
}

module.exports = switchToTestRunnerMode;
