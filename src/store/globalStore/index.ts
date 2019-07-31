import { observable, action } from 'mobx'

import { StoreExt } from '@utils/reactExt'
import { LOCALSTORAGE_KEYS } from '@constants/index'

export class GlobalStore extends StoreExt {

    @observable
    breadcrumbArr: IGlobalStore.menu[] = []
    /**
     * 菜单栏折叠
     *
     * @type {boolean}
     * @memberof GlobalStore
     */
    @observable
    sideBarCollapsed: boolean = localStorage.getItem(LOCALSTORAGE_KEYS.SIDE_BAR_COLLAPSED) === '1'
    /**
     * 打开的菜单key
     *
     * @type {string[]}
     * @memberof GlobalStore
     */
    @observable
    navOpenKeys: string[] = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.NAV_OPEN_KEYS)) || []

    @action
    toggleSideBarCollapsed = () => {
        this.sideBarCollapsed = !this.sideBarCollapsed
        localStorage.setItem(LOCALSTORAGE_KEYS.SIDE_BAR_COLLAPSED, this.sideBarCollapsed ? '1' : '0')
    }

    @action
    setOpenKeys = (openKeys: string[]) => {
        this.navOpenKeys = openKeys
        localStorage.setItem(LOCALSTORAGE_KEYS.NAV_OPEN_KEYS, JSON.stringify(openKeys))
    }

    @action
    setBreadcrumbArr = (menus?: IGlobalStore.menu[]) => {
        this.breadcrumbArr = menus || []
    }
}

export default new GlobalStore()