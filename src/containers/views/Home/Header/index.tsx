import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Layout, Icon, Menu, Dropdown } from 'antd'
import MyIcon from '@components/Icon'
import * as styles from './index.scss'

interface IStoreProps {
    logout?: () => void
    userInfo?: IAuthStore.UserInfo
    sideBarCollapsed?: boolean
    toggleSideBarCollapsed?: () => void
}


function Header({ sideBarCollapsed, toggleSideBarCollapsed, logout, userInfo }: IStoreProps) {
    const menu = (
        <Menu>
            <Menu.Item onClick={logout}>
                <span>logout</span>
            </Menu.Item>
        </Menu>
    )
    return (
        <Layout.Header className={styles.header}>
            <Icon
                className={styles.trigger}
                type={sideBarCollapsed ? 'menu-unfold' : 'menu-fold'}
                onClick={toggleSideBarCollapsed}
            />
            <div className={styles.right}>
                <MyIcon type='iconzhanghao' className={styles.user} />
                <Dropdown overlay={menu}>
                    <span>
                        {userInfo.user_name}
                        <Icon type="down" />
                    </span>
                </Dropdown>
            </div>
        </Layout.Header>
    )
}

export default inject(
    (store: IStore): IStoreProps => {
        const { authStore, globalStore } = store
        const { sideBarCollapsed, toggleSideBarCollapsed } = globalStore
        const { logout, userInfo } = authStore
        return { logout, userInfo, sideBarCollapsed, toggleSideBarCollapsed }
    }
)(observer(Header))
