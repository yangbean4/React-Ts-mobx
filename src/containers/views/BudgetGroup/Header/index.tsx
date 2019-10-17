import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'antd'
import Search from './Search'
import { ComponentExt } from '@utils/reactExt'
import PortalsBtn from '@components/portalsBtn'

interface IStoreProps {
    routerStore?: RouterStore
    // setCampaingn?: (Campaingns: ICampaignStore.ICampaignGroup) => void
    // clearCampaingn?: (Campaingns: ICampaignStore.ICampaignGroup) => void
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

    addBudget = () => {
        this.props.routerStore.push('/budget/add')
    }

    render() {
        return (
            <div className='searchForm'>
                <Search />
                {
                    this.$checkAuth('Offers-Campaigns-Budget Group-Add', (
                        <PortalsBtn querySelector='#companyAddBtn'>
                            <Button icon='plus' type="primary" onClick={this.addBudget}>
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
