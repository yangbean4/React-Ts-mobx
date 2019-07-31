import * as React from 'react'

import * as styles from './index.scss'
import Header from './Header'
import SceneTable from './Table'
import AutoSizer from '@components/AutoSizer'

export default function Scenes() {
    return (
        <div className={styles.container}>
            <Header />
            <AutoSizer className={styles.tableBox}>{({ height }) => <SceneTable scrollY={height - 160} />}</AutoSizer>
        </div>
    )
}
