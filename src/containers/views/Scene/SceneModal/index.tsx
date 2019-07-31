import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption } from '../web.config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import FirstScene, { formItemClassName, firstSceneValidator } from '@components/FirstScene'

const FormItem = Form.Item

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
    createScene?: (scene: ISceneStore.IScene) => Promise<any>
    modifyScene?: (scene: ISceneStore.IScene) => Promise<any>
    routerStore?: RouterStore
    getCategory?: () => Promise<any>
    categoryList?: ISceneStore.ICategory[]
    // 是否是在Modal中
    isInModal?: boolean
    onSave?: (scene: ISceneStore.IScene) => void
    onCancel?: () => void
    // Modal中传过来的appkey，如果有这个参数，则默认显示这个ID且无法修改
    appKey?: string
}

@inject(
    (store: IStore): IProps => {
        const { sceneStore, routerStore } = store
        const { createScene, modifyScene, getCategory, categoryList } = sceneStore
        return { routerStore, createScene, modifyScene, getCategory, categoryList }
    }
)
@observer
class SceneModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private app_key: string = ''

    @observable
    private sceneTarget: ISceneStore.IScene = {}

    @observable
    private sceneTypeList: ISceneStore.sceneType[] = []

    @observable
    private Id: number


    @computed
    get useAppKey() {
        return this.app_key || this.sceneTarget.app_key
    }

    @computed
    get typeIsAdd() {
        return this.Id === undefined
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }
    @action
    appChange = (app_key) => {
        const tar = this.props.categoryList.find(ele => ele.app_key === app_key) || {};
        const {
            category_id,
            scene
        } = tar
        runInAction('set_scene', () => {
            this.sceneTypeList = scene
            this.app_key = app_key
        })
        this.props.form.setFieldsValue({
            category_id: category_id
        })
    }

    @action
    init = async () => {
        const { routerStore, getCategory, form } = this.props
        const routerId = routerStore.location.pathname.toString().split('/').pop()
        const Id = Number(routerId)

        let app_key = ''
        if (!isNaN(Id)) {
            this.Id = Id
            const res = await this.api.scene.getScene({ id: Id })
            app_key = res.data.app_key
            runInAction('set', () => {
                this.sceneTarget = res.data
            })
        } else {
            this.props.appKey && (app_key = this.props.appKey)
            this.Id = undefined
        }
        await getCategory()
        app_key && this.appChange(app_key)

    }

    componentWillMount() {
        this.init()


    }


    Cancel = () => {
        if (this.props.isInModal) {
            this.props.onCancel && this.props.onCancel()
        } else {
            this.props.routerStore.push('/scene')
        }
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, createScene, modifyScene, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        let data = { message: '' }
                        if (this.typeIsAdd) {
                            data = await createScene(values)
                        } else {
                            data = await modifyScene({ ...values, id: this.Id })
                        }
                        message.success(data.message)
                        if (this.props.isInModal) {
                            this.props.onSave && this.props.onSave(values);
                        } else {
                            routerStore.push('/scene')
                        }
                    } catch (err) {
                        console.log(err);
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    render() {
        const { form, categoryList, isInModal, appKey } = this.props
        const { getFieldDecorator } = form
        const {
            app_key = appKey || undefined,
            scene_name = '',
            category_id = undefined,
            status = 1,
            first_scene = [{}]
        } = this.sceneTarget
        return (
            <div className='sb-form'>
                <Form className={styles.sceneModal} {...formItemLayout}>
                    <FormItem label="Status" style={{ display: isInModal ? 'none' : 'block' }}>
                        {getFieldDecorator('status', {
                            initialValue: status,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Radio.Group>
                                {statusOption.map(c => (
                                    <Radio key={c.key} value={c.value}>
                                        {c.key}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                    </FormItem>
                    <FormItem label="Scene Name">
                        {getFieldDecorator('scene_name', {
                            initialValue: scene_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" disabled={!this.typeIsAdd} />)}
                    </FormItem>

                    {
                        (this.typeIsAdd) ? (
                            <React.Fragment>
                                <FormItem label="APP ID" className='app_id'>
                                    {getFieldDecorator('app_key', {
                                        initialValue: app_key
                                    })(
                                        <Select
                                            allowClear
                                            showSearch
                                            disabled={!!appKey}
                                            onChange={this.appChange}
                                            getPopupContainer={trigger => trigger.parentElement}
                                            filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        >
                                            {categoryList.map((c, index) => (
                                                <Select.Option value={c.app_key} key={c.app_key} >
                                                    {c.app_key_app_id}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem label="Category">
                                    {getFieldDecorator('category_id', {
                                        initialValue: category_id
                                    })(
                                        <Select
                                            allowClear
                                            disabled
                                            showSearch
                                            getPopupContainer={trigger => trigger.parentElement}
                                            filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        >
                                            {categoryList.map(c => (
                                                <Select.Option value={c.category_id} key={c.app_key_app_id} >
                                                    {c.category_name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    )}
                                </FormItem>
                            </React.Fragment>
                        ) : (
                                <React.Fragment>
                                    <FormItem label="APP ID">
                                        <Input disabled value={this.sceneTarget.app_id} />
                                    </FormItem>
                                    <FormItem label="Category">
                                        <Input disabled value={this.sceneTarget.category_name} />
                                    </FormItem>
                                </React.Fragment>
                            )
                    }



                    <FormItem label="First Scene" className={formItemClassName}>
                        {getFieldDecorator('first_scene', {
                            initialValue: first_scene,
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    validator: firstSceneValidator
                                }
                            ]
                        })(
                            <FirstScene
                                preData={{ app_key: this.useAppKey }}
                                api={this.api.util.uploadFirstSceneImage}
                                sceneTypeList={this.sceneTypeList} />
                        )}
                    </FormItem>

                    <FormItem className={styles.btnBox}>
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                        <Button className={styles.btn2} onClick={() => this.Cancel()}>Cancel</Button>
                    </FormItem>
                </Form>

            </div>
        )
    }
}

export default Form.create<IProps>()(SceneModal)
