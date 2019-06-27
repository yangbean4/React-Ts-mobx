import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Button, message, Upload, Icon as AntIcon, Popover, Col, Radio, Select } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import EmojiPicker from '@components/Emoji'
import * as web from '../web.config'
import { typeOf, testSize } from '@utils/index'
import UploadFile, { UploadFileProps, FileWHT } from '@components/UploadFile'

// 封装表单域组件
const FormItem = Form.Item

// 获取光标位置
function getCursortPosition(textDom) {
    var cursorPos = 0;
    window.getSelection().getRangeAt(0)
    return cursorPos;
}

function insertAfterText(textDom: HTMLElement, value, startPos) {
    return textDom.innerHTML.substring(0, startPos) + value + textDom.innerHTML.substring(startPos, textDom.innerHTML.length);
}




const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        lg: { span: 6 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 15 },
        lg: { span: 6 }
    }
}
const formItemLayoutForModel = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
        lg: { span: 10 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 },
        lg: { span: 13 }
    }
}

interface hasResult {
    result?: string
}

interface FileWHT {
    width?: number
    height?: number
    isScale?: boolean
    time?: number
    minW_H?: number
    maxW_H?: number
    size?: number
}

interface IStoreProps {
    comment?: ICommentStore.IComment
    createComment?: (company: ICommentStore.IComment) => Promise<any>
    modifyComment?: (company: ICommentStore.IComment) => Promise<any>
    getOptionListDb?: ({ }) => Promise<any>
    changepage?: (page: number) => void
    routerStore?: RouterStore
    clearComment?: () => void,
    setBreadcrumbArr?: (menus?: IGlobalStore.menu[]) => void
}

interface IProps extends IStoreProps {
    type?: string
    onOk?: (id: string) => void
    onCancel?: () => void
}

