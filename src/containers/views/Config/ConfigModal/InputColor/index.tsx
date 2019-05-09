import React from 'react'
import { Input } from 'antd'
import { SketchPicker } from 'react-color'
import { observable, action } from 'mobx'
import { observer } from 'mobx-react'
import * as style from './index.scss'
interface IProp {
  value?: string
  onChange?: (data: any) => void
}

@observer
class InputColor extends React.Component<IProp>  {

  @observable
  private pickerVisible: boolean = false

  @action
  onTogglePicker = () => {
    this.pickerVisible = !this.pickerVisible
  }
  handleColorChange = (data) => {
    this.onTogglePicker()
    this.props.onChange(data.hex);
  }

  render() {
    const value = this.props.value;
    return (
      <div className={style.colorBox}>
        <Input key="input" value={this.props.value} onDoubleClick={() => this.onTogglePicker()} />
        {this.pickerVisible && (
          <div style={{ position: 'absolute', zIndex: 10 }} key='color'>
            <SketchPicker
              color={{ hex: value }}
              onChangeComplete={this.handleColorChange}
            />
          </div>
        )}
        {
          value && (
            <div className={style.viewColor} style={{ backgroundColor: value }}></div>
          )
        }
      </div>

    )
  }
}


export default InputColor

