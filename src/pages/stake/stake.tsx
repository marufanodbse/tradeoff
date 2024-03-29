import Input from 'antd/es/input'
import { useState } from 'react'
import { menuIcon, menuLogo } from '../../image'
import { verifyNum } from '../../utils/formatting'
import { useGlobal } from '../../context/GlobalProvider'
import { prepareWriteContract } from 'wagmi/actions'
import { erc20ABI, usdtStakeABI } from '../../abi/abi'
import BigNumber from "bignumber.js";
import { fetchBalanceObj, sendStatus } from '../../config/api'
import { maxInt256 } from 'viem'
import TipPop from '../../components/pop/TipPop'
import Head from '../../components/head'

let StakeAddr: any = process.env.REACT_APP_StakeAddr + ""
let UsdtAddr: any = process.env.REACT_APP_TOKEN_USDT + ""
function Stake() {
    const { account } = useGlobal()
    const [stakeAmount, setStakeAmount] = useState<string>("")

    const [tipOpen, setTipOpen] = useState<boolean>(false);
    const [tipOpenState, setTipOpenState] = useState<string>("loading");
    const [tipOpenText, setTipOpenText] = useState<string>("");

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
                args: [sendAmount],
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

    return (
        <div>
            <Head />
            <TipPop open={tipOpen} setOpen={setTipOpen} tipPopText={tipOpenText} tipPopState={tipOpenState} />
            <div className=' main '>
                <div className="mx-6 text-white">
                    <p className=' text-center font-bold text-2xl mb-3'>Stake</p>
                    <p className="indent-8 pb-8 text-xs">
                        BABY Social DAO致力于Web3.0、Metaverse和NFT领域，让世界各地的区块链爱好者通过寻找宝贝来重新定义资源融合。这样，区块链爱好者可以愉快地参与而不影响他们的日常生活和工作，同时获得相应的区块链财富。
                    </p>
                </div>

                <div className='mx-6 rounded-xl bg-white'>
                    <div className='px-8 pt-5 pb-5 border-b border-[#ccc] flex'>
                        <div className=' bg-1 h-16 w-16 rounded-full'>
                            <img className=' w-16 h-16 p-3' src={menuLogo} alt="" />
                        </div>
                        <div className=' flex-1 text-right mt-6'>
                            <p className='text-sm text-gray-300'>lock-up period: 100 day</p>
                            <p className='text-sm text-gray-300'>Date:2022.3.4-2022.6.10</p>
                        </div>
                    </div>
                    <div className='px-8'>
                        <div className=' pt-5 pb-2'>
                            <Input value={stakeAmount} onChange={(e) => {
                                console.log(e.target.value)
                                let valueNum = verifyNum(e.target.value)
                                setStakeAmount(valueNum)
                            }} addonAfter={<span>USDT</span>} defaultValue="0.0" />
                        </div>
                        <div className=' pb-4'>
                            <p className=' font-bold text-sm py-2 text-main'>APY 10.34%</p>
                        </div>
                        <div className=' pb-7'>
                            <div className='tradeButton py-2' onClick={() => {
                                sendStakeApprove()
                            }} >Stake</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Stake