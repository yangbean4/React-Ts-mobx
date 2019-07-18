import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'antd'
import Icon from '@components/Icon'
import Search from './Search'
import { ComponentExt } from '@utils/reactExt'
import PortalsBtn from '@components/portalsBtn'
import { action, observable } from 'mobx'
import RevenueModel from '../RevenueModal'
import * as styles from './index.scss'

interface IStoreProps {
    routerStore?: RouterStore
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore } = store
        return {
            routerStore,
        }
    }
)
@observer
class Header extends ComponentExt<IStoreProps> {

    @observable
    private visiable: boolean = false

    @action
    toggleVisiable = () => {
        this.visiable = !this.visiable
    }

    render() {
        return (
            <div className='searchForm'>
                <Search />
                {
                    this.$checkAuth('Revenue Import', (
                        <PortalsBtn querySelector="#currencyAddBtn">
                            <Button type="primary" onClick={this.toggleVisiable}>
                                <Icon type="icondaoru" className={styles.importBtn} />Import
                        </Button>
                        </PortalsBtn>
                    ))
                }
                <RevenueModel visible={this.visiable} onCancel={this.toggleVisiable} />
            </div>
        )
    }
}

export default Header
