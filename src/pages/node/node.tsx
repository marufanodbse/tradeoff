import { useEffect, useState } from 'react'
import Head from '../../components/head'
import TipPop from '../../components/pop/TipPop'
import Input from 'antd/es/input/Input';
import { IResponse, fetchBalanceObj, getReadData, sendStatus } from '../../config/api';
import { prepareWriteContract } from 'wagmi/actions';
import { erc20ABI, nodeABI } from '../../abi/abi';
import { useGlobal } from '../../context/GlobalProvider';
import BigNumber from "bignumber.js";
import { isAddress, maxInt256, zeroAddress } from 'viem';
import { copyIcon, menuLogo } from '../../image';
import { formatAccount, fromTokenValue } from '../../utils';
import { Modal } from 'antd';
import TokenName from '../../components/token/TokenName';
import { useParams } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import { verifyInt } from '../../utils/formatting';
import { useTranslation } from 'react-i18next';

let IpoAddr: any = process.env.REACT_APP_IPOAddr + ""
let UsdtAddr: any = process.env.REACT_APP_TOKEN_USDT + ""
let NodeAddr: any = process.env.REACT_APP_NODEAddr + ""
let REWARD = process.env.REACT_APP_TOKEN_REWARD + "";
const link = process.env.REACT_APP_LINK + "";

