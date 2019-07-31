import * as React from 'react'

import * as styles from './index.scss'
import Header from './Header'
import EndcardTable from './Table'
import AutoSizer from '@components/AutoSizer'

export default function Endcard() {
    return (
        <div className={styles.container}>
            <Header />
            <AutoSizer className={styles.tableBox}>{({ height }) => <EndcardTable scrollY={height - 160} />}</AutoSizer>
        </div>
    )
}
