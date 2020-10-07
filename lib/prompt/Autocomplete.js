const readline = require('readline');
const EventEmitter = require('events');

const {
  cursorShow,
  eraseLine,
  beep,
  cursorLeft,
  cursorUp,
  cursorForward,
  eraseDown,
} = require('ansi-escapes');
const stripAnsi = require('strip-ansi');
const { dim, bgYellow } = require('kleur');
const mm = require('micromatch');

const { getAction, getScrollPosition } = require('./util');

const identity = item => item;

class Prompt extends EventEmitter {
  constructor() {
    super();

    this.in = process.stdin;
    this.out = process.stdout;

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

class Autocomplete extends Prompt {
  constructor(options = {}) {
    super();

    this.list = options.list || [];
    this.limit = options.limit || 10;
    this.format = typeof options.format === 'function' ? options.format : identity;

    this.firstRender = true;
    this.input = '';
    this.cursor = 0;
    this.message = dim(' filter ›');
    this.focusedItemIndex = null;
    this.filteredList = [];

    // to pass following methods as a callback
    this.suggestion = this.suggestion.bind(this);
    this.renderOption = this.renderOption.bind(this);

    this.render();
  }

  onKeypress(str) {
    if (typeof str === 'undefined') return;

    this.input += str;
    this.cursor++;

    this.resetFocusedItem();
    this.render();
  }

  delete() {
    // To prevent deleting the prompt message.
    if (this.cursor === 0) return this.bell();

    this.cursor--;
    this.input = this.input.slice(0, this.cursor);

    this.resetFocusedItem();
    this.render();
  }

  down() {
    // do nothing when the filtered list is empty
    if (!this.filteredList.length) return;

    // do nothing when the last element is focused
    if (this.focusedItemIndex === this.filteredList.length - 1) return;

    if (this.focusedItemIndex === null) {
      this.focusedItemIndex = 0;
    } else {
      this.focusedItemIndex++;
    }

    this.render();
  }

  up() {
    // do nothing when there is no focused item, or when the filtered list is empty
    if (this.focusedItemIndex === null || this.filteredList.length === 0) return;

    // reset the focus when the first item is focused
    if (this.focusedItemIndex === 0) {
      this.resetFocusedItem();
    } else {
      this.focusedItemIndex--;
    }

    this.render();
  }

  submit() {
    const matches = Number.isInteger(this.focusedItemIndex)
      ? [this.filteredList[this.focusedItemIndex]]
      : this.filteredList;

    if (!matches.length) {
      this.bell();
      return;
    }

    this.emit('submit', matches.map(this.format));
    this.cleanup();
  }

  resetFocusedItem() {
    this.focusedItemIndex = null;
  }

  updateFilterList() {
    if (this.input === '') {
      this.filteredList = this.list.map(item => item);
    } else {
      this.filteredList = this.list.filter(this.suggestion);
    }
  }

  renderOption({ label }, isFocused, isStart, isEnd) {
    const prefix = dim('›');
    const scrollIndicator = isStart ? ' ↑' : isEnd ? ' ↓' : '';
    const body = isFocused ? bgYellow().black(label) : dim(label);

    return ` ${prefix}${scrollIndicator} ${body}`;
  }

  suggestion(item) {
    if (this.input === '') return true;

    return mm.contains(item.label, this.input);
  }

  render() {
    if (!this.firstRender) {
      this.out.write(eraseDown);
    }

    this.updateFilterList();

    const [startIndex, endIndex] = getScrollPosition(
      this.focusedItemIndex,
      this.filteredList.length,
      this.limit
    );

    this.outputText = [this.message, this.input].join(' ');

    const suggestions = this.filteredList
      .slice(startIndex, endIndex)
      .map((item, index) => {
        return this.renderOption(
          item,
          this.focusedItemIndex === index + startIndex,
          index === 0 && startIndex > 0,
          index + startIndex === endIndex - 1 && endIndex < this.filteredList.length
        );
      })
      .join('\n');

    this.outputText += `\n\n${suggestions || ' No matches found'}`;

    // update the cursor position
    const cursorY = cursorUp(this.outputText.split('\n').length - 1);
    const cursorX =
      cursorLeft + cursorForward(stripAnsi(this.message).length + this.input.length + 1);

    this.out.write(eraseLine + cursorLeft + this.outputText + cursorY + cursorX);

    this.firstRender = false;
  }
}

module.exports = Autocomplete;
