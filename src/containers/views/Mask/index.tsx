import * as React from 'react'

import * as styles from './index.scss'
import Header from './Header'
import MaskTable from './Table'
import AutoSizer from '@components/AutoSizer'

export default function Masks() {
    return (
        <div className={styles.container}>
            <Header />
            <AutoSizer className={styles.tableBox}>{({ height }) => <MaskTable scrollY={height - 160} />}</AutoSizer>
        </div>
    )
}
