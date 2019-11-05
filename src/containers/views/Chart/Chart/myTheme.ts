/*
 * @Description: 
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-11-05 14:37:00
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-11-05 15:16:38
 */
/* tslint:disable */
(function (root, factory) {
    if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports, require('echarts'));
    } else {
        // Browser globals
        factory({}, root.echarts);
    }
}(this, function (exports, echarts) {
    var log = function (msg) {
        if (typeof console !== 'undefined') {
            console && console.error && console.error(msg);
        }
    };
    if (!echarts) {
        log('ECharts is not Loaded');
        return;
    }

    var colorPalette = [
        "#579ae8",
        "#3dc2b7",
        "#f99dbc",
        "#ac7a69",
        "#f64e51",
        "#f9bb56",
        "#59d3e9",
        "#6ae05e",
        "#c9a171",
        "#145538",
        "#f67b27",
        "#9e0613",
        "#d6c768",
        "#bb5ac6",
        "#101e81",
        "#2e363b"
    ];

    var colorAll = [
        '#37A2DA', '#32C5E9', '#67E0E3', '#9FE6B8', '#FFDB5C', '#ff9f7f',
        '#fb7293', '#E062AE', '#E690D1', '#e7bcf3', '#9d96f5', '#8378EA', '#96BFFF',
        "#579ae8",
        "#3dc2b7",
        "#f99dbc",
    ];

    var theme = {
        color: colorAll,

        colorLayer: [
            ['#37A2DA', '#ffd85c', '#fd7b5f'],
            ['#37A2DA', '#67E0E3', '#FFDB5C', '#ff9f7f', '#E062AE', '#9d96f5'],
            ['#37A2DA', '#32C5E9', '#9FE6B8', '#FFDB5C', '#ff9f7f', '#fb7293', '#e7bcf3', '#8378EA', '#96BFFF'],
            colorAll
        ]
    }

    echarts.registerTheme('myTheme', theme);
}))