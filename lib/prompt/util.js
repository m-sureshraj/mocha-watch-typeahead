const isGlob = require('is-glob');
const { dim } = require('kleur');

function getAction(key) {
  if (key.meta) return;

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

function dimUnmatchedStrings(path = '', matchedIndexes = []) {
  if (matchedIndexes.length === 0) return path;

  const matches = [];
  let previousEnd = 0;

  matchedIndexes.forEach(([start, end]) => {
    if (start !== previousEnd) {
      // unmatched string
      matches.push(dim(path.slice(previousEnd, start)));
    }

    // matched string
    matches.push(path.slice(start, end));
    previousEnd = end;
  });

  // remaining unmatched strings
  const [, end] = matchedIndexes[matchedIndexes.length - 1];
  if (end < path.length) {
    matches.push(dim(path.slice(end)));
  }

  return matches.join('');
}

// purposely avoided using the `regexp.exec` method to extract start, end indexes
function getMatchedIndexes(path = '', pattern = '') {
  const regexp = new RegExp(pattern, 'ig');
  const matches = path.match(regexp) || [];

  if (matches.length === 0) return [];

  const indexes = [];
  let startIndex;
  let position;

  matches.forEach(match => {
    startIndex = path.indexOf(match, position === undefined ? 0 : position);

    indexes.push([startIndex, startIndex + match.length]);

    // next start position
    position = startIndex + 1;
  });

  return indexes;
}

function highlight(pattern = '', path = '') {
  pattern = pattern.trim();
  if (pattern.length === 0) return dim(path);

  // by default, it's a white color text.
  if (isGlob(pattern)) return path;

  const matchedIndexes = getMatchedIndexes(path, pattern);
  if (matchedIndexes.length === 0) return dim(path);

  return dimUnmatchedStrings(path, matchedIndexes);
}

module.exports = {
  getAction,
  getScrollPosition,
  highlight,
};
