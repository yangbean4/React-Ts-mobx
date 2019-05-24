import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Button, Modal, Tree } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import Icon from '@components/Icon'
import AddChoseSelect from './addChoseSelect'
const FormItem = Form.Item
const { TreeNode } = Tree
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
    lg: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
    lg: { span: 18 }
  }
}

interface IStoreProps {
  fullTemplate?: () => Promise<any>
  getSidebar?: () => Promise<any>
  templateTree?: ICustomStore.ICustomTree[]
}
interface IProps extends IStoreProps {
  visible: boolean
  onCancel: () => void
  onOK?: (data?) => void
  select?: {
    template_pid?: number
    templateId?: number
  }
}
@inject(
  (store: IStore): IStoreProps => {
    const { customStore, authStore } = store
    const { getSidebar } = authStore
    const { templateTree, fullTemplate, } = customStore
    return { templateTree, fullTemplate, getSidebar }
  }
)

@observer
class TemplateModal extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  private checkedKeys: string[]

  private showErrMsg: boolean = false

  @observable
  private modalVisible: boolean = false

  @action
  toggleModalVisible = () => {
    this.modalVisible = !this.modalVisible
  }

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  @action
  toggleMsgShow = () => {
    this.showErrMsg = !this.showErrMsg
  }
  componentWillMount() {
    this.props.fullTemplate()
  }

  submit = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }

    if (this.checkedKeys.length === 1) {
      const arr = this.checkedKeys[0].split('.')
      this.props.onOK({
        template_pid: Number(arr[0]),
        templateId: Number(arr[1])
      })
      this.onCancel()
    } else {
      this.toggleMsgShow()
    }
  }

  onCancel = () => {
    this.props.onCancel()
    this.props.form.resetFields()
  }

  renderTreeNodes = (data: ICustomStore.ICustomTree[]) => data.map((item) => {
    const name = item.template_name || item.primary_name;
    if (item.children) {
      return (
        <TreeNode title={name} key={`${item.pid}.${item.id}`} value={`${item.pid}.${item.id}`} disableCheckbox={item.pid === undefined}>
          {this.renderTreeNodes(item.children)}
        </TreeNode>
      );
    }
    return <TreeNode title={name} key={`${item.pid}.${item.id}`} value={`${item.pid}.${item.id}`} disableCheckbox={item.pid === undefined} />
  })
  getTrueKey = () => {
    const { templateId = undefined, template_pid = undefined } = this.props.select || {}
    return template_pid !== undefined && templateId !== undefined ? [`${template_pid}.${templateId}`] : []
  }

  onCheck = (checkedKeys) => {
    this.checkedKeys = checkedKeys
  }
  addTemplate = () => {
    this.toggleModalVisible()
  }

  addModelCancel = () => {
    this.onCancel()
    this.toggleModalVisible()
  }
  render() {
    const { form, visible, onCancel, templateTree } = this.props

    return (

      <React.Fragment>
        <Modal
          title='Value'
          visible={visible}
          onOk={this.submit}
          onCancel={this.onCancel}
          destroyOnClose={true}
          footer={[
            <Button key='cancel' loading={this.loading} onClick={onCancel} >Cancel</Button>,
            <Button key='submit' type="primary" loading={this.loading} onClick={this.submit} >Submit</Button>
          ]}
        >
          <Form {...formItemLayout}>
            <FormItem className={styles.tree} label='Template'>
              {
                templateTree.length ?
                  <Tree
                    checkable
                    defaultExpandAll
                    defaultCheckedKeys={this.getTrueKey()}
                    onCheck={this.onCheck}
                  >{this.renderTreeNodes(templateTree)}</Tree> : null
              }
            </FormItem>

            <FormItem label='' className={styles.xia}>
              {this.showErrMsg ? <p className={styles.errmsg}>One must be chosen.</p> : null}
              <Button key='submit' type="primary" onClick={this.addTemplate} >
                <Icon type='icontianjia3' />
                Add Template</Button>
            </FormItem>
          </Form>

        </Modal>
        <AddChoseSelect
          visible={this.modalVisible}
          onCancel={this.addModelCancel}
          onOK={this.props.onOK}
        />
      </React.Fragment>
    )
  }
}

export default Form.create<IProps>()(TemplateModal)
