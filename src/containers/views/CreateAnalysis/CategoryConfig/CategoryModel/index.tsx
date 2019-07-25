import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import {Icon, Form, Input, Select, Radio, Button, message ,Col, Row} from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
let id = 1;
const FormItem = Form.Item
const InputGroup = Input.Group;
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
    getCategoryInfo: () => Promise<any>,
    setCategoryId:(params:ICategoryConfigStore.addCategoryParams) => void
    getCategoryConfigDetail: () => Promise<any>,
    addCategorySubmit: () => Promise<any>,
    IList?:[],
    addCategory:ICategoryConfigStore.addCategoryParams
    changeAddCategory:(params:ICategoryConfigStore.addCategoryParams) => void
}

@inject(
    (store: IStore): IProps => {
        const { IList,addCategory,getCategoryConfigDetail,addCategorySubmit,changeAddCategory,setCategoryId,getCategoryInfo} = store.categoryConfigStore;
        return { IList,getCategoryConfigDetail,addCategorySubmit,addCategory,changeAddCategory,setCategoryId,getCategoryInfo}
    }
)

@observer
class CategoryModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    componentWillUnmount() {
        console.log(11)
        this.props.setCategoryId({});
        // this.props.getCategoryConfigDetail()
    }
    add = () => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(id++);
        // can use data-binding to set
        // important! notify form to detect changes
        console.log(nextKeys)
        form.setFieldsValue({
          keys: nextKeys,
        });
    };

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const {  form ,changeAddCategory } = this.props;
        form.validateFields(
            async (err, values): Promise<any> => {
                console.log(values)
                if (!err) {
                    this.toggleLoading()
                    try {
                        changeAddCategory(values);
                        this.props.addCategorySubmit()
                    } catch (err) {
                        //console.log(err);
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    remove = k => {
        // alert(11)
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        // We need at least one passenger
        if (keys.length === 1) {
          return;
        }
        // can use data-binding to set
        form.setFieldsValue({
          keys: keys.filter(key => key !== k),
        });
    };

    render() {

        const { form ,IList,addCategory} = this.props
        const { getFieldDecorator , getFieldValue} = form;
        const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 4 },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 20 },
            },
        };
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
              xs: { span: 24, offset: 0 },
              sm: { span: 20, offset: 4 },
            },
        };
        getFieldDecorator('keys', { initialValue: [0] });
        const keys = getFieldValue('keys');
        const formItems = keys.map((k, index) => (
          <Form.Item
            {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
            label={index === 0 ? 'Scene' : ''}
            required={true}
            key={k}
          >
            {getFieldDecorator('scene_code', 
            {
                initialValue:addCategory.scene_code,
                validateTrigger: ['onChange', 'onBlur'],
                rules: [
                    {
                    required: true,
                    whitespace: true,
                    message: "1111",
                    },
                ],
            })(<Input placeholder="code" style={{ width: '20%', marginRight: 8 }} />)}
            {getFieldDecorator('scene_name', {
                initialValue:addCategory.scene_name,
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: "‘xxx’ is in use. Please remove the corresponding relation before deleting it！”",
                },
              ],
            })(<Input placeholder="scene" style={{ width: '60%', marginRight: 8 }} />)}

            <Icon style={{margin:5}} 
             className="dynamic-delete-button"
             type="plus-circle"
             onClick={this.add}
             />
            <Icon 
                className="dynamic-add-button"
                type="minus-circle-o"
                onClick={() => this.remove(k)}
              />
          </Form.Item>
        ));
        return (
            <div className='sb-form'>
                <Form className={styles.userModal} >
                    <FormItem {...formItemLayout} label="Category">
                        {getFieldDecorator('category_id', {
                            initialValue:addCategory.category_id,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Select
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
                        </Select>)}
                    </FormItem>
                    {formItems}
                    <FormItem className={styles.btnBox}>
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                    </FormItem>
                </Form>
            </div>
        )
    }
}

export default Form.create<IProps>()(CategoryModal)
