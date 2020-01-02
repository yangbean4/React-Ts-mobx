import * as React from 'react'
import { Col, Form, InputNumber, DatePicker } from 'antd'
import * as styles from './index.scss'
import { FormComponentProps } from 'antd/lib/form'
import { observable, action, computed, runInAction, when } from 'mobx'
import { observer } from 'mobx-react'
import moment from 'moment'

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
    value?: any
    onChange?: (data) => void
    valid: (fn: Function) => void;
}

@observer
class KPI extends React.Component<IProps & FormComponentProps>{

    // @observable
    private fromData = null;

    @observable
    private isRequired = false;

    componentDidMount() {
        // 添加效验方法
        this.props.valid(this.props.form.validateFields)
    }

    constructor(props) {
        super(props);

        when(
            () => this.props.value,
            () => this.setIsRequired()
        );
    }

    @action
    setIsRequired = () => {
        const data = this.fromData || this.props.value;
        if (data == null) return this.isRequired = false;
        const res = !!Object.values(data).find(v => v);
        this.isRequired = res;
        console.log(this.isRequired);
        if (res == false) {
            setImmediate(() => this.props.form.validateFields({
                force: true
            }));
        }
    }

    @computed
    get value() {
        if (this.props.value && !Array.isArray(this.props.value)) {
            return this.props.value;
        }
        return null;
    }


    onchange = () => setImmediate(() => {
        const data = this.props.form.getFieldsValue();
        if (!Object.values(data).find(v => v)) {
            this.props.onChange({});
        } else {
            this.props.onChange({
                ...data,
                start_time: data.start_time && data.start_time.format('YYYY-MM-DD'),
                end_time: data.end_time && data.end_time.format('YYYY-MM-DD')
            });
        }
        this.fromData = data;
        this.setIsRequired();
    })

    render() {
        const { getFieldDecorator } = this.props.form
        const {
            rate = '',
            start_time = null,
            end_time = null
        } = this.value || {};
        return <div>
            <Col span={4} className={styles.companyTag} style={{ float: 'none' }}>
                <div className={styles.tagWrapper}>
                    <span>KPI</span>
                </div>
            </Col>
            <FormItem label="Aim Retention" {...formItemLayout}>
                {getFieldDecorator('rate', {
                    initialValue: rate,
                    rules: [
                        { required: this.isRequired, message: "Required" },
                        {
                            validator: (r, v, callback) => {
                                if (this.isRequired == false) return callback();
                                if (v <= 0) {
                                    return callback('The Exchange Rate should be a positive number!')
                                }
                                callback()
                            }
                        }
                    ]
                })(<InputNumber precision={0} onChange={this.onchange} />)}
                <span style={{ marginLeft: "5px" }}>%</span>
            </FormItem>
            <FormItem label="Start Time" {...formItemLayout}>
                {getFieldDecorator('start_time', {
                    initialValue: start_time && moment(start_time),
                    rules: [
                        { required: this.isRequired, message: "Required" }
                    ]
                })(<DatePicker onChange={this.onchange} />)}
            </FormItem>
            <FormItem label="End Time" {...formItemLayout}>
                {getFieldDecorator('end_time', {
                    initialValue: end_time && moment(end_time),
                    rules: [
                        { required: this.isRequired, message: "Required" }
                    ]
                })(<DatePicker onChange={this.onchange} />)}
            </FormItem>
        </div>

    }
}

export default Form.create<IProps>()(KPI)
