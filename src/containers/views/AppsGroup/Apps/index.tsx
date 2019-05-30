import * as React from 'react'
import * as styles from './index.scss'

import Header from './Header'
import AutoSizer from '@components/AutoSizer'

interface IProps {
    fullTemplate?: () => Promise<any>
}

class Apps extends React.Component<IProps> {
    render() {
        return (
            <div className={styles.container}>
                <Header />
                <AutoSizer></AutoSizer>
            </div>
        ) 
    }
}
export default Apps