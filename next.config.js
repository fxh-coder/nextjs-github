const withCss = require('@zeit/next-css')
const webpack = require('webpack')
const config = require('./config')

if (typeof require !== 'undefined') {
    require.extensions['.css'] = file => {}
}

module.exports = withCss({
    webpack(config) {
        config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))
        return config
    },
    publicRuntimeConfig: {
        GITHUB_OAUTH_URL: config.GITHUB_OAUTH_URL,
        OAUTH_URL: config.OAUTH_URL
    }
})
