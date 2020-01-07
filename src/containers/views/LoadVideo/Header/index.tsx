import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'antd'
import Search from './Search'
import { observable, action } from 'mobx'
import { ComponentExt } from '@utils/reactExt'
import PortalsBtn from '@components/portalsBtn'
import AddForm from '../LoadVideoModal/Add'
interface IStoreProps {
    routerStore?: RouterStore
    getList?: () => void
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, loadVideoStore } = store
        return {
            routerStore,
            getList: loadVideoStore.getList
        }
    }
)
@observer
class Header extends ComponentExt<IStoreProps> {
    @observable
    private showModal: boolean = false


    @action
    toggleModal = () => {
        this.showModal = !this.showModal
    }

    onOk = () => {
        this.props.getList();
        this.toggleModal();
    }


    render() {
        return (
            <div className='searchForm'>
                <Search />
                {
                    this.$checkAuth('Config Manage-Template Manage', (
                        <PortalsBtn querySelector='#creativeAddBtn'>
                            <Button icon='plus' type="primary" onClick={this.toggleModal}> Add </Button>
                        </PortalsBtn>
                    ))
                }
                <AddForm
                    onOk={this.onOk}
                    onCancel={this.toggleModal}
                    visible={this.showModal}
                    item={{}} />
            </div>
        )
    }
}

export default Header
