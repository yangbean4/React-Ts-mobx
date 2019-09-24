/*
 * @Description: 
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-09-09 18:02:04
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-09-24 10:44:41
 */
module.exports = {
    '/index.php': {
        // target: 'http://san-manage.test2.com',
        target: 'http://sen-oc-manage.io',
        changeOrigin: true,
        pathRewrite: {
            '^/': '/'
        }
    }
};
