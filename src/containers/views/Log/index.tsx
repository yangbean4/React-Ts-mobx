import React, { Component } from 'react'

import * as styles from './index.scss'
import Header from './Header'
import TemplateTable from './Table'
import AutoSizer from '@components/AutoSizer'
import { inject } from 'mobx-react'

interface IStoreProps {
    routerStore?: RouterStore
    setLogType?: (types: string) => void
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, logsStore } = store
        const {
            setLogType
        } = logsStore
        return { routerStore, setLogType }
    }
)

class Template extends Component<IStoreProps> {

    // private unsubscribeFromStore: () => void
    componentWillMount() {
        this.computedType(this.props.routerStore.location.pathname)
        // this.unsubscribeFromStore = this.props.routerStore.history.listen((location, action) => {
        //     this.computedType(location.pathname)
        // })
    }
    // componentWillUnmount() {
    //     this.unsubscribeFromStore()
    // }

    computedType = (pathname: string) => {
        const type = pathname.split('/log/').pop()
        this.props.setLogType(decodeURI(type).toLowerCase())
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
