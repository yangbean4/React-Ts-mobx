import * as React from 'react'
import { Modal } from 'antd'
import AccountForm from '@views/LeadContent/LeadContentModal/Add'

interface IProps {
  visible: boolean
  onCancel: () => void
  onOk: (id: number) => void
  app_key?: string
  platform?: string
}

class AccountModel extends React.Component<IProps>{

  render() {
    const { visible } = this.props
    return (
      <Modal
        title={`Add Lead Content`}
        visible={visible}
        footer={null}
        width={580}
        onCancel={this.props.onCancel}
      >
        <AccountForm
          type='Modal'
          app_key={this.props.app_key}
          platform={this.props.platform}
          onOk={this.props.onOk}
          onCancel={this.props.onCancel}
        />
      </Modal>
    )
  }
}

export default AccountModel
