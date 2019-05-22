import React from 'react'
import { observer, inject } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Button, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import ConfigItem from './configItem'
import { conItem, conItemTree } from './type'
import AddConfigItem from './addConfigItem'
import { camelCase, getEventTargetDom, getGuId, typeOf, _nameCase } from '@utils/index'
import ChoseSelectModal from './choseSelectModal/index'
import EditRedioModal from './editRedioModal/index'

const isLikeArray = (res: object) => {
  return res && Object.keys(res).every(key => !isNaN(Number(key)))
}

const likeArray2obj = (res) => {
  let arr = {}
  Object.keys(res).forEach(ele => {
    arr = Object.assign(arr, res[ele])
  })
  return arr
}

const objCaseName = (res) => {
  let arr = {}
  Object.keys(res).forEach(ele => {
    arr[_nameCase(ele)] = res[ele]
  })
  return arr

}

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
  onCancel: (data?) => void
  onSubmit: (data) => void
  editData: any
  addList: conItemTree,
  type?: string
  activeKey?: string
  shouldSave?: boolean
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

  private confirmModal

  @observable
  private thisConfigList: conItemTree

  private nowHandelConfig: conItem = {}

  private nowHandelConfigIndexPath: string

  private editRedioModaType: number = 0

  private waitItemNum = 0

  @observable
  private modalVisible: boolean = false

  @observable
  private redioVisible: boolean = false

  private fromUseList = (() => {
    let last_id = 0
    const getData = (arr, values) => arr.map((ele, index, array) => {
      const { key, value_type, addId, children } = ele
      let value = values[key];
      value = value_type === '8' && children ? getData(children, value) : value
      let tt = { [key]: value }
      last_id = index === 0 ? 0 : array[index].id || last_id
      // 处理后端返回的默认值在直接保存时有坑的问题
      if (value_type === '4') {
        let vv;
        if (Array.isArray(value)) {
          vv = value.map(v => v.toString()).filter(mn => !!mn)
        } else {
          try {
            const v = JSON.parse(value)
            vv = Array.isArray(v) ? v : [v || '']
          } catch (error) {
            vv = [value || '']
          }
        }
        vv = vv.length ? vv : ['']
        tt = { [key]: vv }
      }
      // 说明是新增加的
      // if (!this.useEditData.hasOwnProperty(key)) {
      if (addId && !children) {
        const mm = { ...ele, key, value: value || ele.default, last_id }
        delete mm.addId
        delete mm.isEdit
        tt = mm
      }
      return tt
    })
    return getData;
  })()

  @action
  toggleLoading = (type?) => {
    const loading = type === undefined ? type : !this.loading
    if (this.loading !== loading) {
      this.loading = loading
    }
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
      const arr: conItemTree = JSON.parse(JSON.stringify(this.useConfigList)).filter(ele => !ele.isEdit)
      runInAction('UP_THIS_CONFIG_LIST', () => {
        this.thisConfigList = arr
      })
    }
    runInAction('CHANGE_WORK_BTN', () => {
      this.showWork = !this.showWork
    })
  }

  @computed
  get useEditData() {
    let editData = this.props.editData || {}
    if (typeOf(editData) === 'array') {
      editData = { ...editData }
    }
    if (isLikeArray(editData)) {
      editData = likeArray2obj(editData)
    }
    return objCaseName(editData)
  }
  @computed
  get useEditDataKeySet() {
    return new Set(this.useConfigList.map(ele => ele.key))
  }
  @computed
  get haveUseEditData() {
    return !!Object.keys(this.useEditData).length
  }

  @computed
  get editDataSortTarget() {
    const target = {}
    const editData = this.props.editData
    if (typeOf(editData) === 'array') {
      const length = editData.length;
      editData.forEach((ele, index) => {
        const key = Object.keys(ele)[0]
        target[_nameCase(key)] = length - index
      })
    }

    if (isLikeArray(editData)) {
      const keys = Object.keys(editData).map(key => Number(key))
      const length = Math.max.apply(null, keys)

      keys.forEach(index => {
        const key = Object.keys(editData[index])[0]
        target[_nameCase(key)] = length - index
      })

    }
    return Object.keys(target).length ? target : editData || {}

  }

  @computed
  get fmtConfigList() {
    const arr = (JSON.parse(JSON.stringify(this.props.addList)) || []).filter(ele => ele && ele.key)
    return arr.map(ele => {
      return {
        ...ele,
        key: _nameCase(ele.key)
      }
    })
  }

  @computed
  get configList(): conItemTree {
    const platform = (this.props.targetConfig || {}).platform === 'android' ? 2 : 1
    const arr = this.fmtConfigList;
    const editDataSortTarget = this.editDataSortTarget
    const fmt = this.haveUseEditData ? arr.filter(a => editDataSortTarget.hasOwnProperty(a.key)) : arr
    return fmt.filter(ele => ele.platform != platform)
      .slice().sort((a, b) => a.sort - b.sort)
      .slice().sort((a, b) => editDataSortTarget[b.key] - editDataSortTarget[a.key])
  }

  @computed
  get useConfigList(): conItemTree {
    return this.thisConfigList || this.configList
  }


  submit = (e?: React.FormEvent<any>): void => {
    //console.log(1231);
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
            //console.log(waitItemNum);
          } else {
            try {

              const dataArr = this.fromUseList(this.useConfigList, values)
              console.log(JSON.stringify(dataArr))
              // onSubmit(dataArr)
              // this.confirmModal ? this.props.onCancel(dataArr) : onSubmit(dataArr)
            } catch (error) {
              //console.log(error)
            }
            this.toggleLoading(false)
          }
        } else {
          this.toggleLoading(false)
        }

      }
    )
  }

  @action
  handelAction = (indexPath: string, type: string, config?: conItem) => {

    const indexPathArr = indexPath.split('.')
    let arrM = JSON.parse(JSON.stringify(this.useConfigList)), arr = arrM, index = Number(indexPathArr.pop())
    indexPathArr.forEach(ele => arr = arr[Number(ele)].children)
    const getBol8 = (index) => arr[index].value_type === '8'
    const typeIs8 = getBol8(index)
    // 从第八种类型中增加出来的，并且在最外层 就只能是第八种类型
    const typeIsOnly8 = typeIs8 && !indexPath.includes('.')
    switch (type) {
      case 'down': {
        // 第八种类型不能到非第八种类型的组中
        if (index !== this.useConfigList.length && typeIs8 === getBol8(index + 1)) {
          this.handelUpdateList(arr, index, index + 1)
        }
        break
      }
      case 'up': {
        // 第八种类型不能到非第八种类型的组中
        if (index !== 0 && typeIs8 === getBol8(index + 1)) {
          this.handelUpdateList(arr, index, index - 1)
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
          isEdit: true,
          typeIsOnly8,
        }
        this.handelUpdateList(arr, index + 1, undefined, addItem)
        break
      }
      case 'acc': {
        this.handelUpdateList(arr, index)
        break
      }
      case 'add': {
        const id = getGuId()
        const addItem = {
          value_type: typeIsOnly8 ? '8' : undefined,
          key: undefined,
          unit: undefined,
          id: undefined,
          default: undefined,
          addId: id,
          isEdit: true,
          typeIsOnly8,
        }
        this.handelUpdateList(arr, index + 1, undefined, addItem)
        break
      }
    }
    runInAction('SET_ARR', () => {
      this.thisConfigList = arrM
    })
  }
  addConfigItemSetType = (indexPath) => {
    console.log(indexPath)
    const indexPathArr = indexPath.split('.')
    let arrM = JSON.parse(JSON.stringify(this.useConfigList)), arr = arrM, index = Number(indexPathArr.pop())
    indexPathArr.forEach(ele => arr = arr[Number(ele)].children)
    arr[index] = {
      ...arr[index],
      value_type: '8',
      unit: undefined,
      id: undefined,
      default: undefined,
      addId: getGuId(),
      isEdit: true,
      children: [
        {
          value_type: undefined,
          key: undefined,
          unit: undefined,
          id: undefined,
          default: undefined,
          addId: getGuId(),
          isEdit: true,
        }
      ]
    }
    runInAction('SET_ARR', () => {
      this.thisConfigList = arrM
    })
  }

  @action
  addConfigItem = (indexPath, config?: conItem) => {
    //console.log('addConfigItem');

    const errorCb = () => {
      this.waitItemNum = 0
      // addConfigItem组件提交过程中出问题了 结束提交过程
      if (this.loading !== false) {
        this.toggleLoading(false)
      }
    }
    if (config) {
      // const indexPathArr = config.indexPath.split('.')
      const indexPathArr = indexPath.split('.')
      indexPathArr.pop();
      let arrM = JSON.parse(JSON.stringify(this.useConfigList)),
        arr = arrM
      indexPathArr.forEach(ele => arr = arr[Number(ele)].children)

      const index = arr.findIndex(ele => ele.addId === config.addId);
      // const arr: conItemTree = JSON.parse(JSON.stringify(this.useConfigList))

      if (this.useEditDataKeySet.has(_nameCase(config.key))) {
        this.$message.error(`${config.key} is exist!`)
        errorCb()
      } else {
        arr[index] = {
          ...arr[index],
          ...config,
          isEdit: false
        }
        runInAction('UP_THIS_CONFIG_LIST', () => {
          this.thisConfigList = arrM
        })

        if (this.loading) {
          // 是本组件触发的自组件提交
          if (! --this.waitItemNum) {
            // 这里必须要用这个nexttick 保证页面中addconfigItem 从编辑状态转为configItem
            // 这样的话 就能保证 submit时获取的数据没有从addconfigItem 直接过来的否则，在submit时会将这条addconfigItem
            //过来的数据的转为 value:object //见if (addId) {
            //当再次进入页面时导致需要渲染这条新增的数据对应的configItem-formItem 而此时formItem取initValue时取为Object

            // 不要改就对了。。。。。
            setImmediate(() => {
              this.submit()
            })
          }
        }
      }

    } else {
      errorCb()
    }
  }

  addDragEvent = () => {
    let dragged

    document.addEventListener('dragstart', (event: DragEvent) => {
      // 保存拖动元素的引用(ref.)
      const target = event.target as HTMLElement
      dragged = target
      // 使其半透明
      target.style.opacity = '.5'
    }, false)

    document.addEventListener('dragend', (event: DragEvent) => {
      const target = event.target as HTMLElement
      // 重置透明度
      target.style.opacity = ''
    }, false)

    /* 放下目标节点时触发事件 */
    document.addEventListener('dragover', (event: DragEvent) => {
      // 阻止默认动作
      event.preventDefault()
    }, false)


    document.addEventListener('dragleave', (event: DragEvent) => {
      const target = event.target as HTMLElement

      // 当拖动元素离开可放置目标节点，重置其背景
      if (target.className === 'dropZone') {
        target.style.background = ''
      }
    }, false)

    document.addEventListener('drop', (event: DragEvent) => {
      // 阻止默认动作（如打开一些元素的链接）
      event.preventDefault();
      // 移动拖动的元素到所选择的放置目标节点
      const tar = getEventTargetDom(event, 'itemBox') as HTMLElement
      if (tar) {
        const tarIndex = parseInt(tar.getAttribute('data-index'), 10)
        const fromIndex = parseInt(dragged.getAttribute('data-index'), 10)
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
  handelUpdateList = (arr, fromIndex: number, tarIndex?: number, addCon?: conItem) => {
    // 由于是keepLive组件 而拖动事件绑定在document上 需要判断当前组件是否是活动组件，
    // 解决拖动1  而2动的bug
    if (addCon !== undefined) {
      arr.splice(fromIndex, 0, addCon)
    } else {
      const tar = arr.splice(fromIndex, 1)
      if (tarIndex !== undefined) {
        arr.splice(tarIndex, 0, tar[0])
      }
    }
  }

  componentDidMount() {
    this.addDragEvent()
  }

  changeTemp = (indexPath: string, con) => {
    this.nowHandelConfigIndexPath = indexPath
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
    const pid = data.pid || data.template_pid
    this.props.getTemplateSelect(pid, true)
    // TODO:!!!!!!!
    // const arr: conItemTree = JSON.parse(JSON.stringify(this.useConfigList))
    // arr[this.nowHandelConfigIndexPath] = {
    //   ...arr[this.nowHandelConfigIndexPath],
    //   ...this.nowHandelConfig,
    //   template_pid: data.template_pid,
    //   value: data.templateId
    // }
    // 设置form 对应字段的值
    // const form = this.props.form;
    // const key = this.nowHandelConfig.key
    // form.setFieldsValue({
    //   [key]: data.templateId,
    // });templateId

    const arr: conItemTree = JSON.parse(JSON.stringify(this.useConfigList))

    const per = this.nowHandelConfig = {
      ...this.nowHandelConfig,
      ...data,
      template_pid: pid,
      default: data.templateId || data.value,
    }
    arr[this.nowHandelConfigIndexPath] = per
    runInAction('UP_THIS_CONFIG_LIST', () => {
      this.thisConfigList = arr
    })
    console.log(arr)
    runInAction('UP_THIS_CONFIG_LIST', () => {
      this.nowHandelConfig = per
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

  lastStep = () => {
    this.confirmModal = Modal.confirm({
      okText: 'Yes',
      cancelText: 'No',
      content: 'Save the Settings of this page?',
      onCancel: () => {
        this.props.onCancel()
        setImmediate(() => {
          this.confirmModal.destroy()
        })
      },
      onOk: () => {
        this.props.onCancel(true)
        setImmediate(() => {
          this.confirmModal.destroy()
        })
      }
    })
  }

  formObjToVal = (obj, keyStr: string) => {
    let j = obj
    try {
      keyStr.split('.').forEach(key => j = j[key])
      return j
    } catch (error) {
      return undefined
    }
  }

  render() {
    const { form, type: BasicType } = this.props
    const { getFieldDecorator } = form
    const { template_pid = undefined, templateId = undefined, option = '' } = this.nowHandelConfig || {}

    const getAddGroup = (item, indexPath) => {
      let valueTypeArr = BasicType === "basic1" ? ['string', 'color', 'select', 'array', 'radio', 'template']
        : !BasicType ? ['string', 'color', 'select', 'array', 'radio']
          : ['string', 'color', 'select', 'array', 'radio', 'template']
      if (BasicType !== "basic1" && indexPath.split('.').length !== 3) {
        // 不是basic1就可以包含'multiple',在嵌套不超过三层时可以是multiple
        valueTypeArr.push('multiple')
      }
      return (
        <AddConfigItem
          shouldSubmit={this.loading}
          choseSelect={this.choseSelect}
          editRadio={this.editRadio}
          key={item.addId}
          config={item}
          valueTypeArr={valueTypeArr}
          setType={() => this.addConfigItemSetType(indexPath)}
          changeTemp={(con) => this.changeTemp(indexPath, con)}
          onOk={(con) => this.addConfigItem(indexPath, con)} >
          {
            // item.children ? item.children.map((ele, index) => getAddGroup(ele, `${indexPath}.${index}`)) : null
            item.children ? renderItem(item.children, undefined, `${indexPath}`) : null
          }
        </AddConfigItem>
      )
    }
    const renderItem = (arr: conItemTree, per?: string, indexPre?) => arr.map(
      (item, index) => {
        const Key = per ? `${per}.${item.key}` : item.key
        const indexPath = indexPre !== undefined ? `${indexPre}.${index}` : `${index}`

        let _val = this.formObjToVal(this.useEditData, Key)
        _val = typeOf(_val) === 'object' ? _val.value : _val
        // 仅剩一条的话不能删除
        const workTypeArr = arr.length === 1 ? ['add', 'copy', 'up', 'down'] : ['acc', 'add', 'copy', 'up', 'down']
        return (
          !item.isEdit ?
            (<div
              key={Key + indexPath}
              // draggable={this.showWork} 
              className="itemBox" data-index={`${indexPath}-${item.key}`}
            >
              <FormItem className={(this.showWork ? 'hasWork work' : 'noWork work') + (item.children ? ' haveChild' : ' noChild')} key='FormItem' label={camelCase(item.key)}>
                {item.children ? <ConfigItem
                  handel={(type, con) => this.handelAction(indexPath, type, con)}
                  showWork={this.showWork}
                  workTypeArr={workTypeArr}
                  config={item} />
                  : getFieldDecorator(Key, {
                    initialValue: _val === undefined ? item.default : _val,
                    rules: [
                      {
                        required: true, message: "Required"
                      }
                    ]
                  })(
                    <ConfigItem
                      changeTemp={(con) => this.changeTemp(indexPath, con)}
                      handel={(type, con) => this.handelAction(indexPath, type, con)}
                      showWork={this.showWork}
                      workTypeArr={workTypeArr}
                      config={item} />
                  )}
              </FormItem>
              {!item.children ? null : <div className='ggg'>
                {renderItem(item.children, Key, indexPath)}
              </div>}
            </div>)
            : getAddGroup(item, indexPath)
        )
      })
    return (
      <div className='Basic' >
        <Form className="dropZone" {...layout}>
          {renderItem(this.useConfigList)}
          <Button type="primary" loading={this.loading} className='submitBtn' onClick={this.submit}>Submit</Button>
          {
            // type有值说明不是Pid中的 
            this.showWork && BasicType ? <Button className="cancelBtn" onClick={this.toggleWork}>Cancel</Button>
              : BasicType === "basic1" ? null : <Button className='cancelBtn' onClick={this.lastStep}>Last Step</Button>
          }
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
      </div >

    )
  }
}

export default Form.create<IProps>()(Basic)
