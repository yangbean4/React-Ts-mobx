import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { observable, action, computed, runInAction, when } from 'mobx'
import { Input, Select, Radio, Divider, Icon } from 'antd'
import { conItem } from './type'
import { SketchPicker } from 'react-color'
import myIcon from '@components/Icon'
import { typeOf } from '@utils/index'
import InputGroup from './InputGroup/index'

const RadioGroup = Radio.Group;

const workGroup = [{
  action: 'acc',
  type: "iconjianshao"
}, {
  action: 'add',
  type: "icontianjia"
}, {
  action: 'copy',
  type: "iconfuzhi"
}, {
  action: 'up',
  type: "iconshang"
}, {
  action: 'down',
  type: "iconxia"
}]

interface optionSelectItem {
  label: string,
  value: number
}


interface IStoreProps {
  getTemplateSelect?: (pid: number, useCache?: boolean) => Promise<any>
  TemplatesTarget?: any
}
interface IProps extends IStoreProps {
  config?: conItem
  showWork?: boolean
  handel?: (type: string, index: number, config?: conItem) => void
  dataIndex?: number
  // getFieldDecorator包裹的组件会给该组件加上value和onChange的props 做双向绑定
  value?: any
  changeTemp?: (index: number, config?: conItem) => void
  onChange?: (data: any) => void
}

@inject(
  (store: IStore): IStoreProps => {
    const { templateStore } = store
    const { getTemplateSelect, TemplatesTarget } = templateStore
    return { getTemplateSelect, TemplatesTarget }
  }
)

@observer
class ConfigItem extends React.Component<IProps> {

  @observable
  private selectOptionLiat: optionSelectItem[]

  @observable
  private pickerVisible: boolean = false

  @computed
  get selectPid() {
    return this.props.config.template_pid
  }

  @computed
  get selectOptionList() {
    return (this.props.TemplatesTarget[this.selectPid] || [])
  }

  @action
  onTogglePicker = () => {
    this.pickerVisible = !this.pickerVisible
  }

  triggerChange(data) {
    this.props.onChange(data);
  }
  handleColorChange = (data) => {
    this.onTogglePicker()
    this.props.onChange(data.hex);
  }
  changeTemp = () => {
    this.props.changeTemp(this.props.dataIndex, this.props.config)
  }

  renderFormBox = () => {
    return React.createElement('div', { className: 'box' }, [
      this.renderFormItemGroup(),
      this.props.showWork ? this.renderWoker() : null
    ])
  }

  renderFormItemGroup = () => {
    const { unit, value_type } = this.props.config
    return React.createElement('div', {
      className: 'mainBox', key: 'mainBox',
    }, [
        this.renderFormItem(),
        // value_type为5 时为radio unit是radio的待选项
        value_type !== '5' ? React.createElement('span', { className: 'unit', key: 'unit' }, unit) : null
      ])
  }

  componentWillMount() {
    if (this.selectPid) {
      this.props.getTemplateSelect(this.selectPid, true)
    }
  }

