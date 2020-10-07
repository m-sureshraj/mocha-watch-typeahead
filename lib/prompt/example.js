const { autoComplete } = require('./index');

const options = {
  list: [
    { label: 'lib/cli/index.js', value: { name: 'master', age: 100 } },
    { label: 'lib/cli/print.js', value: { name: 'yoda', age: 200 } },
    { label: 'lib/mocha/run.js', value: { name: 'foo', age: 300 } },
    { label: '.eslintrc.js', value: { name: 'king', age: 400 } },
    { label: 'foo.js', value: { name: 'king', age: 400 } },
    { label: 'bar.js', value: { name: 'king', age: 400 } },
    { label: 'kool.js', value: { name: 'king', age: 400 } },
  ],
  limit: 3,
};

(async () => {
  const results = await autoComplete(options);

  console.log(results);
})();
