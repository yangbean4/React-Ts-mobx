import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button } from 'antd'
import Search from './Search'
import { ComponentExt } from '@utils/reactExt'
import PortalsBtn from '@components/portalsBtn'
import { computed } from 'mobx'

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

    @computed
    get accountType() {
        return this.props.routerStore.location.pathname.includes('source') ? 'source' : 'subsite'
    }

    addCcount = () => {
        this.props.routerStore.push(`/account/${this.accountType}/add`)
    }

    render() {
        return (
            <div>
                <Search />
                {
                    // this.$checkAuth('Authorization-Ccount Manage-Add', (
                    <PortalsBtn querySelector='#accountAddBtn'>
                        <Button icon='plus' type="primary" onClick={this.addCcount}>
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
