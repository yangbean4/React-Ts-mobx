import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Row, Col, Button } from 'antd'
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
    changeFilter?: (params: IStrategyGroupStore.SearchParams) => void
    filters?: IStrategyGroupStore.SearchParams
    routerStore?: RouterStore
}



@inject(
    (store: IStore): IStoreProps => {
        const { changeFilter, filters } = store.StrategyGroupStore
        const routerStore = store.routerStore
        return { routerStore, changeFilter, filters }
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
                    try {
                        changeFilter(values)
                    } catch (err) { }
                    this.toggleLoading()
                }
            }
        )
    }

    render() {
        const { form, filters } = this.props
        const { getFieldDecorator } = form
        return (
            <Form {...layout} >
                <Row>
                    <Col span={span}>
                        <FormItem label="Strategy Name" className='minInput'>
                            {getFieldDecorator('strategy_name', {
                                initialValue: filters.strategy_name
                            })(<Input autoComplete="off" />)}
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
