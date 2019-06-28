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

    addCompany = () => {
        this.props.routerStore.push('/campaigns/add')
    }

    render() {
        return (
            <div className='searchForm'>
                <Search />
                {
                    this.$checkAuth('Offers-Campaigns-Add', (
                        <PortalsBtn querySelector='#companyAddBtn'>
                            <Button icon='plus' type="primary" onClick={this.addCompany}>
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
