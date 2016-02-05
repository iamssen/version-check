/// <reference path="typings/tsd.d.ts"/>
let packageJson = require('package-json');
import * as Promise from 'bluebird';
import * as chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

interface Module {
  name: string;
  version: string;
}

interface Result {
  title: string;
  modules: Module[];
}

function count(strs:string[]):number {
  let max:number = 0;
  strs.forEach(str => {
    const length:number = str.length;
    if (length > max) max = length;
  });
  return max;
}

function load(title:string, names:string[]):Promise<Result> {
  return Promise
    .all(names.map((pkg:string) => packageJson(pkg, 'latest') as Module))
    .then((modules:Module[]) => {
      return {title, modules};
    });
}

function npm(packageJson:any, key:string):string[] {
  if (packageJson.hasOwnProperty(key)) {
    let packages:string[] = [];
    let dependencies:{[module:string]:string} = packageJson[key];
    for (let dependency in dependencies) {
      packages.push(dependency);
    }
    return packages;
  }
  return null;
}

function jspm(packageJson:any, key:string):string[] {
  if (packageJson.hasOwnProperty('jspm') && packageJson['jspm'].hasOwnProperty(key)) {
    let packages:string[] = [];
    let dependencies:{[module:string]:string} = packageJson['jspm'][key];
    for (let dependency in dependencies) {
      if (dependencies[dependency].indexOf('npm:') === 0) packages.push(dependency);
    }
    return packages;
  }
  return null;
}

function print(results:Result[], printTitle:boolean) {
  let nameLength:number = 0;
  results.forEach((result:Result) => {
    const length:number = count(result.modules.map((module:Module) => module.name));
    if (length > nameLength) nameLength = length;
  });

  let lineLength:number = 0;
  results.forEach((result:Result) => {
    const length:number = count(result.modules.map((module:Module) => {
      let name:string = module.name;
      let f:number = name.length - 1;
      while (++f < nameLength) name += ' ';
      return name + ' ' + module.version;
    }));
    if (length > lineLength) lineLength = length;
  });

  results.forEach((result:Result) => {
    if (printTitle) {
      let name:string = result.title;
      let f:number = name.length - 1;
      while (++f < lineLength) name += ' ';
      console.log(chalk.bgWhite.black.bold(name));
    }

    result.modules.forEach(module => {
      let name:string = module.name;
      let f:number = name.length - 1;
      while (++f < nameLength) name += ' ';
      console.log(chalk.green(name) + ' ' + module.version);
    })

    console.log('')
  })
}

if (process.argv && process.argv.length > 2) {
  const names:string[] = process.argv.slice(2);
  load('packages', names).then(result => print([result], false));
} else {
  const cwd:string = process.cwd();
  const file:string = path.join(cwd, 'package.json');

  if (!fs.existsSync(file)) throw new Error(`Can't find '${file}'`);

  const packageJson:any = JSON.parse(fs.readFileSync(file, {encoding: 'utf8'}));
  const packages:{title:string, packages:string[]}[] = [
    {title: 'depdencencies', packages: npm(packageJson, 'dependencies')},
    {title: 'devDependencies', packages: npm(packageJson, 'devDependencies')},
    {title: 'peerDependencies', packages: npm(packageJson, 'peerDependencies')},
    {title: 'bundledDependencies', packages: npm(packageJson, 'bundledDependencies')},
    {title: 'optionalDependencies', packages: npm(packageJson, 'optionalDependencies')},
    {title: 'jspm.dependencies', packages: jspm(packageJson, 'dependencies')},
    {title: 'jspm.devDependencies', packages: jspm(packageJson, 'devDependencies')}
  ].filter(pkg => pkg.packages !== null);

  const promises:Promise<Result>[] = packages.map(pkg => load(pkg.title, pkg.packages));
  Promise.all(promises).then((...results) => print([].concat(results[0]), true))
}