import * as React from 'react'
import { observer } from 'mobx-react'
import ShowMore from '@components/ShowMore'

import Search from './Search'

@observer
class Header extends React.Component {


    render() {
        return (
            <ShowMore>
                <Search />
            </ShowMore>
        )
    }
}

export default Header
