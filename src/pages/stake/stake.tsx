import Input from 'antd/es/input'
import { useEffect, useState } from 'react'
import { menuIcon, menuLogo } from '../../image'
import { verifyNum } from '../../utils/formatting'
import { useGlobal } from '../../context/GlobalProvider'
import { prepareWriteContract } from 'wagmi/actions'
import { erc20ABI, usdtStakeABI } from '../../abi/abi'
import BigNumber from "bignumber.js";
import { IResponse, fetchBalanceObj, getReadData, isAddress, sendStatus } from '../../config/api'
import { maxInt256, zeroAddress } from 'viem'
import TipPop from '../../components/pop/TipPop'
import Head from '../../components/head'
import { useNavigate, useParams } from 'react-router-dom'
import { Modal, Select } from 'antd'
import { getTimePeriod } from '../../utils'
const { Option } = Select;
let StakeAddr: any = process.env.REACT_APP_StakeAddr + ""
let UsdtAddr: any = process.env.REACT_APP_TOKEN_USDT + ""
function Stake() {
    const { account } = useGlobal()
    const navigate = useNavigate();
    const params = useParams()

    const [stakeAmount, setStakeAmount] = useState<string>("")

    const [tipOpen, setTipOpen] = useState<boolean>(false);
    const [tipOpenState, setTipOpenState] = useState<string>("loading");
    const [tipOpenText, setTipOpenText] = useState<string>("");

    const [registerOpen, setRegisterOpen] = useState<boolean>(false);
    const [registerAddress, setRegisterAddress] = useState<string>("");

    const [isTop, setIsTop] = useState<boolean>(false);
    const [invitersAddress, setInvitersAddress] = useState<string>("");

    const [stakeType, setStakeType] = useState<string>("0");

    const [shareAddr, setShareAddr] = useState<string>("");

    useEffect(() => {
        init()
        if (params.shareAddress) {
            if (isAddress(params.shareAddress) && params.shareAddress !== zeroAddress) {
                setShareAddr(params.shareAddress)
            } else {
                setShareAddr("")
            }
        } else {
            setShareAddr("")
        }
    }, [account])

    const init = async () => {
        getIsTopers()
        getInviters()
    }

    useEffect(() => {
        if (isTop || invitersAddress !== zeroAddress) {
            setRegisterOpen(false)
            setRegisterAddress("")
        } else {
            if (shareAddr !== "") {
                setRegisterAddress(shareAddr)
                setRegisterOpen(true)
            } else {
                setRegisterOpen(false)
                setRegisterAddress("")
            }
        }
    }, [isTop, invitersAddress, shareAddr])

    // isTopers
    const getIsTopers = async () => {
        let { data, code }: IResponse = await getReadData("isTopers", usdtStakeABI, StakeAddr, [account], account);
        console.log("getIsTopers", code, data)
        if (code == 200) {
            setIsTop(data)
        }
    }

    // inviters
    const getInviters = async () => {
        let { data, code }: IResponse = await getReadData("inviters", usdtStakeABI, StakeAddr, [account], account);
        console.log("getInviters", code, data)
        if (code == 200) {
            setInvitersAddress(data)
        }
    }


    const sendStakeApprove = async () => {
        setTipOpen(true);
        setTipOpenState("loading")
        setTipOpenText("加载中...")
        try {
            const allowanceConfig: any = await prepareWriteContract({
                address: UsdtAddr,
                abi: erc20ABI,
                functionName: 'allowance',
                args: [account, StakeAddr],
            })
            const balanceConfig: any = await fetchBalanceObj(account, UsdtAddr)

            let sendAmount = new BigNumber(stakeAmount.toString()).multipliedBy(10 ** balanceConfig.decimals).toString()
            if (new BigNumber(balanceConfig.value).isLessThan(sendAmount)) {
                console.log("余额不足")
                setTipOpenState("error")
                setTipOpenText("余额不足")
                setTimeout(() => {
                    setTipOpenState("")
                    setTipOpen(false)
                }, 2000);
                return
            }

            if (new BigNumber(allowanceConfig.result.toString()).isLessThan(sendAmount)) {
                setTipOpenText("授权中...")
                const approveConfig = await prepareWriteContract({
                    address: UsdtAddr,
                    abi: erc20ABI,
                    functionName: 'approve',
                    args: [StakeAddr, BigInt(maxInt256)],
                })

                let status = await sendStatus(approveConfig)

                if (status) {
                    console.log("授权成功")
                    setTipOpenText("授权成功...")
                    setTimeout(() => {
                        sendStakeApprove()
                    }, 1000);
                } else {
                    setTipOpenState("error")
                    setTipOpenText("授权失败")
                    setTimeout(() => {
                        setTipOpenState("")
                        setTipOpen(false)
                    }, 2000);
                }
            } else {
                sendStake(sendAmount)
            }
        } catch (error) {
            sendTipErr()
        }
    }

    const sendStake = async (sendAmount: any) => {
        try {
            const stakeConfig = await prepareWriteContract({
                address: StakeAddr,
                abi: usdtStakeABI,
                functionName: 'stake',
                args: [sendAmount, stakeType],
            })
            console.log("stakeConfig", stakeConfig)

            let status = await sendStatus(stakeConfig)

            if (status) {
                setStakeAmount("")
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
        setTipOpenText("交易成功")
        setTimeout(() => {
            navigate('/myStake')
            setTipOpen(false)
            setTipOpenState("")
        }, 2000);
    }

    const sendTipErr = () => {
        setTipOpenState("error")
        setTipOpenText("交易失败")
        setTimeout(() => {
            setTipOpen(false)
            setTipOpenState("")
        }, 2000);
    }

    const sendRegister = async () => {
        setTipOpen(true);
        setTipOpenState("loading")
        setTipOpenText("加载中...")
        try {
            const stakeConfig = await prepareWriteContract({
                address: StakeAddr,
                abi: usdtStakeABI,
                functionName: 'register',
                args: [registerAddress],
                account: account
            })
            console.log("stakeConfig", stakeConfig)
            setTipOpenText("注册中...")
            let status = await sendStatus(stakeConfig)

            if (status) {
                setTipOpenState("success")
                setTipOpenText("注册成功")
                setRegisterAddress("")
                setRegisterOpen(false)
                setTimeout(() => {
                    init()
                    setTipOpen(false)
                    setTipOpenState("")
                }, 2000);
            } else {
                setTipOpenState("error")
                setTipOpenText("注册失败")
                setTimeout(() => {
                    setTipOpen(false)
                    setTipOpenState("")
                }, 2000);
            }
        } catch (error) {
            setTipOpenState("error")
            setTipOpenText("注册失败")
            setTimeout(() => {
                setTipOpen(false)
                setTipOpenState("")
            }, 2000);
        }
    }

    const selectBefore = (
        <Select value={stakeType} onChange={(e) => {
            console.log(e)
            setStakeType(e)
        }}>
            <Option value="0">90 天</Option>
            <Option value="1">180 天</Option>
            <Option value="2">360 天</Option>
        </Select>
    );

    return (
        <div>
            <Head />
            <TipPop open={tipOpen} setOpen={setTipOpen} tipPopText={tipOpenText} tipPopState={tipOpenState} />
            <Modal zIndex={1000} open={registerOpen}
                style={{
                    marginTop: "20%",
                    maxWidth: "350px"
                }}
                onCancel={() => { setRegisterOpen(false) }}
                title="填写推荐人"
                footer={null}
            >
                <div >
                    <div className=' mb-5'>
                        <Input value={registerAddress} onChange={(e) => {
                            setRegisterAddress(e.target.value)
                        }} />
                    </div>
                    <div>
                        <div className='tradeButton py-2' onClick={() => {
                            sendRegister()
                        }} >确定</div>
                    </div>
                </div>
            </Modal>
            <div className=' main '>
                <div className="mx-6 text-white">
                    <p className=' text-center font-bold text-2xl mb-6'>STAKE</p>
                </div>

                <div className='mx-6 rounded-xl bg-white'>
                    <div className='px-4 pt-4 pb-4 border-b border-[#ccc] flex'>
                        <div className=' bg-1 h-16 w-16 rounded-full'>
                            <img className=' w-16 h-16 p-3' src={menuLogo} alt="" />
                        </div>
                        <div className=' flex-1  mt-3 text-gray-500'>
                            <div className='text-sm flex'>
                                <p className=' flex-1 text-right '>lock-up period: {stakeType == "0" ? 90 : stakeType == "1" ? 180 : 360} day</p>
                            </div>
                            <div className='text-sm flex'>
                                <p className=' flex-1 text-right'>  Date: {getTimePeriod(stakeType == "0" ? 90 : stakeType == "1" ? 180 : 360)}</p>
                            </div>
                        </div>
                    </div>
                    <div className='px-4'>
                        <div className=' pt-5 pb-2'>
                            <Input addonBefore={selectBefore} value={stakeAmount} onChange={(e) => {
                                console.log(e.target.value)
                                let valueNum = verifyNum(e.target.value)
                                setStakeAmount(valueNum)
                            }} addonAfter={<span>USDT</span>} defaultValue="0.0" />
                        </div>
                        <div className=' pb-4'>
                            <p className=' text-xs py-2 text-gray-500'>3千万TRO用于USDT质押挖矿，按10年线性产出, 按质押量加权平分每天产出</p>
                        </div>

                        {
                            isTop || invitersAddress !== zeroAddress ? <div className=' pb-7'>
                                <div className='tradeButton py-2' onClick={() => {
                                    sendStakeApprove()
                                }} >Stake</div>
                            </div> : <div className=' pb-5'>
                                <div className='tradeButtonGray py-2' onClick={() => {
                                    setTipOpen(true);
                                    setTipOpenState("error")
                                    setTipOpenText("请先注册！")
                                    setTimeout(() => {
                                        setTipOpenState("")
                                        setTipOpen(false)
                                    }, 2000);
                                }} >Stake</div>
                            </div>
                        }

                        {
                            isTop || invitersAddress !== zeroAddress ? <></> : <div className=' pb-7'>
                                <div className='tradeButton py-2' onClick={() => {
                                    setRegisterOpen(true)
                                }} >注册</div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div >

    )
}

export default Stake