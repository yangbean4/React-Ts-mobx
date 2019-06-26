import * as React from 'react'
import { Modal } from 'antd'
import AccountForm from '@views/Account/AccountModel'

interface IProps {
  visible: boolean
  onCancel: () => void
  onOk: (id: number) => void
}

class AccountModel extends React.Component<IProps>{

  render() {
    const { visible } = this.props
    return (
      <Modal
        title={`Add Account`}
        visible={visible}
        footer={null}
        width={580}
        onCancel={this.props.onCancel}
      >
        <AccountForm
          type='Modal'
          onOk={this.props.onOk}
          onCancel={this.props.onCancel}
        />
      </Modal>
    )
  }
}

export default AccountModel