import * as React from 'react'
import { Layout } from 'antd'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import { hot } from 'react-hot-loader'

import * as styles from './index.scss'
import Error from '@components/Error'
import { asynchronousComponents, router } from './menu&router'
import Header from './Header'
import Sider from './Sider'
import Breadcrumb from './Breadcrumb'

function Home() {
    return (
        <Layout>
            <Sider />
            <Layout>
                <Header />
                <Breadcrumb />
                <Layout.Content className={styles.content}>
                    <Router>
                        <Switch>
                            {router.map(m => {
                                if (!m.path) {
                                    return null
                                }
                                return (
                                    <Route
                                        key={m.id}
                                        exact={m.exact}
                                        path={m.path}
                                        component={m.component ? asynchronousComponents[m.component] : null}
                                    />
                                )
                            })}
                            <Route component={Error} />
                        </Switch>
                    </Router>
                </Layout.Content>
            </Layout>
        </Layout>
    )
}

export default hot(module)(Home)
