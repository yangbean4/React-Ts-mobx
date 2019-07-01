import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { computed } from 'mobx'
import { Menu } from 'antd'
import pathToRegexp from 'path-to-regexp'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import menu, { router, IMenu, IMenuInTree, templateId, logId, routerAndMenu } from '../menu&router'
import { arrayToTree, queryArray } from '@utils/index'
import { clearAuth } from '@utils/checkAuth'
import Icon from '@components/Icon'

const { SubMenu } = Menu

interface IStoreProps {
    sideBarCollapsed?: boolean
    navOpenKeys?: string[]
    setOpenKeys?: (openKeys: string[]) => void
    userInfo?: IAuthStore.UserInfo
    routerStore?: RouterStore
    tmpSidebar?: IAuthStore.Sidebar[]
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, globalStore, authStore } = store
        const { userInfo, tmpSidebar } = authStore
        const { navOpenKeys, setOpenKeys, sideBarCollapsed } = globalStore
        return {
            routerStore,
            userInfo,
            navOpenKeys,
            tmpSidebar,
            sideBarCollapsed,
            setOpenKeys
        }
    }
)
@observer
class SiderMenu extends ComponentExt<IStoreProps> {
    // 打开的菜单层级记录
    private levelMap: NumberObject = {}

    @computed
    get currentRoute() {
        return this.props.routerStore.location.pathname
    }

    @computed
    get addSideBar() {
        const merge = (pop, tmp) => {
            const addTmp: IMenu[] = tmp.map((item, index) => {
                return {
                    pid: templateId,
                    id: (templateId * 1000) + index,
                    component: "Template",
                    title: item.primary_name,
                    path: `/template/${encodeURI(item.id)}`
                }
            })
            const addLog: IMenu[] = tmp.map((item, index) => {
                return {
                    pid: logId,
                    id: (logId * 1000) + index,
                    component: "Logs",
                    title: item.primary_name,
                    path: `/log/${(item.primary_name)}`
                }
            })
            return pop.concat(addTmp, addLog)
        }
        return merge([], this.props.tmpSidebar)
    }

    @computed
    get allRouterAndMenu() {
        return [].concat.call(this.addSideBar, routerAndMenu)
    }

    @computed
    get menuConfig() {
        return [].concat.call(menu, this.addSideBar)
    }
    @computed
    get routerConfig() {
        return [].concat.call(router, this.addSideBar)
    }

    @computed
    get menuTree() {
        return arrayToTree<IMenuInTree>(this.menuConfig, 'id', 'pid')
    }

    @computed
    get menuProps() {
        const { sideBarCollapsed, navOpenKeys } = this.props
        return !sideBarCollapsed
            ? {
                onOpenChange: this.onOpenChange,
                openKeys: navOpenKeys
            }
            : {}
    }

    goto = ({ key }: { key: string }) => {
        const { history } = this.props.routerStore
        const selectedMenu = this.menuConfig.find(item => String(item.id) === key)
        if (selectedMenu && selectedMenu.path && selectedMenu.path !== this.currentRoute) {
            history.push(selectedMenu.path)
        }
    }

    onOpenChange = (openKeys: string[]): void => {
        const { navOpenKeys, setOpenKeys } = this.props
        const latestOpenKey = openKeys.find(key => !navOpenKeys.includes(key))
        const latestCloseKey = navOpenKeys.find(key => !openKeys.includes(key))
        let nextOpenKeys = []
        if (latestOpenKey) {
            nextOpenKeys = this.getAncestorKeys(latestOpenKey).concat(latestOpenKey)
        }
        if (latestCloseKey) {
            nextOpenKeys = this.getAncestorKeys(latestCloseKey)
        }
        setOpenKeys(nextOpenKeys)
    }

    getPathArray = (array: IMenu[], current: IMenu): string[] => {
        const result = [String(current.id)]
        const getPath = (item: IMenu): void => {
            if (item && item.pid) {
                result.unshift(String(item.pid))
                getPath(queryArray(array, String(item.pid), 'id'))
            }
        }
        getPath(current)
        return result
    }

    // 保持选中
    getAncestorKeys = (key: string): string[] => {
        const map = {}
        const getParent = index => {
            const result = [String(this.levelMap[index])]
            if (this.levelMap[result[0]]) {
                result.unshift(getParent(result[0])[0])
            }
            return result
        }
        for (const index in this.levelMap) {
            if ({}.hasOwnProperty.call(this.levelMap, index)) {
                map[index] = getParent(index)
            }
        }
        return map[key] || []
    }
    // 选中给子节点添加上active的样式
    addActive = (item, key, domEvent) => {

    }
    // 递归生成菜单
    getMenus = (menuTree: IMenuInTree[]) => {
        return menuTree.map(item => {
            if (item.children) {
                if (item.pid) {
                    this.levelMap[item.id] = item.pid
                }
                const getAuthArr = (item): string[] => {
                    if (item.children) {
                        return item.children.map(ele => getAuthArr(ele))
                    } else {
                        return [item.authName]
                    }
                }
                const authArr = getAuthArr(item).join(',').split(',').filter(ele => !!ele)

                const auth = item.id.toString().indexOf('4') === 0 ? 'Log' : authArr.join('|')

                return (
                    this.$checkAuth(auth, (
                        <SubMenu
                            key={String(item.id)}
                            title={
                                <span>
                                    {item.icon && <Icon className={this.props.sideBarCollapsed ? styles.sideBarIcon : styles.menuIcon} type={item.icon} />}
                                    <span>{item.title}</span>
                                </span>
                            }
                        >
                            {this.getMenus(item.children)}
                        </SubMenu>)
                    )
                )
            }
            return (this.$checkAuth(item.authName, (
                <Menu.Item key={String(item.id)}>
                    {item.icon && <Icon className={this.props.sideBarCollapsed ? styles.sideBarIcon : styles.menuIcon} type={item.icon} />}
                    <span>{item.title}</span>
                </Menu.Item>
            ))
            )
        })
    }

    componentWillUnmount() {
        clearAuth()
    }

    render() {
        this.levelMap = {}
        const menuItems = this.getMenus(this.menuTree)
        // 寻找选中路由
        let currentMenu: IMenu = null
        const reg = pathToRegexp(this.currentRoute)
        for (const item of this.allRouterAndMenu) {
            if (item.path && reg.exec(item.path)) {
                currentMenu = item
                break
            }
        }
        let selectedKeys: string[] = null
        if (currentMenu) {
            selectedKeys = this.getPathArray(this.allRouterAndMenu, currentMenu)
        }
        if (!selectedKeys) {
            selectedKeys = ['1']
        }
        return (
            <Menu
                className={styles.menu + ' mymenu'}
                theme='dark'
                mode="inline"
                selectedKeys={selectedKeys}
                onClick={this.goto}
                {...this.menuProps}
            >
                {menuItems}
            </Menu>
        )
    }
}

export default SiderMenu
