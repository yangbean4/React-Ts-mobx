import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'antd'
import Search from './Search'
import { ComponentExt } from '@utils/reactExt'
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
class Header extends ComponentExt<IStoreProps> {

  add = () => {
    this.props.routerStore.push('/creativeFrequency/add')
  }

  render() {
    return (
      <div className='searchForm'>
        <Search />
        {
          this.$checkAuth('Apps-Creative Frequency-Add', (
            <PortalsBtn querySelector='#h5ExportAddBtn'>
              <Button icon='plus' type="primary" onClick={this.add}>
                Add
              </Button>
            </PortalsBtn>
          ))
        }
      </div>
    )
  }
}

export default Header
