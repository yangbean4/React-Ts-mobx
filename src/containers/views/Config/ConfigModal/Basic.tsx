import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import ConfigItem from './configItem'
import { conItem } from './type'
import AddConfigItem from './addConfigItem'
import { camelCase, getEventTargetDom, getGuId, typeOf, _nameCase } from '@utils/index'
import ChoseSelectModal from './choseSelectModal/index'
import EditRedioModal from './editRedioModal/index'

const FormItem = Form.Item

const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18
  }
}

interface IStoreProps {
  targetConfig?: IConfigStore.IConfigTarget
  getTemplateSelect?: (pid: number, useCache?: boolean) => Promise<any>
}

interface IProps extends IStoreProps {
  onCancel: () => void
  onSubmit: (data) => void
  editData: any
  addList: conItem[]
}
@inject(
  (store: IStore): IStoreProps => {
    const { configStore, templateStore } = store
    const { targetConfig } = configStore
    const { getTemplateSelect } = templateStore
    return { targetConfig, getTemplateSelect }
  }
)


@observer
class Basic extends ComponentExt<IProps & FormComponentProps> {

  @observable
  private loading: boolean = false

  @observable
  private showWork: boolean = false
  @observable
  private thisConfigList: conItem[]

  private nowHandelConfig: conItem = {}

  private nowHandelConfigIndex: number

  private editRedioModaType: number = 0

  private waitItemNum = 0


  @computed
  get usEeditData() {
    if (typeOf(this.props.editData) === 'array') {
      let target = {}
      this.props.editData.forEach(ele => {
        const tar = {}
        Object.entries(ele).forEach(([key, value]) => {
          tar[key.toLowerCase()] = value
        })
        target = { ...target, ...tar }
      })
      return target
    } else {
      return this.props.editData
    }
  }

  @observable
  private modalVisible: boolean = false


  @observable
  private redioVisible: boolean = false

  @action
  toggleLoading = (type?) => {
    this.loading = type ? type : !this.loading
  }
  @action
  choseSelectModalSwitch = () => {
    this.modalVisible = !this.modalVisible
  }

  @action
  editRedioModalSwitch = () => {
    this.redioVisible = !this.redioVisible
  }

  @action
  toggleWork = () => {
    if (this.showWork) {
      const arr: conItem[] = JSON.parse(JSON.stringify(this.useConfigList)).filter(ele => !ele.isEdit)
      runInAction('UP_THIS_CONFIG_LIST', () => {
        this.thisConfigList = arr
      })
    }
    runInAction('CHANGE_WORK_BTN', () => {
      this.showWork = !this.showWork
    })
  }

  @computed
  get editDataSortTarget() {
    const targrt = {}
    if (typeOf(this.props.editData) === 'array') {
      const length = this.props.editData.length;
      this.props.editData.forEach((ele, index) => {
        const key = Object.keys(ele)[0]
        targrt[key] = length - index
      })
    }
    return targrt
  }

  @computed
  get configList(): conItem[] {
    const platform = (this.props.targetConfig || {}).platform === 'android' ? 2 : 1
    return (JSON.parse(JSON.stringify(this.props.addList)) || [])
      .filter(ele => ele.platform != platform)
      .slice().sort((a, b) => a.sort - b.sort)
      .slice().sort((a, b) => this.editDataSortTarget[b.key] - this.editDataSortTarget[a.key])
  }

  @computed
  get useConfigList(): conItem[] {
    return this.thisConfigList || this.configList
  }

