const fs = require('fs');
const path = require('path');
const tmp = require('tmp');

module.exports = (initScript, type) => {
    let initialScript = fs
        .readFileSync(path.join(__dirname, `./${type}.template.js`), "utf8")
        .replace('{{{INIT_SCRIPT}}}', initScript);

    let tempScriptFile = tmp.fileSync({ postfix: `.${type}.js` });
    fs.writeFileSync (tempScriptFile.name, initialScript, { mode: 0o755 });
    return tempScriptFile;
};