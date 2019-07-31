import * as React from 'react'

import * as styles from './index.scss'
import Header from './Header'
import AccountTable from './Table'
import AutoSizer from '@components/AutoSizer'

export default function Account() {
    return (
        <div className={styles.container}>
            <Header />
            <AutoSizer className={styles.tableBox}>{({ height }) => <AccountTable scrollY={height - 160} />}</AutoSizer>
        </div>
    )
}
