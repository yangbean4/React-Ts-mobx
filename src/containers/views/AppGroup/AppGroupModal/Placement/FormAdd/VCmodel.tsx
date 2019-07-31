import * as React from 'react'
import { Modal } from 'antd'
import VCForm from '@views/Currency/CurrencyModal/Add'

interface IProps {
  visible: boolean
  onCancel: () => void
  onOk: (id: number) => void
  currency: ICurrencyStore.ICurrency
}

class AccountModel extends React.Component<IProps>{

  render() {
    const { visible } = this.props
    return (
      <Modal
        title='Add Virtual Currency'
        visible={visible}
        footer={null}
        width={580}
        onCancel={this.props.onCancel}
      >
        <VCForm
          type='Modal'
          currency={this.props.currency}
          onOk={this.props.onOk}
          onCancel={this.props.onCancel}
        />
      </Modal>
    )
  }
}

export default AccountModel
