import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'antd'
import Search from './Search'
import { observable, action } from 'mobx'
import CustomModal from './../TemplateModal'
import PortalsBtn from '@components/portalsBtn'


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
class Header extends React.Component<IStoreProps> {

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
                <PortalsBtn querySelector='#templateAddBtn'>

                    <Button className='addbtn-mb20 addbtn-ml20' icon='plus' type="primary" onClick={this.toggleCustomModalVisible}>
                        Add
                </Button>
                </PortalsBtn>

                <CustomModal visible={this.userModalVisible} onCancel={this.toggleCustomModalVisible} />
            </div>
        )
    }
}

export default Header
