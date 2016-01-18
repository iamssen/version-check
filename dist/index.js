var packageJson = require('package-json');
var Promise = require('bluebird');
var chalk = require('chalk');
function print(packages, subTitle) {
    if (subTitle === void 0) { subTitle = null; }
    Promise
        .all(packages.map(function (pkg) { return packageJson(pkg, 'latest'); }))
        .then(function (jsons) {
        if (subTitle)
            console.log(subTitle);
        var nameMaxLength = 0;
        jsons.forEach(function (json) {
            var length = json.name.length;
            if (length > nameMaxLength)
                nameMaxLength = length;
        });
        jsons.forEach(function (json) {
            var name = json.name;
            var f = name.length - 1;
            while (++f < nameMaxLength)
                name += ' ';
            console.log(chalk.green(name), json.version);
        });
    });
}
if (process.argv && process.argv.length > 2) {
    print(process.argv.slice(2));
}
//# sourceMappingURL=index.js.map