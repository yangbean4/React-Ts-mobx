import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'antd'
import Search from './Search'
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
class Header extends React.Component<IStoreProps> {

    addPermission = () => {
        this.props.routerStore.push('/permission/add')
    }

    render() {
        return (
            <div className='searchForm'>
                <Search />
                <PortalsBtn querySelector='#addPermissionBtn'>

                    <Button icon='plus' type="primary" onClick={this.addPermission}>
                        Add
                </Button>
                </PortalsBtn>

            </div>
        )
    }
}

export default Header
