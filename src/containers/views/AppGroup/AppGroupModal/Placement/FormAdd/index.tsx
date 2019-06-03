import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, InputNumber, Col, Popover, Icon } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import * as web from '@views/AppGroup/web.config'
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


interface IStoreProps {
    optionListDb?: IAppGroupStore.OptionListDb
}

interface IProps extends IStoreProps {
    placementID?: number
    onCancel?: () => void
    onOk?: (id: number) => void
}
@inject(
    (store: IStore): IStoreProps => {
        const { appGroupStore } = store
        const { optionListDb } = appGroupStore
        return { optionListDb }
    }
)

@observer
class PlacementModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private pidType: number

    @observable
    private rewardType: number

    // @observable
    // private pidTypeList: any[] = []

    @computed
    get usePidtype() {
        return [this.pidType, !this.Palcement.pid_type, true].find(ele => ele !== undefined)
    }

    @observable
    private Palcement: IAppGroupStore.Placement = {}

    @computed
    get isAdd() {
        return !this.props.placementID
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    @action
    pidTypeChange = (type) => {
        this.pidType = type;
    }

    @action
    rewardTypeChange = (e) => {
        const value = e.target.value
        runInAction('set_STore', () => {
            this.rewardType = value
        })
    }

    Cancel = () => {
        this.props.onCancel()
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, createCurrency, form, modifyCurrency } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        if (this.isAdd) {
                            let data = await createCurrency({ ...values, type: 1 })
                            message.success(data.message)
                            const {
                                pkg_name,
                                platform
                            } = values
                            localStorage.setItem('TargetCurrency', JSON.stringify({
                                pkg_name,
                                platform
                            }))
                            routerStore.push('/currency/edit')
                        } else {
                            const currencyStr = localStorage.getItem('TargetCurrency') || '{}';
                            const currency = JSON.parse(currencyStr)
                            const pre = { ...values, type: 2 }
                            let data
                            if (this.props.currency.id) {
                                data = await modifyCurrency({
                                    ...pre,
                                    ...currency,
                                    id: this.props.currency.id
                                })
                            } else {
                                data = await createCurrency({
                                    ...pre,
                                    ...currency,
                                })
                            }
                            message.success(data.message)
                            this.props.onOk(data.data.id)

                        }
                    } catch (err) {
                        //console.log(err);
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    @action
    init = async () => {
        const id = this.props.placementID
        if (id !== undefined) {
            const res = await this.api.appGroup.palcementDetail({ id })
            runInAction('set_p', () => {
                this.Palcement = res.data
            })
        }

        // const pidRes = await this.api.appGroup.getPidType()
        // runInAction('set_List', () => {
        //     this.pidTypeList = pidRes.data;
        // })
    }

    componentWillMount() {
        this.init()
    }

    render() {
        const { form, optionListDb } = this.props
        const { getFieldDecorator } = form
        const {
            status = 1,
            placement_id = '',
            placement_name = "",
            ige_carrier_block = [],
            frequency_num,
            frequency_time,
            pid_type,
            min_offer_num,
            offer_num,
            budget,
            vc_id,
            reward_type,
            reward_num,
            style_id,
            style_detail
        } = this.Palcement
        return (
            <div className='sb-form'>
                <Form {...formItemLayout} className={styles.currencyModal} >
                    <Col span={4} className={styles.companyTag}>
                        <div className={styles.tagWrapper}>
                            <span>Basic Info</span>
                        </div>
                    </Col>
                    <FormItem label="Status">
                        {getFieldDecorator('status', {
                            initialValue: status,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Radio.Group>
                                {web.statusOption.map(c => (
                                    <Radio key={c.key} value={c.value}>
                                        {c.key}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                        <Popover content={(<p>Adjust to Enable status, may reduce revenue.</p>)}>
                            <Icon className={styles.workBtn} type="question-circle" />
                        </Popover>
                    </FormItem>
                    <FormItem label="PID">
                        {getFieldDecorator('placement_id', {
                            initialValue: placement_id,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input />)}
                    </FormItem>

                    <FormItem label="Placement Name">
                        {getFieldDecorator('placement_name', {
                            initialValue: placement_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input />)}
                    </FormItem>

                    <FormItem label="IGE Carrier">
                        {getFieldDecorator('placement_name',
                            {
                                initialValue: ige_carrier_block,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Select
                                    mode="multiple"
                                    showSearch
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {web.IGE.map(c => (
                                        <Select.Option {...c}>
                                            {c.key}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        <Popover content={(<p>Support the network type of ige offer.</p>)}>
                            <Icon className={styles.workBtn} type="question-circle" />
                        </Popover>
                    </FormItem>

                    <FormItem label="Frequency Number">
                        {getFieldDecorator('frequency_num', {
                            initialValue: frequency_num,
                            rules: [
                                {
                                    required: true, message: "Required"
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
                    </FormItem>
                    <FormItem label="Frequency Time">
                        {getFieldDecorator('frequency_time', {
                            initialValue: frequency_time,
                            rules: [
                                {
                                    required: true, message: "Required"
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
                        })(<InputNumber precision={0} />)}seconds
                    </FormItem>


                    <Col span={4} className={styles.companyTag}>
                        <div className={styles.tagWrapper}>
                            <span>PID Type</span>
                        </div>
                    </Col>

                    <FormItem label="PID Type">
                        {getFieldDecorator('pid_type',
                            {
                                initialValue: pid_type,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Select
                                    disabled={!this.isAdd}
                                    onChange={this.pidTypeChange}
                                    showSearch
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {optionListDb.PidType.map(c => (
                                        <Select.Option key={c.id} value={c.id}>
                                            {c.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                    </FormItem>

                    <FormItem label="Offer Number">
                        {getFieldDecorator('frequency_num', {
                            initialValue: frequency_num,
                            rules: [
                                {
                                    required: true, message: "Required"
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
                    </FormItem>

                    <FormItem label="Mini Offer Number">
                        {getFieldDecorator('min_offer_num', {
                            initialValue: min_offer_num,
                            rules: [
                                {
                                    required: true, message: "Required"
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
                    </FormItem>

                    <FormItem label="PID Budget">
                        {getFieldDecorator('budget', {
                            initialValue: budget,
                            rules: [
                                {
                                    required: true, message: "Required"
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
                        $
                        <Popover content={(<p>Support the network type of ige offer.</p>)}>
                            <Icon className={styles.workBtn} type="question-circle" />
                        </Popover>
                    </FormItem>

                    {
                        this.pidType !== 3 && (
                            <React.Fragment>
                                <Col span={4} className={styles.companyTag}>
                                    <div className={styles.tagWrapper}>
                                        <span>VC Reward</span>
                                    </div>
                                </Col>
                                <FormItem label="Virtual Currency">
                                    {getFieldDecorator('vc_id',
                                        {
                                            initialValue: vc_id,
                                            rules: [
                                                {
                                                    required: true, message: "Required"
                                                }
                                            ]
                                        })(
                                            <Select
                                                onChange={this.pidTypeChange}
                                                showSearch
                                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {optionListDb.VC.map(c => (
                                                    <Select.Option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                </FormItem>
                                <FormItem label="Exchange Rate">
                                    {/* {this.exRate} = 1$ */}
                                </FormItem>

                                <FormItem label="Reward Type">
                                    {getFieldDecorator('reward_type', {
                                        initialValue: reward_type,
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(
                                        <Radio.Group
                                            onChange={this.rewardTypeChange}
                                        >
                                            {/* {web.rewardOption.map(c => (
                                                <Radio key={c.key} value={c.value}>
                                                    {c.key}
                                                </Radio>
                                            ))} */}
                                            <Radio disabled={this.pidType !== 1} value={1}>Dynamic Reward</Radio>
                                            <Radio disabled={this.pidType === 1} value={2}>Fix Reward</Radio>
                                        </Radio.Group>
                                    )}
                                </FormItem>
                                {
                                    this.pidType === 1 && (
                                        <FormItem label="Number Of Reward">
                                            {getFieldDecorator('reward_num', {
                                                initialValue: reward_num,
                                                rules: [
                                                    {
                                                        required: true, message: "Required"
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
                                        </FormItem>
                                    )
                                }

                            </React.Fragment>


                        )
                    }

                    <FormItem className={styles.btnBox}>
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                        <Button className={styles.btn2} onClick={() => this.Cancel()}>Cancel</Button>
                    </FormItem>
                </Form>

            </div>
        )
    }
}

export default Form.create<IProps>()(PlacementModal)
