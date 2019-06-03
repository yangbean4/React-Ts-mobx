import * as React from 'react'
import { observer } from 'mobx-react'

import Search from './Search'

@observer
class Header extends React.Component {


    render() {
        return (
            <div className='searchForm'>
                <Search />
            </div>
        )
    }
}

export default Header
