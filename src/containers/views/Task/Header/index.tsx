import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { observable, action } from 'mobx'
import { Button, Modal } from 'antd'
import Search from './Search'
import { ComponentExt } from '@utils/reactExt'
import PortalsBtn from '@components/portalsBtn'
import Export from './Export'

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
  private showExportModal: boolean = false

  @action
  toggleExportModal = () => {
    this.showExportModal = !this.showExportModal
  }

  addTask = () => {
    this.props.routerStore.push('/task/add')
  }


  render() {
    return (
      <div className='searchForm'>
        <Search />
        {
          this.$checkAuth('Creative Analysis-Task List-Add', (
            <div>
              <PortalsBtn querySelector='#taskAddBtn'>
                <Button icon='plus' type="primary" onClick={this.addTask}>
                  Add
              </Button>
              </PortalsBtn>
              <PortalsBtn querySelector='#taskExportBtn'>
                <Button icon='export' type="primary" onClick={this.toggleExportModal}>
                  Export
              </Button>
              </PortalsBtn>
            </div>
          ))
        }
        <Modal
          title="Export Data"
          visible={this.showExportModal}
          width="500px"
          footer={null}
          onCancel={this.toggleExportModal}
          destroyOnClose
        >
          <Export onSubmit={this.toggleExportModal} />
        </Modal>
      </div>
    )
  }
}

export default Header
