import * as React from 'react'

import * as styles from './index.scss'
import Header from './Header'
import CreativeTable from './Table'
import AutoSizer from '@components/AutoSizer'

export default function Creative() {
    return (
        <div className={styles.container}>
            <Header />
            <AutoSizer className={styles.tableBox}>{({ height }) => <CreativeTable scrollY={height - 160} />}</AutoSizer>
        </div>
    )
}
