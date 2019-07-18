import React from 'react'
import { observer } from 'mobx-react'
import { Upload, Modal, message, Icon, Button } from 'antd'
import { action, computed, runInAction, observable } from 'mobx';
import { typeOf, testSize } from '@utils/index'
import * as styles from './index.scss'
import MyIcon from '../Icon'
import { CopyToClipboard } from 'react-copy-to-clipboard'
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
  WH_arr?: FileWHT[]
}

export interface UploadFileProps {
  fileType?: string
  value?: string
  wht?: FileWHT
  onChange?: (data: any) => void
  api?: (data: any) => Promise<any>
  children?: React.ReactNode
  preData?: object
  callBack?: (data) => void
  className?: string
  viewUrl?: string
}

@observer
class UploadFile extends React.Component<UploadFileProps> {

  @observable
  private previewVisible: boolean = false

  @observable
  private title: string = ''

  @observable
  private footer: (string | object) = null

  @observable
  private previewUrl: string

  @computed
  get useUrl() {
    return this.props.value ? this.previewUrl || this.props.value : ''
  }

  @action
  handleCancel = () => {
    this.previewVisible = false
  }

  @action
  eyeClick = (e: React.MouseEvent) => {
    this.setTitle()
    this.setFooter()
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
    runInAction('SET_URL', () => {
      this.previewUrl = ''
    })
  }

  @action
  setTitle = () => {
    const title = this.props.fileType === 'video' ? 'View' : ''
    runInAction('SET_TITLE', () => {
      this.title = title
    })
  }

  @action
  setFooter = () => {
    const dom = this.props.fileType === 'video' ? (<CopyToClipboard onCopy={this.onCopy} text={this.useUrl}><Button type="primary">Copy Url</Button></CopyToClipboard>) : null
    runInAction('SET_FOOTER', () => {
      this.footer = dom
    })
  }
  @action
  showOnline = (e: React.MouseEvent) => {
    e.stopPropagation()
  }
  onCopy = () => {
    message.success('copy success')
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
          const { width, height, isScale = false, WH_arr } = whs;
          return testSize(file, whs, isVideo ? 'video' : 'img').catch(() => {
            let msg = isScale ? `Please upload ${fileName} at ${width}/${height}` : `Please upload ${fileName} at ${width}*${height}px`
            if (WH_arr) {
              msg = `Please upload ${fileName} at ${WH_arr[0].width}*${WH_arr[0].height}px or ${WH_arr[1].width}*${WH_arr[1].height}px`
            }
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

    const { api, wht, fileType, preData, callBack } = this.props
    const props = this.getUploadprops(api, wht, preData, fileType, callBack)
    const domCom = fileType === 'video' ?
      (<video style={{ width: '100%' }} src={this.useUrl} />)
      : (<div className={styles.imgBox} style={{ backgroundImage: 'url(' + this.useUrl + ')' }} />)

    const isZip = fileType === '.zip'
    const isVideo = fileType === 'video' ? true : false

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
                <Button onClick={isVideo ? this.showOnline : this.eyeClick} style={{ marginRight: 12 }} type="primary" shape="circle" icon="eye" />
                <Button onClick={this.delClick} type="primary" shape="circle" icon="delete" />
                {
                  isVideo ? (
                    <div className={styles.onlineWrap}>
                      <div className="online" onClick={this.eyeClick}>Online</div>
                      <div className="offline" onClick={this.eyeClick} style={{ borderLeft: 'none' }}>Offline</div>
                    </div>
                  ) : ''
                }

              </div>

              <div className={styles.trueDom}>
                {domCom}
              </div>
            </div>
              ))

            : this.props.children || uploadButton}
        </Upload>
        <Modal
          visible={this.previewVisible}
          width={680}
          onCancel={this.handleCancel}
          title={this.title}
          footer={this.footer}
        >
          {
            fileType === 'video' ?
              (
                <React.Fragment>
                  <div className={styles.videoWrapper}>
                    <video width="100%" height="100%" style={{ width: '100%' }} controls autoPlay src={this.useUrl} />
                  </div>
                  <div className={styles.linkUrlWrapper}>
                    <div className={styles.label}>{this.setText}</div>
                    <div className={styles.linkUrl}>{this.useUrl}</div>
                  </div>
                </React.Fragment>
              ) :
              isZip ? <iframe src={this.props.viewUrl} />
                : (<img alt="example" style={{ width: '100%' }} src={this.useUrl} />)
          }
        </Modal>
      </React.Fragment>

    )
  }
}

export default UploadFile
