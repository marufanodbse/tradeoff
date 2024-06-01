import { useEffect, useState } from 'react'
import BigNumber from "bignumber.js";
import { trimNumber } from '../../utils';
import { fetchBalanceObj } from '../../config/api';
import { zeroAddress } from 'viem';
import { fetchBalance } from 'wagmi/actions';
import { useGlobal } from '../../context/GlobalProvider';

declare const window: Window & { ethereum: any };
interface ITokenBalance {
    token: string
    addr: string
    decimalPlaces: number,
    setTokenBalance?: Function,
    change?: boolean
}

function TokenBalance({ token, addr, decimalPlaces, setTokenBalance, change }: ITokenBalance) {
    const { account, chainId } = useGlobal();
    const [decimals, setDecimals] = useState<number>(0);
    const [balance, setBalance] = useState<string>('0');

    useEffect(() => {
        if (token && account) {
            getTokenBalance()
        }
    }, [token, chainId, change, account]);

    const getTokenBalance = async () => {
        if (token == zeroAddress||token == "BNB"|| token == process.env.REACT_APP_TOKEN_BNB) {
            const balanceObj = await fetchBalance({
                address: account,
            })
            setDecimals(18);
            setBalance(balanceObj.value.toString());
            if (setTokenBalance) {
                setTokenBalance(balanceObj.value.toString())
            }
        } else {
            const balanceConfig: any = await fetchBalanceObj(account, token)
            setDecimals(balanceConfig.decimals);
            setBalance(balanceConfig.value.toString())
        };
    }

    return <>{
        trimNumber(new BigNumber(balance).dividedBy(10 ** decimals).toFixed(decimalPlaces), decimalPlaces)
    }</>
}

export default TokenBalance