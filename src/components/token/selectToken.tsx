import React from 'react'
import TokenIcon from './tokenIcon'
import TokenName from './TokenName'
import { DownOutlined } from '@ant-design/icons'

interface ISelectToken {
    tokenAddr: string
}

function SelectToken({ tokenAddr }: ISelectToken) {
    return (
        <>
            <TokenIcon tokenAddr={tokenAddr + ""} />
            <p className=" mx-1 leading-6">
                <TokenName tokenAddr={tokenAddr} />
            </p>
            <DownOutlined />
        </>

    )
}

export default SelectToken