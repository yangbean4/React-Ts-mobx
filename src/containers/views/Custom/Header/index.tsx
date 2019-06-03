import * as React from 'react'
import { observer } from 'mobx-react'
import { Button } from 'antd'
import Search from './Search'
import { observable, action } from 'mobx'
import CustomModal from './../CustomModal'
import PortalsBtn from '@components/portalsBtn'
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
            <div className='searchForm'>
                <Search />
                <PortalsBtn querySelector='#customAddBtn'>
                    <Button icon='plus' type="primary" onClick={this.toggleCustomModalVisible}>
                        Add
                </Button>
                </PortalsBtn>

                <CustomModal visible={this.userModalVisible} onCancel={this.toggleCustomModalVisible} />
            </div>
        )
    }
}

export default Header
