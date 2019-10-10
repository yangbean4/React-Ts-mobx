import React from 'react'
import { observer } from 'mobx-react'
import { Upload, Modal, message, Icon, Button, Spin } from 'antd'
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
  urlGroup?: {
    onlineUrl?: string
    offlineUrl?: string
  }
  wht?: FileWHT
  onChange?: (data: any) => void
  api?: (data: any) => Promise<any>
  children?: React.ReactNode
  preData?: object
  uploadBefore?: (data) => void
  handleFormData?: (data) => void
  callBack?: (data) => void
  className?: string
  viewUrl?: string
  hasView?: boolean
  showFileSize?: boolean
  fileSize?: number
  showUnzippedFileSize?: boolean
}

@observer
class UploadFile extends React.Component<UploadFileProps> {

  @observable
  private previewVisible: boolean = false

  @observable
  private loading: boolean = false

  @observable
  private title: string = ''

  @observable
  private videoUrl: string = ''

  @observable
  private videoType: string = ''

  @observable
  private footer: (string | object) = null

  @observable
  private previewUrl: string

  @observable
  private fileSize: number = 0;

  @observable
  private btnVisible: boolean = false

  @computed
  get useUrl() {
    // this.props.value ? this.previewUrl || this.props.value : ''
    return this.props.value
  }

  @computed
  get showFileSize() {
    return this.props.showFileSize;
  }

  @computed
  get getFileSize() {
    let fileSize = this.fileSize || this.props.fileSize;
    if (fileSize > 1048576) return (fileSize / 1048576).toFixed(2) + 'Mb';
    else return Math.round(fileSize / 1024) + 'kb';

  }

  @computed
  get showLine() {
    return this.previewUrl ? false : this.props.urlGroup && Object.values(this.props.urlGroup).every(ele => !!ele)
  }

  @action
  handleCancel = () => {
    this.previewVisible = false
  }

