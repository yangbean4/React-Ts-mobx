import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Select, Row, Col, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
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
    changeFilter?: (params: ICategoryConfigStore.SearchParams) => void
    filters?: ICategoryConfigStore.SearchParams,
    categoryList?:[],
    IList?:[],

}

@inject(
    (store: IStore): IStoreProps => {
        const { changeFilter ,filters,categoryList,IList} = store.categoryConfigStore
        return { changeFilter,filters,categoryList,IList}
    }
)
@observer
class CategorySearch extends ComponentExt<IStoreProps & FormComponentProps> {
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
        const { changeFilter, form } = this.props;
        form.validateFields(
            async (err, values): Promise<any> => {
                console.log(values)
                if (!err) {
                    this.toggleLoading();
                    try {
                        changeFilter(values)
                    } catch (err) { }
                    this.toggleLoading()
                }
            }
        )
    }

    render() {
        const { form, filters, IList } = this.props
        const { getFieldDecorator } = form
        return (
            <Form {...layout} >
                <Row>
                    <Col span={span}>
                        <FormItem label="Category" className='minInput'>
                            {getFieldDecorator('category_id', {
                                initialValue: filters.category_id
                            })(
                                <Select
                                    allowClear
                                    showSearch
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {IList.map(c => (
                                        <Select.Option {...c}>
                                            {c.key}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={span}>
                        <FormItem label="Scene" className='minInput'>
                            {getFieldDecorator('scene', {
                                initialValue: filters.Scene
                            })(<Input autoComplete="off" />)}
                        </FormItem>
                    </Col>

                    <Col span={3} offset={1}>
                        <Button type="primary" onClick={this.submit}>Search</Button>
                    </Col>
                    <Col span={3} offset={1}>
                        <span id='customAddBtn'></span>
                    </Col>
                </Row>
            </Form>
        )
    }
}

export default Form.create<IStoreProps>()(CategorySearch)
