import { useNavigate } from 'react-router-dom';
import Head from '../../../components/head'
import { useGlobal } from '../../../context/GlobalProvider';
import { useEffect, useState } from 'react';
import TokenCyPop from '../../../components/pop/tokenCyPop';
import TokenName from '../../../components/token/TokenName';
import { fetchBalanceObj, getReadData } from '../../../config/api';
import { factoryABI, pairABI } from '../../../abi/abi';
import { fromTokenValue, removeDup } from '../../../utils';
import BigNumber from "bignumber.js";
import { zeroAddress } from 'viem';
import TokenBalance from '../../../components/token/tokenBalance';
import { pairData } from '../pool';
import { ArrowLeftOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import TokenIcon from '../../../components/token/tokenIcon';


const INK = process.env.REACT_APP_TOKEN_INK + "";
const USDT = process.env.REACT_APP_TOKEN_USDT + "";
const factroryAddr = process.env.REACT_APP_FACTORY + "";

function AddPair() {
    const navigate = useNavigate();
    const { account } = useGlobal()
    const [tokenA, setTokenA] = useState<string>(INK);
    const [tokenB, setTokenB] = useState<string>(USDT);

    const [tokenPopOpen, setTpkenPopOpen] = useState<boolean>(false);
    const [tokenPopOpenType, setTpkenPopOpenType] = useState<string>("in");

    const [tokenADecimals, setTokenADecimals] = useState<any>("0")
    const [tokenBDecimals, setTokenBDecimals] = useState<any>("0")

    const [tokenAReserves, setTokenAReserves] = useState<string>("0")
    const [tokenBReserves, setTokenBReserves] = useState<string>("0")

    const [accountPairAmount, setAccountPairAmount] = useState<string>("0")
    const [pairTotal, setPairTotal] = useState<string>("0")
    const [pairAddr, setPairAddr] = useState<string>("")


    const [pairList, setPairList] = useState<any>([])
    const [addPair, setAddpair] = useState<boolean>(false);

    const [change, setChange] = useState<boolean>(true);
    useEffect(() => {
        getPair(tokenA, tokenB)
        getAmountsOut(tokenA, tokenB)
    }, [tokenA, tokenB, account])

    const getPair = async (tokena: string, tokenb: string) => {
        if (tokena == "BNB") {
            tokena = process.env.REACT_APP_TOKEN_BNB + ""
        }
        if (tokenb == "BNB") {
            tokenb = process.env.REACT_APP_TOKEN_BNB + ""
        }

        let localPairData = localStorage.getItem("localPairData") + "";

        let arr = pairData

        let dataArr: any = []

        if (localPairData) {
            var newArr = removeDup(arr.concat(JSON.parse(localPairData)));
            dataArr = newArr;
        } else {
            dataArr = arr
        }
        setPairList(dataArr)

        try {
            let pairAddrData = await getReadData("getPair", factoryABI, factroryAddr, [tokena, tokenb], account);
            if (pairAddrData.code == 200) {
                let address = pairAddrData.data
                setPairAddr(address)

                if (address == zeroAddress) {
                    return
                }

                let dataIndex = dataArr.findIndex((itemData: any) => {
                    return itemData == address
                });

                if (dataIndex == -1) {
                    setAddpair(true)
                } else {
                    setAddpair(false)
                }

                let pairBalance = await getReadData("balanceOf", pairABI, address, [account], account);
                console.log("pairBalance", pairBalance)
                setAccountPairAmount(pairBalance.data.toString())
                let total = await getReadData("totalSupply", pairABI, address, [], account);
                setPairTotal(total.data.toString())
                let token0Data = await getReadData("token0", pairABI, address, [], account);
                let reserves = await getReadData("getReserves", pairABI, address, [], account);
                console.log("getReserves", reserves)
                if (tokena == token0Data.data) {
                    setTokenAReserves(reserves.data[0].toString());
                    setTokenBReserves(reserves.data[1].toString());
                } else {
                    setTokenAReserves(reserves.data[1].toString());
                    setTokenBReserves(reserves.data[0].toString());
                }
            } else {
                setPairAddr("")
                setAccountPairAmount("0");
                setPairTotal("0");
                setTokenAReserves("0");
                setTokenBReserves("0");
                return
            }
        } catch (error) {
            console.log(error)
            setPairAddr("")
            setAccountPairAmount("0");
            setPairTotal("0");
            setTokenAReserves("0");
            setTokenBReserves("0");
        }
    }

    const getAmountsOut = async (tokena: string, tokenb: string) => {
        if (tokena == "BNB") {
            tokena = process.env.REACT_APP_TOKEN_BNB + ""
        }

        if (tokenb == "BNB") {
            tokenb = process.env.REACT_APP_TOKEN_BNB + ""
        }
        try {
            let tokenAErc20 = await fetchBalanceObj(account, tokena)
            let tokenBErc20 = await fetchBalanceObj(account, tokenb)
            let tokenaDecimals = tokenAErc20.decimals
            let tokenbDecimals = tokenBErc20.decimals
            setTokenADecimals(tokenaDecimals)
            setTokenBDecimals(tokenbDecimals)
        } catch (error) {
        }
    }

    const setPairData = () => {
        let data: any = pairList
        data.push(pairAddr)
        localStorage.setItem("localPairData", JSON.stringify(removeDup(data)));
        navigate('/pool')
    }

    return (<div>
        <Head />
        <TokenCyPop open={tokenPopOpen} setOpen={setTpkenPopOpen} tokenType={tokenPopOpenType} setTokenA={setTokenA} setTokenB={setTokenB} />

        <div className="main">
            <div className='mx-6 rounded-xl bg-white px-5 py-3 mb-8'>
                <div className="flex mb-4">
                    <div onClick={() => {
                        navigate('/pool')
                    }}>
                        <ArrowLeftOutlined />
                    </div>
                    <div className="flex-1">
                        <p className=" font-medium text-center " >导入流动池</p>
                    </div>
                </div>
                <div className=" bg-1 rounded-lg  p-4 mb-4">
                    <p className="  text-sm">提示:使用此工具可查找未自动出现在界面中的流动池。</p>
                </div>

                <div className="flex  border border-1 rounded-lg  px-5 py-2 " onClick={() => {
                    setTpkenPopOpen(true)
                    setTpkenPopOpenType("in")
                }}>
                    <div className="flex-1  ">
                        <TokenName tokenAddr={tokenA} />
                    </div>
                    <div >
                        <DownOutlined />
                    </div>
                </div>

                <div className=" text-center py-2  w-full ">
                    <PlusOutlined />
                </div>

                <div className="flex  border border-1 rounded-lg  px-5 py-2 mb-4 " onClick={() => {
                    setTpkenPopOpen(true)
                    setTpkenPopOpenType("out")
                }}>
                    <div className="flex-1  ">
                        <TokenName tokenAddr={tokenB} />
                    </div>
                    <div >
                        <DownOutlined />
                    </div>
                </div>

                {
                    addPair ? <div className="tradeButton py-2" >
                        <p onClick={() => {
                            setPairData()
                        }}> 导入 </p>
                    </div> : <div className="tradeButtonGray py-2">
                        {
                            pairAddr !== zeroAddress ? <div>
                                <p>已添加流动池</p>
                            </div> : <>未找到流动池</>
                        }
                    </div>
                }
            </div>
            {
                pairAddr !== zeroAddress ? <div className="mx-6 rounded-xl bg-white px-5 py-3 mb-8">
                    <div>
                        <p className=" font-medium"> 您的流动资金仓位</p>
                    </div>
                    <div className="flex  py-2 ">
                        <div className="flex-1 ">
                            <div className="flex text-sm">
                                <div className='flex'>
                                    <div className='tokenA'>
                                        <TokenIcon tokenAddr={tokenA + ""} />
                                    </div>
                                    <div className=' relative z-10  -left-2'>
                                        <TokenIcon tokenAddr={tokenB + ""} />
                                    </div>
                                </div>
                                <div className="leading-6">
                                    <TokenName tokenAddr={tokenA + ""} /> / <TokenName tokenAddr={tokenB + ""} />
                                </div>
                            </div>
                        </div>
                        <div className="text-sm leading-6"><TokenBalance token={pairAddr} addr={account + ""} decimalPlaces={6} change={change} /></div>
                    </div>
                    <div className="flex  text-sm">
                        <div className="flex-1">您的流动池份额:</div>
                        <div>
                            {accountPairAmount == "0" ? 0 : new BigNumber(accountPairAmount).multipliedBy(100).dividedBy(pairTotal).toFixed(3)}%
                        </div>
                    </div>
                    <div className="flex  text-sm">
                        <div className="flex-1"><TokenName tokenAddr={tokenA + ""} />:</div>
                        <div>
                            {
                                fromTokenValue(new BigNumber(tokenAReserves).multipliedBy(accountPairAmount).dividedBy(pairTotal).toFixed(), Number(tokenADecimals), 3)
                            }
                        </div>
                    </div>
                    <div className="flex  text-sm">
                        <div className="flex-1"><TokenName tokenAddr={tokenB + ""} />:</div>
                        <div>
                            {
                                fromTokenValue(new BigNumber(tokenBReserves).multipliedBy(accountPairAmount).dividedBy(pairTotal).toFixed(), Number(tokenBDecimals), 3)
                            }
                        </div>
                    </div>
                </div> : <></>
            }

        </div>
    </div>)
}

export default AddPair