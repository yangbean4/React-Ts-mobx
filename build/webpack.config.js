const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const config = require('./config')
const constants = require('./constants')
const styleRules = require('./rules/styleRules')
const jsRules = require('./rules/jsRules')
const fileRules = require('./rules/fileRules')
const plugins = require('./plugins')
const { assetsPath, resolve } = require('./utils')
const optimization = require('./optimization')
const proxy = require('./proxy')
require('./cleanup-folder')
const port = '8899';
const isDev = constants.APP_ENV === 'dev'
const webPackConfig = {
    mode: process.env.NODE_ENV,
    entry: {
        vendor: ['@babel/polyfill'],
        app: ['./src/index.tsx']
    },
    output: {
        path: config.assetsRoot,
        filename: isDev ? '[name].js' : assetsPath('js/[name].[chunkhash].js'),
        chunkFilename: isDev ? '[name].js' : assetsPath('js/[name].[id].[chunkhash].js'),
        publicPath: config.assetsPublicPath,
        pathinfo: false
    },
    resolve: {
        extensions: constants.FILE_EXTENSIONS,
        modules: [resolve('src'), resolve('node_modules')],
        alias: {
            mobx: resolve('node_modules/mobx/lib/mobx.es6.js')
        },
        plugins: [
            new TsconfigPathsPlugin({
                configFile: resolve('tsconfig.webpack.json'),
                extensions: constants.FILE_EXTENSIONS
            })
        ]
    },
    module: {
        rules: [...styleRules, ...jsRules, ...fileRules]
    },
    plugins,
    // optimization,
    stats: { children: false },
    devtool: config.sourceMap
}
if (isDev) {
    webPackConfig.devServer = {
        port,
        proxy,
        compress: true,
        noInfo: true
    };
}
module.exports = webPackConfig;
