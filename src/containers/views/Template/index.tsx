import React, { Component } from 'react'

import * as styles from './index.scss'
import Header from './Header'
import TemplateTable from './Table'
import AutoSizer from '@components/AutoSizer'
import { inject } from 'mobx-react'

interface IStoreProps {
    routerStore?: RouterStore
    setTemplateType?: (type: number) => void
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, templateStore } = store
        const {
            setTemplateType
        } = templateStore
        return { routerStore, setTemplateType }
    }
)

class Template extends Component<IStoreProps> {

    private unsubscribeFromStore: () => void
    componentWillMount() {
        this.computedType(this.props.routerStore.location.pathname)
        this.unsubscribeFromStore = this.props.routerStore.history.listen((location, action) => {
            this.computedType(location.pathname)
        })
    }
    componentWillUnmount() {
        this.unsubscribeFromStore()
    }

    computedType = (pathname: string) => {
        const type = pathname.split('/template/').pop()
        this.props.setTemplateType(Number(type))
    }

    render() {
        return (
            <div className={styles.container}>
                <Header />
                <AutoSizer className={styles.tableBox}>{({ height }) => <TemplateTable scrollY={height - 160} />}</AutoSizer>
            </div>
        )
    }
}


export default Template
