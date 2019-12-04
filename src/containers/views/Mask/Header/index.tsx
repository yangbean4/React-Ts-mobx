import * as React from 'react'
import { observer } from 'mobx-react'
import { Button } from 'antd'
import Search from './Search'
import { observable, action } from 'mobx'
import MaskModal from './../MaskModal'
import PortalsBtn from '@components/portalsBtn'
@observer
class Header extends React.Component {
    @observable
    private userModalVisible: boolean = false

    @action
    toggleMaskModalVisible = () => {
        this.userModalVisible = !this.userModalVisible
    }

    render() {
        return (
            <div className='searchForm'>
                <Search />
                <PortalsBtn querySelector='#maskAddBtn'>
                    <Button icon='plus' type="primary" onClick={this.toggleMaskModalVisible}>
                        Add
                </Button>
                </PortalsBtn>

                <MaskModal visible={this.userModalVisible} onCancel={this.toggleMaskModalVisible} />
            </div>
        )
    }
}

export default Header