function Node() {
    const { account } = useGlobal()
    const params = useParams()
    const { t } = useTranslation()
    const [tipOpen, setTipOpen] = useState<boolean>(false);
    const [tipOpenState, setTipOpenState] = useState<string>("loading");
    const [tipOpenText, setTipOpenText] = useState<string>("");

    const [inviters, setInviters] = useState<string>("")
    const [invitersPop, setInvitersPop] = useState<boolean>(false);

    const [stakeAmount, setStakeAmount] = useState<string>("0")
    const [nodeEndTime, setNodeEndTime] = useState<string>("0")
    const [nodeStartTime, setNodeStartTime] = useState<string>("0")
    const [nodeValue, setNodeValue] = useState<string>("0")
    const [rewardValueAmount, setRewardValueAmount] = useState<string>("0")

    const [mystakeValue, setMyStakeValue] = useState<string>("0")
    const [allStakeValue, setAllStakeValue] = useState<string>("0")

    const [stakeTime, setStakeTime] = useState<string>("0")
    const [releaseTime, setReleaseTime] = useState<string>("0")
    const [feeRate, setFeeRate] = useState<string>("")

    useEffect(() => {
        init()
        if (params.shareAddress) {
            if (isAddress(params.shareAddress) && params.shareAddress !== zeroAddress) {
                setInviters(params.shareAddress)
            } else {
                setInviters("")
            }
        } else {
            setInviters("")
        }
    }, [account])

    const init = () => {
        getStakeAmount()
        getSTAKE_PERIOD()
        getRELEASE_PERIOD()
        getRewardPool()
        if (account) {
            getNodeInfo()
            getStakeValue()
            getRewardValue()
        }
    }

    // stakeValue
    const getStakeValue = async () => {
        let { data, code }: IResponse = await getReadData("stakeValue", nodeABI, NodeAddr, [account], account);
        if (code == 200) {
            setMyStakeValue(data[0].toString())
            setAllStakeValue(data[1].toString())
        }
    }
    // rewardPool
    const getRewardPool = async () => {
        let { data, code }: IResponse = await getReadData("rewardPool", nodeABI, NodeAddr, [], account);
    }
    // rewardPool
    const getRewardValue = async () => {
        let { data, code }: IResponse = await getReadData("rewardValue", nodeABI, NodeAddr, [account], account);
        if (code == 200) {
            setRewardValueAmount(data.toString())
        }
    }

    // stakeAmount
    const getStakeAmount = async () => {
        let { data, code }: IResponse = await getReadData("stakeAmount", nodeABI, NodeAddr, [], account);
        if (code == 200) {
            setStakeAmount(data.toString())
        }
    }

    // STAKE_PERIOD
    const getSTAKE_PERIOD = async () => {
        let { data, code }: IResponse = await getReadData("STAKE_PERIOD", nodeABI, NodeAddr, [], account);
        if (code == 200) {
            setStakeTime(data.toString())
        }
    }

    // RELEASE_PERIOD
    const getRELEASE_PERIOD = async () => {
        let { data, code }: IResponse = await getReadData("RELEASE_PERIOD", nodeABI, NodeAddr, [], account);
        if (code == 200) {
            setReleaseTime(data.toString())
        }
    }

    // nodeInfo
    const getNodeInfo = async () => {
        let { data, code }: IResponse = await getReadData("nodeInfo", nodeABI, NodeAddr, [account], account);
        console.log("getNodeInfo",data)
        if (code == 200) {
            setNodeEndTime(data.endTime.toString())
            setNodeStartTime(data.startTime.toString())
            setNodeValue(data.value.toString())
        }
    }
    // createNode
    const sendCreateNodeApprove = async (inviterAddr: any, tokenAddr: any, fee: any) => {
        setTipOpen(true);
        setTipOpenState("loading")
        setTipOpenText(`${t("TransactionPacking")}`)
        try {
            const allowanceConfig: any = await prepareWriteContract({
                address: tokenAddr,
                abi: erc20ABI,
                functionName: 'allowance',
                args: [account, NodeAddr],
            })
            const balanceConfig: any = await fetchBalanceObj(account, tokenAddr)
            let sendAmount: any = "0"
            if (new BigNumber(stakeAmount).isZero()) {
                sendAmount = new BigNumber(10000).multipliedBy(10 ** balanceConfig.decimals).toString()
            } else {
                sendAmount = stakeAmount
            }
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
                    address: tokenAddr,
                    abi: erc20ABI,
                    functionName: 'approve',
                    args: [NodeAddr, BigInt(maxInt256)],
                })
                let status = await sendStatus(approveConfig)
                if (status) {
                    setTipOpenText(`${t("AuthorizationSuccessful")}`)
                    setTimeout(() => {
                        sendCreateNodeApprove(inviterAddr, tokenAddr, fee)
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
                sendCreateNode(inviterAddr, fee)
            }
        } catch (error) {
            sendTipErr()
        }
    }

    const sendCreateNode = async (inviterAddr: any, fee: any) => {
        try {
            const Config = await prepareWriteContract({
                address: NodeAddr,
                abi: nodeABI,
                functionName: 'createNode',
                args: [inviterAddr, fee],
            })
            let status = await sendStatus(Config)
            if (status) {
                setFeeRate("")
                setInvitersPop(false)
                sendTipSuccess()
            } else {
                sendTipErr()
            }
        } catch (error) {
            sendTipErr()
        }
    }
    // claim
    const sendClaim = async () => {
        setTipOpen(true);
        setTipOpenState("loading")
        setTipOpenText(`${t("TransactionPacking")}`)
        try {
            const Config = await prepareWriteContract({
                address: NodeAddr,
                abi: nodeABI,
                functionName: 'claim',
            })
            let status = await sendStatus(Config)
            if (status) {
                sendTipSuccess()
            } else {
                sendTipErr()
            }
        } catch (error) {
            sendTipErr()
        }
    }

    // unlock
    const sendUnlock = async () => {
        setTipOpen(true);
        setTipOpenState("loading")
        setTipOpenText(`${t("TransactionPacking")}`)
        try {
            const Config = await prepareWriteContract({
                address: NodeAddr,
                abi: nodeABI,
                functionName: 'unlock',
            })
            let status = await sendStatus(Config)
            if (status) {
                sendTipSuccess()
            } else {
                sendTipErr()
            }
        } catch (error) {
            sendTipErr()
        }
    }

    // harvest
    const sendHarvest = async () => {
        setTipOpen(true);
        setTipOpenState("loading")
        setTipOpenText(`${t("TransactionPacking")}`)
        try {
            const Config = await prepareWriteContract({
                address: NodeAddr,
                abi: nodeABI,
                functionName: 'harvest',
            })
            let status = await sendStatus(Config)
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

    const getUnlockHtml = (startTime: any, endTime: any) => {
        let html: any
        let nowTime = new Date().getTime() / 1000
        if (new BigNumber(endTime).isZero()) {
            if (new BigNumber(startTime).plus(stakeTime).isLessThan(nowTime)) {
                html = <div className='tradeButton p-0 w-24' onClick={() => { sendUnlock() }}> {t("Unlock")}</div>
            } else {
                html = <div className='tradeButtonGray p-0 w-24'>{t("Unlock")}</div>
            }
        } else {
            html = <div className='tradeButtonGray p-0 w-24'>{t("Unlocked")}</div>
        }

        return html
    }

    const getReleasedHtml = (startTime: any, endTime: any) => {
        let html: any
        let nowTime = new Date().getTime() / 1000;
        if (new BigNumber(endTime).isZero()) {
            html = "0"
        } else {
            if (new BigNumber(endTime).isLessThan(nowTime)) {
                html = fromTokenValue(nodeValue, 18, 2)
            } else {
                let releasedTime = new BigNumber(nowTime).plus(releaseTime).minus(endTime).toString()
                html = fromTokenValue(new BigNumber(nodeValue).multipliedBy(releasedTime).dividedBy(releaseTime).toString(), 18, 2)
            }
        }
        return html
    }

    const getClaimHtml = (startTime: any, endTime: any) => {
        let html: any
        let nowTime = new Date().getTime() / 1000;
        if (new BigNumber(endTime).isZero() || new BigNumber(endTime).isLessThan(startTime)) {
            html = <div className='flex   mb-3'>
                <div className=' flex-1 flex'>
                    <p className=' w-12 text-man  text-sm text-gray-300 text-right leading-7'>{t("Unclaimed")}:</p>
                    <p className=' flex-1 text-right mr-5 font-bold text-lg'>{fromTokenValue(0, 18, 2)} <TokenName tokenAddr={REWARD} /></p>
                </div>
                <div className=' w-28 leading-7 text-right'>
                    <div className='tradeButtonGray p-0 w-24' >{t("Extraction")} </div>
                </div>
            </div>
        } else {
            if (new BigNumber(endTime).isLessThan(nowTime)) {
                let releasedTime = new BigNumber(endTime).minus(startTime).toString()
                let canClaimAmount = new BigNumber(nodeValue).multipliedBy(releasedTime).dividedBy(releaseTime).toString()
                html = <div className='flex   mb-3'>
                    <div className=' flex-1 flex'>
                        <p className=' w-12 text-man  text-sm text-gray-300 text-right leading-7'>{t("Unclaimed")}:</p>
                        <p className=' flex-1 text-right mr-5 font-bold text-lg'>{fromTokenValue(canClaimAmount, 18, 2)} <TokenName tokenAddr={REWARD} /></p>
                    </div>
                    <div className=' w-28 leading-7 text-right'>
                        {
                            new BigNumber(canClaimAmount).isZero() ? <div className='tradeButtonGray p-0 w-24'  > {t("Extraction")}</div> : <div className='tradeButton p-0 w-24' onClick={() => { sendClaim() }}> {t("Extraction")}</div>
                        }
                    </div>
                </div>
            } else {
                let releasedTime = new BigNumber(nowTime).minus(startTime).toString()
                let canClaimAmount = new BigNumber(nodeValue).multipliedBy(releasedTime).dividedBy(releaseTime).toString()
                html = <div className='flex   mb-3'>
                    <div className=' flex-1 flex'>
                        <p className=' w-12 text-man  text-sm text-gray-300 text-right leading-7'>{t("Unclaimed")}:</p>
                        <p className=' flex-1 text-right mr-5 font-bold text-lg'>{fromTokenValue(canClaimAmount, 18, 2)} <TokenName tokenAddr={REWARD} /></p>
                    </div>
                    <div className=' w-28 leading-7 text-right'>
                        {
                            new BigNumber(canClaimAmount).isZero() ? <div className='tradeButtonGray p-0 w-24'  > {t("Extraction")}</div> : <div className='tradeButton p-0 w-24' onClick={() => { sendClaim() }}> {t("Extraction")}</div>
                        }
                    </div>
                </div>
            }
        }
        return html
    }

    return (<div>
        <Head />
        <TipPop open={tipOpen} setOpen={setTipOpen} tipPopText={tipOpenText} tipPopState={tipOpenState} />
        <Modal
            style={{
                marginTop: "-20%",
            }}
            zIndex={1000}
            open={invitersPop}
            centered
            onCancel={() => { setInvitersPop(false) }}
            width={"300px"}
            footer={null}
            closeIcon={null}
            title={<p className=' font-DengXian'>{t("Createnodes")}</p>}
        >
            <div className=' mb-3' >
                {
                    new BigNumber(stakeAmount).isZero() ? <div className=' '>
                        <p className=' leading-6 text-gray-500 font-DengXian text-sm'>{t("Recommendedaddress")}:</p>
                        <Input className='' value={inviters} onChange={(e) => {
                            setInviters(e.target.value)
                        }} defaultValue="0.0" />
                    </div> : <></>
                }

                <div className='  '>
                    <p className=' leading-6 text-gray-500 font-DengXian text-sm'>{t("fees")}:</p>
                    <Input className=' ' value={feeRate} onChange={(e) => {
                        let value = e.target.value
                        setFeeRate(verifyInt(e.target.value))
                    }} addonAfter={<span>%</span>} defaultValue="0.0" />
                </div>
                <div>
                    <p className='text-gray-500 text-sm font-DengXian'>{t("Feelimit")}</p>
                </div>
            </div>
            <div>
                <div className='tradeButton py-2' onClick={() => {
                    if (inviters == "" && new BigNumber(stakeAmount).isZero()) {
                        setTipOpen(true);
                        setTipOpenState("error")
                        setTipOpenText("Please fill in the recommender's address")
                        setTimeout(() => {
                            setTipOpenState("")
                            setTipOpen(false)
                        }, 2000);
                        return
                    }

                    let token: any
                    if (new BigNumber(stakeAmount).isZero()) {
                        token = UsdtAddr
                    } else {
                        token = REWARD
                    }

                    if (feeRate == "" || new BigNumber(feeRate).isLessThan(5) || new BigNumber(feeRate).isGreaterThan(10)) {
                        setTipOpen(true);
                        setTipOpenState("error")
                        setTipOpenText("Please enter a positive integer between 5 and 10")
                        setTimeout(() => {
                            setTipOpenState("")
                            setTipOpen(false)
                        }, 2000);
                        return
                    }

                    sendCreateNodeApprove(inviters, token, feeRate)
                }} >{t("Createnodes")}</div>
            </div>
        </Modal>

        <div className='main'>
            <div>
                <p className=' text-center font-Copperplate text-3xl mb-10 text-[#4a1d83]'>TradeOFF</p>
            </div>
            <div>
                <p className=' text-center font-normal text-xl mb-2'> {new BigNumber(nodeValue).isZero() ? t("Createnodes") : t("Mynodes")}</p>
            </div>

            {
                new BigNumber(nodeValue).isZero() ? <div className='mx-6 rounded-xl bg-white'>
                    <div className='px-4 pt-4 pb-4 border-b border-[#ccc] flex'>
                        <div className=' bg-1 h-10 w-10 rounded-full'>
                            <img className=' h-10 w-10 p-2' src={menuLogo} alt="" />
                        </div>
                        <div className=' flex-1  mt-3 text-gray-500'>
                            <div className='text-xs flex'>
                                {new BigNumber(stakeAmount).isZero() ? <p className=' flex-1 text-right '>{t("Creatingrequires")} 10000 USDT</p> : <p className=' flex-1 text-right '>{t("Creatingrequires")} {fromTokenValue(stakeAmount, 18, 3)} <TokenName tokenAddr={REWARD} /></p>}
                            </div>
                        </div>
                    </div>
                    <div className='px-4'>
                        <div className=' pb-3 pt-3'>
                            <div className='tradeButton py-2' onClick={() => {
                                setInvitersPop(true)
                            }} >{t("Createnodes")}</div>
                        </div>
                    </div>
                </div> :
                    <>
                        <div className='borderSelectToken mx-6  mt-5 mb-8'>
                            <div className=' text-center p-3'>
                                <div className='flex'>
                                    <div className=" w-1/2">
                                        <p className='text-man  text-sm'>{t("myPledge")}</p>
                                        <p className=' font-bold text-lg'>
                                            {fromTokenValue(mystakeValue, 18, 2)}
                                        </p>
                                    </div>
                                    <div className=" w-1/2">
                                        <p className='text-man  text-sm'>{t("Netpledge")}</p>
                                        <p className=' font-bold text-lg'>{fromTokenValue(allStakeValue, 18, 2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='borderSelectToken mx-6  mt-5 mb-8'>
                            <div className='  text-center p-3'>
                                <div className='font-bold text-xl flex leading-8'>
                                     {t("Share")}:
                                    <div className=" flex mt-1" onClick={() => {
                                        const currentUrl = window.location.href
                                        console.log("currentUrl",currentUrl)
                                        copy(window.location.href+ "/" + account + "");
                                        setTipOpen(true)
                                        setTipOpenState("success")
                                        setTipOpenText(`${t("Copy")}`)
                                        setTimeout(() => {
                                            init()
                                            setTipOpen(false)
                                            setTipOpenState("")
                                        }, 2000);
                                    }}>
                                        <span className=' text-base ml-2 mr-3  ' > {formatAccount(account, 6, 6)}</span>
                                        <img className="w-5 h-5" src={copyIcon} alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='borderSelectToken mx-6  mt-5 mb-8'>
                            <div className=' p-3'>
                                <div className=' text-center pb-4 text-man font-bold text-lg '>{t("NodeInformation")}</div>
                                <div className='flex   mb-3'>
                                    <div className=' flex-1 flex'>
                                        <p className=' w-12 text-man  text-sm text-gray-300 text-right leading-7'>{t("Pledge")}:</p>
                                        <p className=' flex-1 text-right mr-5 font-bold text-lg'>{fromTokenValue(nodeValue, 18, 2)} <TokenName tokenAddr={REWARD} /></p>
                                    </div>
                                    <div className=' w-28 leading-7 text-right'>
                                        {nodeStartTime && nodeEndTime && getUnlockHtml(nodeStartTime, nodeEndTime)}
                                    </div>
                                </div>
                                <div className='flex   mb-3'>
                                    <div className=' flex-1 flex'>
                                        <p className=' w-12 text-man  text-sm text-gray-300 text-right leading-7'>{t("Released")}:</p>
                                        <p className=' flex-1 text-right mr-5 font-bold text-lg'>
                                            {nodeStartTime && nodeEndTime && getReleasedHtml(nodeStartTime, nodeEndTime)} <TokenName tokenAddr={REWARD} />
                                        </p>
                                    </div>
                                    <div className=' w-28 leading-7 text-right'>
                                    </div>
                                </div>
                                {
                                    nodeStartTime && nodeEndTime && getClaimHtml(nodeStartTime, nodeEndTime)
                                }
                                <div className='flex   mb-3'>
                                    <div className=' flex-1 flex'>
                                        <p className=' w-12 text-man  text-sm text-gray-300 text-right leading-7'>{t("Income")}:</p>
                                        <p className=' flex-1 text-right mr-5 font-bold text-lg'>{fromTokenValue(rewardValueAmount, 18, 2)} <TokenName tokenAddr={REWARD} /></p>
                                    </div>
                                    <div className=' w-28 leading-7 text-right'>
                                        {
                                            new BigNumber(rewardValueAmount).isZero() ? <div className='tradeButtonGray p-0 w-24'  > {t("Extraction")}</div> : <div className='tradeButton p-0 w-24' onClick={() => { sendHarvest() }}> {t("Extraction")}</div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>

            }
        </div>
    </div>
    )
}

export default Node