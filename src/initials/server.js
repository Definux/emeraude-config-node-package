const baseInit = require('./baseInit.js');

module.exports = (initScript) => {
    return baseInit(initScript, 'server');
};