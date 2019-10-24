import * as React from 'react'
import * as styles from './index.scss'

import Header from './Header'
import BudgetTable from './Table'


interface IProps {
    
}

class Manual extends React.Component<IProps> {
    render() {
        return (
            <div className={styles.container}>
                <Header />
                <BudgetTable />
            </div>
        )
    }
}
export default Manual
