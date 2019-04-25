import * as React from 'react'

import * as styles from './index.scss'
import Header from './Header'
import CustomTable from './Table'
import AutoSizer from '@components/AutoSizer'

export default function Customs() {
    return (
        <div className={styles.container}>
            <Header />
            <AutoSizer className={styles.tableBox}>{({ height }) => <CustomTable scrollY={height - 120} />}</AutoSizer>
        </div>
    )
}