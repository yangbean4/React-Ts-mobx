import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'antd'
import Search from './Search'
import { ComponentExt } from '@utils/reactExt'
import PortalsBtn from '@components/portalsBtn'
import { action, observable } from 'mobx'
import ShowMore from '@components/ShowMore';

interface IStoreProps {
  routerStore?: RouterStore
}

@inject(
  (store: IStore): IStoreProps => {
    const { routerStore } = store
    return {
      routerStore
    }
  }
)

@observer
class Header extends ComponentExt<IStoreProps> {

  @action
  exprotExel = () => {
    // 导出内容
  }
  render() {
    return (
      <ShowMore>
        {/* <div className="searchForm" style={{ paddingBottom: '20px' }}> */}
        <Search />
        {/* {
            this.$checkAuth('', (
              <PortalsBtn querySelector="#currencyAddBtn">
                <Button type="primary" onClick={this.exprotExel}>
                  Export
                </Button>
              </PortalsBtn>
            ))
          } */}
        {/* </div> */}
      </ShowMore>
    )
  }
}

export default Header
