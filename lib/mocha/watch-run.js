const path = require('path');

const chokidar = require('chokidar');
const debug = require('debug')('watch-run');
const Context = require('mocha/lib/context');

exports.watchRun = (mocha, { watchFiles, watchIgnore }, fileCollectParams) => {
  debug('creating serial watcher');

  return createWatcher(mocha, {
    watchFiles,
    watchIgnore,
    beforeRun({ mocha, files }) {
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
      newMocha.files = files;

      // because we've swapped out the root suite (see the `run` inner function
      // in `createRerunner`), we need to call `mocha.ui()` again to set up the context/globals.
      newMocha.ui(newMocha.options.ui);

      // we need to call `newMocha.rootHooks` to set up rootHooks for the new
      // suite
      newMocha.rootHooks(newMocha.options.rootHooks);

      return newMocha;
    },
    afterRun({ watcher }) {
      blastCache(watcher);
    },
    fileCollectParams,
  });
};

function createWatcher(
  mocha,
  { watchFiles, watchIgnore, beforeRun, afterRun, fileCollectParams }
) {
  if (!watchFiles) {
    debug('default extension: %s', fileCollectParams.extension);
    watchFiles = fileCollectParams.extension.map(ext => `**/*.${ext}`);
  }

  debug('ignoring files matching: %s', watchIgnore);
  debug('watching files matching: %s', watchFiles);

  const watcher = chokidar.watch(watchFiles, {
    ignored: watchIgnore.concat(['node_modules', '.git']),
    ignoreInitial: true,
  });

  const reRunner = createReRunner(mocha, watcher, {
    beforeRun,
    afterRun,
  });

  return {
    watcher,
    reRunner,
  };
}

const createReRunner = (mocha, watcher, { beforeRun, afterRun } = {}) => {
  // Set to a `Runner` when mocha is running. Set to `null` when mocha is not running.
  let runner = null;

  // true if a file has changed during a test run
  let rerunScheduled = false;

  const run = files => {
    mocha = beforeRun ? beforeRun({ mocha, files }) : mocha;

    runner = mocha.run(() => {
      debug('finished watch run');
      runner = null;
      afterRun && afterRun({ mocha, watcher });

      if (rerunScheduled) {
        rerun();
      } else {
        debug('waiting for changes...');
      }
    });
  };

  const scheduleRun = files => {
    if (rerunScheduled) return;

    rerunScheduled = true;

    if (runner) {
      runner.abort();
    } else {
      rerun(files);
    }
  };

  const rerun = files => {
    rerunScheduled = false;
    run(files);
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

// process.on('SIGINT', () => {
//   showCursor();
//   process.exit(128 + 2);
// });
//
// return watcher;
