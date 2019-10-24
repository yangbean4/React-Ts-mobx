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
    addCategorySubmit: (flag: number) => Promise<any>,
    categoryIdList?: ICategoryConfigStore.categoryIdList[],
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

    @observable
    private tem_isdelete: any[] = [];
    private check_number(rule, value, callback) {
        var re = /^\d+$/;
        if (re.test(value)) {
            callback();
        } else {
            callback('code must be number');
        }
    };
    @action
    change_tem_isdelete = (obj: any) => {
        // debugger;
        this.tem_isdelete.push(obj)
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    componentWillMount() {
        this.init();
    }

    @action
    init = async () => {
        const { routerStore, category_id } = this.props;
        const routerId = routerStore.location.pathname.split('/').pop();

        console.log(routerId);

        if (routerId != 'add') {
            await this.props.setCategoryId(parseInt(routerId));
            setImmediate(() => {
                const { showCategoryParams } = this.props;
                id = showCategoryParams.number.length;
                console.log(this.props.showCategoryParams);
                runInAction('get', () => {
                    this.temp_params = Object.assign({}, showCategoryParams);
                    this.origin_param = Object.assign({}, showCategoryParams)
                    let arr = this.temp_params.number.map((_, index) => index);
                    this.props.form.setFieldsValue({
                        keys: arr
                    });
                })
            })

        } else {
            console.log(category_id)
            if (!category_id) {
                // routerStore.push('/category')
                console.log(1)
            }
            setImmediate(() => {
                runInAction('set', () => {
                    this.props.form.setFieldsValue({
                        keys: [0]
                    });
                })
            })
        }

    }

    componentDidMount() {
        console.log(this.props.addCategory.category_id)
    }
    componentWillUnmount() {
        console.log(11)
    }



    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { form, changeAddCategory, routerStore } = this.props;
        const routerId = routerStore.location.pathname.split('/').pop();
        form.validateFields(
            async (err, values): Promise<any> => {
                console.log(values);
                if (!err) {
                    let { codes, names, category_id, id, isdelete, keys } = values;
                    let arr = [];
                    let flags = codes.some((val, idx) => {
                        return codes.includes(val, idx + 1);
                    })
                    let flags_name = names.some((val, idx) => {
                        return names.includes(val, idx + 1);
                    })
                    if (flags || flags_name) {
                        message.error('scene is already exist!');
                        return
                    }

                    for (let i in keys) {
                        let obj: myObj = {};
                        obj.scene_code = codes[keys[i]];
                        obj.scene_name = names[keys[i]];
                        obj.id = id[keys[i]] || '';
                        arr.push(obj);
                    }
                    arr = arr.concat(this.tem_isdelete);
                    let datas = {
                        category_id,
                        data: arr
                    }

                    // debugger
                    this.toggleLoading();
                    try {
                        changeAddCategory(datas);
                        if (routerId == 'add') {
                            await this.props.addCategorySubmit(0)
                        } else {
                            await this.props.addCategorySubmit(1)
                        }
                    } catch (err) {
                        console.log(err);
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

        if (this.temp_params.screne_id[k]) {
            runInAction('set_delete', () => {

                let delete_obj = {
                    "id": this.temp_params.screne_id[k],
                    "scene_code": this.temp_params.scene_code[k],
                    "scene_name": this.temp_params.scene_name[k],
                    "is_delete": 1
                }
                //将删除的数据存入新的数组中
                this.change_tem_isdelete(delete_obj)
            })
        }

    }

    add = (k) => {
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        const index = keys.findIndex(key => key === k);
        console.log(keys)
        const nextKeys = [...keys]
        nextKeys.splice(index + 1, 0, ++id)
        // debugger;
        form.setFieldsValue({
            keys: nextKeys,
        });
    }
    goBack = () => {
        this.props.history.goBack();
    }

    render() {
        const { form, categoryIdList, addCategory, showCategoryParams, category_id, routerStore } = this.props
        const { getFieldDecorator, getFieldValue } = form;
        const routerId = routerStore.location.pathname.split('/').pop();
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
        // console.log(keys)
        const formItems = keys.map((k, index) => (
            // console.log(k)
            <span key={k}>
                <Form.Item
                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                    label={index === 0 ? 'Scene' : ''}
                    required={true}
                >
                    {getFieldDecorator(`codes[${k}]`,
                        {
                            initialValue: this.temp_params.scene_code[k],
                            validateTrigger: ['onBlur'],
                            rules: [
                                {
                                    required: true,
                                    whitespace: true,
                                    message: "required",
                                }
                                // , {
                                //     validator: this.check_number,
                                // }
                            ],
                        })(<Input placeholder="code" autoComplete="off" style={{ width: '20%', marginRight: 8, marginBottom: 0 }} />)}

                    <Form.Item style={{ display: 'inline-block', width: '60%', marginBottom: 0 }}>
                        {getFieldDecorator(`names[${k}]`, {
                            initialValue: this.temp_params.scene_name[k],
                            validateTrigger: ['onBlur'],
                            rules: [
                                {
                                    required: true,
                                    whitespace: true,
                                    message: "require",
                                },
                            ],
                        })(<Input placeholder="scene" autoComplete="off" style={{ width: '60%', marginRight: 8 }} />)}
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
                            initialValue: routerId == 'add' ? '' : category_id,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Select
                            allowClear
                            showSearch
                            getPopupContainer={trigger => trigger.parentElement}
                            disabled={routerId != 'add' ? true : false}
                        >
                            {categoryIdList.map(c => (
                                <Select.Option key={c.name} value={c.id}>
                                    {c.name}
                                </Select.Option>
                            ))}
                        </Select>)}
                    </FormItem>
                    {formItems}

                    <FormItem className={styles.btnBox}>
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                        <Button onClick={this.goBack} style={{ marginLeft: 10 }}>Cancel</Button>
                    </FormItem>
                </Form>
            </div>
        )
    }
}

export default Form.create<IProps>()(CategoryModal)
