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

    addRole = () => {
        this.props.routerStore.push('/role/add')
    }

    render() {
        return (
            <div>
                <Search />
                <Button type="primary" onClick={this.addRole}>
                    add role
                </Button>
            </div>
        )
    }
}

export default Header
