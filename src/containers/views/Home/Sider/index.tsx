import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Layout, Icon } from 'antd'
import * as styles from './index.scss'
import SiderMenu from './Menu'

interface IStoreProps {
    sideBarCollapsed?: boolean
}

@inject(
    (store: IStore): IStoreProps => {
        const { globalStore } = store
        const { sideBarCollapsed } = globalStore
        return {
            sideBarCollapsed,
        }
    }
)
@observer
class Sider extends React.Component<IStoreProps> {

    render() {
        const { sideBarCollapsed } = this.props
        return (
            <Layout.Sider
                className={styles.sider}
                trigger={null}
                theme='dark'
                collapsible
                collapsed={sideBarCollapsed}
            >
                <div className={styles.logoBox}>
                    {/* <div className={styles.logo}></div>
                 */}
                    {/* <img src='../../../assets/images/logo.png' /> */}
                </div>
                <SiderMenu />
            </Layout.Sider>
        )
    }
}

export default Sider