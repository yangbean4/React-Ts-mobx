module.exports = {
    '/index.php': {
        target: 'http://san-manage.test2.com',
        changeOrigin: true,
        pathRewrite: {
            '^/': '/'
        }
    }
};
