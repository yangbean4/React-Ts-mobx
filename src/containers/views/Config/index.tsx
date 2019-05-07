import * as React from 'react'

import * as styles from './index.scss'
import Header from './Header'
import ConfigTable from './Table'
import AutoSizer from '@components/AutoSizer'
import { inject } from 'mobx-react';

interface IProps {
    fullTemplate?: () => Promise<any>
}

@inject((store: IStore): IProps => {
    return {
        fullTemplate: store.customStore.fullTemplate
    }
})
class Config extends React.Component<IProps> {
    componentWillMount() {
        this.props.fullTemplate()
    }
    render() {
        return (
            <div className={styles.container}>
                <Header />
                <AutoSizer className={styles.tableBox}>{({ height }) => <ConfigTable scrollY={height - 120} />}</AutoSizer>
            </div>
        )
    }

}

export default Config
