import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'antd'
import Search from './Search'
import { ComponentExt } from '@utils/reactExt'

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

    addUser = () => {
        this.props.routerStore.push('/users/add')
    }

    render() {
        return (
            <div>
                <Search />
                {
                    this.$checkAuth('Authorization-User Manage-Add', (
                        <Button icon='plus' type="primary" onClick={this.addUser}>
                            add
                </Button>
                    ))
                }
            </div>
        )
    }
}

export default Header
