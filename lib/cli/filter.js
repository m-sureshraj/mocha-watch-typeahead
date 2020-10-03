const readline = require('readline');
const path = require('path');

const { printFilterUsage } = require('./print');
const { autoComplete } = require('../prompt');

function handleKeypress(str, key) {
  // Ctrl + c || Esc
  if ((key.ctrl && key.name === 'c') || key.name === 'escape') {
    process.stdout.write('\n');
    process.exit();
  }
}

async function promptFilter(collectedTestFiles = []) {
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  const rl = readline.createInterface({
    input: process.stdin,
    escapeCodeTimeout: 50,
  });
  readline.emitKeypressEvents(process.stdin, rl);

  process.stdin.on('keypress', handleKeypress);

  printFilterUsage();

  const list = collectedTestFiles.map(filePath => ({
    value: filePath,
    // get relative path from absolute path
    label: path.relative(process.cwd(), filePath),
  }));
  const matchedTestFiles = await autoComplete({
    list,
    format: ({ value }) => value,
  });

  // cleanup
  process.stdin.removeListener('keypress', handleKeypress);
  process.stdin.setRawMode(false);
  rl.close();

  return matchedTestFiles;
}

module.exports = promptFilter;
