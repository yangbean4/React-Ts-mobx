import React from 'react'
import { emojiList } from './emojiconfig'
import { observable, action, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import * as style from './index.scss'

interface IProp {
  onChange?: (data: any) => void
}

@observer
class EmojiPicker extends React.Component<IProp>{
  @observable
  private pickerVisiable: boolean = false

  @observable
  private url: string

  @action
  toggleEmojiPicker = () => {
    this.pickerVisiable = !this.pickerVisiable
  }

  @action
  insertEmoji = (event) => {
    this.toggleEmojiPicker()
  }

  render() {
    return (
      <div className="sen-emoji-wrap">
        <ul className="sen-emojis">
          {
            emojiList.map((item, index) => {
              return (
                <li
                  key={index}
                  data-emoji={item}
                  onClick={(event) => this.insertEmoji(event)}
                >{item}
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }
}

export default EmojiPicker
