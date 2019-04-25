import * as React from 'react'

import * as styles from './index.scss'
import Header from './Header'
import PermissionTable from './Table'
import AutoSizer from '@components/AutoSizer'

export default function Permissions() {
    return (
        <div className={styles.container}>
            <Header />
            <AutoSizer className={styles.tableBox}>{({ height }) => <PermissionTable scrollY={height - 120} />}</AutoSizer>
        </div>
    )
}