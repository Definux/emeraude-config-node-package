const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const merge = require('webpack-merge');
const CompressionPlugin = require('compression-webpack-plugin');
const WebpackBar = require('webpackbar');
const isDevelopment = !(process.env.NODE_ENV && process.env.NODE_ENV === 'production');
const clientInitial = require('./initials/client.js');
const serverInitial = require('./initials/server.js');

module.exports = function(config) {
    const appEntry = config.appEntry;
    const projectPath = config.projectPath || process.cwd();
    const entryPath = path.join(projectPath, appEntry).replace(/\\/g,'\\\\');
    const outputPath = path.join(projectPath, 'wwwroot', config.publicPath);
    let clientEntryFile = clientInitial(entryPath);
    let serverEntryFile = serverInitial(entryPath);

    const sharedConfig = () => ({
        mode: isDevelopment ? 'development' : 'production',
        devtool: '',
        stats: { modules: false },
        resolve: { extensions: ['.js', '.vue'] },
        output: {
            filename: '[name].js',
            publicPath: config.publicPath
        },
        devServer: {
          stats: { chunks: false }
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader'
                },
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    include: projectPath,
                    exclude: file => (
                        /node_modules/.test(file) &&
                        !/\.vue\.js/.test(file)
                    )
                },
                {
                    test: /\.css$/,
                    oneOf: [
                        {
                            resourceQuery: /module/,
                            use: [
                                'vue-style-loader',
                                {
                                    loader: 'css-loader',
                                    options: {
                                        modules: true,
                                        localIdentName: '[local]_[hash:base64:5]'
                                    }
                                }
                            ]
                        },
                        {
                            use: [
                                'vue-style-loader',
                                'css-loader'
                            ]
                        }
                    ]

                },
                {
                    test: /\.scss$/,
                    use: [
                        'vue-style-loader',
                        'css-loader',
                        {
                            loader: 'sass-loader'
                        }
                    ]
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg)$/,
                    loader: 'url-loader?limit=25000'
                }
            ]
        },
        plugins: [
            new VueLoaderPlugin()
        ]
    });
    const clientBundleSystemConfig = merge(sharedConfig(), {
        entry: { 'bundle.client': clientEntryFile.name },
        output: {
            path: outputPath
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors.client',
                        chunks: 'all'
                    }
                }
            },
            runtimeChunk: {
                name: 'manifest.client'
            }
        },
        plugins: [
            {
                apply: (compiler) => {
                    compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                        clientEntryFile.removeCallback();
                    });
                }
            },
            new CompressionPlugin({
                compressionOptions: { level: 9 },
            }),
            new WebpackBar({
                name: 'Client Bundle',
                color: '#7eb62f'
            })
        ]
    });
    const serverBundleSystemConfig = merge(sharedConfig(), {
        target: 'node',
        entry: { 'bundle.server': serverEntryFile.name },
        output: {
            libraryTarget: 'commonjs2',
            path: outputPath
        },
        plugins: [
            {
                apply: (compiler) => {
                    compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                        serverEntryFile.removeCallback();
                    });
                }
            },
            new WebpackBar({
                name: 'Server Bundle',
                color: '#508800'
            })
        ]
    });
    const serverBundleConfig = merge.smart(serverBundleSystemConfig, config.serverConfig);
    const clientBundleConfig = merge.smart(clientBundleSystemConfig, config.clientConfig);

    return [clientBundleConfig, serverBundleConfig];
}