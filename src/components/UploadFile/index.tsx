import React from 'react'
import { observer } from 'mobx-react'
import { Upload, Modal, message, Icon, Button } from 'antd'
import { action, computed, runInAction, observable } from 'mobx';
import { typeOf, testSize } from '@utils/index'
import * as styles from './index.scss'
import MyIcon from '../Icon'
interface hasResult {
  result?: string
}

export interface FileWHT {
  width?: number
  height?: number
  isScale?: boolean
  time?: number
  minW_H?: number
  maxW_H?: number
  size?: number
}

export interface UploadFileProps {
  fileType?: string
  value?: string
  wht?: FileWHT
  onChange?: (data: any) => void
  api?: (data: any) => Promise<any>
  children?: React.ReactNode
  preData?: Object
  callBack?: (data) => void
  className?: string
  viewUrl?: string
}

@observer
class UploadFile extends React.Component<UploadFileProps> {

  @observable
  private previewVisible: boolean = false
  @observable
  private previewUrl: string

  @computed
  get useUrl() {
    return this.props.value ? this.previewUrl || this.props.value : ''
  }

  @action
  handleCancel = () => {
    this.previewVisible = false;
  }

  @action
  eyeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    runInAction("set", () => {
      this.previewVisible = true;
    })
  }

  delClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    this.removeFile()
  }

  @action
  removeFile = () => {
    this.props.onChange('');
    runInAction("SET_URL", () => {
      this.previewUrl = ''
    })
  }

  getUploadprops = (fun: Function,
    whs?: FileWHT,
    preData?,
    type = ".png, .jpg, .jpeg, .gif",
    cb?: Function) => {

    const errorCb = (error) => { console.log(error); this.removeFile() };
    const isVideo = type === 'video'
    const isZip = type === '.zip'
    const fileName = isVideo ? 'Video' : 'Image'

    return {
      showUploadList: false,
      accept: isVideo ? 'video/*' : type,
      name: 'file',
      // listType: "picture-card",
      // fileList: this.fileList,
      className: "avatar-uploader " + this.props.className,
      onRemove: () => this.removeFile(),
      beforeUpload: (file) => {
        const houz = file.name.split('.').pop()
        const isHtml = isVideo || type.includes(houz)
        const size = isVideo ? 0 : whs.size;
        if (!isHtml) {
          message.error(`Upload failed! The file must be in ${type} format.`);
        }
        const isLt2M = !size || file.size / 1024 < size;
        if (!isLt2M) {
          const msg = size >= 1000 ? `${size / 1000} M` : `${size}kb`
          message.error(`Failure，The file size cannot exceed ${msg}!`);
        }
        // && !isVideo
        if (isHtml && isLt2M && !isZip && whs) {
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
          const Rdata = res.data
          this.props.onChange(Rdata.url)

          if (isZip) {
            runInAction('SET_URL', () => {
              this.previewUrl = file.name
            })
          } else {
            const fileRender = new FileReader()
            fileRender.onload = (ev) => {
              const target = ev.target as hasResult
              runInAction('SET_URL', () => {
                this.previewUrl = target.result
              })

              cb && cb({
                data: Rdata,
                localUrl: target.result
              })
            }
            fileRender.readAsDataURL(file)
          }

        }, errorCb).catch(errorCb)
      }
    }
  }

  viewFile = () => {
    window.open(this.props.viewUrl)
  }


  render() {

    const { api, wht, fileType, preData, callBack } = this.props;
    const props = this.getUploadprops(api, wht, preData, fileType, callBack)
    const domCom = fileType === 'video' ?
      (<video style={{ width: '100%' }} src={this.useUrl} />)
      : (<div className={styles.imgBox} style={{ backgroundImage: 'url(' + this.useUrl + ')' }}></div>)

    const isZip = fileType === '.zip'

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return (
      <React.Fragment>
        <Upload
          {...props}
        >
          {this.useUrl ? (
            isZip ? (
              <div className={styles.fileBox}>
                <span className={styles.fileName} title={this.useUrl}>{this.useUrl}</span>
                <MyIcon className={styles.fileIcon} type="iconguanbi" onClick={this.delClick} />
                {
                  this.props.viewUrl && <Icon className={styles.fileIcon} type="eye" onClick={this.viewFile} />
                }
              </div>
            ) : (<div className={styles.box}>
              <div className={styles.layer}>
                <Button onClick={this.eyeClick} style={{ marginRight: 12 }} type="primary" shape="circle" icon="eye" />
                <Button onClick={this.delClick} type="primary" shape="circle" icon="delete" />
              </div>
              <div className={styles.trueDom}>
                {domCom}
              </div>
            </div>
              ))

            : this.props.children || uploadButton}
        </Upload>
        <Modal visible={this.previewVisible} footer={null} onCancel={this.handleCancel}>
          {
            fileType === 'video' ?
              (<video style={{ width: '100%' }} controls autoPlay src={this.useUrl} />) :
              isZip ? <iframe src={this.props.viewUrl} />
                : (<img alt="example" style={{ width: '100%' }} src={this.useUrl} />)
          }
        </Modal>
      </React.Fragment>

    );
  }
}

export default UploadFile