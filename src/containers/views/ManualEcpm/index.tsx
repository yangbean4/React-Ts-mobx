import * as React from 'react'
import * as styles from './index.scss'

import Header from './Header'
import ManualTable from './Table'
import AutoSizer from '@components/AutoSizer'

interface IProps {
    // fullTemplate?: () => Promise<any>
}

class Manual extends React.Component<IProps> {
    render() {
        return (
            <div className={styles.container}>
                <Header />
                <AutoSizer className={styles.tableBox}>{({ height }) => <ManualTable scrollY={height - 160} />}</AutoSizer>
            </div>
        )
    }
}
export default Manual
