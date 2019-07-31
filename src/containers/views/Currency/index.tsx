import * as React from 'react'

import * as styles from './index.scss'
import Header from './Header'
import CurrencyTable from './Table'
import AutoSizer from '@components/AutoSizer'

export default function Currency() {
    return (
        <div className={styles.container}>
            <Header />
            <AutoSizer className={styles.tableBox}>{({ height }) => <CurrencyTable scrollY={height - 160} />}</AutoSizer>
        </div>
    )
}
