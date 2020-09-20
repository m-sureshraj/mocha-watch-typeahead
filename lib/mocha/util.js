const hideCursor = () => {
  process.stdout.write('\u001b[?25l');
};

const showCursor = () => {
  process.stdout.write('\u001b[?25h');
};

const eraseLine = () => {
  process.stdout.write('\u001b[2K');
};

module.exports = {
  hideCursor,
  showCursor,
  eraseLine,
};
