import isGlob from 'is-glob';
import { dim } from 'kleur';

export const enum Action {
  abort = 'abort',
  delete = 'delete',
  up = 'up',
  down = 'down',
  submit = 'submit',
  keypress = 'keypress',
}

interface Key {
  name: string;
  ctrl: boolean;
  meta: boolean;
}

type MatchedIndex = [number, number];

export function getAction(key: Key): Action | void {
  if (key.meta) return;

  if (key.ctrl) {
    if (key.name === 'c') return Action.abort;
  }

  if (key.name === 'backspace') return Action.delete;
  if (key.name === 'up') return Action.up;
  if (key.name === 'down') return Action.down;
  if (key.name === 'return') return Action.submit;

  return Action.keypress;
}

export function getScrollPosition(
  cursor: number | null,
  total: number,
  limit: number
): [number, number] {
  const isInitialRender = cursor === null;
  const hasEnoughHeight = limit >= total;
  const halfScreenIndex = Math.floor(limit / 2);

  if (isInitialRender || hasEnoughHeight || (cursor as number) <= halfScreenIndex) {
    return [0, limit];
  }

  const startIndex = (cursor as number) - halfScreenIndex;
  const endIndex = startIndex + limit;

  if (endIndex > total) {
    return [total - limit, total];
  }

  return [startIndex, endIndex];
}

export function highlight(pattern = '', path = ''): string {
  pattern = pattern.trim();
  if (pattern.length === 0) return dim(path);

  // by default, it's a white color text.
  if (isGlob(pattern)) return path;

  const matchedIndexes = getMatchedIndexes(path, pattern);
  if (matchedIndexes.length === 0) return dim(path);

  return dimUnmatchedStrings(path, matchedIndexes);
}

// purposely avoided using the `regexp.exec` method to extract start, end indexes
function getMatchedIndexes(path = '', pattern = ''): [] | MatchedIndex[] {
  const regexp = new RegExp(pattern, 'ig');
  const matches = path.match(regexp) || [];

  if (matches.length === 0) return [];

  const indexes: MatchedIndex[] = [];
  let startIndex;
  let position: undefined | number;

  matches.forEach(match => {
    startIndex = path.indexOf(match, position === undefined ? 0 : position);

    indexes.push([startIndex, startIndex + match.length]);

    // next start position
    position = startIndex + 1;
  });

  return indexes;
}

function dimUnmatchedStrings(path = '', matchedIndexes: [] | MatchedIndex[]): string {
  if (matchedIndexes.length === 0) return path;

  const matches = [];
  let previousEnd = 0;

  // @ts-ignore
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
