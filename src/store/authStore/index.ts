import { observable, action, runInAction, computed } from 'mobx'

import { StoreExt } from '@utils/reactExt'
import { routerStore } from './../'
import { setCookie, clearCookie } from '@utils/index'
import { COOKIE_KEYS, LOCALSTORAGE_KEYS } from '@constants/index'

const getAuthTree = (permission: string[]) => {
    const target = {}
    const addAuth = (menu, pre?) => {
        menu.forEach(item => {
            const { name, children, id } = item
            const key = pre ? `${pre}-${name}` : name
            target[key] = permission.includes(id)
            if (children) {
                addAuth(children, key)
            }
        })
        return target
    }
    return addAuth
}


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
    tmpSidebar: IAuthStore.Sidebar[] = []

    @action
    getCaptcha = (): void => {
        this.captcha += `?t=${+ new Date()}`
    }
    @action
    setUserInfo = (userInfo: IAuthStore.UserInfo) => {
        runInAction('SET_USERINFO', () => {
            this.userInfo = userInfo
        })
    }

    @action
    login = async (params: IAuthStore.LoginParams): Promise<any> => {
        const res = await this.api.auth.login(params)
        const { data, token } = res;
        const userInfo = {
            ...data,
            token,
        }

        const { permission, menu } = userInfo
        const authTree = getAuthTree(permission)(menu || [])
        localStorage.setItem(LOCALSTORAGE_KEYS.AUTHTARGET, JSON.stringify(authTree))

        this.setUserInfo(userInfo)
        setCookie(COOKIE_KEYS.TOKEN, token)
        localStorage.setItem(LOCALSTORAGE_KEYS.USERINFO, JSON.stringify(userInfo))
        return { authTree }
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
        // const lcoalSidebar = localStorage.getItem(LOCALSTORAGE_KEYS.SIDEBAR)
        if (!lcoalUserInfo) {
            throw new Error('no local userinfo!!')
        }
        const userInfo: IAuthStore.UserInfo = JSON.parse(lcoalUserInfo)
        this.setUserInfo(userInfo)
        // if (!lcoalSidebar) {
        //     this.getSidebar()
        // } else {
        //     const sidebar: IAuthStore.Sidebar[] = JSON.parse(lcoalSidebar)
        //     this.tmpSidebar = sidebar
        // }
        this.getSidebar()

        return userInfo
    }
}

export default new AuthStore()
