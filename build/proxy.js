/*
 * @Description:
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-09-09 18:02:04
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-10-12 15:35:48
 */
module.exports = {
    '/index.php': {
        target: 'http://san-manage.test.com',
        // target: 'http://sen-oc-manage.io',
        changeOrigin: true,
        pathRewrite: {
            '^/': '/'
        }
    }
};
if ([]) {
    console.log(1)
}