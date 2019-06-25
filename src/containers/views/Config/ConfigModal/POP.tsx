import * as React from 'react'
import { observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Row, Col, Button, Icon, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'

interface IProps {
  onCancel: (data?) => void
  onSubmit: (data) => Promise<any>
  editData: any
  shouldSave?: boolean
}

@observer
class POP extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  private confirmModal

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  submit = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }
    const { onSubmit, form } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        if (!err) {
          this.toggleLoading()
          try {
            // this.confirmModal ? this.props.onCancel(values) : onSubmit(values)
            onSubmit(values)
          } catch (err) { }
          this.toggleLoading()
        }
      }
    )
  }

  lastStep = () => {
    this.confirmModal = Modal.confirm({
      okText: 'Yes',
      cancelText: 'No',
      content: 'Save the Settings of this page?',
      onCancel: () => {
        this.props.onCancel()
        setImmediate(() => {
          this.confirmModal.destroy()
        })
      },
      onOk: () => {
        this.props.onCancel(true)
        setImmediate(() => {
          this.confirmModal.destroy()
        })
      }
    })
  }

  render() {
    const { form, editData } = this.props
    const { getFieldDecorator } = form
    const {
      marked_words_up = '',
      marked_words_down = '',
      marked_text = '',
      marked_button_up = '',
      marked_button_down = '',
      unavaiab_marked_words_up = 'Oops ! Connection failed',
      unavaiab_marked_words_down = 'Try later or download now',
      unavaiab_marked_text = '',
      pl_text = ''
    } = editData || {}
    return (
      <div className='POP'>
        <Row>
          <Col span={9} offset={1}>
            <div className="popBox">
              <div className="title"><span>Unavaiab Pop Set</span> <span className='sanjiao'></span> </div>
              <div className="card">
                <div className="li">
                  <Form.Item>
                    {getFieldDecorator('unavaiab_marked_words_up', {
                      initialValue: unavaiab_marked_words_up || 'Oops ! Connection failed',
                      rules: [
                        {
                          required: true, message: "Required"
                        }
                      ]
                    })(<Input autoComplete="off" placeholder='Oops ! Connection failed' />)}
                  </Form.Item>
                </div>
                <div className="li">
                  <Form.Item>
                    {getFieldDecorator('unavaiab_marked_words_down', {
                      initialValue: unavaiab_marked_words_down || 'Try later or download now',
                      rules: [
                        {
                          required: true, message: "Required"
                        }
                      ]
                    })(<Input autoComplete="off" placeholder='Try later or download now' />)}
                  </Form.Item>

                </div>
                <div className="bigLi li">
                  <div className="fl">LOGO</div>
                  <div className="fr">
                    <div className="top">
                      Adventure Capitalist
                    </div>
                    <div className="star">
                      <Icon type="star" /><Icon type="star" /><Icon type="star" /><Icon type="star" />
                    </div>
                    <div className="bottom">
                      <Form.Item>
                        {getFieldDecorator('unavaiab_marked_text', {
                          initialValue: unavaiab_marked_text || 'Download',
                          rules: [
                            {
                              required: true, message: "Required"
                            }
                          ]
                        })(<Input autoComplete="off" placeholder='Download' />)}
                      </Form.Item>

                    </div>
                  </div>
                </div>
              </div>
            </div>

          </Col>
          <Col span={9} offset={4}>
            <div className="popBox2">
              <div className="title"><span> Unreached reward Set</span>  <span className='sanjiao'></span></div>
              <div className="card">
                <div className="bigLi li xiaoLi">
                  <div className="fl">LOGO</div>
                  <div className="fr">
                    <div className="top">
                      Adventure Capitalist
                    </div>
                    <div className="star">
                      <Icon type="star" /><Icon type="star" /><Icon type="star" /><Icon type="star" />
                    </div>
                    <div className="bottom">
                      <Form.Item>
                        {getFieldDecorator('marked_text', {
                          initialValue: marked_text || 'Download',
                          rules: [
                            {
                              required: true, message: "Required"
                            }
                          ]
                        })(<Input autoComplete="off" placeholder='Download' />)}
                      </Form.Item>

                    </div>
                  </div>
                </div>
                <div className="li">
                  <Form.Item>
                    {getFieldDecorator('marked_words_up', {
                      initialValue: marked_words_up || 'Win %s %s now!',
                      rules: [
                        {
                          required: true, message: "Required"
                        }
                      ]
                    })(<Input autoComplete="off" placeholder='Win %s %s now!' />)}
                  </Form.Item>
                </div>
                <div className="li">
                  <Form.Item>
                    {getFieldDecorator('marked_words_down', {
                      initialValue: marked_words_down || 'Return to game for rewards?',
                      rules: [
                        {
                          required: true, message: "Required"
                        }
                      ]
                    })(<Input autoComplete="off" placeholder='Return to game for rewards?' />)}
                  </Form.Item>
                </div>
                <div className="li btnGroup">
                  <div className="flbtn btn">
                    <Form.Item>
                      {getFieldDecorator('marked_button_up', {
                        initialValue: marked_button_up || 'Yes',
                        rules: [
                          {
                            required: true, message: "Required"
                          }
                        ]
                      })(<Input autoComplete="off" placeholder='Yes' />)}
                    </Form.Item>
                  </div>
                  <div className="frbtn btn">
                    <Form.Item>
                      {getFieldDecorator('marked_button_down', {
                        initialValue: marked_button_down || 'Quit',
                        rules: [
                          {
                            required: true, message: "Required"
                          }
                        ]
                      })(<Input autoComplete="off" placeholder='Quit' />)}
                    </Form.Item>

                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col span={9} offset={1}>
            <div className="popBox3">
              <div className="title"> <span>IGE POP Set</span>  <span className='sanjiao'></span></div>
              <div className="card">
                <div className="li">
                  <div className="fl">LOGO</div>
                  <div className="fr">
                    <div className="top">
                      Adventure
                      <div className="star">
                        <Icon type="star" /><Icon type="star" /><Icon type="star" /><Icon type="star" />
                      </div>
                    </div>

                    <div className="bottom">
                      <Form.Item>
                        {getFieldDecorator('pl_text', {
                          initialValue: pl_text || 'Download',
                          rules: [
                            {
                              required: true, message: "Required"
                            }
                          ]
                        })(<Input autoComplete="off" placeholder='Download' />)}
                      </Form.Item>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Button type="primary" className='submitBtn' onClick={this.submit}>Submit</Button>
        <Button className='cancelBtn' onClick={this.lastStep}>Last Step</Button>
      </div>
    )
  }
}

export default Form.create<IProps>()(POP)
