import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction, autorun, computed } from 'mobx'
import { Form, Input, Row, Col, Button, Select, Popover } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './../index.scss'

console.log(styles)
const FormItem = Form.Item

const span = 6
const layout = {
    labelCol: {
        span: 7,
    },
    wrapperCol: {
        span: 17
    }
}


interface IStoreProps {
    changeFilter?: (params: IBudgetGroupStore.SearchParams) => void

    getTargetCode?: () => Promise<any>
    setCampaignType?: (str: string) => void
    campaignOption?: [IBudgetGroupStore.OptionList]

    filter?: IBudgetGroupStore.SearchParams
    routerStore?: RouterStore
    getListDetail?: () => Promise<any>
    getSourceAccount?: []
}



@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, budgetStore } = store
        const { getSourceAccount, campaignOption, getListDetail, filter, changeFilter } = budgetStore
        return { getSourceAccount, campaignOption, getListDetail, filter, routerStore, changeFilter }
    }
)
@observer
class BudgetSearch extends ComponentExt<IStoreProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    @observable
    companyList: [IBudgetGroupStore.campaignOption] = [{}]

    @observable
    accountList: [IBudgetGroupStore.accountOption] = [{}]


    @action
    getCampany = async () => {
        try {
            const res = await this.api.budgetGroup.getCampaign();
            runInAction('SET_CAMPAIGN', () => {
                console.log(res.data);
                this.companyList = res.data;
            })
        }
        catch (err) {
            console.log(err)
        }
    }
    @action
    getAccountList = async () => {
        try {
            const res = await this.api.budgetGroup.getAccount();
            runInAction('SET_ACCOUNT', () => {
                this.accountList = res.data;
            })
        }
        catch (err) {
            console.log(err)
        }

    }

    



    componentWillMount() {
        this.props.getListDetail()
        this.getCampany();
        this.getAccountList();
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { changeFilter, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        changeFilter(values)
                    } catch (err) { }
                    this.toggleLoading()
                }
            }
        )
    }


    render() {
        const { form, filter } = this.props
        const { getFieldDecorator } = form
        return (
            <Form {...layout} >
                <Row>
                    <Col span={span}>
                        <FormItem label="Group Name">
                            {getFieldDecorator('group_name', {
                                initialValue: filter.group_name
                            })(<Input autoComplete="off" />)}
                        </FormItem>
                    </Col>

                    <Col span={span}>
                        <FormItem label="Source Account">
                            {getFieldDecorator('source_account', {
                                initialValue: filter.source_account
                            })(<Select
                                allowClear
                                showSearch
                                mode='multiple'
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.accountList.map(c => (
                                    <Select.Option key={c.id} value={c.id}>
                                        {c.user_name}
                                    </Select.Option>
                                ))}
                            </Select>)}
                        </FormItem>
                    </Col>
                    <Col span={span}>
                        <FormItem label="App ID">
                            {getFieldDecorator('app_id', {
                                initialValue: filter.app_id
                            })(<Input autoComplete="off" />)}
                        </FormItem>
                    </Col>
                    <Col span={span}>
                        <FormItem label="Campaign">
                            {getFieldDecorator('campaign', {
                                initialValue: filter.campaign
                            })(
                                <Select
                                    allowClear
                                    showSearch
                                    mode='multiple'
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.props.content.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {this.companyList.map(c => (
                                        <Select.Option key={c.id} value={c.id}>
                                            <Popover content={c.id + '-' + c.name} placement="right" overlayClassName={styles.popovers}>
                                                <div className={styles.textHidden}>
                                                    {c.id + '-' + c.name}
                                                </div>
                                            </Popover>
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={3} offset={1}>
                        <Button type="primary" icon="search" onClick={this.submit} htmlType="submit">Search</Button>
                    </Col>
                    <Col span={3} offset={1}>
                        <span id='companyAddBtn'></span>
                    </Col>
                </Row>
            </Form>
        )
    }
}

export default Form.create<IStoreProps>()(BudgetSearch)
