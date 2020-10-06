const { cursorShow, cursorHide } = require('ansi-escapes');

const hideCursor = (stdout = process.stdout) => {
  stdout.write(cursorHide);
};

const showCursor = (stdout = process.stdout) => {
  stdout.write(cursorShow);
};

const isDebugEnabled = () => Boolean(process.env.DEBUG);

const lineBreak = (count = 1, stdout = process.stdout) => {
  stdout.write('\n'.repeat(count));
};

module.exports = {
  hideCursor,
  showCursor,
  isDebugEnabled,
  lineBreak,
};
