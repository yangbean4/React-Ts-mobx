import React from 'react'
import PortalsBtn from '@components/portalsBtn'
import { Button, message } from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'

export default () => {
    const path = (process.env.NODE_ENV === 'development' ? '/' : '/dist/') + '#/chart';
    const url = window.location.origin + path;
    return <div>
        <PortalsBtn querySelector='#IWillUseHelp'>
            <CopyToClipboard onCopy={() => message.success('copy success')} text={url}>
                <Button type="primary" size="small">Copy Url</Button>
            </CopyToClipboard>
        </PortalsBtn>
        <iframe src={path} style={{ width: '100%', border: 'none', borderRadius: 6 }}></iframe>
    </div>
}
