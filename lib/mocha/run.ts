import Mocha, { MochaOptions } from 'mocha';
import { handleRequires, validatePlugin, loadRootHooks } from 'mocha/lib/cli/run-helpers';

import { watchRun } from './watch-run';

import type { MochaOptions as Options } from './load-options';

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

async function preRun(options: Options) {
  // https://github.com/mochajs/mocha/blob/v8.1.3/lib/cli/run.js#L341
  try {
    // load requires first, because it can impact "plugin" validation
    const rawRootHooks = await handleRequires(options.require);
    validatePlugin(options, 'reporter', Mocha.reporters);
    validatePlugin(options, 'ui', Mocha.interfaces);

    if (rawRootHooks && rawRootHooks.length) {
      options.rootHooks = await loadRootHooks(rawRootHooks);
    }
  } catch (err) {
    // this could be a bad --require, bad reporter, ui, etc.
    console.error(err);
    process.exit(1);
  }
}

export async function run(options: Options = {}): Promise<Run> {
  await preRun(options);

  const mocha = new Mocha(options as MochaOptions);
  const watchOptions = {
    extension: options.extension || [],
    watchFiles: options.watchFiles,
    watchIgnore: options.watchIgnore,
  };

  return watchRun(mocha, watchOptions);
}
