const readline = require('readline');
const debug = require('debug')('test-runner');

const { printTestRunnerUsage } = require('./print');
const { run } = require('../mocha/run');
const { showCursor, hideCursor, isDebugEnabled, lineBreak } = require('./util');
const promptFilter = require('./filter');

let isInFilterMode = false;
let boundedKeypressHandler = null;
let recentlyFilteredFiles = [];

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

async function handleKeypress({ rl, reRunner, collectedFiles }, _, key) {
  // Ctrl + c || Esc
  if ((key.ctrl && key.name === 'c') || key.name === 'escape') {
    showCursor();
    process.exit();
  }

  if (key.name === 'f') {
    debug('switching to filter mode');
    isInFilterMode = true;

    if (reRunner.runner) {
      debug('aborting test execution');
      reRunner.runner.abort();
    }
    closeReadline(rl);

    recentlyFilteredFiles = await promptFilter(collectedFiles);

    if (isDebugEnabled()) lineBreak(2);
    debug('new filtered files: %O', recentlyFilteredFiles);

    // switch back to test runner
    isInFilterMode = false;

    boundedKeypressHandler = handleKeypress.bind(null, {
      rl: getInitializedReadline(),
      collectedFiles,
      reRunner,
    });
    process.stdin.on('keypress', boundedKeypressHandler);

    printTestRunnerUsage();
    hideCursor();

    debug('Scheduling a run');
    reRunner.scheduleRun(recentlyFilteredFiles);
  }
}

async function switchToTestRunnerMode(filteredFiles, collectedFiles, mochaOptions) {
  recentlyFilteredFiles = filteredFiles;
  const rl = getInitializedReadline();

  try {
    const { watcher, reRunner } = await run(mochaOptions);

    watcher.on('ready', () => {
      reRunner.run(recentlyFilteredFiles);
    });

    watcher.on('all', () => {
      if (isInFilterMode) return;

      reRunner.scheduleRun(recentlyFilteredFiles);
    });

    // why not inline callback? because we need the handler ref to remove later.
    boundedKeypressHandler = handleKeypress.bind(null, { rl, collectedFiles, reRunner });
    process.stdin.on('keypress', boundedKeypressHandler);

    printTestRunnerUsage();
    hideCursor();
  } catch (error) {
    console.error(`\n${error.stack || `Error: ${error.message || error}`}`);
    process.exit(1);
  }
}

module.exports = switchToTestRunnerMode;
