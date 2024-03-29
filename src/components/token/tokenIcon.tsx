import { useEffect, useState } from 'react'
import { bnbIcon, notFundIcon, usdtIcon } from '../../image/tokenIcon/tokenIcon';
import { fetchBalanceObj } from '../../config/api';
import { useGlobal } from '../../context/GlobalProvider';

interface ITokenIcon {
    tokenAddr: string
}
function TokenIcon({ tokenAddr }: ITokenIcon) {
    const { account } = useGlobal();
    const [name, setName] = useState<string>();

    useEffect(() => {
        if (tokenAddr) {
            getName();
        }
    }, [name, tokenAddr]);

    const getName = async () => {
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
    };

    const getHtml = (str: string) => {
        let html;
        if (str == "BNB") {
            html = <img className=' w-6 h-6 rounded-full' src={bnbIcon} alt="" />;
        } else if (str == "USDT") {
            html = <img className=' w-6 h-6 rounded-full' src={usdtIcon} alt="" />;
        } else if (str == "notFund") {
            html = <img className=' w-6 h-6 rounded-full' src={notFundIcon} alt="" />
        } else {
            html = <img className=' w-6 h-6 rounded-full' src={notFundIcon} alt="" />
        }
        return html;
    }

    return (<>
        {
            name && getHtml(name)
        }
    </>
    )
}

export default TokenIcon