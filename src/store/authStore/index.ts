import { observable, action, runInAction } from 'mobx'

import { StoreExt } from '@utils/reactExt'
import { routerStore } from './../'
import { setCookie, clearCookie } from '@utils/index'
import { COOKIE_KEYS, LOCALSTORAGE_KEYS } from '@constants/index'

// const formatArr = (arr:Array)
// .reduce((a,b)=>a.concat(b,b.children),[])

export class AuthStore extends StoreExt {
    /**
     * 用户信息
     *
     * @type {IAuthStore.UserInfo}
     * @memberof AuthStore
     */
    @observable
    userInfo: IAuthStore.UserInfo = null

    @observable
    captcha: string = `${process.env.BASEURL}//captcha/url`

    @observable
    tmpSidebar: IAuthStore.Sidebar[]

    @action
    getCaptcha = (): void => {
        this.captcha += `?t=${+ new Date()}`
    }

    @action
    login = async (params: IAuthStore.LoginParams): Promise<any> => {
        const res = await this.api.auth.login(params)
        const { data, token } = res;
        const userInfo = {
            ...data,
            token,
        }
        runInAction('SET_USERINFO', () => {
            this.userInfo = userInfo
        })
        setCookie(COOKIE_KEYS.TOKEN, token)
        localStorage.setItem(LOCALSTORAGE_KEYS.USERINFO, JSON.stringify(userInfo))
        return res
    }


    @action
    logout = () => {
        clearCookie(COOKIE_KEYS.TOKEN)
        localStorage.removeItem(LOCALSTORAGE_KEYS.USERINFO)
        routerStore.push('/login')
    }

    @action
    getSidebar = async () => {
        let data = []
        try {
            const res = await this.api.auth.getSidebar()
            data = res.data
        } catch (error) {

        }
        runInAction('updateSideBar', () => {
            this.tmpSidebar = data
        })
        localStorage.setItem(LOCALSTORAGE_KEYS.SIDEBAR, JSON.stringify(data))
    }

    /**
     * 初始化用户信息
     *
     * @memberof AuthStore
     */
    @action
    initUserInfo = (): IAuthStore.UserInfo => {
        const lcoalUserInfo = localStorage.getItem(LOCALSTORAGE_KEYS.USERINFO)
        const lcoalSidebar = localStorage.getItem(LOCALSTORAGE_KEYS.SIDEBAR)
        if (!lcoalUserInfo) {
            throw new Error('no local userinfo!!')
        }
        const userInfo: IAuthStore.UserInfo = JSON.parse(lcoalUserInfo)
        this.userInfo = userInfo
        if (!lcoalSidebar) {
            this.getSidebar()
        } else {
            const sidebar: IAuthStore.Sidebar[] = JSON.parse(lcoalSidebar)
            this.tmpSidebar = sidebar
        }

        return userInfo
    }
}

export default new AuthStore()
