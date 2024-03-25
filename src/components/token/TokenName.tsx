import React, { useEffect, useState } from 'react'
import { prepareWriteContract } from 'wagmi/actions'
import { erc20ABI } from '../../abi/abi'

function TokenName({ tokenAddr }: { tokenAddr: string }) {
    const [name, setName] = useState<string>("")
    useEffect(() => {
        TokenName(tokenAddr)
    }, [tokenAddr])
    const TokenName = async (addr: any) => {
        try {
            const config: any = await prepareWriteContract({
                address: addr,
                abi: erc20ABI,
                functionName: 'symbol',
            })
            setName(config.result)
        } catch (error) {
            setName("")
        }
    }
    return (
        <>{name}</>
    )
}

export default TokenName