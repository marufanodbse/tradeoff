import { useState } from 'react'
import Head from '../../components/head'
import TipPop from '../../components/pop/TipPop'
import Input from 'antd/es/input/Input';
import { verifyNum } from '../../utils/formatting';
import { fetchBalanceObj, sendStatus } from '../../config/api';
import { prepareWriteContract } from 'wagmi/actions';
import { erc20ABI, ipoABI } from '../../abi/abi';
import { useGlobal } from '../../context/GlobalProvider';
import BigNumber from "bignumber.js";
import { maxInt256 } from 'viem';

let IpoAddr: any = process.env.REACT_APP_IPOAddr + ""
let UsdtAddr: any = process.env.REACT_APP_TOKEN_USDT + ""

function Ipo() {
    const { account } = useGlobal()
    const [ipoAmount, setIpoAmount] = useState<string>("")

    const [tipOpen, setTipOpen] = useState<boolean>(false);
    const [tipOpenState, setTipOpenState] = useState<string>("loading");
    const [tipOpenText, setTipOpenText] = useState<string>("");

    const sendIpoJionApprove = async () => {
        setTipOpen(true);
        setTipOpenState("loading")
        setTipOpenText("加载中...")
        try {
            const allowanceConfig: any = await prepareWriteContract({
                address: UsdtAddr,
                abi: erc20ABI,
                functionName: 'allowance',
                args: [account, IpoAddr],
            })
            const balanceConfig: any = await fetchBalanceObj(account, UsdtAddr)

            let sendAmount = new BigNumber(ipoAmount.toString()).multipliedBy(10 ** balanceConfig.decimals).toString()
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
                    args: [IpoAddr, BigInt(maxInt256)],
                })

                let status = await sendStatus(approveConfig)

                if (status) {
                    console.log("授权成功")
                    setTipOpenText("授权成功...")
                    setTimeout(() => {
                        sendIpoJionApprove()
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
                sendIpoJion(sendAmount)
            }
        } catch (error) {
            sendTipErr()
        }
    }

    const sendIpoJion = async (sendAmount: any) => {
        try {
            const ipoConfig = await prepareWriteContract({
                address: IpoAddr,
                abi: ipoABI,
                functionName: 'join',
                args: [sendAmount, account],
            })
            console.log("ipoConfig", ipoConfig)

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

    return (<div>
        <Head />
        <TipPop open={tipOpen} setOpen={setTipOpen} tipPopText={tipOpenText} tipPopState={tipOpenState} />

        <div className='main'>
            <div className="mx-6 text-white">
                <p className=' text-center font-bold text-2xl mb-3'>巨星计划</p>
                <p className="indent-8 pb-8 text-xs  whitespace-pre-line">
                    巨星计划旨在邀请超零社区DAO道组织的核心种子用户。本期全球限额30名，自愿参与。<br /> 参与者主要权益:<br />1. 获得SOD巨星额度兑换机会；<br />  2.自动享有流动性底池份额和对应收益；<br />  3.成为DAO组织核心成员，共同参与决策，如新生态引入、社区建设和平台参数机制设定；<br />  4.作为早期聚合器构建成员获得相应未来权益。
                </p>
            </div>

            <div className='mx-6 rounded-xl bg-white'>
                <div className='px-8'>
                    <div className=' pt-6 pb-4'>
                        <Input value={ipoAmount} onChange={(e) => {
                            console.log(e.target.value)
                            let valueNum = verifyNum(e.target.value)
                            setIpoAmount(valueNum)
                        }} addonAfter={<span>USDT</span>} defaultValue="0.0" />
                    </div>

                    <div className=' pb-5'>
                        <div className='tradeButton py-2' onClick={() => {
                            sendIpoJionApprove()
                        }} >加入计划</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}

export default Ipo