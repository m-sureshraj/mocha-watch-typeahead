export interface Key {
  name: string;
  ctrl: boolean;
  meta: boolean;
}

export interface MochaOptions {
  [key: string]: string;
}

export interface Files {
  collectedSpecFiles: string[];
  filesGivenThroughFileOption: string[];
}

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
