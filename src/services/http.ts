import axios, { AxiosRequestConfig as _AxiosRequestConfig } from 'axios'
import * as qs from 'qs'
import { message } from 'antd'

import { getCookie } from '@utils/index'
import { COOKIE_KEYS } from '@constants/index'

export interface AxiosRequestConfig extends _AxiosRequestConfig {
    startTime?: Date
}

interface httpOption {
    baseUrl?: string
    onUploadProgress?: (progressEvent: any) => void
    andAuth?: boolean
    useRes?: boolean
    headers?: object
}


export interface HttpResquest {
    get?(url: string, data?, option?: httpOption): Promise<any>
    post?(url: string, data?, option?: httpOption): Promise<any>
    delete?(url: string, data, option?: httpOption): Promise<any>
    put?(url: string, data, option?: httpOption): Promise<any>
}

enum HTTPERROR {
    LOGICERROR,
    TIMEOUTERROR,
    NETWORKERROR
}

const TOKENERROR = [401, 402, 403]

const DEFAULTCONFIG = {
    baseURL: process.env.BASEURL
}

const http: HttpResquest = {}
const methods = ['get', 'post', 'put', 'delete']

let authTimer: number = null

const isSuccess = res => res.errorcode === 0

methods.forEach(v => {
    http[v] = (url: string, data, option: httpOption = {}) => {
        const {
            baseUrl,
            onUploadProgress,
            andAuth = true,
            useRes = false,
            headers
        } = option
        const axiosConfig: AxiosRequestConfig = {
            method: v,
            url,
            baseURL: baseUrl || DEFAULTCONFIG.baseURL,
            headers: !andAuth ? { ...headers } : { ...headers, Authorization: `Bearer ${getCookie(COOKIE_KEYS.TOKEN)}` },
            onUploadProgress: onUploadProgress
        }
        const instance = axios.create(DEFAULTCONFIG)

        instance.interceptors.response.use(
            response => {
                let rdata = null
                if (typeof response.data === 'object' && !isNaN(response.data.length)) {
                    rdata = response.data[0]
                } else {
                    rdata = response.data
                }
                if (!isSuccess(rdata) && !useRes) {
                    const _err = {
                        msg: rdata.message || rdata.msg,
                        errCode: rdata.errCode,
                        type: HTTPERROR[HTTPERROR.LOGICERROR],
                        config: response.config
                    }
                    if (TOKENERROR.includes(rdata.code)) {
                        message.destroy()
                        message.error('用户认证失败! 请登录重试...')
                        window.clearTimeout(authTimer)
                        authTimer = window.setTimeout(() => {
                            const loginUrl = location.href.split('#/')[0]
                            location.replace(`${loginUrl}#/login`)
                        }, 300)
                    }
                    return Promise.reject(_err)
                }
                return useRes ? response : response.data
            },
            error => {

                const _err = {
                    msg: error.response.statusText || error.message || '网络故障',
                    type: /^timeout of/.test(error.message)
                        ? HTTPERROR[HTTPERROR.TIMEOUTERROR]
                        : HTTPERROR[HTTPERROR.NETWORKERROR],
                    config: error.config
                }
                return Promise.reject(_err)
            }
        )

        if (v === 'get') {
            axiosConfig.params = data
        } else if (data instanceof FormData || v === 'post') {
            axiosConfig.data = data
        } else {
            axiosConfig.data = qs.stringify(data)
        }

        return instance
            .request(axiosConfig)
            .then(res => res)
            .catch(err => {
                message.destroy()
                message.error(err.response || err.msg || err.stack || '未知错误')
                return Promise.reject({
                    err,
                    stack: err.msg || err.stack || ''
                })
            })
    }
})

export default http
