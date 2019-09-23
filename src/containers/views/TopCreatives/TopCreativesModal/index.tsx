import React from 'react'
import { Modal } from 'antd'
import { observer } from 'mobx-react'


interface IProp {
  visible: boolean
  onCancel: () => void
  data: ITopCreativeStore.ITopCreativeForList
}

@observer
class TopCreativesModal extends React.Component<IProp> {

  render() {

    return (
      <Modal
        title='Creative'
        destroyOnClose
        onCancel={this.props.onCancel}
        footer={null}
      ></Modal>
    )
  }
}


export default TopCreativesModal
