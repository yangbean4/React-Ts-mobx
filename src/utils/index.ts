
export function dateFormat(date, format) {
    if (!format || typeof format !== 'string') {
        console.error('format is undefiend or type is Error');
        return '';
    }

    date = date instanceof Date ? date : (typeof date === 'number' || typeof date === 'string') ? new Date(date) : new Date();

    //解析
    var formatReg = {
        'y+': date.getFullYear(),
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    }
    for (var reg in formatReg) {
        if (new RegExp(reg).test(format)) {
            var match = RegExp.lastMatch;
            format = format.replace(match, formatReg[reg] < 10 ? '0' + formatReg[reg] : formatReg[reg].toString());
        }
    }
    return format;
}
/**
 * @param obj 要判断的类型
 */

export const typeOf = (obj: any): string => {
    const toString = Object.prototype.toString;
    const map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object'
    }
    return map[toString.call(obj)]
}

/**
 * 深拷贝/继承
 * @returns [true|target,source1.....]
 * ex: extend(true,obj1) deepCopy一份obj1
 *     extend(true,target,onj1,obj2...) 将所有的obj1,obj2...集合到target
 */
export const extend = (() => {
    const isPlainObject = (() => {
        const class2type = {}

        const hasOwn = class2type.hasOwnProperty

        const fnToString = hasOwn.toString

        const ObjectFunctionString = fnToString.call(Object)

        const getProto = Object.getPrototypeOf

        return (obj) => {
            let proto, Ctor
            // Detect obvious negatives
            // Use toString instead of jQuery.type to catch host objects
            if (!obj || toString.call(obj) !== '[object Object]') {
                return false
            }

            proto = getProto(obj)

            // Objects with no prototype (e.g., `Object.create( null )`) are plain
            if (!proto) {
                return true
            }

            // Objects with prototype are plain iff they were constructed by a global Object function
            Ctor = hasOwn.call(proto, 'constructor') && proto.constructor
            return typeof Ctor === 'function' && fnToString.call(Ctor) === ObjectFunctionString
        }
    })()

    const extend = (...arg) => {
        let options
        let name
        let src
        let copy
        let copyIsArray: boolean
        let clone
        let target = arg[0] || {}
        let i = 1
        const length: number = arg.length
        let deep = false

        // Handle a deep copy situation
        if (typeof target === 'boolean') {
            deep = target

            // Skip the boolean and the target
            target = arg[i] || {}
            i++
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== 'object' && typeOf(target) !== 'function') {
            target = {}
        }

        // Extend jQuery itself if only one argument is passed
        if (i === length) {
            i--
            target = Array.isArray(arg[i]) ? [] : {}
        }

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            options = arg[i]
            if (options != null) {
                // Extend the base object
                for (name in options) {
                    if (options.hasOwnProperty(name)) {

                        src = target[name]
                        copy = options[name]

                        // Prevent never-ending loop
                        if (target === copy) {
                            continue
                        }
                        copyIsArray = Array.isArray(copy)
                        // Recurse if we're merging plain objects or arrays
                        if (deep && copy && (isPlainObject(copy) || copyIsArray)) {
                            if (copyIsArray) {
                                copyIsArray = false
                                clone = src && Array.isArray(src) ? src : []
                            } else {
                                clone = src && isPlainObject(src) ? src : {}
                            }

                            // Never move original objects, clone them
                            target[name] = extend(deep, clone, copy)

                            // Don't bring in undefined values
                        } else if (copy !== undefined) {
                            target[name] = copy
                        }
                    }
                }
            }

        }
        return target
    }

    return extend
})()
/**
 * setCookie
 *
 * @export
 * @param {string} name
 * @param {string} value
 * @param {number} [expiredays=365]
 */
export function setCookie(name: string, value: string, expiredays = 365) {
    const exdate = new Date()
    exdate.setDate(exdate.getDate() + expiredays)
    document.cookie = `${name}=${escape(value)};expires=${exdate.toUTCString()}`
}

/**
 * getCookie
 *
 * @export
 * @param {string} name
 * @returns
 */
export function getCookie(name: string) {
    if (document.cookie.length > 0) {
        let cStart = document.cookie.indexOf(name + '=')
        if (cStart !== -1) {
            cStart = cStart + name.length + 1
            let cEnd = document.cookie.indexOf(';', cStart)
            if (cEnd === -1) {
                cEnd = document.cookie.length
            }
            return unescape(document.cookie.substring(cStart, cEnd))
        }
    }
    return ''
}

