import { cursorShow, cursorHide } from 'ansi-escapes';

export const hideCursor = (stdout = process.stdout): void => {
  stdout.write(cursorHide);
};

export const showCursor = (stdout = process.stdout): void => {
  stdout.write(cursorShow);
};

export const isDebugEnabled = (): boolean => Boolean(process.env.DEBUG);

export const lineBreak = (count = 1, stdout = process.stdout): void => {
  stdout.write('\n'.repeat(count));
};
