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
        const { routerStore, manualEcpmStore } = store
        return {
            routerStore,
            //  clearCampaingn: manualEcpmStore.clearCampaingn
        }
    }
)
@observer
class Header extends ComponentExt<IStoreProps> {

    addCompany = () => {
        // this.props.clearCampaingn({})
        this.props.routerStore.push('/manual/add')
    }

    render() {
        return (
            <div className='searchForm'>
                <Search />
                {
                    this.$checkAuth('Offers-Campaigns-Manual eCPM-Add', (
                        <PortalsBtn querySelector='#ManualAddBtn'>
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
