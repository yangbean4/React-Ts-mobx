import * as React from 'react'

import * as styles from './index.scss'
import Header from './Header'
import RoleTable from './Table'
import AutoSizer from '@components/AutoSizer'

export default function Roles() {
    return (
        <div className={styles.container}>
            <Header />
            <AutoSizer className={styles.tableBox}>{({ height }) => <RoleTable scrollY={height - 120} />}</AutoSizer>
        </div>
    )
}
