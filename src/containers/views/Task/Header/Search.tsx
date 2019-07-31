import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Select, Row, Col, Button, DatePicker } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusEnum } from '../web.config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import moment from 'moment';

const dateFormat = 'YYYYMMDD'
const statusKeys = Object.keys(statusEnum).filter(k => isNaN(parseInt(k, 10)))

const { RangePicker } = DatePicker;

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
    changeFilter?: (params: ITaskStore.SearchParams) => void
    filters?: ITaskStore.SearchParams
    getGeo?: () => void
    getPkgname?: () => void
    optionListDb?: ITaskStore.OptionListDb
}



@inject(
    (store: IStore): IStoreProps => {
        const { changeFilter, filters, getGeo, getPkgname, optionListDb } = store.taskStore
        return { changeFilter, filters, getGeo, getPkgname, optionListDb }
    }
)
@observer
class TaskSearch extends ComponentExt<IStoreProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }


    defaultValue = () => {
        return [new Date(), new Date()].map(val => moment(val, dateFormat))
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
                    values.date = values.date.map(val => val.format('YYYY-MM-DD')).join(' - ')
                    try {
                        changeFilter(values)
                    } catch (err) { }
                    this.toggleLoading()
                }
            }
        )
    }

    componentDidMount() {
        this.props.getGeo();
        this.props.getPkgname();
    }

    render() {
        const { form, filters, optionListDb } = this.props
        const { getFieldDecorator } = form
        return (
            <Form {...layout} >
                <Row>
                    <Col span={span}>
                        <FormItem label="App ID" className={styles.searchInput}>
                            {getFieldDecorator('app_id', {
                                initialValue: filters.app_id
                            })(<Input autoComplete="off" />)}
                        </FormItem>
                    </Col>
                    <Col span={span}>
                        <FormItem label="Task Name" className={styles.searchInput}>
                            {getFieldDecorator('task_name', {
                                initialValue: filters.task_name
                            })(<Input autoComplete="off" />)}
                        </FormItem>
                    </Col>
                    <Col span={span}>
                        <FormItem label="GEO" className='minInput'>
                            {getFieldDecorator('GEO')(
                                <Select
                                    allowClear
                                    mode='multiple'
                                    showSearch
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {optionListDb.Country.map(c => (
                                        <Select.Option key={c.id} value={c.code2}>
                                            {c.code2}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={span}>
                        <FormItem label="Status" className='minInput'>
                            {getFieldDecorator('status', {
                                initialValue: filters.status
                            })(
                                <Select
                                    allowClear
                                    showSearch
                                    mode='multiple'
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {statusKeys.map(c => (
                                        <Select.Option key={statusEnum[c]} value={statusEnum[c]}>
                                            {c}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={span}>
                        <FormItem label="Pkg Name" className='minInput'>
                            {getFieldDecorator('pkg_name')(
                                <Select
                                    allowClear
                                    mode='multiple'
                                    showSearch
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {optionListDb.PkgnameData.map(c => (
                                        <Select.Option key={c.id} value={c.pkg_name}>
                                            {c.pkg_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={span}>
                        <FormItem label="Date">
                            {getFieldDecorator('date', {
                                initialValue: this.defaultValue()
                            })(<RangePicker format={dateFormat} />)}
                        </FormItem>
                    </Col>

                    <Col span={3} offset={1}>
                        <Button type="primary" icon="search" onClick={this.submit}>Search</Button>
                    </Col>
                    <Col span={3} offset={1}>
                        <span id='taskAddBtn'></span>
                    </Col>
                </Row>
            </Form>
        )
    }
}

export default Form.create<IStoreProps>()(TaskSearch)
