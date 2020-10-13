const EventEmitter = require('events');
const readline = require('readline');
const { cursorShow, beep } = require('ansi-escapes');

const { getAction, Action } = require('./util');

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

      if (!action) {
        this.bell();
        return;
      }

      if (action === Action.keypress) {
        this.onKeypress(str);
      } else if (typeof this[action] === 'function') {
        // specific actions (submit, abort, ...)
        this[action](key);
      }
    };

    this.cleanup = () => {
      this.in.removeListener('keypress', keypress);
      this.in.setRawMode(false);
      rl.close();
    };

    this.in.on('keypress', keypress);
  }

  onKeypress(_str) {}

  abort() {
    this.cleanup();
    this.out.write('\n');
  }

  bell() {
    this.out.write(beep);
  }
}

module.exports = Prompt;
