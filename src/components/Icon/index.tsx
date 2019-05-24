import { Icon } from 'antd'
import * as styles from './style.scss'
import React, { MouseEvent, SFC } from 'react';
import './icon.js'


const MyIcon = Icon.createFromIconfontCN({
  // scriptUrl: ""
  // scriptUrl: './icon.js', // 在 iconfont.cn 上生成
});



interface IProps {
  type: string
  onClick?(e: MouseEvent<HTMLElement>): void
  className?: string
}

const Button: SFC<IProps> = ({ onClick, type, className }) => (
  <MyIcon className={`${styles.icon}  ${className}`} type={type} onClick={onClick} />
);

export default Button
