/*
 * @Description:
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-09-09 18:02:04
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2020-06-03 14:21:46
 */
module.exports = {
    '/index.php': {
        // target: 'http://san-manage.test.com',
        target: 'http://13.250.169.238:10000',
        // target: 'http://10.200.10.180:8079',
        // http://13.250.169.238:10000/api/app/placementDetail
        // target: 'http://sen-oc-manage.io',
        changeOrigin: true,
        pathRewrite: {
            '^/': '/'
        }
    }
};
