import * as React from 'react'
import * as styles from './index.scss'
import Header from './Header'
import QueryTable from './Table'
import AutoSizer from '@components/AutoSizer'

export default function Query() {
  return (
    <div className={styles.container}>
      <Header />
      {/* <QueryTable /> */}
      <AutoSizer className={styles.tableBox}>{({ height }) => <QueryTable scrollY={height - 160} />}</AutoSizer>
    </div>
  )
}
