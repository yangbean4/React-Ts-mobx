import * as React from 'react'
import { observer } from 'mobx-react'
import Search from './Search'
import { ComponentExt } from '@utils/reactExt'

@observer
class Header extends ComponentExt {
    render() {
        return (
            <div className='searchForm'>
                <Search />
            </div>
        )
    }
}

export default Header
