const EventEmitter = require('events');
const readline = require('readline');
const { cursorShow, beep } = require('ansi-escapes');

const { getAction } = require('./util');

class Prompt extends EventEmitter {
  constructor(options) {
    super();

    this.in = options.stdin || process.stdin;
    this.out = options.stdout || process.stdout;

    const rl = readline.createInterface({
      input: this.in,
    });
    readline.emitKeypressEvents(this.in, rl);

    if (this.in.isTTY) this.in.setRawMode(true);
    this.in.write(cursorShow);

    const keypress = (str, key) => {
      let action = getAction(key);

      if (action === false) {
        this.onKeypress(str, key);
      } else if (typeof this[action] === 'function') {
        // specific actions (submit, abort, ...)
        this[action](key);
      } else {
        this.bell();
      }
    };

    this.cleanup = () => {
      this.in.removeListener('keypress', keypress);
      this.in.setRawMode(false);
      rl.close();
    };

    this.abort = () => {
      this.cleanup();
      this.out.write('\n');
    };

    this.in.on('keypress', keypress);
  }

  bell() {
    this.out.write(beep);
  }
}

module.exports = Prompt;
