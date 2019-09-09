module.exports = {
    '/index.php': {
        target: 'http://san-manage.test2.com',
        // target: 'http://10.200.10.180:8079/',
        changeOrigin: true,
        pathRewrite: {
            '^/': '/'
        }
    }
};