@inject(
    (store: IStore): IProps => {
        const { commentStore, routerStore, globalStore } = store
        const { setBreadcrumbArr } = globalStore
        const { comment, createComment, modifyComment, clearComment } = commentStore
        return { clearComment, comment, routerStore, createComment, modifyComment, setBreadcrumbArr }
    }
)
@observer
class CommentModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private emoji: boolean = false

    @observable
    private mousePositon: number = 0

    @observable
    private head_portrait: string

    @observable
    private langauge: string[] = []



    private myRef = React.createRef()

    @computed
    get formItemLayout() {
        return this.props.type ? formItemLayoutForModel : formItemLayout
    }

    @computed
    get isAdd() {
        return !this.props.comment
    }

    @computed
    get buttonModalLayout() {
        return this.props.type ? 'btnBox' : ''
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    @action
    showEmojiPicker = () => {
        // this.emoji = !this.emoji
        // this.mousePositon = getCursortPosition(this.myRef.current)
    }

    @action
    removeFile = () => {
        runInAction('SET_URL', () => {
            this.head_portrait = ''
        })
        this.props.form.setFieldsValue({
            head_portrait: ''
        })
    }

    @action
    languageChange = (language) => {
        this.props.form.setFieldsValue({
            language: `${language}`
        })
    }

    @action
    getLanaugeDetail = async () => {
        const res = await this.api.endcard.getlanguage()
        runInAction('SET_LANGAUE', () => {
            this.langauge = res.data
        })
    }

    @action
    resetBread = (comment: ICommentStore.IComment) => {
        let arr = [
            {
                title: 'Comment Tempaltes',
                path: "/comments/template"
            }
        ] as IGlobalStore.menu[]
        arr.push({
            title: comment.id ? `Edit ${comment.com_name}` : ''
        })
        setImmediate(() => {
            this.props.setBreadcrumbArr(arr)
        })
    }

    componentWillMount() {
        const { routerStore, comment = {} } = this.props
        const routerId = routerStore.location.pathname.toString().split('/').pop()
        const Id = Number(routerId)
        if ((!isNaN(Id) && (!comment.id || comment.id !== Id)) && !this.props.type) {
            routerStore.push('/comments/template')
        }
        if (Id) {
            this.resetBread(comment)
        }
        this.getLanaugeDetail()
    }
    componentWillUnmount() {
        this.props.clearComment()
        this.props.setBreadcrumbArr()
    }


    checkImageWH = (file) => {
        const WHS = { width: 80, height: 80, size: 30 }
        const { width, height, size } = WHS
        const isLt2M = file.size / 1024 < WHS.size ? true : false
        if (!isLt2M) {
            const msg = `${size}kb`
            message.error(`Failure，The file size cannot exceed ${msg}!`)
            return Promise.reject()
        } else {
            return testSize(file, WHS, 'img').catch(() => {
                const msg = `Please upload Image at ${width}*${height}px`
                message.error(msg);
                return Promise.reject()
            })
        }

    }

    actionUpload = async (data) => {
        const formData = new FormData()
        formData.append('file', data.file)
        await this.api.appGroup.uploadIcon(formData).then(res => {
            const head_portrait = res.data.url
            this.props.form.setFieldsValue({
                head_portrait: head_portrait
            })
            const fileRender = new FileReader()
            fileRender.onload = (ev) => {
                const target = ev.target as hasResult
                runInAction('SET_URL', () => {
                    this.head_portrait = target.result;
                })
            }
            fileRender.readAsDataURL(data.file)
        }, this.removeFile).catch(this.removeFile)
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, comment, createComment, modifyComment, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        let res = {
                            message: '',
                        }
                        if (this.isAdd) {
                            res = await createComment(values)
                        } else {
                            res = await modifyComment({ ...values })
                        }
                        message.success(res.message)
                        // if (this.props.type) {
                        //     this.props.onOk(res.data.id)
                        //     this.props.form.resetFields()
                        // } else {
                        // }

                        routerStore.push('/comments/template')
                    } catch (err) {
                        console.log(err);
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    selectEmoji = (emoji) => {
        const current = this.myRef.current as HTMLElement
        // const innerHTML = current.innerHTML + emoji
        console.log(this.mousePositon)
        const innerHTML = insertAfterText(current, emoji, this.mousePositon)
        current.innerHTML = innerHTML
        this.props.form.setFieldsValue({
            com_talk: innerHTML
        })
    }

    @action
    setMousePosition = () => {
        this.mousePositon = window.getSelection().focusOffset
    }

    setCom_talk = (e) => {
        this.setMousePosition()
        this.props.form.setFieldsValue({
            com_talk: e.target.innerHTML
        })
    }

    componentDidMount() {
        const current = this.myRef.current as HTMLElement
        current.innerHTML = this.props.comment ? this.props.comment.com_talk : ''
    }

    render() {
        const uploadConfig = {
            showUploadList: false,
            accept: ".png, .jpg, .jpeg, .gif",
            name: 'file',
            beforeUpload: this.checkImageWH,
            customRequest: this.actionUpload
        }
        const { comment, form } = this.props
        const { getFieldDecorator } = form
        const {
            id = '',
            status = 1,
            language = '',
            head_portrait = '',
            com_name = '',
            com_talk = ''
        } = comment || {}
        return (
            <div className='sb-form'>
                <Form className={styles.CompanyModal} {...this.formItemLayout} style={{ paddingLeft: 0 }}>
                    {!this.isAdd && <FormItem label="ID"  >
                        {getFieldDecorator('id', {
                            initialValue: id,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" disabled={!this.isAdd} />)}
                    </FormItem>
                    }
                    <FormItem label="Status"  >
                        {getFieldDecorator('status', {
                            initialValue: status,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Radio.Group>
                                {web.statusOption.map(c => (
                                    <Radio key={c.key} value={c.value}>
                                        {c.key}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                    </FormItem>
                    <FormItem label="Comment Language" >
                        {getFieldDecorator('language', {
                            initialValue: language,
                            rules: [{
                                required: true, message: "Required"
                            }
                            ]
                        })(
                            <Select
                                showSearch
                                onChange={this.languageChange}
                                disabled={!this.isAdd}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {
                                    this.langauge && this.langauge.map((c, index) => (
                                        <Select.Option key={index} value={c}>
                                            {c}
                                        </Select.Option>
                                    ))
                                }
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="Head Portrait" className={styles.ccc}>
                        {getFieldDecorator('head_portrait', {
                            initialValue: head_portrait,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ],
                        })(
                            // <Upload {...uploadConfig}>
                            //     {this.head_portrait || head_portrait ? <img width="80" height="80" src={this.head_portrait || head_portrait} alt="avatar" /> : <AntIcon className={styles.workPlus} type='plus' />}
                            // </Upload>
                            <UploadFile
                                className={styles.imgbox}
                                api={this.api.appGroup.uploadIcon}
                                wht={{ width: 80, height: 80, size: 30 }}
                            >
                                {/* <div className={styles.full}></div> */}
                                {/* <AntIcon type='plus' /> */}
                                <AntIcon className={styles.workPlus} type="plus" />
                            </UploadFile>
                        )
                        }
                    </FormItem>
                    <FormItem label="Comment Name" >
                        {getFieldDecorator('com_name', {
                            initialValue: com_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ],
                            validateTrigger: 'onBlur'
                        })(<Input autoComplete="off" />)}
                    </FormItem>
                    <FormItem label="Comment Talk" >
                        {getFieldDecorator('com_talk', {
                            initialValue: com_talk,
                            rules: [
                                {
                                    required: true, message: 'required'
                                },
                            ],
                        })(
                            <div>
                                <Popover
                                    content={<EmojiPicker
                                        selectEmoji={this.selectEmoji}
                                    ></EmojiPicker>}
                                    trigger="click"
                                    placement="top">
                                    <AntIcon className={styles.workPlus} onClick={this.showEmojiPicker} type="plus" />
                                </Popover>
                                <div>
                                    <div ref={this.myRef} onClick={this.setMousePosition} className={styles.textBox} onInput={this.setCom_talk} contentEditable={true}></div>
                                    <Popover content={(<p>At least 80 characters.</p>)}>
                                        <AntIcon className={styles.workBtn} type="question-circle" />
                                    </Popover>
                                </div>

                            </div>
                        )}
                    </FormItem>
                    <FormItem className={this.props.type ? styles.modalBtn : styles.btnBox} >
                        <Button className={this.props.type ? styles.btn : ''} type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                    </FormItem>
                </Form>

            </div>
        )
    }
}

export default Form.create<IProps>()(CommentModal)
