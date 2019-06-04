import React from 'react'
import { Input } from 'antd'
import { SketchPicker } from 'react-color'
import { observable, action, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import * as style from './index.scss'
interface IProp {
  value?: string
  onChange?: (data: any) => void
}

@observer
class InputColor extends React.Component<IProp>  {

  @observable
  private positionStyle

  @observable
  private pickerVisible: boolean = false

  private colorBox

  constructor(prop: IProp) {
    super(prop)
    this.colorBox = React.createRef()
  }

  @action
  onTogglePicker = () => {
    if (!this.pickerVisible) {
      const dom = this.colorBox.current as HTMLElement
      const domRect = dom.getBoundingClientRect()
      const Basic = document.getElementsByClassName('Basic')[0]
      if (Basic) {
        const bigBox = Basic.getBoundingClientRect() as DOMRect
        const style = bigBox.bottom < (domRect.bottom + 360) ? {
          bottom: '100%',
        } : {
            top: '100%'
          }
        runInAction('SET_STYLE', () => {
          this.positionStyle = style
        })
      }

    }
    this.pickerVisible = !this.pickerVisible
  }
  handleColorChange = (data) => {
    this.onTogglePicker()
    this.props.onChange(data.hex);
  }
  componentDidMount() {
    document.addEventListener('dblclick', (e) => {
      const dom = this.colorBox.current as HTMLElement
      if (dom) {
        const domRect = dom.getBoundingClientRect()
        const show = e.clientY < domRect.bottom && e.clientY > domRect.top
          && e.clientX < domRect.right && e.clientX > domRect.left
        runInAction('SET_SHOW', () => {
          this.pickerVisible = show
        })
      }
    })
  }

  render() {
    const value = this.props.value;
    return (
      <div ref={this.colorBox} className={style.colorBox}>
        <Input key="input" value={this.props.value} onDoubleClick={() => this.onTogglePicker()} />
        {this.pickerVisible && (
          <div style={{ position: 'absolute', zIndex: 10, ...this.positionStyle }} key='color'>
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

