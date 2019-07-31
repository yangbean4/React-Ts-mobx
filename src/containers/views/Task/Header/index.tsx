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

    addTask = () => {
        this.props.routerStore.push('/task/add')
    }

    render() {
        return (
            <div className='searchForm'>
                <Search />
                {
                    // this.$checkAuth('Apps-Virtual AppGroup-Add', (
                    <PortalsBtn querySelector='#taskAddBtn'>
                        <Button icon='plus' type="primary" onClick={this.addTask}>
                            Add
                        </Button>
                    </PortalsBtn>

                    // ))
                }
            </div>
        )
    }
}

export default Header
