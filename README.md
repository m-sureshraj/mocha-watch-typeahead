# mocha-watch-typeahead

![npm](https://img.shields.io/npm/v/mocha-watch-typeahead?color=brightgreen)

The `mocha-watch-typeahead` is an attempt to add interactive
watch mode support for the [Mocha](https://mochajs.org/) test framework. Besides rerunning tests on file changes, it provides a feature to filter tests by file name.

> ![mocha-watch-typeahead in action](https://raw.githubusercontent.com/m-sureshraj/mocha-watch-typeahead/HEAD/media/mocha-watch-in-action.gif 'mocha-watch-typeahead in action')

## Install

```
npm install mocha@8.1.3 mocha-watch-typeahead -D --save-exact
```

The `mocha-watch-typeahead` uses some internal methods from `mocha@8.1.3`, So at the moment
it directly depends on `mocha@8.1.3` (the latest version at the time of writing).

## Usage

First, you have to configure the mocha. For that, please refer to its getting start [guide](https://mochajs.org/#getting-started).
Then add the following npm script to the `package.json`.

```json
{
  "scripts": {
    "test-watch": "mocha-watch"
  }
}
```

Think `mocha-watch` is an alias for command `mocha`.
You can pass all valid `mocha` options to the `mocha-watch` as well.
The only difference is, it always runs in watch mode.

```
npm run test-watch
```

Based on your mocha configuration, it collects all the matched
test files and prompt autocomplete to filter tests by file name.
You can filter tests by **glob** pattern as well.

> ![mocha-watch-typeahead in action](https://raw.githubusercontent.com/m-sureshraj/mocha-watch-typeahead/HEAD/media/filter-mode.png 'filter mode')

Note, the above list won't display files that are loaded
through the [--file](https://mochajs.org/#-file-filedirectoryglob) option.

## Temporary limitations

The `mocha-watch-typeahead` has a few known temporary limitations at the moment.

* It only tested with the latest version of mocha (v8.1.3). Probably it won't work with the older versions of mocha.
* It only supports serial run, although mocha's built-in watch mode has support for [parallel](https://mochajs.org/#-parallel-p) run.
* It doesn't validate passed options.

If you encounter the following warning message in watch mode, you can safely ignore it. It's a known mocha [issue](https://github.com/mochajs/mocha/issues/117).

```
MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
11 uncaughtException listeners added to [process]. Use emitter.setMaxListeners() to increase limit
```

## Future improvements

* Watch mode feedback speed can be increased by not watching non-filter test files.
* Resolve the temporary limitations.

## Credits

* [Mocha](https://mochajs.org/)
* Inspired by [jest-watch-typeahead](https://github.com/jest-community/jest-watch-typeahead)
* Some ideas have been taken from the [Prompts](https://github.com/terkelg/prompts) project to build the autocomplete.

## License

MIT © [Sureshraj](https://github.com/m-sureshraj)
