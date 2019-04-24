import React from 'react';
import { inject, observer } from 'mobx-react'
import { observable } from 'mobx'
import { Breadcrumb } from 'antd'

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
class Bread extends React.Component<IStoreProps> {
  @observable
  unsubscribeFromStore: () => void
  componentWillMount() {
    this.unsubscribeFromStore = this.props.routerStore.history.listen((location, action) => {
      console.log(location, action)
    })
  }
  componentWillUnmount() {
    this.unsubscribeFromStore()
  }

  render() {
    return (
      <Breadcrumb>

      </Breadcrumb>
    )
  }
}

export default Bread
