import { useEffect, useState } from "react"
import BigNumber from "bignumber.js";
import { fromTokenValue, removeTrailingZeros, trimNumber } from "../../utils";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "../../context/GlobalProvider";
import { fetchBalanceObj, getReadData } from "../../config/api";
import { pairABI } from "../../abi/abi";
import TokenName from "../../components/token/TokenName";
import { DownOutlined } from "@ant-design/icons";
import TokenIcon from "../../components/token/tokenIcon";

interface IPairItem {
    pairaddr: string
}

function PairItem({ pairaddr }: IPairItem) {
    const navigate = useNavigate();
    const { account } = useGlobal()

    const [tokenA, setTokenA] = useState<string>("");
    const [tokenB, setTokenB] = useState<string>("");

    const [accountPairAmount, setAccountPairAmount] = useState<string>("0")
    const [pairTotal, setPairTotal] = useState<string>("0")

    const [tokenAReserves, setTokenAReserves] = useState<string>("0")
    const [tokenBReserves, setTokenBReserves] = useState<string>("0")

    const [tokenADecimals, setTokenADecimals] = useState<any>("0")
    const [tokenBDecimals, setTokenBDecimals] = useState<any>("0")

    const [open, setOpen] = useState<boolean>(false)

    useEffect(() => {
        console.log("PairItem", pairaddr)
        getPair(pairaddr)
    }, [])

    const getPair = async (pairaddr: string) => {
        try {

            let pairBalance = await getReadData("balanceOf", pairABI, pairaddr, [account], account);
            console.log("pairBalance", pairBalance)

            setAccountPairAmount(pairBalance.data.toString())
            let total = await getReadData("totalSupply", pairABI, pairaddr, [], account);
            setPairTotal(total.data.toString())
            let token0Data = await getReadData("token0", pairABI, pairaddr, [], account);
            setTokenA(token0Data.data)
            let token1Data = await getReadData("token1", pairABI, pairaddr, [], account);
            setTokenB(token1Data.data)
            let tokenAErc20 = await fetchBalanceObj(account, token0Data.data)
            let tokenBErc20 = await fetchBalanceObj(account, token1Data.data)
            let tokenaDecimals = tokenAErc20.decimals
            let tokenbDecimals = tokenBErc20.decimals
            setTokenADecimals(tokenaDecimals)
            setTokenBDecimals(tokenbDecimals)

            let reserves = await getReadData("getReserves", pairABI, pairaddr, [], account);

            setTokenAReserves(reserves.data[0].toString());
            setTokenBReserves(reserves.data[1].toString());
        } catch (error) {
            console.log(error)
            setAccountPairAmount("0");
            setPairTotal("0");
            setTokenAReserves("0");
            setTokenBReserves("0");
        }
    }
    return (<>
        {
            new BigNumber(accountPairAmount).isZero() ? <></> : <div className="mx-6 rounded-xl bg-white p-2 mb-3">
                <div className="flex px-2">
                    <div className=" flex-1 flex  " >
                        <div className='flex'>
                            <div className='tokenA'>
                                <TokenIcon tokenAddr={tokenA + ""} />
                            </div>
                            <div className=' relative z-10  -left-2'>
                                <TokenIcon tokenAddr={tokenB + ""} />
                            </div>
                        </div>

                        <div className=" font-medium">
                            <span className=" relative">
                                <TokenName tokenAddr={tokenA} /> /  <TokenName tokenAddr={tokenB} />
                            </span>
                        </div>
                    </div>
                    <div onClick={() => {
                        setOpen(!open)
                    }} className=" cursor-pointer" >
                        <DownOutlined />
                    </div>
                </div>
                {
                    open &&
                    <div className=" text-sm">
                        <div className="flex pt-3" >
                            <div className="flex-1">您的流动池代币总额(LP):</div>
                            <div>
                                {accountPairAmount == "0" ? 0 : trimNumber(fromTokenValue(accountPairAmount, 18, 6), 3)}
                            </div>
                        </div>
                        <div className="flex  " >
                            <div className="flex-1">流动池汇集 <TokenName tokenAddr={tokenA} />:</div>
                            <div>
                                {
                                    trimNumber(fromTokenValue(new BigNumber(tokenAReserves).multipliedBy(accountPairAmount).dividedBy(pairTotal).toFixed(), Number(tokenADecimals), 3), 3)
                                }
                            </div>
                        </div>

                        <div className="flex  " >
                            <div className="flex-1">流动池汇集 <TokenName tokenAddr={tokenB} />:</div>
                            <div>
                                {
                                    trimNumber(fromTokenValue(new BigNumber(tokenBReserves).multipliedBy(accountPairAmount).dividedBy(pairTotal).toFixed(), Number(tokenBDecimals), 3), 3)
                                }
                            </div>
                        </div>

                        <div className="flex ">
                        <div className="flex-1">您的流动池份额:</div>
                            <div>
                                {accountPairAmount == "0" ? 0 :removeTrailingZeros(new BigNumber(accountPairAmount).multipliedBy(100).dividedBy(pairTotal).toNumber(), 3)}%
                            </div>
                        </div>

                        <div className=" flex mt-4">
                            <div className=" flex-1 tradeButton py-1"
                                onClick={() => {
                                    navigate('/pool/add/' + tokenA + '/' + tokenB);
                                }}
                            > 添加</div>
                            <div className=" w-10"></div>
                            <div className="flex-1 tradeButton py-1" onClick={() => {
                                navigate('/pool/remove/' + tokenA + '/' + tokenB);
                            }}> 去除</div>
                        </div>
                    </div>
                }
            </div>
        }
    </>)
}

export default PairItem