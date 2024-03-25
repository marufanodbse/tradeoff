import React, { useEffect, useState } from 'react'
import { prepareWriteContract } from 'wagmi/actions'
import { fromTokenValue } from '../../utils'
import { erc20ABI } from '../../abi/abi'

function TokenPrice({ tokenAddr, value, mantissa }: { tokenAddr: string, value: any, mantissa?: number }) {
    const [price, setPrice] = useState<string>("")
    useEffect(() => {
        TokenName(tokenAddr)
    }, [tokenAddr])

    const TokenName = async (addr: any) => {
        try {
            const config: any = await prepareWriteContract({
                address: addr,
                abi: erc20ABI,
                functionName: 'decimals',
            })
            if (mantissa) {
                setPrice(fromTokenValue(value, config.result.toString(), mantissa))
            } else {
                setPrice(fromTokenValue(value, config.result.toString(), 2))
            }
        } catch (error) {
            setPrice("0")
        }
    }
    return (
        <>{price}</>
    )
}

export default TokenPrice