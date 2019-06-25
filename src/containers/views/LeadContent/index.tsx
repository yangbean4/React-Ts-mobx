import * as React from 'react'

import * as styles from './index.scss'
import Header from './Header'
import LeadContentTable from './Table'
import AutoSizer from '@components/AutoSizer'

export default function LeadContent() {
    return (
        <div className={styles.container}>
            <Header />
            <AutoSizer className={styles.tableBox}>{({ height }) => <LeadContentTable scrollY={height - 160} />}</AutoSizer>
        </div>
    )
}
