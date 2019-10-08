import * as React from 'react'
import { observer } from 'mobx-react'
import Search from './Search'
import { ComponentExt } from '@utils/reactExt'
import ShowMore from '@components/ShowMore'

@observer
class Header extends ComponentExt {
    render() {
        return (
            <ShowMore>
                <Search />
            </ShowMore>
        )
    }
}

export default Header
