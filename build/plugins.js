const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')

const constants = require('./constants')
const config = require('./config')
const { assetsPath } = require('./utils')
const env = require('./env.json')

const oriEnv = env[constants.APP_ENV]
Object.assign(oriEnv, {
    APP_ENV: constants.APP_ENV
})
// 照旧将webpack下发变量置于process.env
const defineEnv = {}
for (let key in oriEnv) {
    defineEnv[`process.env.${key}`] = JSON.stringify(oriEnv[key])
}

const basePlugins = [
    new webpack.DefinePlugin(defineEnv),
    new MomentLocalesPlugin({
        localesToKeep: ['es-us', 'zh-cn']
    })
]

const devPlugins = [
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'build/tpl/index.html',
        inject: true
    }),
    new CaseSensitivePathsPlugin()
]

const prodPlugins = [
    new webpack.WatchIgnorePlugin([/css\.d\.ts$/]),
    new HtmlWebpackPlugin({
        filename: config.index,
        template: 'build/tpl/index.html',
        inject: true,
        minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true
            // more options:
            // https://github.com/kangax/html-minifier#options-quick-reference
        },
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: 'dependency'
    }),
    new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: assetsPath('css/[name].[contenthash].css'),
        chunkFilename: assetsPath('css/[name].[id].[contenthash].css')
    }),
    new WorkboxPlugin.GenerateSW({
        cacheId: 'ts-react-webpack',// 设置前缀
        clientsClaim: true,// Service Worker 被激活后使其立即获得页面控制权
        skipWaiting: true,// 强制等待中的 Service Worker 被激活
        offlineGoogleAnalytics: false,
        // do not use google cdn
        importWorkboxFrom: 'local',
        // precache ignore
        exclude: [/index\.html$/, /\.map$/],
        swDest: 'service-wroker.js', // 输出 Service worker 文件
        // dynamic update
        runtimeCaching: [// 配置路由请求缓存
            {
                // match html
                urlPattern: new RegExp(config.indexDomain),
                handler: 'networkFirst'//// 网络优先
            },
            {
                // match static resource
                urlPattern: new RegExp(config.assetsDomain),
                handler: 'staleWhileRevalidate'//重新验证时过时
            }
        ]
    })
]

if (config.bundleAnalyzerReport) {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    prodPlugins.push(new BundleAnalyzerPlugin())
}

module.exports = basePlugins.concat(constants.APP_ENV === 'dev' ? devPlugins : prodPlugins)
