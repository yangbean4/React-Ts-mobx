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

    addUser = () => {
        this.props.routerStore.push('/users/add')
    }

    render() {
        return (
            <div>
                <Search />
                <Button type="primary" onClick={this.addUser}>
                    add user
                </Button>
            </div>
        )
    }
}

export default Header
