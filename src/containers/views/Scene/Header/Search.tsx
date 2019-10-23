import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Select, Row, Col, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption } from '../web.config'
import { ComponentExt } from '@utils/reactExt'

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
    changeFilter?: (params: ISceneStore.SearchParams) => void
    filters?: ISceneStore.SearchParams
    getCategoryIdLists?: () => Promise<any>
    IcategorIdList?: ISceneStore.ICategoryLists[]
}



@inject(
    (store: IStore): IStoreProps => {
        const { changeFilter, filters, getCategoryIdLists, IcategorIdList } = store.sceneStore
        return { changeFilter, filters, getCategoryIdLists, IcategorIdList }
    }
)
@observer
class SceneSearch extends ComponentExt<IStoreProps & FormComponentProps> {
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
                    this.toggleLoading()
                    try {
                        changeFilter(values)
                    } catch (err) { }
                    this.toggleLoading()
                }
            }
        )
    }
    componentWillMount() {
        this.props.getCategoryIdLists()
    }

    render() {
        const { form, filters } = this.props
        const { getFieldDecorator } = form
        return (
            <Form {...layout} >
                <Row>
                    <Col span={span}>
                        <FormItem label="App ID">
                            {getFieldDecorator('app_id', {
                                initialValue: filters.app_id
                            })(<Input autoComplete="off" />)}
                        </FormItem>
                    </Col>
                    <Col span={span}>
                        <FormItem label="Category" className='category_id'>
                            {getFieldDecorator('category_id', {
                                initialValue: filters.category_id
                            })(
                                <Select
                                    allowClear
                                    showSearch
                                    mode="multiple"
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {this.props.IcategorIdList.map(c => (
                                        <Select.Option value={c.id} key={c.name} >
                                            {c.name}
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
                                    mode="multiple"
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {statusOption.map(c => (
                                        <Select.Option {...c}>
                                            {c.key}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={3} offset={1}>
                        <Button type="primary" onClick={this.submit} htmlType="submit">Search</Button>
                    </Col>
                    <Col span={3} offset={1}>
                        <span id='SceneAddBtn'></span>
                    </Col>
                </Row>
            </Form>
        )
    }
}

export default Form.create<IStoreProps>()(SceneSearch)
