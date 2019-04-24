import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'antd'
import Search from './Search'
import { observable, action } from 'mobx'
import CustomModal from './../TemplateModal'

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
            <div>
                <Search />
                <Button type="primary" onClick={this.toggleCustomModalVisible}>
                    add template
                </Button>
                <CustomModal visible={this.userModalVisible} onCancel={this.toggleCustomModalVisible} />
            </div>
        )
    }
}

export default Header
