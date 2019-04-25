import * as React from 'react'
import { observer } from 'mobx-react'
import { Button } from 'antd'
import Search from './Search'
import { observable, action } from 'mobx'
import CustomModal from './../CustomModal'

@observer
class Header extends React.Component {
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
                <Button icon='plus' type="primary" onClick={this.toggleCustomModalVisible}>
                    Add
                </Button>
                <CustomModal visible={this.userModalVisible} onCancel={this.toggleCustomModalVisible} />
            </div>
        )
    }
}

export default Header
