import * as React from 'react'
import * as styles from './index.scss'
import * as stylesIndex from './../index.scss'
import { inject, observer } from 'mobx-react';
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Select, Button, Input, InputNumber, Popover } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
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


interface IProps {
    type?: string
    getCampaignOption?: (data) => Promise<any>
    commitData?: (data) => Promise<any>
    editCommit?: (data) => Promise<any>
    editData?: (data) => Promise<any>
    routerStore?: RouterStore
    campaignOption?: [IBudgetGroupStore.OptionList]
    campaignsData?: any
    OptionListDb?: IBudgetGroupStore.OptionListDb
    initData?: IBudgetGroupStore.AddBudgetParams
    resetInitData?: () => void
    app_id_origin?: any[]
}
@inject((store: IStore): IProps => {
    const { routerStore, budgetStore } = store;
    const { getCampaignOption, campaignOption, campaignsData, OptionListDb, initData, commitData, editData, resetInitData, editCommit, app_id_origin } = budgetStore;
    return { routerStore, getCampaignOption, campaignOption, campaignsData, OptionListDb, initData, commitData, editData, resetInitData, editCommit, app_id_origin }
})
@observer
class BudgetModel extends React.Component<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false;

    @observable
    private group_id_edit = false;


    @observable
    private account_edit: boolean = false;

    @observable
    private appid_edit: boolean = false;

    @observable
    private campaign_edit: boolean = true;

    // @observable
    // private campaign_data: any[] = []

    @action
    limitDecimals = (value: string | number): string => {
        const reg = /^(\-)*(\d+)\.(\d\d).*$/;
        if (typeof value === 'string') {
            return !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : ''
        } else if (typeof value === 'number') {
            return !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : ''
        } else {
            return ''
        }
    }


    @computed
    get app_id_option() {
        return this.props.OptionListDb.appIdData;
    }
    @computed
    get app_key() {
        return this.props.initData.sen_app_key;
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    componentWillUnmount() {
        this.props.resetInitData()
    }


    @action
    init = async () => {
        const id = this.props.routerStore.location.pathname.split('/').pop();
        try {
            if (!isNaN(Number(id))) {
                await this.props.getCampaignOption({
                    type: 0,
                    group_id: id
                });
                await this.props.editData(id);
                const app_key = this.app_key;
                const opt = this.props.campaignsData;
                console.log(app_key);
                const campaign_list = this.func1(opt.appIdData[app_key], 'campaign_id');

                runInAction('SET_EDIT', () => {
                    this.group_id_edit = true;
                    this.account_edit = true;
                    this.appid_edit = true;
                    this.campaign_edit = false;
                    this.props.OptionListDb.campaign = campaign_list;
                })
            } else {
                await this.props.getCampaignOption({
                    type: 1
                });
            }
        }
        catch (err) {
            console.log(err)
        }
    }


    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    const id = this.props.routerStore.location.pathname.split('/').pop();
                    console.log(values);
                    delete values.user_name;
                    delete values.group_id;
                    this.toggleLoading();
                    try {
                        if (!isNaN(Number(id))) {
                            values.id = id;
                            this.props.editCommit(values);
                        } else {
                            this.props.commitData(values);
                        }
                    } catch (err) {
                        console.log(err)
                    }
                    this.toggleLoading()
                }
            }
        )

    }
    Cancel = () => {
        this.props.routerStore.push('/budget')
    }

    @action
    handleAccoutChange = (value) => {
        console.log(value);
        if (!value) {
            this.props.form.setFieldsValue({
                'campaign': []
            })
            return false;
        }
        const opt = this.props.campaignsData;
        const appid_change = this.func1(opt.accountData[value], 'app_id');
        console.log(appid_change)
        runInAction('CHANGE_DATA', () => {
            this.props.OptionListDb.appIdData = appid_change;
        })
    }

    @action
    handleAppIdChange = (value) => {
        console.log(value);
        if (!value) {
            this.props.form.setFieldsValue({
                'user_name': '',
                'campaign': []
            })
            runInAction('SET_ACC_EDIT', () => {
                this.account_edit = false;
                console.log('asaass')
                this.props.OptionListDb.appIdData = this.props.app_id_origin;
            })
            return;
        }
        const opt = this.props.campaignsData;
        console.log(opt.appIdData)
        // debugger
        const accout_val = this.props.form.getFieldValue('user_name');
        const account_change = this.func1(opt.appIdData[value], 'user_name');
        const campaign_change = this.func1(opt.appIdData[value], 'campaign_id');
        console.log(accout_val)
        runInAction('CHANGE_ACCOUNT_DATA', () => {
            // this.props.OptionListDb.accountData = account_change;
            // this.campaign_data = campaign_change;
            this.props.form.setFieldsValue({
                'app_key': '',
                'user_name': account_change[0].user_name,
                'campaign': []
            })
            this.props.OptionListDb.campaign = campaign_change;
            this.campaign_edit = false
            this.account_edit = true;
            console.log('ssss')
            // if (accout_val) {
            // }

        })
    }
    //将对象数组项 去除重复的属性项
    func1 = (objArray, property) => {
        var result = [];//去重后返回的结果数组
        var temp = {};//临时对象
        //将对象数组中每一项的name值作为属性，若temp不拥有此属性时则为temp添加此属性且将其值赋为true，并将这一项push到结果数组中
        for (var i = 0; i < objArray.length; i++) {
            var myname = objArray[i][property];
            if (temp[myname]) {//如果temp中已经存在此属性名，则说明遇到重复项
                continue;//不继续执行接下来的代码，跳转至循环开头
            }
            temp[myname] = true;//为temp添加此属性（myname）且将其值赋为true
            result.push(objArray[i]);//将这一项复制到结果数组result中去
        }
        return result;
    }



    componentWillMount() {
        this.init()
    }
    render() {
        const { form, OptionListDb, initData } = this.props;
        const { getFieldDecorator } = form;
        return (
            <div className='sb-form'>
                <Form {...formItemLayout} className={styles.currencyModal}>
                    {this.group_id_edit ?
                        <FormItem label="Group ID">
                            {getFieldDecorator('group_id', {
                                initialValue: initData.sen_group_id,
                                rules: [
                                    {
                                        required: false, message: "Required"
                                    }
                                ]
                            })(<Input autoComplete="off" disabled={this.group_id_edit} />)}

                        </FormItem>
                        : null}
                    <FormItem label="Group Name">
                        {getFieldDecorator('group_name', {
                            initialValue: initData.group_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" />)}

                    </FormItem>
                    <FormItem label="Source Account" >
                        {getFieldDecorator('user_name', {
                            initialValue: initData.user_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select
                                allowClear
                                showSearch
                                disabled={this.account_edit}
                                onChange={this.handleAccoutChange}
                                getPopupContainer={trigger => trigger.parentElement}
                            // filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {OptionListDb.accountData.map(c => (
                                    <Select.Option key={c.id} value={c.user_name}>
                                        {c.user_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="App ID" >
                        {getFieldDecorator('app_key', {
                            initialValue: initData.sen_app_key,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select
                                allowClear={true}
                                disabled={this.appid_edit}
                                showSearch
                                onChange={this.handleAppIdChange}
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.props.content.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {OptionListDb.appIdData.map(c => (
                                    <Select.Option key={c.app_key} value={c.app_key}>
                                        <Popover content={c.app_key + '-' + c.app_id} placement="right" overlayClassName={stylesIndex.popovers}>
                                            <div className={stylesIndex.textHidden}>
                                                {c.app_key + '-' + c.app_id}
                                            </div>
                                        </Popover>
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="Campaign" >
                        {getFieldDecorator('campaign', {
                            // initialValue: '',
                            initialValue: initData.campaign,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select
                                showSearch
                                mode="multiple"
                                disabled={this.campaign_edit}
                                onChange={null}
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {OptionListDb.campaign.map(c => (
                                    <Select.Option key={c.campaign_id} value={c.campaign_id ? c.campaign_id.toString() : c.campaign_id} className={c.status == 'suspend' ? styles.grey : ''}>
                                        {/* <span className={c.status == 'suspend' ? styles.grey : ''}>{c.campaign_id + '-' + c.campaign_name}</span> */}
                                        {c.campaign_id + '-' + c.campaign_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="Daily Budget">
                        <span style={{ marginRight: "5px" }}>$</span>
                        {getFieldDecorator('daily_budget', {
                            initialValue: initData.daily_budget,
                            validateTrigger: ['onBlur'],
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    validator: (r, v, callback) => {
                                        if (v <= 0 && v != undefined) {
                                            callback('Daily Budget should be positive!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(
                            <InputNumber max={9999} formatter={this.limitDecimals} min={0} />
                        )}
                    </FormItem>
                    <FormItem className={this.props.type ? styles.vcMdoal : styles.btnBox}>
                        <Button type="primary" loading={this.loading} onClick={this.submit} style={{ marginRight: 10 }}>Submit</Button>
                        <Button onClick={this.Cancel}>Cancel</Button>
                    </FormItem>
                </Form>

            </div>
        )
    }
}


export default Form.create<IProps>()(BudgetModel)
