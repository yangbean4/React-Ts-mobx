import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, runInAction } from 'mobx'
import { Form, Icon, Input, Button, Row, Col } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { hot } from 'react-hot-loader'

import * as styles from './index.scss'

const FormItem = Form.Item

interface IStoreProps {
    login?: (data: IAuthStore.LoginParams) => Promise<any>,
    captcha: string
    getCaptcha?: () => void,
    getSidebar?: () => Promise<any>
    routerStore?: RouterStore
}

@inject(
    (store: IStore): IStoreProps => {
        const { authStore, routerStore } = store
        const { login, captcha, getCaptcha, getSidebar } = authStore
        return {
            login,
            captcha,
            getCaptcha,
            getSidebar,
            routerStore
        }
    }
)
@observer
class Login extends React.Component<IStoreProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    submit = (e: React.FormEvent<any>): void => {
        e.preventDefault()
        this.props.form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    runInAction('SHOW_LOGIN_LOADING', () => {
                        this.loading = true
                    })
                    const { userName: user_name,
                        password: pwd,
                        captcha: captcha
                    } = values
                    try {
                        await this.props.login({ user_name, pwd, captcha })
                        await this.props.getSidebar()
                        this.props.routerStore.replace(`/config`)
                    } catch (error) {
                        this.props.getCaptcha();
                    }
                    runInAction('HIDE_LOGIN_LOADING', () => {
                        this.loading = false
                    })
                }
            }
        )
    }

    componentWillMount() {
        this.props.getCaptcha()
    }

    render() {
        const { getFieldDecorator } = this.props.form
        return (
            <div className={styles.login}>
                <Form className={styles.form}>
                    <div className={styles.logoBox}>
                        {/* <Icon type="ant-design" /> */}
                    </div>
                    <FormItem hasFeedback>
                        {getFieldDecorator('userName', {
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Input
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="userName"
                            />
                        )}
                    </FormItem>
                    <FormItem hasFeedback>
                        {getFieldDecorator('password', {
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Input
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                type="password"
                                placeholder="password"
                            />
                        )}
                    </FormItem>
                    <FormItem>
                        <Row gutter={8}>
                            <Col span={12}>
                                {getFieldDecorator('captcha', {
                                    rules: [{ required: true, message: 'Please input the captcha you got!' }],
                                })(
                                    <Input />
                                )}
                            </Col>
                            <Col span={12}>
                                <img className={styles.captcha} src={this.props.captcha} onClick={this.props.getCaptcha} />
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" onClick={this.submit} block loading={this.loading}>
                            login
                        </Button>
                    </FormItem>
                </Form>
            </div>
        )
    }
}

export default hot(module)(Form.create<{}>()(Login))
