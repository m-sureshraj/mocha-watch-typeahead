// const isGlob = require('is-glob');
// const { yellow } = require('kleur');

function getAction(key) {
  if (key.meta) {
    // if (key.name === 'escape') return 'abort';

    return;
  }

  if (key.ctrl) {
    if (key.name === 'c') return 'abort';
  }

  if (key.name === 'backspace') return 'delete';
  if (key.name === 'up') return 'up';
  if (key.name === 'down') return 'down';
  if (key.name === 'return') return 'submit';

  return false;
}

function getScrollPosition(cursor, total, limit) {
  const half = Math.floor(limit / 2);

  if (cursor === null || cursor <= half) {
    return [0, limit];
  }

  // Max scroll reached
  if (cursor + half >= total) {
    return [total - limit, total];
  }

  const start = cursor - half;
  const end = start + limit;

  return [start, end];
}

// function highlight(pattern = '', value = '') {
//   if (isGlob(pattern)) return yellow(value);
//
//   const regExp = new RegExp(pattern, 'ig');
//
//   return value.replace(regExp, yellow(value));
// }

module.exports = {
  getAction,
  getScrollPosition,
};
