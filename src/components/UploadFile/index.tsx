import React from 'react'
import { Upload, Modal } from 'antd'
import { action } from 'mobx';

interface IProps {
  type?: string
  value?: string
  onChange?: (data: any) => void
  api?: () => Promise<any>
  children?: React.ReactNode
}

class UploadFile extends React.Component<IProps> {

  private previewVisible: boolean = false


  @action
  handleCancel = () => {
    this.previewVisible = false;
  }


  render() {
    const { previewVisible, previewImage, fileList } = this;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <div className="clearfix">
        <Upload
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          listType="picture-card"
          fileList={fileList}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
        >
          {fileList.length >= 3 ? null : uploadButton}
        </Upload>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}
}

export default UploadFile