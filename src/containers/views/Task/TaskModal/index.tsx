import * as React from 'react'
import Loadable from 'react-loadable'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import { Form, Input, Select, DatePicker, Button, message, InputNumber, Icon, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import PageLoading from '@components/PageLoading'
import moment from 'moment'
import * as styles from './index.scss'
import * as taskStyles from '../index.scss'

const SceneModal = Loadable({
    loader: () => import(/* webpackChunkName: "UserModal" */ '@views/Scene/SceneModal'),
    loading: PageLoading
})

const FormItem = Form.Item
const { RangePicker } = DatePicker
const { TextArea } = Input
const dateFormat = 'YYYYMMDD'

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
    task?: ITaskStore.ITask
    createTask?: (user: ITaskStore.ITask) => Promise<any>
    getOptionListDb?: () => void
    optionListDb?: ITaskStore.OptionListDb

    modifyUser?: (user: IUserStore.IUser) => Promise<any>
    changepage?: (page: number) => void
    routerStore?: RouterStore
    clearUser?: () => void
}

@inject(
    (store: IStore): IProps => {
        const { taskStore, routerStore } = store
        const { task, createTask, getOptionListDb, optionListDb } = taskStore
        return { routerStore, task, createTask, getOptionListDb, optionListDb }
    }
)
@observer
class TaskModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private selectIgePkgname = [];

    @observable
    private sceneList = [];

    @observable
    private pkgNameList = [];

    @observable
    private videosNum: number = null;

    @observable
    private addSceneModalVisible: boolean = false;

    @observable
    private addSceneModalAppKey: string = '';

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    /**
     * 选择ige pkgname 设置appid选项
     */
    @action
    changeIgePkgname = (value: string) => {
        this.selectIgePkgname = this.props.optionListDb.IgePkgname[value];
        debugger
        console.log(this.selectIgePkgname)
        this.props.form.setFieldsValue({
            app_id: '',
            pkg_name: '',
            scene_id: ''
        })
        this.pkgNameList = [];
        this.sceneList = [];
    }

    /**
     * 通过appid 获取ccene列表
     */
    @action
    getSceneList = async (app_key: string) => {
        const res = await this.api.scene.categoryAppId()
        console.log(res)

        let tem = res.data;
        tem = tem.find(n => n.app_key === app_key);
        runInAction('SET_SCENELIST', () => {
            this.sceneList = tem.scene || [];
            console.log(this.sceneList)
        })
    }

    @action
    getPkgnameList = async (appid: string) => {
        const res = await this.api.task.getPkgNameList({
            app_id: appid
        })
        runInAction('SET_PKGNAMELIST', () => {
            this.pkgNameList = res.data
        })
    }

    /**
     * 弹窗中添加scene成功
     */
    addSceneDone = (scene: ISceneStore.IScene) => {
        const appId = this.props.form.getFieldValue('app_id')
        this.getSceneList(appId)
        this.toggleSceneModal();
    }

    @action
    toggleSceneModal = () => {
        this.addSceneModalVisible = !this.addSceneModalVisible;
    }

    /**
     * appid变更后获取有关数据
     */
    @action
    changeAppid = (app_key: string) => {
        // this.props.optionListDb.IgePkgname;
        debugger
        // const temp = JSON.parse(JSON.stringify(this.props.optionListDb));
        // console.log(temp)
        const o = this.selectIgePkgname.find(v => v.app_key == app_key) || {};
        this.sceneList = o.scene;
        Promise.all([
            // this.getSceneList(app_key),
            this.getPkgnameList(app_key)
        ]);
        this.addSceneModalAppKey = app_key;
        this.props.form.setFieldsValue({
            pkg_name: '',
            scene_id: ''
        })
    }

    @action
    getDemoNum = () => {
        const { validateFields } = this.props.form;
        const keys = ['app_id', 'geo', 'date', 'pkg_name'];
        validateFields(keys, async (err, values) => {
            if (err) return;

            let res = await this.api.task.getDemoNum({
                app_id: values.app_id,
                geo: values.geo,
                pkg_name: values.pkg_name,
                report_date: values.date.map(m => m.format(dateFormat)).join(',')
            });

            runInAction('SET_VIDEO_NUM', () => {
                this.videosNum = res.data
            })
        })
    }

    /**
     * 默认时间戳
     */
    defaultDateValue = () => {
        let d = new Date(new Date().setDate(new Date().getDate() - 1))
        return [d, d].map(val => moment(val, dateFormat))
    }


    Cancel = () => {
        this.props.routerStore.push('/task')
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, createTask, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                console.log(values)
                if (!err) {
                    this.toggleLoading()
                    try {
                        let data = { message: '' }
                        values.date = values.date.map(m => m.format('YYYY-MM-DD')).join(' - ');
                        console.log(values.date);
                        data = await createTask(values)
                        message.success(data.message)
                        routerStore.push('/task')
                    } catch (err) {
                        console.error(err);
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    componentWillMount() {
        this.props.getOptionListDb();
    }

    render() {
        const { task, form, optionListDb } = this.props
        const { getFieldDecorator } = form
        // debugger
        return (
            <div className='sb-form'>
                <Form className={styles.taskModal} >
                    <FormItem {...formItemLayout} label="Task Name">
                        {getFieldDecorator('task_name', {
                            initialValue: task.task_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="IGE Pkgname">
                        {getFieldDecorator('ige_pkgname', {
                            initialValue: task.ige_pkgname,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select
                                allowClear
                                showSearch
                                getPopupContainer={trigger => trigger.parentElement}
                                onChange={this.changeIgePkgname}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {Object.keys(optionListDb.IgePkgname).map(c => (
                                    <Select.Option key={c} value={c}>
                                        {c}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="APP ID">
                        {getFieldDecorator('app_key', {
                            initialValue: task.app_id,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select
                                allowClear
                                showSearch
                                onChange={this.changeAppid}
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.selectIgePkgname.map(c => (
                                    <Select.Option key={c.app_key} value={c.app_key}>
                                        {c.t}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="GEO">
                        {getFieldDecorator('geo', {
                            initialValue: task.geo,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select
                                allowClear
                                showSearch
                                getPopupContainer={trigger => trigger.parentElement}
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
                    <FormItem {...formItemLayout} label="Scene">
                        {getFieldDecorator('scene_id', {
                            initialValue: task.scene_id,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select
                                allowClear
                                showSearch
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.sceneList.map(c => (
                                    <Select.Option key={c.id} value={c.id}>
                                        {c.id_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                        <button
                            className={taskStyles.linkBtn}
                            onClick={this.toggleSceneModal}
                            style={{ display: this.addSceneModalAppKey ? 'inline' : 'none' }}
                        >
                            <Icon type="plus-circle" />
                        </button>
                    </FormItem>
                    <FormItem {...formItemLayout} label="Date">
                        {getFieldDecorator('date', {
                            initialValue: this.defaultDateValue(),
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <RangePicker format={dateFormat} />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="Pkgname">
                        {getFieldDecorator('pkg_name', {
                            initialValue: task.pkg_name,
                        })(
                            <Select
                                allowClear
                                showSearch
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.pkgNameList.map(c => (
                                    <Select.Option key={c} value={c}>
                                        {c}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="Priority">
                        {getFieldDecorator('priority', {
                            initialValue: 100,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <InputNumber max={100} min={1} />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="Remark">
                        {getFieldDecorator('remark', {
                            initialValue: task.remark,
                        })(
                            <TextArea autosize={{ minRows: 3 }} />
                        )}
                    </FormItem>
                    <FormItem className={styles.btnBox}>
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                        <Button className={styles.btn2} onClick={() => this.Cancel()}>Cancel</Button>
                        <Button type="primary" ghost className={styles.btn2} onClick={() => this.getDemoNum()}>query</Button>
                        {
                            this.videosNum !== null ? (
                                <span className={styles.videoMsg}>{this.videosNum} videos</span>
                            ) : undefined
                        }
                    </FormItem>
                </Form>

                <Modal
                    title="Add Scene"
                    visible={this.addSceneModalVisible}
                    width="70%"
                    footer={null}
                    onCancel={this.toggleSceneModal}
                    destroyOnClose
                >
                    <SceneModal
                        isInModal={true}
                        appKey={this.addSceneModalAppKey}
                        onSave={this.addSceneDone}
                        onCancel={this.toggleSceneModal}
                    />
                </Modal>
            </div>
        )
    }
}

export default Form.create<IProps>()(TaskModal)
