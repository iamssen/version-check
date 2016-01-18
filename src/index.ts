/// <reference path="typings/tsd.d.ts"/>
let packageJson = require('package-json');
import * as Promise from 'bluebird';
import * as chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

interface PackageJson {
	name: string;
	version: string;
}

function print(packages:string[], subTitle:string = null) {
	Promise
		.all(packages.map((pkg:string) => packageJson(pkg, 'latest')))
		.then((jsons:PackageJson[]) => {
			if (subTitle) console.log(subTitle);

			let nameMaxLength:number = 0;

			jsons.forEach(json => {
				let length:number = json.name.length;
				if (length > nameMaxLength) nameMaxLength = length;
			});

			jsons.forEach(json => {
				let name:string = json.name;
				let f:number = name.length - 1;
				while (++f < nameMaxLength) name += ' ';
				console.log(chalk.green(name), json.version);
			});
		})
}

if (process.argv && process.argv.length > 2) {
	print(process.argv.slice(2));
}
//else {
//	const cwd:string = process.cwd();
//	const file:string = path.join(cwd, 'package.json');
//
//	if (!fs.existsSync(file)) throw new Error(`Can't find '${file}'`);
//
//	const packageJson:any = JSON.parse(fs.readFileSync(file, {encoding: 'utf8'}));
//}