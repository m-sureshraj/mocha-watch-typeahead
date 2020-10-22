import readline from 'readline';
import path from 'path';

import type { Key } from './Types';

import { printFilterUsage } from './print';
import { autoComplete } from '../prompt';

function handleKeypress(_: unknown, key: Key): void {
  // Ctrl + c || Esc
  if ((key.ctrl && key.name === 'c') || key.name === 'escape') {
    process.stdout.write('\n');
    process.exit();
  }
}

export default async function promptFilter(filePaths: string[] = []): Promise<string[]> {
  if (process.stdin.isTTY) process.stdin.setRawMode?.(true);

  const rl = readline.createInterface({
    input: process.stdin,
    escapeCodeTimeout: 50,
  });
  readline.emitKeypressEvents(process.stdin, rl);

  process.stdin.on('keypress', handleKeypress);

  printFilterUsage();

  const list = filePaths.map(filePath => ({
    value: filePath,
    // get relative path from absolute path
    label: path.relative(process.cwd(), filePath),
  }));
  const matchedTestFiles = await autoComplete({
    list,
    format: ({ value }: { value: string }) => value,
  });

  // cleanup
  process.stdin.removeListener('keypress', handleKeypress);
  process.stdin.setRawMode?.(false);
  rl.close();

  return matchedTestFiles;
}
