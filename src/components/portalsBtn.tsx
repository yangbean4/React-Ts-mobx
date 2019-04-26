import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { observer } from 'mobx-react'

import { action, observable } from 'mobx';

interface IProps {
  querySelector?: string
}

@observer
class PortalsBtn extends React.Component<IProps> {

  @observable
  private useDom = false

  @action
  trigger = () => {
    this.useDom = true
  }

  componentWillMount() {
    setTimeout(() => {
      this.trigger()
    }, 50);
  }

  render() {
    return this.useDom ? ReactDOM.createPortal(
      this.props.children,
      window.document.querySelector(this.props.querySelector)
    ) : null
  }
}

export default PortalsBtn