import * as React from 'react'

import * as styles from './index.scss'
import Header from './Header'
import Table from './Table'
import AutoSizer from '@components/AutoSizer'

export default function Task() {
    return (
        <div className={styles.container}>
            <Header />
            <AutoSizer className={styles.tableBox}>{({ height }) => <Table scrollY={height - 160} />}</AutoSizer>
        </div>
    )
}
