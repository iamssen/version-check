const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const {getPackages, getPackageJson} = require('./index');

/**
 * @param strs {string[]}
 * @return {number}
 */
function count(strs) {
  return strs.reduce((max, str) => Math.max(max, str.length), 0);
}

/**
 * @param results {Result[]}
 * @param printTitle {boolean}
 */
function print(results, printTitle) {
  const nameLength = results.reduce((max, result) => {
    return Math.max(count(result.modules.map(module => module.name)), max);
  }, 0);

  const lineLength = results.reduce((max, result) => {
    return Math.max(count(result.modules.map(module => {
      let name = module.name;
      let f = name.length - 1;
      while (++f < nameLength) name += ' ';
      return name + ' ' + module.version;
    })), max);
  }, 0);

  results.forEach(result => {
    if (printTitle) {
      let name = result.title;
      let f = name.length - 1;
      while (++f < lineLength) name += ' ';
      console.log(chalk.bgWhite.black.bold(name));
    }

    result.modules.forEach(module => {
      let name = module.name;
      let f = name.length - 1;
      while (++f < nameLength) name += ' ';
      console.log(chalk.green(name) + ' ' + module.version);
    })

    console.log('');
  })
}

if (process.argv && process.argv.length > 2) { // version-check rxjs typescript ...
  getPackages(process.argv.slice(2)).then(result => print([result], false));
} else { // version-check
  const cwd = process.cwd();
  const file = path.join(cwd, 'package.json');

  if (fs.existsSync(file)) {
    getPackageJson(file).then((...results) => print([].concat(results[0]), true));
  } else {
    console.log(chalk.red(`Error: Undefined package.json in this directory`), file);
  }
}