  renderFormItem = () => {
    const { config, value } = this.props
    const {
      key,
      value_type,
      unit,
      option
    } = config
    let Component, Component1, children = null, props = {
      // 因为是自定义的组件由getFieldDecorator包裹，
      // 所以and-form 不能自动的将在getFieldDecorator-option处设置的initialValue
      // 设置到具体的input等输入组件上，但是不通过getFieldDecorator-option处设置initialValue只在此处设置
      // defaultValue的话初始值getFieldDecorator-rules检测不到有值。
      // 所以这里依然用defaultValue去将初始值设置具体的输入组件上

      // 这个逻辑相当于该组件作为中间组件，去接管getFieldDecorator设置过来的value  和onchange 
      defaultValue: value,
      value: value,
      key: key,
      className: `main-item-type${value_type} ${unit ? 'hasUnit' : ''}`
    }, addProp;
    const _value_type = value_type.toString()
    switch (_value_type) {
      case '1': Component = Input; addProp = {
        onChange: (e) => {
          let value = e.target.value;
          this.triggerChange(value)
        }
      }; break;
      case '2':
        Component1 = React.createElement('div', {
          key: 'color-box',
        }, [
            <Input key="input" value={value} onDoubleClick={() => this.onTogglePicker()} />,
            this.pickerVisible && (
              <div style={{ position: 'absolute', zIndex: 10 }} key='color'>
                <SketchPicker
                  color={{ hex: value }}
                  onChangeComplete={this.handleColorChange}
                />
              </div>
            )])
        break
      case '3': {
        Component = Select
        const dropdownRender = menu => {
          return !this.selectPid ? menu : (
            <div>
              {menu}
              <Divider key='Divider' style={{ margin: '4px 0' }} />
              <div key='more-box' onMouseDown={e => { e.preventDefault(); }}
                onClick={() => this.changeTemp()} style={{ padding: '8px', cursor: 'pointer' }}>
                <Icon type="plus" /> Change TemplatesGroup
            </div>
            </div>
          )
        }
        addProp = {
          allowClear: true,
          showSearch: true,
          value: value,
          getPopupContainer: trigger => trigger. parentElement,
          filterOption: (input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0,
          onChange: (val) => this.triggerChange(val),
          dropdownRender,
        }
        const optionArr = this.selectPid ? this.selectOptionList :
          typeOf(option) === 'array' ? option.map((ele, index) => {
            if (typeOf(ele) === 'object') {
              const {
                key, value, label
              } = ele
              return {
                label: label, value: key || value
              }
            } else if (typeOf(ele) === 'string') {
              return {
                label: ele,
                value: index + ''
              }
            }
          })
            : typeOf(option) === 'object' ? Object.entries(option).map(([key, value]) => ({ label: value, value: key }))
              : JSON.parse(option || '[]')
        children = optionArr.map((c, i) => (
          <Select.Option key={c.label + i} value={c.value}>
            {c.label}
          </Select.Option>
        ))
        break;
      }
      case '4': {
        Component = InputGroup
        let vv;
        if (Array.isArray(value)) {
          vv = value
        } else {
          try {
            const v = JSON.parse(value)
            vv = Array.isArray(v) ? v : [v || '']
          } catch (error) {
            vv = [value || '']
          }
        }

        addProp = {
          value: vv,
          onChange: (value) => {
            this.triggerChange(value)
          }
        }
        break
      }
      case '5': {
        Component = RadioGroup
        let _value = value;
        if (typeOf(_value) !== 'number') {
          _value = Number(value)
          this.triggerChange(_value)
        }
        addProp = {
          value: Number(value),
          onChange: (val) => this.triggerChange(val)
        }

        let arr: { label: string, value: string | number }[] = (option || '').split(',').map((item, index) => {
          return {
            label: item,
            value: index,
          }
        })

        // 这是一段垃圾代码，把后端返回的unit转成待选项 有yes  或 on  切只有两个是 这个对应1 另一个对应0 -----TMD垃圾
        if (arr.length === 2 && (option.toLowerCase().includes('on') || option.toLowerCase().includes('yes'))) {
          arr = arr.map(item => {
            const { label } = item
            return {
              label: label,
              value: + (label.toLowerCase().includes('on') || label.toLowerCase().includes('yes')),
            }
          })
        }
        children = arr.map((c, i) => (
          <Radio key={c.value + c.label} value={c.value}>
            {c.label}
          </Radio>
        ))

        break;
      }
      default: {
        return null
      }
    }
    return Component1 || React.createElement(Component, { ...props, ...addProp }, children)
  }

  renderWoker = () => {
    return React.createElement('div', { className: 'workBox', key: 'workBox' },
      workGroup.map(item => {
        return React.createElement(myIcon, {
          key: item.type,
          type: item.type,
          onClick: () => this.props.handel(item.action, this.props.dataIndex, this.props.config)
        })
      })
    )
  }

  render() {
    return React.createElement('div', null, this.renderFormBox());
  }
}

export default ConfigItem
