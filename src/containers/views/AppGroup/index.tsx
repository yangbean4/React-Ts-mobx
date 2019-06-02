import * as React from 'react'

import * as styles from './index.scss'
import Header from './Header'
import AppGroupTable from './Table'
import AutoSizer from '@components/AutoSizer'

export default function AppGroup() {
    return (
        <div className={styles.container}>
            <Header />
            <AutoSizer className={styles.tableBox}>{({ height }) => <AppGroupTable scrollY={height - 160} />}</AutoSizer>
        </div>
    )
}
