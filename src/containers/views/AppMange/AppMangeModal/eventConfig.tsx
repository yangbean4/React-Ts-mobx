import * as React from 'react'
import { Col, Form, Row, Select, Input, Icon } from 'antd'
import * as styles from './index.scss'
import { FormComponentProps } from 'antd/lib/form'
import { observable, computed, } from 'mobx'
import { observer } from 'mobx-react'
import { PlatformNameOption, EventTypeOption } from '../web.config'

const FormItem = Form.Item;

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
    value?: Array<any>
    onChange?: (data) => void
    valid: (fn: Function) => void;
}

@observer
class EventConfig extends React.Component<IProps & FormComponentProps>{

    // @observable
    // private isRequired = false;

    componentDidMount() {
        // 添加效验方法
        this.props.valid(this.props.form.validateFields)
    }

    @computed
    get dataList() {
        console.log(this.props.value)
        if (this.props.value === null || this.props.value.length == 0) {
            return [
                {
                    source_name: '',
                    event_type: '',
                    event_name: ''
                }
            ]
        } else {
            return this.props.value
        }
    }

    remove = (k) => {
        let data = this.props.form.getFieldValue('eventConfig').filter((v, i) => i !== k);
        this.props.onChange(data);
        setImmediate(() => {
            this.props.form.setFieldsValue({
                eventConfig: this.dataList
            })
        });
    }

    add = () => {
        this.props.onChange([...this.dataList, {
            source_name: '',
            event_type: '',
            event_name: ''
        }])
    }

    checkRequired = (v) => {
        return v.source_name || v.event_type || v.event_name;
    }

    render() {
        const { getFieldDecorator } = this.props.form
        return <div style={{ marginBottom: 30 }}>
            <Col span={4} className={styles.companyTag} style={{ float: 'none' }}>
                <div className={styles.tagWrapper}>
                    <span>Event Config</span>
                </div>
            </Col>
            <Row>
                <Col xs={24} sm={5} lg={2}></Col>
                <Col xs={24} sm={19} lg={13}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <td style={{ width: 100 }}>Platform Name</td>
                                <td style={{ width: 100 }}>Event Type</td>
                                <td style={{ width: 100 }}>Evnet Key</td>
                                <td style={{ width: 80 }}>Operate</td>
                            </tr>
                        </thead>
                        <tbody>
                            {this.dataList.map((v, k) => (
                                <tr>
                                    <td>
                                        <FormItem>
                                            {getFieldDecorator(`eventConfig[${k}].source_name`, {
                                                initialValue: v.source_name,
                                                rules: [{ required: this.checkRequired(v), message: "Required" }]
                                            })(<Select
                                                showSearch
                                                getPopupContainer={trigger => trigger.parentElement}
                                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {PlatformNameOption.map(c => (
                                                    <Select.Option {...c}>
                                                        {c.value}
                                                    </Select.Option>
                                                ))}
                                            </Select>)}
                                        </FormItem>
                                    </td>
                                    <td>
                                        <FormItem>
                                            {getFieldDecorator(`eventConfig[${k}].event_type`, {
                                                initialValue: v.event_type,
                                                rules: [{ required: this.checkRequired(v), message: "Required" }]
                                            })(<Select
                                                showSearch
                                                getPopupContainer={trigger => trigger.parentElement}
                                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {EventTypeOption.map(c => (
                                                    <Select.Option {...c}>
                                                        {c.value}
                                                    </Select.Option>
                                                ))}
                                            </Select>)}
                                        </FormItem>
                                    </td>
                                    <td>
                                        <FormItem>
                                            {getFieldDecorator(`eventConfig[${k}].event_name`, {
                                                initialValue: v.event_name,
                                                rules: [{ required: this.checkRequired(v), message: "Required" }]
                                            })(<Input></Input>)}
                                        </FormItem>
                                    </td>
                                    <td>
                                        <Icon style={{ margin: 5 }}
                                            key="delete"
                                            className="dynamic-add-button"
                                            type="plus-circle"
                                            onClick={() => this.add()}
                                        />
                                        <Icon
                                            key="add"
                                            className="dynamic-delete-button"
                                            type="minus-circle-o"
                                            onClick={() => this.remove(k)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Col>
            </Row>
        </div>

    }
}

export default Form.create<IProps>({
    onValuesChange: (props, changeValues, allValues) => {
        props.onChange(allValues.eventConfig);
    }
})(EventConfig)
