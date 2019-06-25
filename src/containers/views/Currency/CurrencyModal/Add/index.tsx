import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, InputNumber } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption, platformOption } from '../../web.config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'

const FormItem = Form.Item

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
        lg: { span: 3 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
        lg: { span: 5 }
    }
}

const miniLayout = {
    labelCol: {
        lg: { span: 8 }
    },
    wrapperCol: {
        lg: { span: 12 }
    }
}

interface IStoreProps {
    modifyCurrency?: (currency: ICurrencyStore.ICurrency) => Promise<any>
    createCurrency?: (currency: ICurrencyStore.ICurrency) => Promise<any>
    routerStore?: RouterStore
}

interface IProps extends IStoreProps {
    currency?: ICurrencyStore.ICurrency
    onCancel?: () => void
    onOk?: (id: number) => void
    type?: string
}
@inject(
    (store: IStore): IProps => {
        const { currencyStore, routerStore } = store
        const { createCurrency, modifyCurrency } = currencyStore
        return { routerStore, createCurrency, modifyCurrency }
    }
)
@observer
class CurrencyModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private platform: boolean = false


    @observable
    private pkgnameData: any[] = []

    @computed
    get isAdd() {
        return !this.props.currency
    }

    @computed
    get usePlatform() {
        return this.platform || 'android'
    }

    @computed
    get usePkgnameData() {
        return this.pkgnameData.filter(ele => ele.platform === this.usePlatform)
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    Cancel = () => {
        this.props.type || !this.isAdd ? this.props.onCancel() : this.props.routerStore.push('/currency')
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, createCurrency, form, modifyCurrency, type, currency } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {

                        if (this.isAdd) {
                            const {
                                app_name,
                                pkg_name
                            } = this.pkgnameData.find(ele => ele.id === values.app_name)
                            values = {
                                ...values,
                                app_name
                            }
                            let data = await createCurrency({ ...values, type: 1 })
                            message.success(data.message)
                            const {
                                platform
                            } = values
                            localStorage.setItem('TargetCurrency', JSON.stringify({
                                app_name,
                                pkg_name,
                                platform
                            }))
                            routerStore.push('/currency/edit')
                        } else {
                            const currencyStr = localStorage.getItem('TargetCurrency') || '{}';
                            const kg = (type ? currency : JSON.parse(currencyStr)) as ICurrencyStore.ICurrencyForList
                            const {
                                app_name,
                                platform
                            } = kg;
                            // 再Model中新增时需要status的值，在正常添加时用values的值覆盖
                            const pre = { status: 1, ...values, type: 2 }
                            let data
                            if (currency.id) {
                                data = await modifyCurrency({
                                    ...pre,
                                    app_name,
                                    platform,
                                    id: currency.id
                                })
                            } else {
                                data = await createCurrency({
                                    ...pre,
                                    app_name,
                                    platform,
                                })
                            }
                            message.success(data.message)
                            this.props.onOk(data.data.id)
                            if (this.props.type) {
                                this.props.form.resetFields()
                            }
                        }
                    } catch (err) {
                        console.log(err);
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    @action
    init = async () => {
        const res = await this.api.appGroup.getPkgnameData()
        runInAction('set_LIST', () => {
            this.pkgnameData = res.data
        })
    }

    @action
    setPlatform = (type) => {
        this.platform = type
    }

    componentWillMount() {
        this.init()
    }

    render() {
        const { currency, form } = this.props
        const { getFieldDecorator } = form
        const {
            platform = 'android',
            vc_name = '',
            app_name = "",
            vc_exchange_rate = '',
            vc_callback_url = '',
            vc_desc = '',
            vc_secret_key = '',
            status = 1,
        } = currency || {}
        return (
            <div className='sb-form'>
                <Form {...this.props.type ? miniLayout : formItemLayout} className={styles.currencyModal} >
                    {
                        !this.props.type && <FormItem label="Status">
                            {getFieldDecorator('status', {
                                initialValue: status,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Radio.Group>
                                    {statusOption.map(c => (
                                        <Radio key={c.key} value={c.value}>
                                            {c.key}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            )}
                        </FormItem>
                    }

                    {
                        this.isAdd && <FormItem label="Platform">
                            {getFieldDecorator('platform',
                                {
                                    initialValue: platform,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(
                                    <Select
                                        showSearch
                                        onChange={(val) => this.setPlatform(val)}
                                        filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    >
                                        {platformOption.map(c => (
                                            <Select.Option {...c}>
                                                {c.key}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                        </FormItem>
                    }

                    {
                        this.isAdd && <FormItem label="App Name">
                            {getFieldDecorator('app_name', {
                                initialValue: app_name,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Select
                                showSearch
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.usePkgnameData.map(c => (
                                    <Select.Option value={c.id} key={c.id}>
                                        {c.app_name}
                                    </Select.Option>
                                ))}
                            </Select>)}
                        </FormItem>
                    }


                    <FormItem label="VC Name">
                        {getFieldDecorator('vc_name', {
                            initialValue: vc_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" />)}
                    </FormItem>

                    <FormItem label="VC Description"  >
                        {getFieldDecorator('vc_desc', {
                            initialValue: vc_desc,
                        })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>

                    <FormItem label="VC Exchange Rate">
                        {getFieldDecorator('vc_exchange_rate', {
                            initialValue: vc_exchange_rate,
                            validateTrigger: 'blur',
                            rules: [
                                {
                                    required: true, message: "Required",
                                },
                                {
                                    validator: (r, v, callback) => {
                                        if (v <= 0) {
                                            callback('The Exchange Rate should be a positive integer!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber precision={0} />)}
                        <span>=1$</span>
                    </FormItem>

                    <FormItem label="VC Callback Url"  >
                        {getFieldDecorator('vc_callback_url', {
                            initialValue: vc_callback_url,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>
                    <FormItem label="VC Secret Key">
                        {getFieldDecorator('vc_secret_key', {
                            initialValue: vc_secret_key,
                        })(<Input autoComplete="off" />)}
                    </FormItem>

                    <FormItem className={this.props.type ? styles.vcMdoal : styles.btnBox} >
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                        <Button className={styles.btn2} onClick={() => this.Cancel()}>Cancel</Button>
                    </FormItem>
                </Form>

            </div>
        )
    }
}

export default Form.create<IProps>()(CurrencyModal)