/**
 * clearCookie
 *
 * @export
 * @param {string} name
 */
export function clearCookie(name: string) {
    setCookie(name, '')
}

/**
 * 从url获取参数
 *
 * @export
 * @param {string} name
 * @returns {string}
 */
export function queryURL(name: string): string {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i')
    const result = window.location.search.substr(1).match(reg)
    if (result !== null) {
        return decodeURI(result[2])
    }
    return null
}

/**
 * 数组查询
 *
 * @export
 * @template T
 * @param {any[]} array
 * @param {string} key
 * @param {string} [keyAlias='key']
 * @returns {T}
 */
export function queryArray<T>(array: any[], key: string, keyAlias = 'key'): T {
    if (!(array instanceof Array)) {
        return null
    }
    const item = array.filter(a => a[keyAlias] === key)
    if (item.length) {
        return item[0]
    }
    return null
}

/**
 * 数组格式转树状结构
 *
 * @export
 * @template T
 * @param {any[]} array
 * @param {string} [id='id']
 * @param {string} [pid='pid']
 * @param {string} [children='children']
 * @returns {T[]}
 */
export function arrayToTree<T>(array: any[], id = 'id', pid = 'pid', children = 'children'): T[] {
    const data = extend(true, array)
    const result = []
    const hash = {}
    data.forEach((_, index) => {
        hash[data[index][id]] = data[index]
    })
    data.forEach(item => {
        const hashVP = hash[item[pid]]
        if (hashVP) {
            if (!hashVP[children]) {
                hashVP[children] = []
            }
            hashVP[children].push(item)
        } else {
            result.push(item)
        }
    })
    return result
}

/**
 * 下划线转驼峰且首字母大些
 * @param str 
 */

export function camelCase(str: string): string {
    // Support: IE9-11+
    const name = str.replace(/_([a-z])/g, (all: string, letter: string) => {
        return ` ${letter.toUpperCase()}`
    })
    return name.charAt(0).toUpperCase() + name.slice(1)
}

export function _nameCase(str: string): string {
    // Support: IE9-11+
    return str.replace(/ /g, '_').toLowerCase()
}



//处理兼容问题，Safari中没有e.path
export function getEventTargetDom(e, className: string) {
    let temp = null;
    if ((e.path instanceof Array) && e.path.length > 0) {
        temp = [...e.path].find(item => {
            return ('className' in item) && (item.className.split(" ").indexOf(className) >= 0);
        })
    } else {
        let dom = e.target;
        while (dom) {
            if (('className' in dom) && (dom.className.split(" ").indexOf(className) >= 0)) {
                temp = dom; break
            } else if (dom.nodeName.toLocaleUpperCase() == "HTML") {
                break;
            } else {
                dom = dom.parentNode;
            }
        }
    }
    return temp
}

export const getGuId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}

export const testSize = (target: File, config, type: string = 'img') => {
    const { WH_arr } = config
    return new Promise((resolve, reject) => {
        try {
            const objectURL = window.createObjectURL != undefined
                ? window.createObjectURL(target) : URL != undefined
                    ? window.URL.createObjectURL(target) : window.webkitURL != undefined
                        ? window.webkitURL.createObjectURL(target) : null
            const imageCopy: HTMLVideoElement | HTMLImageElement = type === 'img' ? new Image() : type === 'video' ? document.createElement('video') : null
            imageCopy.src = objectURL

            // const imageCopy: HTMLVideoElement | HTMLImageElement = type === 'img' ? new Image() : type === 'video' ? document.createElement('video') : null
            // const fileRender = new FileReader()
            // fileRender.readAsDataURL(target)
            // fileRender.onload = (ev) => {
            //     imageCopy.src = ev.target.result
            // }

            const callBack = () => {
                const P_width = imageCopy.width || imageCopy.videoWidth
                const P_height = imageCopy.height || imageCopy.videoHeight
                const arr = WH_arr ? WH_arr : [config]
                const is = arr.map((ele) => {
                    const { width, height, isScale = false, minW_H, maxW_H } = ele
                    return isScale ?
                        (minW_H && maxW_H ? (P_width / P_height) <= maxW_H && (P_width / P_height) > minW_H : P_width / width === P_height / height)
                        : P_width === width && P_height === height
                }).find(ele => !!ele)

                is ? resolve() : reject();
            }

            if (type === 'img') {
                imageCopy.onload = callBack
            } else {
                imageCopy.addEventListener('canplay', callBack)
            }

        } catch (error) {
            console.log(error)
        }



    })
}
