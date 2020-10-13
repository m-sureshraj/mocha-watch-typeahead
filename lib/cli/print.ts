import { dim, yellow, white } from 'kleur';
import { clearScreen } from 'ansi-escapes';

import { isDebugEnabled } from './util';

const arrow = '\u203A';

export function printFilterUsage(stdout = process.stdout): void {
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

export function printTestRunnerUsage(stdout = process.stdout): void {
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
