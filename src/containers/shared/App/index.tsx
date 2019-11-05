import * as React from 'react'
import { hot } from 'react-hot-loader'
import Loadable from 'react-loadable'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'

import * as styles from './index.scss'
import PageLoading from '@components/PageLoading'
import Error from '@components/Error'
import PrivateRoute from '@shared/PrivateRoute'

const Home = Loadable({
    loader: () => import(/* webpackChunkName: "home" */ '@views/Home'),
    loading: PageLoading
})
const Login = Loadable({
    loader: () => import(/* webpackChunkName: "login" */ '@views/Login'),
    loading: PageLoading
})

const chart = Loadable({
    loader: () => import(/* webpackChunkName: "chart" */ '@views/Chart'),
    loading: PageLoading
})

const AppWrapper = props => <div className={styles.appWrapper}>{props.children}</div>

class AppRouter extends React.Component<{}> {
    render() {
        return (
            <AppWrapper>
                <Router>
                    <Switch>
                        <Route exact path="/login" component={Login} />
                        <Route exact path="/chart" component={chart} />
                        <PrivateRoute path="/" component={Home} />
                        <Route component={Error} />
                    </Switch>
                </Router>
            </AppWrapper>
        )
    }
}

export default hot(module)(AppRouter)
