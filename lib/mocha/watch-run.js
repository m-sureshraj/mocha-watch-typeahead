// https://github.com/mochajs/mocha/blob/v8.1.3/lib/cli/watch-run.js

const path = require('path');

const chokidar = require('chokidar');
const debug = require('debug')('watch-run');
const Context = require('mocha/lib/context');

function beforeRun({ mocha, filesToBeTest }) {
  mocha.unloadFiles();

  // I don't know why we're cloning the root suite.
  const rootSuite = mocha.suite.clone();

  // this `require` is needed because the require cache has been cleared.  the dynamic
  // exports set via the below call to `mocha.ui()` won't work properly if a
  // test depends on this module (see `required-tokens.spec.js`).
  const Mocha = require('mocha');

  // ... and now that we've gotten a new module, we need to use it again due
  // to `mocha.ui()` call
  const newMocha = new Mocha(mocha.options);
  // don't know why this is needed
  newMocha.suite = rootSuite;
  // nor this
  newMocha.suite.ctx = new Context();

  // reset the list of files
  newMocha.files = filesToBeTest;

  // because we've swapped out the root suite (see the `run` inner function
  // in `createRerunner`), we need to call `mocha.ui()` again to set up the context/globals.
  newMocha.ui(newMocha.options.ui);

  // we need to call `newMocha.rootHooks` to set up rootHooks for the new
  // suite
  newMocha.rootHooks(newMocha.options.rootHooks);

  return newMocha;
}

exports.watchRun = (mocha, watchOptions) => {
  debug('creating serial watcher');

  return createWatcher(mocha, watchOptions);
};

function createWatcher(mocha, { watchFiles, watchIgnore, extension }) {
  debug('default extension: %s', extension);

  if (!watchFiles) {
    watchFiles = extension.map(ext => `**/*.${ext}`);
  }

  debug('ignoring files matching: %s', watchIgnore);
  debug('watching files matching: %s', watchFiles);

  const watcher = chokidar.watch(watchFiles, {
    ignored: watchIgnore, // ['node_modules', '.git'] ignored by default
    ignoreInitial: true,
  });

  const reRunner = createReRunner(mocha, watcher);

  return {
    watcher,
    reRunner,
  };
}

const createReRunner = (mocha, watcher) => {
  // Set to a `Runner` when mocha is running. Set to `null` when mocha is not running.
  let runner = null;

  // true if a file has changed during a test run
  let rerunScheduled = false;

  const run = filesToBeTest => {
    mocha = beforeRun({ mocha, filesToBeTest });

    runner = mocha.run(() => {
      debug('finished watch run');
      runner = null;
      blastCache(watcher);

      if (rerunScheduled) {
        debug('rerunning scheduled run for: %s', filesToBeTest);
        rerun(filesToBeTest);
      } else {
        debug('waiting for changes...');
      }
    });
  };

  const scheduleRun = filesToBeTest => {
    if (rerunScheduled) return;

    rerunScheduled = true;

    if (runner) {
      runner.abort();
    } else {
      rerun(filesToBeTest);
    }
  };

  const rerun = filesToBeTest => {
    rerunScheduled = false;
    run(filesToBeTest);
  };

  return {
    scheduleRun,
    run,
    runner,
  };
};

const blastCache = watcher => {
  const files = getWatchedFiles(watcher);
  files.forEach(file => {
    delete require.cache[file];
  });
  debug('deleted %d file(s) from the require cache', files.length);
};

const getWatchedFiles = watcher => {
  const watchedDirs = watcher.getWatched();
  return Object.keys(watchedDirs).reduce(
    (acc, dir) => [...acc, ...watchedDirs[dir].map(file => path.join(dir, file))],
    []
  );
};
