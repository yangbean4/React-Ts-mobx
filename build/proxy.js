module.exports = {
  '/index.php': {
    target: 'http://san-manage.test.com',
    changeOrigin: true,
    pathRewrite: {
      '^/': '/'
    }
  }
};