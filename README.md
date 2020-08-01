# Emeraude bundle configuration

emeraude.config.js
```
const webpack = require('webpack');
const emeraudeConfig = require('emeraude-config');

module.exports = () => {
    return emeraudeConfig({
        appEntry: './ClientApp/main.js',
        publicPath: '/dist',
        serverConfig: {

        },
        clientConfig: {

        }
    });
};
```