  @action
  eyeClick = (e: React.MouseEvent, type?) => {
    this.setTitle()
    e.stopPropagation()
    runInAction("set", () => {
      this.videoUrl = type === 1 ? this.props.urlGroup.onlineUrl : type === 2 ? this.props.urlGroup.offlineUrl : this.props.value;
      this.videoType = type === 1 ? 'Online' : type === 2 ? 'Offline' : ''
      this.previewVisible = true;
      this.btnVisible = false;
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

  // @action
  // setFooter = () => {
  //   const dom =
  //   runInAction('SET_FOOTER', () => {
  //     this.footer = dom
  //   })
  // }
  @action
  showOnline = (e: React.MouseEvent) => {
    // e.stopPropagation()
    console.log(222)

    this.btnVisible = true;
  }

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  @action
  hideBtn = (e: React.MouseEvent) => {
    // e.stopPropagation()
    console.log(111)
    this.btnVisible = false;
  }

  stop = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  onCopy = () => {
    message.success('copy success')
  }
  getUploadprops = (fun: Function,
    whs: FileWHT = {},
    preData?,
    type = ".png, .jpg, .jpeg, .gif",
    cb?: Function) => {

    const errorCb = (error) => {
      console.log(error);
      this.removeFile()
      this.toggleLoading()
    };
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

        if (!isHtml || (isVideo && file.type.substring(0, 5) !== 'video')) {
          message.error(`Upload failed! The file must be in ${type} format.`);
          return false
        }
        const isLt2M = !size || file.size / 1024 < size;
        if (!isLt2M) {
          const msg = size >= 1000 ? `${size / 1024} M` : `${size}kb`
          message.error(`Failure，The file size cannot exceed ${msg}!`);
          return false
        }
        // && !isVideo
        if (isHtml && isLt2M && !isZip && ((whs.width && whs.height) || whs.isScale) || Array.isArray(whs.WH_arr)) {
          const { width, height, isScale = false, WH_arr } = whs;
          return testSize(file, whs, isVideo ? 'video' : 'img').catch((err) => {
            if (err) {
              message.error(err);
              return Promise.reject()
            }
            let msg = isScale ? `Please upload ${fileName} at ${width}:${height}` : `Please upload ${fileName} at ${width}*${height}px`
            if (WH_arr) {
              msg = `Please upload ${fileName} at ${WH_arr[0].width}*${WH_arr[0].height} or ${WH_arr[1].width}*${WH_arr[1].height}`
            }
            message.error(msg);
            return Promise.reject()
          })
        }
        if (isHtml && isLt2M && this.props.uploadBefore) {
          return this.props.uploadBefore(file);
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
        if (this.props.handleFormData) {
          this.props.handleFormData(formData);
        }
        this.toggleLoading()
        fun(formData).then(res => {
          const Rdata = res.data
          this.props.onChange(Rdata.url)
          this.toggleLoading()
          if (isZip) {
            runInAction('SET_URL', () => {
              this.previewUrl = file.name
              this.showFileSize && (this.fileSize = Rdata.file_size);
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

  @action
  viewFile = () => {
    window.open(this.props.viewUrl || this.useUrl)
    // if (this.useUrl.includes('.html')) {
    //   this.previewVisible = true
    // } else {
    //   window.open(this.props.viewUrl || this.useUrl)
    // }
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
        <Spin spinning={this.loading}>
          <Upload {...props} >
            {this.useUrl ? (
              isZip ? (
                <>
                  <div className={styles.fileBox} onClick={this.stop}>
                    <span className={styles.fileName} title={this.useUrl}>{this.useUrl}</span>
                    <MyIcon className={styles.fileIcon} type="iconguanbi" onClick={this.delClick} />
                    {
                      (this.props.viewUrl || this.props.hasView) && <Icon className={styles.fileIcon} type="eye" onClick={this.viewFile} />
                    }
                    <CopyToClipboard onCopy={this.onCopy} text={this.useUrl}><Icon className={styles.fileIcon} type="copy" /></CopyToClipboard>
                  </div>
                  {
                    this.showFileSize && <span style={{ color: '#aaa' }}>{this.getFileSize} {this.props.showUnzippedFileSize && '(Unzipped file size)'}</span>
                  }
                </>
              ) : (<div className={styles.box} onClick={this.stop} onMouseLeave={this.hideBtn}>
                <div className={styles.layer}>
                  <Button onClick={this.showLine ? this.showOnline : this.eyeClick} style={{ marginRight: 12 }} type="primary" shape="circle" icon="eye" />
                  <Button onClick={this.delClick} type="primary" shape="circle" icon="delete" />
                  {
                    this.btnVisible ? (
                      <div className={styles.onlineWrap}>
                        <div className="online" onClick={(e) => this.eyeClick(e, 1)}>Online</div>
                        <div className="offline" onClick={(e) => this.eyeClick(e, 2)} style={{ borderLeft: 'none' }}>Offline</div>
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
        </Spin>
        <Modal
          destroyOnClose
          visible={this.previewVisible}
          width={680}
          onCancel={this.handleCancel}
          title={this.title}
          footer={(this.props.fileType !== '.zip' ? (<CopyToClipboard onCopy={this.onCopy} text={this.videoUrl || this.useUrl}><Button type="primary">Copy Url</Button></CopyToClipboard>) : null)}
        >
          {
            fileType === 'video' ?
              (
                <React.Fragment>
                  <div className={styles.videoWrapper}>
                    <video width="100%" height="100%" style={{ width: '100%' }} controls autoPlay src={this.videoUrl || this.useUrl} />
                  </div>
                  <div className={styles.linkUrlWrapper}>
                    <div className={styles.label}>{this.videoType} Url</div>
                    <div className={styles.linkUrl}>{this.videoUrl || this.useUrl}</div>
                  </div>
                </React.Fragment>
              ) :
              isZip ? <iframe className={styles.frame} src={this.props.viewUrl || this.useUrl} />
                : <React.Fragment>
                  <img alt="example" style={{ maxHeight: '600px', display: 'block', margin: '0 auto', maxWidth: '100%' }} src={this.useUrl} />
                  <div className={styles.linkUrlWrapper}>
                    <div className={styles.label}> Url</div>
                    <div className={styles.linkUrl}>{this.useUrl}</div>
                  </div>
                </React.Fragment>
          }
        </Modal>
      </React.Fragment>

    )
  }
}

export default UploadFile
