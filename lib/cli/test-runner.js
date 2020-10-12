const readline = require('readline');
const debug = require('debug')('test-runner');

const { printTestRunnerUsage } = require('./print');
const { run } = require('../mocha/run');
const { showCursor, hideCursor, isDebugEnabled, lineBreak } = require('./util');
const promptFilter = require('./filter');

let isInFilterMode = false;
let boundedKeypressHandler = null;
let filesToBeTest = [];
const STATE_RUNNING = 'running';

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

function waitForTestsToStop(reRunner) {
  return new Promise(resolve => {
    const runner = reRunner.getRunner();

    if (!runner || runner.state !== STATE_RUNNING) {
      debug('tests have already stopped');
      return resolve();
    }

    debug('aborting test execution');
    const _runner = runner.abort();

    const id = setInterval(() => {
      if (_runner.state !== STATE_RUNNING) {
        debug('waiting for tests to stop');
        clearInterval(id);
        resolve();
      }
    }, 500); // No specific reason. Just a random timeout
  });
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

async function switchToTestRunnerMode(_filesToBeTest, files, mochaOptions) {
  filesToBeTest = _filesToBeTest;
  const rl = getInitializedReadline();

  try {
    const { watcher, reRunner } = await run(mochaOptions);

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

module.exports = switchToTestRunnerMode;
