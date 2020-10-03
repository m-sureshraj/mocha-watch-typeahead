const readline = require('readline');

const { printTestRunnerUsage } = require('./print');

function handleKeypress(str, key) {
  // ctrl + c (terminate)
  if (key.ctrl && key.name === 'c') {
    process.stdout.write('\n');
    process.exit();
  }

  if (key.name === 'escape') {
    process.exit();
  }
}

function switchToTestRunnerMode(matchedTestFiles, mochaOptions) {
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  const rl = readline.createInterface({
    input: process.stdin,
    escapeCodeTimeout: 50,
  });
  readline.emitKeypressEvents(process.stdin, rl);

  process.stdin.on('keypress', handleKeypress);

  printTestRunnerUsage();
}

module.exports = switchToTestRunnerMode;

// const { run } = require('../mocha/run');

// (async () => {
//   try {
//     await run(options);
//   } catch (error) {
//     console.error(`\n${error.stack || `Error: ${error.message || error}`}`);
//     process.exit(1);
//   }
// })();

// Notes
// * By default, mocha cli will watch following files [ '**/*.js', '**/*.cjs', '**/*.mjs' ]
