import { Icon } from 'antd'
import * as styles from './style.scss'
import React, { MouseEvent, SFC } from 'react';
const MyIcon = Icon.createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_1129208_cvxrfql4bdt.js', // 在 iconfont.cn 上生成
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
