import React from 'react'
import { Upload, Modal, message, Icon } from 'antd'
import { action, computed, runInAction } from 'mobx';
import { typeOf, testSize } from '@utils/index'
interface hasResult {
  result?: string
}

interface WHT {
  width?: number
  height?: number
  isScale?: boolean
  time?: number
  minW_H?: number
  maxW_H?: number
  size?: number
}

interface IProps {
  fileType?: string
  value?: string
  wht?: WHT
  onChange?: (data: any) => void
  api?: () => Promise<any>
  children?: React.ReactNode
  preData?: Object
  callBack?: () => void
}

class UploadFile extends React.Component<IProps> {

  private previewVisible: boolean = false

  private previewUrl: string

  @computed
  get useUrl() {
    return this.previewUrl || this.props.value
  }

  @computed
  get fileList() {
    return this.useUrl ? [{
      uid: '1',
      name: '12',
      status: 'done',
      url: this.useUrl
    }] : []
  }

  @action
  handleChange = ({ fileList }) => {
    console.log(fileList)
  };

  @action
  handleCancel = () => {
    this.previewVisible = false;
  }

  @action
  handlePreview = () => {
    this.previewVisible = true;
  }

  @action
  removeFile = () => {
    this.props.onChange('');
    runInAction("SET_URL", () => {
      this.previewUrl = ''
    })
  }

  getUploadprops = (fun: Function,
    whs?: WHT,
    preData?,
    type = ".png, .jpg, .jpeg, .gif",
    cb?: Function) => {

    const errorCb = (error) => { console.log(error); this.removeFile() };
    const isVideo = type === 'video'
    const fileName = isVideo ? 'Video' : 'Image'

    return {
      showUploadList: false,
      accept: isVideo ? 'video/*' : type,
      name: 'file',
      listType: "picture-card",
      fileList: this.fileList,
      className: "avatar-uploader",
      onRemove: () => this.removeFile(),
      beforeUpload: (file) => {
        const houz = file.name.split('.').pop()
        const isHtml = isVideo || type.includes(houz)
        const size = whs.size;
        if (!isHtml) {
          message.error(`Upload failed! The file must be in ${type} format.`);
        }
        const isLt2M = file.size / 1024 < size;
        if (!isLt2M) {
          const msg = size >= 1000 ? `${size / 1000} M` : `${size}kb`
          message.error(`Failure，The file size cannot exceed ${msg}!`);
        }
        // && !isVideo
        if (isHtml && isLt2M && whs) {
          const { width, height, isScale = false } = whs;
          return testSize(file, whs, isVideo ? 'video' : 'img').catch(() => {
            const msg = isScale ? `Please upload ${fileName} at ${width}/${height}` : `Please upload ${fileName} at ${width}*${height}px`
            message.error(msg);
            return Promise.reject()
          })
        }
        return isHtml && isLt2M
      },
      customRequest: (data) => {
        const formData = new FormData()
        const file = data.file
        formData.append('file', file)
        if (preData && typeOf(preData) === 'object') {
          Object.entries(preData).forEach(([key, value]) => {
            const _value = value as string
            formData.append(key, _value)
          })
        }
        fun(formData).then(res => {
          const data = res.data
          const fileRender = new FileReader()
          fileRender.onload = (ev) => {
            const target = ev.target as hasResult
            runInAction('SET_URL', () => {
              this.previewUrl = target.result
            })
            cb && cb({
              data,
              localUrl: target.result
            })
          }
          fileRender.readAsDataURL(file)
        }, errorCb).catch(errorCb)
      }
    }
  }


  render() {
    const { previewVisible, previewUrl, fileList } = this;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const { api, wht, fileType, preData, callBack } = this.props;
    const props = this.getUploadprops(api, wht, preData, fileType, callBack)
    return (
      <div className="clearfix">
        <Upload
          {...props}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
        >
          {fileList.length > 0 ? null : this.props.children || uploadButton}
        </Upload>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewUrl} />
        </Modal>
      </div>
    );
  }
}

export default UploadFile