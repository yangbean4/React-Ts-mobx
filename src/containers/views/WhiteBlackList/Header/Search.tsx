import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Select, Row, Col, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'


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
    changeFilter?: (params: IWhiteBlackListStore.SearchParams) => void
    filters?: IWhiteBlackListStore.SearchParams
    getCategory?: () => void
    getPlacements?: () => void
    getCampaigns: () => void
    optionListDb?: IWhiteBlackListStore.OptionListDb
    routerStore?: RouterStore
}



@inject(
    (store: IStore): IStoreProps => {
        const { changeFilter, filters, getCategory, optionListDb, getCampaigns, getPlacements } = store.whiteBlackListStore
        const routerStore = store.routerStore
        return { routerStore, changeFilter, filters, getCategory, optionListDb, getCampaigns, getPlacements }
    }
)
@observer
class Search extends ComponentExt<IStoreProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }


    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { changeFilter, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading();
                    if (values.category && values.category.length === 0) {
                        delete values.category;
                    }
                    try {
                        changeFilter(values)
                    } catch (err) { }
                    this.toggleLoading()
                }
            }
        )
    }

    componentDidMount() {
        this.props.getCategory();
        this.props.getCampaigns();
        this.props.getPlacements();
        const campaign_id = window.localStorage.getItem('WBLcampaign');
        if (campaign_id) {
            this.props.form.setFieldsValue({
                campaign_id: [+campaign_id]
            })
            setImmediate(this.submit);
            window.localStorage.removeItem('WBLcampaign');
        }
    }

    render() {
        const { form, filters, optionListDb } = this.props
        const { getFieldDecorator } = form
        return (
            <Form {...layout} >
                <Row>
                    <Col span={span}>
                        <FormItem label="Pkg Name" className='minInput'>
                            {getFieldDecorator('pkg_name', {
                                initialValue: filters.pkg_name
                            })(<Input autoComplete="off" />)}
                        </FormItem>
                    </Col>
                    <Col span={span}>
                        <FormItem label="Category" className='minInput'>
                            {getFieldDecorator('category')(
                                <Select
                                    allowClear
                                    mode='multiple'
                                    showSearch
                                    maxTagCount={1}
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {optionListDb.Category.map(c => (
                                        <Select.Option key={c.id} value={c.id}>
                                            {c.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={span}>
                        <FormItem label="App ID" className={styles.searchInput}>
                            {getFieldDecorator('app_id', {
                                initialValue: filters.app_id
                            })(<Input autoComplete="off" />)}
                        </FormItem>
                    </Col>

                    <Col span={span}>
                        <FormItem label="Placement" className='minInput'>
                            {getFieldDecorator('placement_id')(
                                <Select
                                    allowClear
                                    mode='multiple'
                                    showSearch
                                    maxTagCount={1}
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {optionListDb.placements.map(c => (
                                        <Select.Option key={c.placement_id} value={c.placement_id}>
                                            {c.placement_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                    </Col>

                    <Col span={span}>
                        <FormItem label="White/Black Type" className='minInput'>
                            {getFieldDecorator('type')(
                                <Select
                                    allowClear
                                    mode='multiple'
                                    showSearch
                                    maxTagCount={1}
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    <Select.Option key={0} value={0}>Whitelist</Select.Option>
                                    <Select.Option key={1} value={1}>Blacklist</Select.Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>

                    <Col span={span}>
                        <FormItem label="Campaign" className='minInput'>
                            {getFieldDecorator('campaign_id')(
                                <Select
                                    allowClear
                                    mode='multiple'
                                    showSearch
                                    maxTagCount={1}
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {optionListDb.campaigns.map(c => (
                                        <Select.Option key={c.id} value={c.id}>
                                            {c.name}
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
                        <span id='whiteBlackAddBtn'></span>
                    </Col>
                </Row>
            </Form>
        )
    }
}

export default Form.create<IStoreProps>()(Search)