  submit = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }
    const waitItemNum = this.useConfigList.filter(ele => ele.isEdit).length
    this.waitItemNum = waitItemNum
    this.toggleLoading(true)
    const { onSubmit, form } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        if (!err) {
          if (waitItemNum) {
            console.log(waitItemNum);
          } else {
            try {

              const dataArr = this.useConfigList.map(ele => {
                const key = _nameCase(ele.key)
                const value = values[ele.key];

                let tt = { [key]: value }
                // 处理后端返回的默认值在直接保存时有坑的问题
                if (ele.value_type === '4') {
                  let vv;
                  if (Array.isArray(value)) {
                    vv = value.filter(mn => !!mn)
                  } else {
                    try {
                      const v = JSON.parse(value)
                      vv = Array.isArray(v) ? v : [v || '']
                    } catch (error) {
                      vv = [value || '']
                    }
                  }
                  tt = { [key]: vv }
                }

                // 说明是新增加的
                // if (!this.usEeditData.hasOwnProperty(key)) {
                if (ele.addId || !this.usEeditData.hasOwnProperty(key)) {
                  const mm = { ...ele, key, value: value || ele.default }
                  delete mm.addId
                  delete mm.isEdit
                  tt = {
                    [key]: mm
                  }
                }
                return tt
              })
              console.log(dataArr)
              onSubmit(dataArr)
            } catch (error) {
              console.log(error)
            }
            this.toggleLoading(false)

          }

        } else {
          this.toggleLoading(false)
        }

      }
    )
  }

  handelAction = (type: string, index: number, config?: conItem) => {
    switch (type) {
      case 'down': {
        if (index !== this.useConfigList.length) {
          this.handelUpdateList(index, index + 1)
        }
        break
      }
      case 'up': {
        if (index !== this.useConfigList.length) {
          this.handelUpdateList(index, index - 1)
        }
        break
      }
      case 'copy': {
        const id = getGuId()
        const { value_type, unit } = config
        const addItem = {
          value_type: value_type,
          key: undefined,
          unit,
          id: undefined,
          default: undefined,
          addId: id,
          isEdit: true
        }
        this.handelUpdateList(index + 1, undefined, addItem)
        break
      }
      case 'acc': {
        this.handelUpdateList(index)
        break
      }
      case 'add': {
        const id = getGuId()
        const addItem = {
          value_type: undefined,
          key: undefined,
          unit: undefined,
          id: undefined,
          default: undefined,
          addId: id,
          isEdit: true
        }
        this.handelUpdateList(index + 1, undefined, addItem)
        break
      }
    }
  }

  @action
  addConfigItem = (config?: conItem) => {
    if (config) {
      const index = this.useConfigList.findIndex(ele => ele.addId === config.addId);
      const arr: conItem[] = JSON.parse(JSON.stringify(this.useConfigList))
      arr[index] = {
        ...arr[index],
        ...config,
        isEdit: false
      }
      runInAction('UP_THIS_CONFIG_LIST', () => {
        this.thisConfigList = arr
      })

      if (this.loading) {
        // 是本组件触发的自组件提交
        if (! --this.waitItemNum) {
          this.submit()
        }
      }
    } else {
      this.waitItemNum = 0
      // addConfigItem组件提交过程中出问题了 结束提交过程
      this.toggleLoading(false)
    }
  }

  addDragEvent = () => {
    let dragged

    document.addEventListener('dragstart', (event) => {
      // 保存拖动元素的引用(ref.)
      dragged = event.target
      // 使其半透明
      event.target.style.opacity = .5
    }, false)

    document.addEventListener('dragend', (event) => {
      // 重置透明度
      event.target.style.opacity = ''
    }, false)

    /* 放下目标节点时触发事件 */
    document.addEventListener('dragover', (event) => {
      // 阻止默认动作
      event.preventDefault()
    }, false)


    document.addEventListener('dragleave', (event) => {
      // 当拖动元素离开可放置目标节点，重置其背景
      if (event.target.className === 'dropZone') {
        event.target.style.background = ''
      }
    }, false)

    document.addEventListener('drop', (event) => {
      // 阻止默认动作（如打开一些元素的链接）
      event.preventDefault();
      // 移动拖动的元素到所选择的放置目标节点
      const tar = getEventTargetDom(event, 'itemBox')
      if (tar) {
        const tarIndex = tar.getAttribute('data-index')
        const fromIndex = dragged.getAttribute('data-index')
        if (tarIndex !== fromIndex) {
          this.handelUpdateList(fromIndex, tarIndex)
        } else {
          dragged.style.opacity = ''
        }
      }
    }, false)
  }

  /**
   * 只有fromIndex 时删除
   */
  @action
  handelUpdateList = (fromIndex: number, tarIndex?: number, addCon?: conItem) => {
    const arr: conItem[] = JSON.parse(JSON.stringify(this.useConfigList))
    if (addCon !== undefined) {
      arr.splice(fromIndex, 0, addCon)
    } else {
      const tar = arr.splice(fromIndex, 1)
      if (tarIndex !== undefined) {
        arr.splice(tarIndex, 0, tar[0])
      }
    }

    runInAction('UP_THIS_CONFIG_LIST', () => {
      this.thisConfigList = arr
    })
  }

  componentDidMount() {
    this.addDragEvent()
  }

  changeTemp = (index, con) => {
    this.nowHandelConfigIndex = index
    this.nowHandelConfig = con
    this.choseSelectModalSwitch()
  }

  choseSelect = (con: conItem) => {
    this.nowHandelConfig = con
    // this.choseSelectModalSwitch()
    this.editRedioModaType = 0
    this.editRedioModalSwitch()
  }

  setChoseSelect = (data) => {
    // runInAction('SET_OPTION', () => {
    //   this.nowHandelConfig.template_pid = data.template_pid,
    //     this.nowHandelConfig.templateId = data.templateId
    // })
    this.props.getTemplateSelect(data.template_pid, true)
    // TODO:!!!!!!!
    const arr: conItem[] = JSON.parse(JSON.stringify(this.useConfigList))
    arr[this.nowHandelConfigIndex] = {
      ...arr[this.nowHandelConfigIndex],
      ...this.nowHandelConfig,
      template_pid: data.template_pid,
      value: data.templateId
    }
    // 设置form 对应字段的值
    const form = this.props.form;
    const key = this.nowHandelConfig.key
    form.setFieldsValue({
      [key]: data.templateId,
    });
    runInAction('UP_THIS_CONFIG_LIST', () => {
      this.thisConfigList = arr
    })
  }

  editRadio = (con: conItem) => {
    this.nowHandelConfig = con
    this.editRedioModaType = 1
    this.editRedioModalSwitch()
  }
  setEditRedio = (data) => {
    let option = data.option;
    let def = data.default
    // if (this.editRedioModaType === 0) {
    //   option = data.option.split(',').map((ele, index) => {
    //     return {
    //       label: ele,
    //       value: index,
    //     }
    //   })
    // }
    runInAction('SET_OPTION', () => {
      this.nowHandelConfig.option = option
      this.nowHandelConfig.default = def
    })
  }


  render() {
    const { form } = this.props
    const { getFieldDecorator } = form
    const { template_pid = undefined, templateId = undefined, option = '' } = this.nowHandelConfig || {}
    return (
      <div className='Basic'>
        <Form className="dropZone" {...layout} onSubmit={this.submit}>
          {
            this.useConfigList.map((item, index) => (
              !item.isEdit ? <div key={item.key + index} draggable={this.showWork} className="itemBox" data-index={index}>
                <FormItem className={this.showWork ? 'hasWork work' : 'noWork work'} key={item.key + index} label={camelCase(item.key)}>
                  {getFieldDecorator(item.key, {
                    initialValue: this.usEeditData[item.key.toLowerCase()] || item.default,
                    rules: [
                      {
                        required: true, message: "Required"
                      }
                    ]
                  })(
                    <ConfigItem
                      dataIndex={index}
                      handel={this.handelAction}
                      showWork={this.showWork}
                      changeTemp={this.changeTemp}
                      config={item} />
                  )}
                </FormItem>
              </div>
                : <AddConfigItem shouldSubmit={this.loading} choseSelect={this.choseSelect} editRadio={this.editRadio} key={item.addId} config={item} onOk={this.addConfigItem} />
            ))
          }

          <Button type="primary" loading={this.loading} className='submitBtn' htmlType="submit">Submit</Button>
          <Button className='cancelBtn' onClick={this.props.onCancel}>Cancel</Button>
        </Form>
        <Button className="workBtn" type="primary" onClick={this.toggleWork}>{this.showWork ? 'Cancel' : 'Edit Filed'}</Button>
        <ChoseSelectModal
          visible={this.modalVisible}
          onCancel={this.choseSelectModalSwitch}
          onOK={this.setChoseSelect}
          select={{ template_pid, templateId }}
        />

        {
          this.redioVisible ? <EditRedioModal
            visible={this.redioVisible}
            onCancel={this.editRedioModalSwitch}
            onOK={this.setEditRedio}
            type={this.editRedioModaType}
            option={option}
          /> : null
        }
      </div>

    )
  }
}

export default Form.create<IProps>()(Basic)
