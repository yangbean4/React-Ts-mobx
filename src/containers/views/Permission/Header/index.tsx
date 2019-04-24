import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'antd'
import Search from './Search'

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

    addPermission = () => {
        this.props.routerStore.push('/permission/add')
    }

    render() {
        return (
            <div>
                <Search />
                <Button type="primary" onClick={this.addPermission}>
                    add permission
                </Button>
            </div>
        )
    }
}

export default Header
