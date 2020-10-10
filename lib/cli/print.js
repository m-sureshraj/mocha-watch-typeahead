const { dim, yellow, white } = require('kleur');
const { clearScreen } = require('ansi-escapes');

const { isDebugEnabled } = require('./util');

const arrow = '\u203A';

function printFilterUsage(stdout = process.stdout) {
  if (!isDebugEnabled()) stdout.write(clearScreen);
  stdout.write(yellow().bold('Filter Mode\n\n'));

  stdout.write(
    ` ${dim(`${arrow} Press`)} ${white().bold('Enter')} ${dim(
      'to run filtered test files.'
    )}\n`
  );
  stdout.write(
    ` ${dim(`${arrow} Press`)} ${white().bold('Esc')} ${dim('to quit filter mode.')}\n\n`
  );
}

function printTestRunnerUsage(stdout = process.stdout) {
  if (!isDebugEnabled()) stdout.write(clearScreen);
  stdout.write(yellow().bold('Test Runner Mode\n\n'));

  stdout.write(
    ` ${dim(`${arrow} Press`)} ${white().bold('f')} ${dim('to go to filter mode.')}\n`
  );
  stdout.write(
    ` ${dim(`${arrow} Press`)} ${white().bold('Esc')} ${dim(
      'to quit test runner mode.'
    )}\n\n`
  );
}

module.exports = {
  printFilterUsage,
  printTestRunnerUsage,
};
