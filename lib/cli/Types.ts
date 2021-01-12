export interface Key {
  name: string;
  ctrl: boolean;
  meta: boolean;
}

// Fixme: mocha/run.js should provide the following types
export enum RunnerState {
  running = 'running',
}

type Runner = { abort: () => Runner; state: RunnerState };

export interface ReRunner {
  run: (files: string[]) => void;
  scheduleRun: (files: string[]) => void;
  getRunner: () => null | Runner;
}

export interface Run {
  watcher: NodeJS.EventEmitter;
  reRunner: ReRunner;
}
