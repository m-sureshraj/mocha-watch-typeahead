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
  const isInitialRender = cursor === null;
  const hasEnoughHeight = limit >= total;
  const halfScreenIndex = Math.floor(limit / 2);

  if (isInitialRender || hasEnoughHeight || cursor <= halfScreenIndex) {
    return [0, limit];
  }

  const startIndex = cursor - halfScreenIndex;
  const endIndex = startIndex + limit;

  if (endIndex > total) {
    return [total - limit, total];
  }

  return [startIndex, endIndex];
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
