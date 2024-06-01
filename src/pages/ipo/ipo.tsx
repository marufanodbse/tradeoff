import { useEffect, useState } from 'react'
import Head from '../../components/head'
import TipPop from '../../components/pop/TipPop'
import Input from 'antd/es/input/Input';
import { verifyNum } from '../../utils/formatting';
import { IResponse, fetchBalanceObj, getReadData, sendStatus } from '../../config/api';
import { prepareWriteContract } from 'wagmi/actions';
import { erc20ABI, ipoABI } from '../../abi/abi';
import { useGlobal } from '../../context/GlobalProvider';
import BigNumber from "bignumber.js";
import { maxInt256, zeroAddress } from 'viem';
import { menuLogo } from '../../image';
import { fromTokenValue, removeTrailingZeros, toTokenValue } from '../../utils';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

let IpoAddr: any = process.env.REACT_APP_IPOAddr + ""
let UsdtAddr: any = process.env.REACT_APP_TOKEN_USDT + ""

function Ipo() {
    const { account } = useGlobal()
    const { t } = useTranslation()
    const [ipoAmount, setIpoAmount] = useState<string>("")

    const [tipOpen, setTipOpen] = useState<boolean>(false);
    const [tipOpenState, setTipOpenState] = useState<string>("loading");
    const [tipOpenText, setTipOpenText] = useState<string>("");

    const [managerAddr, setManagerAddr] = useState<string>("")
    const [inviters, setInviters] = useState<string>("")
    const [claimValue, setClaimValue] = useState<string>("0")
    const [releaseValue, setReleaseValue] = useState<string>("0")
    const [totalValue, setTotalValue] = useState<string>("0")

    const [invitersPop, setInvitersPop] = useState<boolean>(false);

    const [shareAddr, setShareAddrAddr] = useState<string>("")

    const [totalUsdtAmount, setTotalUsdtAmount] = useState<string>("0")

    useEffect(() => {
        getManager()
        init()
    }, [account])

    const init = () => {
        getInviters()
        getValues()
        // getTotalUsdtAmount()
    }

    const getTotalUsdtAmount = async () => {
        let { data, code }: IResponse = await getReadData("totalUsdtAmount", ipoABI, IpoAddr, [], account);
        console.log("getTotalUsdtAmount", data, code)
        if (code == 200) {
            setTotalUsdtAmount(data.toString())
        }
    }

    //values
    const getValues = async () => {
        let { data, code }: IResponse = await getReadData("values", ipoABI, IpoAddr, [account], account);
        if (code == 200) {
            setClaimValue(data[0].toString())
            setReleaseValue(data[1].toString())
            setTotalValue(data[2].toString())
        }
    }

    // inviters
    const getInviters = async () => {
        let { data, code }: IResponse = await getReadData("inviters", ipoABI, IpoAddr, [account], account);
        if (code == 200) {
            setInviters(data)
        }
    }

    // manager
    const getManager = async () => {
        let { data, code }: IResponse = await getReadData("manager", ipoABI, IpoAddr, [], account);
        if (code == 200) {
            setManagerAddr(data)
        }
    }

    const getShareAddr = async () => {
        console.log(shareAddr)
        if (shareAddr == managerAddr) {
            sendIpoJionApprove(shareAddr)
            setInvitersPop(false)
            setShareAddrAddr("")
        } else {
            try {
                let { data, code }: IResponse = await getReadData("inviters", ipoABI, IpoAddr, [shareAddr], account);
                console.log("getShareAddr", data)
                if (code == 200 && data != zeroAddress) {
                    sendIpoJionApprove(shareAddr)
                    setInvitersPop(false)
                    setShareAddrAddr("")
                } else {
                    setTipOpen(true);
                    setTipOpenState("error")
                    setTipOpenText("推荐地址错误")
                    setTimeout(() => {
                        setTipOpenState("")
                        setTipOpen(false)
                    }, 2000);
                }
            } catch (error) {
                setTipOpen(true);
                setTipOpenState("error")
                setTipOpenText("推荐地址错误")
                setTimeout(() => {
                    setTipOpenState("")
                    setTipOpen(false)
                }, 2000);
            }
        }

    }

    const sendIpoJionApprove = async (inviterAddr: any) => {
        setTipOpen(true);
        setTipOpenState("loading")
        setTipOpenText(`${t("TransactionPacking")}`)
        try {
            const allowanceConfig: any = await prepareWriteContract({
                address: UsdtAddr,
                abi: erc20ABI,
                functionName: 'allowance',
                args: [account, IpoAddr],
            })
            const balanceConfig: any = await fetchBalanceObj(account, UsdtAddr)
            console.log("balanceConfig", balanceConfig)
            let sendAmount = new BigNumber(ipoAmount.toString()).multipliedBy(10 ** balanceConfig.decimals).toString()
            if (new BigNumber(balanceConfig.value).isLessThan(sendAmount)) {
                setTipOpenState("error")
               setTipOpenText(`${t("Insufficientbalance")}`)
                setTimeout(() => {
                    setTipOpenState("")
                    setTipOpen(false)
                }, 2000);
                return
            }

            if (new BigNumber(allowanceConfig.result.toString()).isLessThan(sendAmount)) {
               setTipOpenText(`${t("Authorizing")}`)
                const approveConfig = await prepareWriteContract({
                    address: UsdtAddr,
                    abi: erc20ABI,
                    functionName: 'approve',
                    args: [IpoAddr, BigInt(maxInt256)],
                })

                let status = await sendStatus(approveConfig)

                if (status) {
                    setTipOpenText(`${t("AuthorizationSuccessful")}`)
                    setTimeout(() => {
                        sendIpoJionApprove(inviterAddr)
                    }, 1000);
                } else {
                    setTipOpenState("error")
                    setTipOpenText(`${t("AuthorizationFailed")}`)
                    setTimeout(() => {
                        setTipOpenState("")
                        setTipOpen(false)
                    }, 2000);
                }
            } else {
                sendIpoJion(sendAmount, inviterAddr)
            }
        } catch (error) {
            sendTipErr()
        }
    }

    const sendIpoJion = async (sendAmount: any, inviterAddr: any) => {
        try {
            const ipoConfig = await prepareWriteContract({
                address: IpoAddr,
                abi: ipoABI,
                functionName: 'join',
                args: [sendAmount, inviterAddr],
            })

            let status = await sendStatus(ipoConfig)

            if (status) {
                setIpoAmount("")
                sendTipSuccess()
            } else {
                sendTipErr()
            }
        } catch (error) {
            
            sendTipErr()
        }
    }

    const sendClaim = async () => {
        setTipOpen(true);
        setTipOpenState("loading")
        setTipOpenText(`${t("TransactionPacking")}`)
        try {
            const ipoConfig = await prepareWriteContract({
                address: IpoAddr,
                abi: ipoABI,
                functionName: 'claim',
            })
            console.log("ipoConfig", ipoConfig)

            let status = await sendStatus(ipoConfig)

            if (status) {
                sendTipSuccess()
            } else {
                sendTipErr()
            }
        } catch (error) {
            
            sendTipErr()
        }
    }

    const sendTipSuccess = () => {
        setTipOpenState("success")
        setTipOpenText(`${t("successfulTransaction")}`)
        setTimeout(() => {
            init();
            setTipOpen(false)
            setTipOpenState("")
        }, 2000);
    }

    const sendTipErr = () => {
        setTipOpenState("error")
        setTipOpenText(`${t("transactionFailed")}`)
        setTimeout(() => {
            setTipOpen(false)
            setTipOpenState("")
        }, 2000);
    }


    const getOutHtml = (joinAmount: any) => {
        let num = "0";
        let amount = toTokenValue(joinAmount, 18);
        let firstAmount = toTokenValue(200000, 18)
        if (new BigNumber(totalUsdtAmount).plus(amount).isLessThanOrEqualTo(firstAmount)) {
            num = removeTrailingZeros(new BigNumber(joinAmount).multipliedBy(10).toNumber(), 3)
        } else {
            if (new BigNumber(totalUsdtAmount).isLessThan(firstAmount)) {
                let lessAmount = new BigNumber(new BigNumber(firstAmount).minus(totalUsdtAmount).toString()).multipliedBy(10).toString();
                let greaterAmount = new BigNumber(new BigNumber(totalUsdtAmount).plus(amount).minus(firstAmount).toString()).multipliedBy(5).toString();

                num = removeTrailingZeros(new BigNumber(fromTokenValue(lessAmount, 18)).plus(fromTokenValue(greaterAmount, 18)).toNumber(), 3)

            } else {
                num = removeTrailingZeros(new BigNumber(joinAmount).multipliedBy(5).toNumber(), 3)
            }
        }

        return num
    }

    return (<div>
        <Head />
        <TipPop open={tipOpen} setOpen={setTipOpen} tipPopText={tipOpenText} tipPopState={tipOpenState} />
        <Modal
            className=''
            style={{
                marginTop: "-20%",
            }}
            open={invitersPop}
            centered
            onCancel={() => { setInvitersPop(false) }}
            width={"300px"}
            footer={null}
            closeIcon={null}
        >
            <div className=' mb-3' >
                <div className=' mb-2'>填写推荐人地址</div>
                <Input value={shareAddr} onChange={(e) => {
                    setShareAddrAddr(e.target.value)
                }} defaultValue="0.0" />
            </div>
            <div>
                <div className='tradeButton py-2' onClick={() => {
                    getShareAddr()
                }} >加入计划</div>
            </div>
        </Modal>

        <div className='main'>
            <div className="mx-6 text-white">
                <p className=' text-center font-bold text-2xl mb-6'>IPO</p>
            </div>
            <div className='mx-6 rounded-xl bg-white'>
                <div className='px-4 pt-4 pb-4 border-b border-[#ccc] flex'>
                    <div className=' bg-1 h-16 w-16 rounded-full'>
                        <img className=' w-16 h-16 p-3' src={menuLogo} alt="" />
                    </div>
                    <div className=' flex-1  mt-3 text-gray-500'>
                        <div className='text-sm flex'>
                            <p className=' flex-1 text-right '> 第一批IPO价格0.1USDT,数量200万</p>
                        </div>
                        <div className='text-sm flex'>
                            <p className=' flex-1 text-right '> 第二批IPO价格0.2USDT,数量300万</p>
                        </div>
                    </div>
                </div>
                <div className='px-4'>
                    <div className=' pt-5 pb-2'>
                        <Input value={ipoAmount} onChange={(e) => {
                            console.log(e.target.value)
                            let valueNum = verifyNum(e.target.value)
                            if (new BigNumber(valueNum).isGreaterThan(5000)) {
                                setIpoAmount("5000")
                            } else {
                                setIpoAmount(valueNum)
                            }
                        }} addonAfter={<span>USDT</span>} defaultValue="0.0" />
                    </div>
                    <div className=' text-xs mb-3 text-right text-gray-500'>
                        获取 {new BigNumber(ipoAmount).isZero() || ipoAmount == "" ? "0" : getOutHtml(ipoAmount)} TRO 锁定1年线性释放
                    </div>
                    <div className=' pb-3'>
                        <div className='tradeButton py-2' onClick={() => {
                            if (new BigNumber(ipoAmount).isZero() || ipoAmount == "") {
                                setTipOpen(true);
                                setTipOpenState("error")
                                setTipOpenText("数量不能为空")
                                setTimeout(() => {
                                    setTipOpenState("")
                                    setTipOpen(false)
                                }, 2000);
                                return
                            }

                            if (account == managerAddr) {
                                sendIpoJionApprove(zeroAddress)
                            } else {
                                if (inviters == zeroAddress) {
                                    setInvitersPop(true)
                                } else {
                                    sendIpoJionApprove(inviters)
                                }
                            }
                        }} >加入计划</div>
                    </div>
                </div>

                <div className=' px-4 text-sm pt-2 pb-3'>
                    <div>
                        <p>
                            <span className='text-gray-500 pr-1'> 可获得总量:</span>
                            {fromTokenValue(totalValue, 18, 3)}
                        </p>

                    </div>
                    <div >
                        <p>
                            <span className='text-gray-500 pr-1'> 已解锁数量:</span>
                            {fromTokenValue(releaseValue, 18, 3)}
                        </p>
                    </div>
                    <div className=' flex '>
                        <p className=' flex-1 leading-7'>
                            <span className='text-gray-500 pr-1'> 可领取数量:</span>
                            {fromTokenValue(claimValue, 18, 3)}
                        </p>
                        <div>
                            {
                                new BigNumber(claimValue).isZero() ? <div className='tradeButtonGray py-1 w-24'  >Claim</div> : <div className='tradeButton py-1 w-24' onClick={() => {
                                    sendClaim()
                                }} >Claim</div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}

export default Ipo