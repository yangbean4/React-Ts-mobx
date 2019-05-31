import * as React from 'react'
import { Modal } from 'antd'

import Loadable from 'react-loadable'

import PageLoading from '@components/PageLoading'

const loadComponent = (loader: () => Promise<any>) =>
  Loadable({
    loader,
    loading: PageLoading
  })

interface IProps {
  visible: boolean
  onCancel: () => void
  onOk: (id: string) => void
  type: string
}
const asyncComponent = {
  subsite: loadComponent(() => import(/**/ '@views/Companysite/CompanyModel')),
  source: loadComponent(() => import(/**/ '@views/Companysource/AdsourceModel')),
}


class CompanyModel extends React.Component<IProps>{


  getComponent = () => {
    const Components = asyncComponent[this.props.type];
    const props = {
      type: 'Modal',
      onOk: this.props.onOk,
      onCancel: this.props.onCancel
    }
    return <Components {...props} />
  }

  render() {
    const { visible } = this.props
    return (
      <Modal
        visible={visible}
        footer={null}
        width={460}
      >
        {this.getComponent()}
      </Modal>
    )
  }
}

export default CompanyModel
