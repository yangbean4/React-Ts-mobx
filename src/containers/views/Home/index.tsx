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
                    {/* <div style={{ width: '300px', margin: '0 auto', padding: '20px 0' }}>
                        <a target='_blank' href='http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11010502038143'
                            style={{ display: 'inline-block', textDecoration: 'none', height: '20px', lineHeight: '20px' }}>
                            <img src='../guo.jpg' style={{ float: 'left' }} />
                            <p style={{ float: "left", height: "20px", lineHeight: "20px", "margin": "0px 0px 0px 5px", color: '#939393' }}>
                                京公网安备 11010502038143号</p>
                        </a >
                    </div > */}
                </Layout.Content>
            </Layout>
        </Layout>
    )
}

export default hot(module)(Home)
