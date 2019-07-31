import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Icon, Form, Input, Select, Button, message, Col, Row, DatePicker } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
let id: number = 0;
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

interface myObj {
    scene_code?: number,
    scene_name?: string,
    id?: number,
    isdelete?: number
}


interface IProps {
    routerStore?: RouterStore
    getCategoryInfo: () => Promise<any>,
    setCategoryId: (params: number) => void
    getCategoryConfigDetail: () => Promise<any>,
    addCategorySubmit: () => Promise<any>,
    categoryIdList?: [],
    addCategory: ICategoryConfigStore.addCategoryParams
    changeAddCategory: (params: any) => void
    showCategoryParams: ICategoryConfigStore.showCategoryParams
    category_id?: number
}

@inject(
    (store: IStore): IProps => {
        const { routerStore } = store;
        const { categoryIdList, addCategory, getCategoryConfigDetail, addCategorySubmit, changeAddCategory, setCategoryId, getCategoryInfo, showCategoryParams, category_id } = store.categoryConfigStore;
        return { categoryIdList, getCategoryConfigDetail, addCategorySubmit, addCategory, changeAddCategory, setCategoryId, getCategoryInfo, routerStore, showCategoryParams, category_id }
    }
)

@observer
class CategoryModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private temp_params: ICategoryConfigStore.showCategoryParams = {
        scene_code: [],
        scene_name: [],
        isdelete_number: [],
        screne_id: []
    }

    @observable
    private origin_param: ICategoryConfigStore.showCategoryParams = {}


    private tem_isdelete: any[] = [];


    private check_number(rule, value, callback) {
        var re = /^\d+$/;

        if (re.test(value)) {
            callback();
        } else {
            callback('code must be number');
        }
    };

    change_tem_isdelete = (obj: any) => {
        // debugger;
        this.tem_isdelete.push(obj)
    }


    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    componentWillMount() {
        this.init()
    }
    init = async () => {
        const { routerStore } = this.props;
        const routerId = routerStore.location.pathname.split('/').pop();
        if (routerId != 'add') {
            await this.props.setCategoryId(parseInt(routerId));
        }

        const { showCategoryParams } = this.props;
        setImmediate(() => {
            runInAction('set', () => {
                this.temp_params = Object.assign({}, showCategoryParams)
                this.origin_param = Object.assign({}, showCategoryParams)
            })
        })

        id = showCategoryParams.number.length;
        let arr = showCategoryParams.number.map((_, index) => index)

        this.props.form.setFieldsValue({
            keys: arr
        });
    }

    componentDidMount() {
        console.log('mount')
    }
    componentWillUnmount() {
        console.log(11)
    }



    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { form, changeAddCategory } = this.props;
        form.validateFields(
            async (err, values): Promise<any> => {
                console.log(values);
                if (!err) {
                    let { codes, names, category_id, id, isdelete } = values;
                    let arr = [];
                    for (let i in codes) {
                        let obj: myObj = {};
                        obj.scene_code = codes[i];
                        obj.scene_name = names[i];
                        obj.id = id[i];
                        obj.isdelete = isdelete[i];
                        arr.push(obj);
                    }
                    arr = arr.concat(this.tem_isdelete);
                    let datas = {
                        category_id,
                        data: arr
                    }

                    this.toggleLoading();
                    try {
                        changeAddCategory(datas);
                        this.props.addCategorySubmit()
                    } catch (err) {
                        //console.log(err);
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    remove = (k) => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        // We need at least one passenger
        if (keys.length === 1) {
            return;
        }
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
    }

    add = (k) => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        const index = keys.findIndex(key => key === k)
        // const nextKeys = keys.concat(id++);
        const nextKeys = [...keys]
        nextKeys.splice(index + 1, 0, id++)
        form.setFieldsValue({
            keys: nextKeys,
        });
    }

    render() {
        const { form, categoryIdList, addCategory, showCategoryParams, category_id } = this.props
        const { getFieldDecorator, getFieldValue } = form;
        let a = showCategoryParams.number;
        // console.log(a)
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
        getFieldDecorator('keys', { initialValue: this.temp_params.number || [] });
        const keys = getFieldValue('keys');
        const formItems = keys.map((k, index) => (
            <span key={k}>
                <Form.Item
                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                    label={index === 0 ? 'Scene' : ''}
                    required={true}
                >
                    {getFieldDecorator(`codes[${k}]`,
                        {
                            initialValue: this.temp_params.scene_code[k],
                            validateTrigger: ['onChange', 'onBlur'],
                            rules: [
                                {
                                    required: true,
                                    whitespace: true,
                                    message: "required",
                                }
                                , {
                                    validator: this.check_number,
                                }
                            ],
                        })(<Input placeholder="code" style={{ width: '20%', marginRight: 8, marginBottom: 0 }} />)}

                    <Form.Item style={{ display: 'inline-block', width: '60%', marginBottom: 0 }}>
                        {getFieldDecorator(`names[${k}]`, {
                            initialValue: this.temp_params.scene_name[k],
                            validateTrigger: ['onChange', 'onBlur'],
                            rules: [
                                {
                                    required: true,
                                    whitespace: true,
                                    message: "require",
                                },
                            ],
                        })(<Input placeholder="scene" style={{ width: '60%', marginRight: 8 }} />)}
                        <Icon style={{ margin: 5 }}
                            className="dynamic-delete-button"
                            type="plus-circle"
                            onClick={() => this.add(k)}
                        />
                        {keys.length > 0 && <Icon
                            className="dynamic-add-button"
                            type="minus-circle-o"
                            onClick={() => this.remove(k)}
                        />}

                    </Form.Item>
                    <Form.Item style={{ display: 'none' }} >
                        {getFieldDecorator(`isdelete[${k}]`, {
                            initialValue: this.temp_params.isdelete_number[k],

                        })(<Input placeholder="" />)}
                    </Form.Item>
                    <Form.Item style={{ display: 'none' }} >
                        {getFieldDecorator(`id[${k}]`, {
                            initialValue: this.temp_params.screne_id[k]
                        })(<Input placeholder="" />)}
                    </Form.Item>
                </Form.Item>
            </span>
        ));
        return (
            <div className='sb-form'>
                <Form className={styles.userModal} >
                    <FormItem {...formItemLayout} label="Category">
                        {getFieldDecorator('category_id', {
                            initialValue: category_id,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Select
                            allowClear
                            showSearch
                            disabled={addCategory.category_id ? false : true}
                        >
                            {categoryIdList.map(c => (
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
