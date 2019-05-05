import * as React from 'react'
import { observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Row, Col, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'

interface IProps {
  onCancel: () => void
  onSubmit: (data) => Promise<any>
  editData: any
}

@observer
class POP extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false

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
            onSubmit(values)
          } catch (err) { }
          this.toggleLoading()
        }
      }
    )
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
      unavaiab_marked_words_up = '',
      unavaiab_marked_words_down = '',
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
                      initialValue: unavaiab_marked_words_up,
                      rules: [
                        {
                          required: true, message: "Required"
                        }
                      ]
                    })(<Input placeholder='Oops ! Connection failed' />)}
                  </Form.Item>
                </div>
                <div className="li">
                  <Form.Item>
                    {getFieldDecorator('unavaiab_marked_words_down', {
                      initialValue: unavaiab_marked_words_down,
                      rules: [
                        {
                          required: true, message: "Required"
                        }
                      ]
                    })(<Input placeholder='Try later or download now' />)}
                  </Form.Item>

                </div>
                <div className="bigLi li">
                  <div className="fl">LOGO</div>
                  <div className="fr">
                    <div className="top">
                      Adventure Capitalist
                    </div>
                    <div className="bottom">
                      <Form.Item>
                        {getFieldDecorator('unavaiab_marked_text', {
                          initialValue: unavaiab_marked_text,
                          rules: [
                            {
                              required: true, message: "Required"
                            }
                          ]
                        })(<Input placeholder='Download' />)}
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
                    <div className="bottom">
                      <Form.Item>
                        {getFieldDecorator('marked_text', {
                          initialValue: marked_text,
                          rules: [
                            {
                              required: true, message: "Required"
                            }
                          ]
                        })(<Input placeholder='Download' />)}
                      </Form.Item>

                    </div>
                  </div>
                </div>
                <div className="li">
                  <Form.Item>
                    {getFieldDecorator('marked_words_up', {
                      initialValue: marked_words_up,
                      rules: [
                        {
                          required: true, message: "Required"
                        }
                      ]
                    })(<Input placeholder='Win %s %s now!' />)}
                  </Form.Item>
                </div>
                <div className="li">
                  <Form.Item>
                    {getFieldDecorator('marked_words_down', {
                      initialValue: marked_words_down,
                      rules: [
                        {
                          required: true, message: "Required"
                        }
                      ]
                    })(<Input placeholder='Return to game for rewards?' />)}
                  </Form.Item>
                </div>
                <div className="li btnGroup">
                  <div className="flbtn btn">
                    <Form.Item>
                      {getFieldDecorator('marked_button_up', {
                        initialValue: marked_button_up,
                        rules: [
                          {
                            required: true, message: "Required"
                          }
                        ]
                      })(<Input placeholder='Yes' />)}
                    </Form.Item>
                  </div>
                  <div className="frbtn btn">
                    <Form.Item>
                      {getFieldDecorator('marked_button_down', {
                        initialValue: marked_button_down,
                        rules: [
                          {
                            required: true, message: "Required"
                          }
                        ]
                      })(<Input placeholder='Quit' />)}
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
                    </div>
                    <div className="bottom">
                      <Form.Item>
                        {getFieldDecorator('pl_text', {
                          initialValue: pl_text,
                          rules: [
                            {
                              required: true, message: "Required"
                            }
                          ]
                        })(<Input placeholder='Download' />)}
                      </Form.Item>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Button type="primary" className='submitBtn' onClick={this.submit}>Submit</Button>
        <Button className='cancelBtn' onClick={this.props.onCancel}>Last Step</Button>
      </div>
    )
  }
}

export default Form.create<IProps>()(POP)
