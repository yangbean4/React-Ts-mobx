import React from 'react'
import { emojiList } from './emojiconfig'
import { observable, action, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import * as styles from './index.scss'

interface IProp {
  selectEmoji?: (data: any) => void
}

@observer
class EmojiPicker extends React.Component<IProp>{
  @action
  insertEmoji = (event) => {
    console.log(event)
  }
  render() {
    return (
      <div className={styles.senEmojiWrap}>
        <ul className={styles.senEmojis}>
          {
            emojiList.map((item, index) => {
              return (
                <li
                  key={index}
                  data-emoji={item}
                  onClick={() => this.props.selectEmoji(item)}
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
