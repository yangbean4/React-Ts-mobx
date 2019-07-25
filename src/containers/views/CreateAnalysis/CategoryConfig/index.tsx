import * as React from 'react'
import * as styles from './index.scss'
import Header from './Header'
import CategoryTable from './Table'
import AutoSizer from '@components/AutoSizer'

function config() {
    return (
        <div className={styles.container}>
            <Header />
            <AutoSizer className={styles.tableBox}>{({ height }) => <CategoryTable scrollY={height - 160} />}</AutoSizer>
        </div>
    )
}


export default config
