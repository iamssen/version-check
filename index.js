const packageJson = require('package-json');
const fs = require('fs');

/**
 * @typedef {{
 *  name: string,
 *  version: string
 * }} Module
 *
 * @typedef {{
 *  title: string,
 *  modules: Module[]
 * }} Result
 */

/**
 * @param title {string}
 * @param names {string[]}
 * @return {Promise}
 */
function load(title, names) {
  return Promise.all(names.map(pkg => packageJson(pkg, 'latest')))
                .then(modules => ({title, modules}))
}

/**
 * @param packageJson {*}
 * @param key {string}
 * @return {string[]}
 */
function npm(packageJson, key) {
  if (packageJson.hasOwnProperty(key)) {
    const packages = [];
    const dependencies = packageJson[key];
    for (let dependency in dependencies) {
      if (dependencies.hasOwnProperty(dependency)) packages.push(dependency);
    }
    return packages;
  }
  return null;
}

/**
 * @param packageJson {*}
 * @param key {string}
 * @return {string[]}
 */
function jspm(packageJson, key) {
  if (packageJson.hasOwnProperty('jspm') && packageJson['jspm'].hasOwnProperty(key)) {
    const packages = [];
    const dependencies = packageJson['jspm'][key];
    for (let dependency in dependencies) {
      if (dependencies.hasOwnProperty(dependency) && dependencies[dependency].indexOf('npm:') === 0) packages.push(dependency);
    }
    return packages;
  }
  return null;
}

exports.getPackages = function (names) {
  return load('packages', names);
}

exports.getPackageJson = function (file) {
  if (!fs.existsSync(file)) throw new Error(`Can't find '${file}'`);
  
  const packageJson = JSON.parse(fs.readFileSync(file, {encoding: 'utf8'}));
  const packages = [
    {title: 'depdencencies', packages: npm(packageJson, 'dependencies')},
    {title: 'devDependencies', packages: npm(packageJson, 'devDependencies')},
    {title: 'peerDependencies', packages: npm(packageJson, 'peerDependencies')},
    {title: 'bundledDependencies', packages: npm(packageJson, 'bundledDependencies')},
    {title: 'optionalDependencies', packages: npm(packageJson, 'optionalDependencies')},
    {title: 'jspm.dependencies', packages: jspm(packageJson, 'dependencies')},
    {title: 'jspm.devDependencies', packages: jspm(packageJson, 'devDependencies')}
  ].filter(pkg => pkg.packages !== null);
  
  return Promise.all(packages.map(pkg => load(pkg.title, pkg.packages)))
}