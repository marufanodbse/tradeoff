import { useEffect, useState } from 'react'
import { fetchBalanceObj } from '../../config/api'
import { useGlobal } from '../../context/GlobalProvider';

function TokenName({ tokenAddr }: { tokenAddr: string }) {
    const { account } = useGlobal();
    const [name, setName] = useState<string>("")
    useEffect(() => {
        if (tokenAddr) {
            TokenName(tokenAddr)
        }
    }, [name, tokenAddr])
    const TokenName = async (addr: any) => {
        if (tokenAddr == "BNB" || tokenAddr == process.env.REACT_APP_TOKEN_BNB) {
            setName("BNB");
        } else {
            try {
                const balanceConfig: any = await fetchBalanceObj(account, tokenAddr)
                setName(balanceConfig.symbol)
            } catch (error) {
                setName("notFund")
            }
        }
    }
    return (
        <>{name && name}</>
    )
}

export default TokenName