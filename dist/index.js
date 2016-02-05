var packageJson = require('package-json');
var Promise = require('bluebird');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
function count(strs) {
    var max = 0;
    strs.forEach(function (str) {
        var length = str.length;
        if (length > max)
            max = length;
    });
    return max;
}
function load(title, names) {
    return Promise
        .all(names.map(function (pkg) { return packageJson(pkg, 'latest'); }))
        .then(function (modules) {
        return { title: title, modules: modules };
    });
}
function npm(packageJson, key) {
    if (packageJson.hasOwnProperty(key)) {
        var packages = [];
        var dependencies = packageJson[key];
        for (var dependency in dependencies) {
            packages.push(dependency);
        }
        return packages;
    }
    return null;
}
function jspm(packageJson, key) {
    if (packageJson.hasOwnProperty('jspm') && packageJson['jspm'].hasOwnProperty(key)) {
        var packages = [];
        var dependencies = packageJson['jspm'][key];
        for (var dependency in dependencies) {
            if (dependencies[dependency].indexOf('npm:') === 0)
                packages.push(dependency);
        }
        return packages;
    }
    return null;
}
function print(results, printTitle) {
    var nameLength = 0;
    results.forEach(function (result) {
        var length = count(result.modules.map(function (module) { return module.name; }));
        if (length > nameLength)
            nameLength = length;
    });
    var lineLength = 0;
    results.forEach(function (result) {
        var length = count(result.modules.map(function (module) {
            var name = module.name;
            var f = name.length - 1;
            while (++f < nameLength)
                name += ' ';
            return name + ' ' + module.version;
        }));
        if (length > lineLength)
            lineLength = length;
    });
    results.forEach(function (result) {
        if (printTitle) {
            var name_1 = result.title;
            var f = name_1.length - 1;
            while (++f < lineLength)
                name_1 += ' ';
            console.log(chalk.bgWhite.black.bold(name_1));
        }
        result.modules.forEach(function (module) {
            var name = module.name;
            var f = name.length - 1;
            while (++f < nameLength)
                name += ' ';
            console.log(chalk.green(name) + ' ' + module.version);
        });
        console.log('');
    });
}
if (process.argv && process.argv.length > 2) {
    var names = process.argv.slice(2);
    load('packages', names).then(function (result) { return print([result], false); });
}
else {
    var cwd = process.cwd();
    var file = path.join(cwd, 'package.json');
    if (!fs.existsSync(file))
        throw new Error("Can't find '" + file + "'");
    var packageJson_1 = JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }));
    var packages = [
        { title: 'depdencencies', packages: npm(packageJson_1, 'dependencies') },
        { title: 'devDependencies', packages: npm(packageJson_1, 'devDependencies') },
        { title: 'peerDependencies', packages: npm(packageJson_1, 'peerDependencies') },
        { title: 'bundledDependencies', packages: npm(packageJson_1, 'bundledDependencies') },
        { title: 'optionalDependencies', packages: npm(packageJson_1, 'optionalDependencies') },
        { title: 'jspm.dependencies', packages: jspm(packageJson_1, 'dependencies') },
        { title: 'jspm.devDependencies', packages: jspm(packageJson_1, 'devDependencies') }
    ].filter(function (pkg) { return pkg.packages !== null; });
    var promises = packages.map(function (pkg) { return load(pkg.title, pkg.packages); });
    Promise.all(promises).then(function () {
        var results = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            results[_i - 0] = arguments[_i];
        }
        return print([].concat(results[0]), true);
    });
}
//# sourceMappingURL=index.js.map