import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'antd'
import Search from './Search'
import { observable, action } from 'mobx'
import CustomModal from '../TemplateModal'
import PortalsBtn from '@components/portalsBtn'
import { ComponentExt } from '@utils/reactExt'


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
    private userModalVisible: boolean = false

    @action
    toggleCustomModalVisible = () => {
        this.userModalVisible = !this.userModalVisible
    }

    render() {
        return (
            <div className='searchForm'>
                <Search />
                {
                    this.$checkAuth('Offers-Endcards-Endcard Template-Add', (
                        <PortalsBtn querySelector='#customAddBtn'>
                            <Button icon='plus' type="primary" onClick={this.toggleCustomModalVisible}>
                                Add
                            </Button>
                        </PortalsBtn>
                    ))
                }
                <CustomModal visible={this.userModalVisible} onCancel={this.toggleCustomModalVisible} />
            </div>
        )
    }
}

export default Header
