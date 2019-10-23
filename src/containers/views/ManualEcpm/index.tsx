import * as React from 'react'
import * as styles from './index.scss'

import Header from './Header'
import ManualTable from './Table'


interface IProps {
    // fullTemplate?: () => Promise<any>
}

class Manual extends React.Component<IProps> {
    render() {
        return (
            <div className={styles.container}>
                <Header />
                <ManualTable />
            </div>
        )
    }
}
export default Manual
