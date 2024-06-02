import Input from 'antd/es/input'
import { useEffect, useState } from 'react'
import { menuLogo } from '../../image'
import { verifyNum } from '../../utils/formatting'
import { useGlobal } from '../../context/GlobalProvider'
import { prepareWriteContract } from 'wagmi/actions'
import { erc20ABI, nodeABI, nodeStakeABI } from '../../abi/abi'
import BigNumber from "bignumber.js";
import { IResponse, fetchBalanceObj, getReadData, isAddress, sendStatus } from '../../config/api'
import { maxInt256 } from 'viem'
import TipPop from '../../components/pop/TipPop'
import Head from '../../components/head'
import { Collapse, Modal, Select, Tooltip } from 'antd'
import { formatAccount, fromTokenValue, getTimePeriod } from '../../utils'
import TokenName from '../../components/token/TokenName'
import { useTranslation } from 'react-i18next'
const { Option } = Select;
let StakeAddr: any = process.env.REACT_APP_StakeAddr + ""
let UsdtAddr: any = process.env.REACT_APP_TOKEN_USDT + ""
let REWARD = process.env.REACT_APP_TOKEN_REWARD + "";
let NodeAddr: any = process.env.REACT_APP_NODEAddr + ""
let NodeStakeAddr: any = process.env.REACT_APP_NODESTAKEAddr + ""

interface INodeItem {
    nodeAddress: string,
    nodeStatus: boolean,
    feeRate: string,
    nodeTitle: string
}

function Stake() {
    const { account } = useGlobal()
    const { t } = useTranslation()
    const [stakeAmount, setStakeAmount] = useState<string>("")
    const [stakeNode, setStakeNode] = useState<any>("")

    const [tipOpen, setTipOpen] = useState<boolean>(false);
    const [tipOpenState, setTipOpenState] = useState<string>("loading");
    const [tipOpenText, setTipOpenText] = useState<string>("");

    const [stakeOpen, setStakeOpen] = useState<boolean>(false);

    const [nodeList, setNodeList] = useState<any>([]);

    const [unStakeOpen, setUnStakeOpen] = useState<boolean>(false);
    const [unStakeAmount, setUnStakeAmount] = useState<string>("")
    const [allStakeValue, setAllStakeValue] = useState<string>("0")

    useEffect(() => {
        init()
        getRewardPool()
    }, [account])

    const init = async () => {
        getNodeList()
        getStakeValue()
    }

    // stakeValue
    const getStakeValue = async () => {
        let { data, code }: IResponse = await getReadData("stakeValue", nodeABI, NodeAddr, [account], account);
        if (code == 200) {
            setAllStakeValue(data[1].toString())
        }
    }

    const getRewardPool = async () => {
        let { data, code }: IResponse = await getReadData("rewardPool", nodeStakeABI, NodeStakeAddr, [], account);
        console.log("getRewardPool", data)
    }
    //nodeList
    const getNodeList = async () => {
        let { data, code }: IResponse = await getReadData("nodeList", nodeABI, NodeAddr, [], account);
        if (code == 200) {
            let datas = data[0].map(async (item: any) => {
                let proposalResponse: IResponse = await getReadData("getFeeRate", nodeABI, NodeAddr, [item], account)
                return proposalResponse.data
            });
            let responses = await Promise.all(datas)
            fetch("./nodeName.json").then(response => {
                if (response.ok) return response.json();
                throw response;
            }).then(dataNames => {
                console.log('wallets', dataNames, responses, data);
                let arr: any = []
                for (let index = 0; index < data[0].length; index++) {
                    let obj: INodeItem = {
                        nodeAddress: data[0][index],
                        nodeStatus: data[1][index],
                        feeRate: responses[index].toString(),
                        nodeTitle: dataNames[data[0][index]]
                    }
                    arr.push(obj)
                }
                console.log(arr)
                if (arr.length > 0) {
                    setStakeNode(arr[0].nodeAddress)
                }
                setNodeList([...arr])
            })
        }
    }

    // stake
    const sendStakeApprove = async (tokenAddr: any, approveAddr: any) => {
        setTipOpen(true);
        setTipOpenState("loading")
        setTipOpenText(`${t("TransactionPacking")}`)
        try {
            const allowanceConfig: any = await prepareWriteContract({
                address: tokenAddr,
                abi: erc20ABI,
                functionName: 'allowance',
                args: [account, approveAddr],
            })
            const balanceConfig: any = await fetchBalanceObj(account, tokenAddr)
            console.log("balanceConfig", balanceConfig)

            let sendAmount: any = new BigNumber(stakeAmount).multipliedBy(10 ** balanceConfig.decimals).toString()

            if (new BigNumber(balanceConfig.value).isLessThan(sendAmount)) {
                setTipOpenState("error")
                setTipOpenText("The balance is insufficient")
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
                    args: [approveAddr, BigInt(maxInt256)],
                })

                let status = await sendStatus(approveConfig)

                if (status) {
                    setTipOpenText(`${t("AuthorizationSuccessful")}`)
                    setTimeout(() => {
                        sendStakeApprove(tokenAddr, approveAddr)
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
                sendStake(sendAmount)
            }
        } catch (error) {
            sendTipErr()
        }
    }

    const sendStake = async (sendAmount: any) => {
        try {
            const Config = await prepareWriteContract({
                address: NodeStakeAddr,
                abi: nodeStakeABI,
                functionName: 'stake',
                args: [stakeNode, sendAmount],
            })
            let status = await sendStatus(Config)
            if (status) {
                setStakeOpen(false)
                sendTipSuccess()
            } else {
                sendTipErr()
            }
        } catch (error) {
            sendTipErr()
        }
    }

    // harvest
    const sendHarvest = async (node: any) => {
        setTipOpen(true);
        setTipOpenState("loading")
        setTipOpenText(`${t("TransactionPacking")}`)
        console.log("stakeNode", node)
        try {
            const Config = await prepareWriteContract({
                address: NodeStakeAddr,
                abi: nodeStakeABI,
                functionName: 'harvest',
                args: [node]
            })
            let status = await sendStatus(Config)
            if (status) {
                setStakeNode("")
                setStakeAmount("")
                init()
                sendTipSuccess()
            } else {
                sendTipErr()
            }
        } catch (error) {
            sendTipErr()
        }
    }

    // unstake
    const sendUnstake = async () => {
        setTipOpen(true);
        setTipOpenState("loading")
        setTipOpenText(`${t("TransactionPacking")}`)
        try {
            let sendAmount = new BigNumber(unStakeAmount).multipliedBy(10 ** 18).toString();
            const Config = await prepareWriteContract({
                address: NodeStakeAddr,
                abi: nodeStakeABI,
                functionName: 'unstake',
                args: [stakeNode, sendAmount],
            })
            let status = await sendStatus(Config)
            if (status) {
                setUnStakeAmount("")
                setUnStakeOpen(false)
                init()
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

    return (
        <div>
            <Head />
            <TipPop open={tipOpen} setOpen={setTipOpen} tipPopText={tipOpenText} tipPopState={tipOpenState} />
            <Modal zIndex={1000} open={stakeOpen}
                style={{
                    marginTop: "20%",
                    maxWidth: "350px"
                }}
                onCancel={() => { setStakeOpen(false) }}
                title={t("Pledgequantity")}
                footer={null}
            >

                <div >
                    <div className=' flex  mb-5'>
                        <p className=' leading-8 text-gray-500 mr-2 text-sm'>{t("Quantity")}:</p>
                        <Input className=' w-52 overflow-hidden' value={stakeAmount} onChange={(e) => {
                            let valueNum = verifyNum(e.target.value)
                            setStakeAmount(valueNum)
                        }} addonAfter={<span><TokenName tokenAddr={REWARD} /></span>} />
                    </div>
                    <div>
                        <div className='tradeButton py-2' onClick={() => {
                            if (stakeAmount == "" || new BigNumber(stakeAmount).isZero()) {
                                setTipOpen(true);
                                setTipOpenState("error")
                                setTipOpenText(`${t("Pleasefillinthequantity")}`)
                                setTimeout(() => {
                                    setTipOpenState("")
                                    setTipOpen(false)
                                }, 2000);
                                return
                            }

                            sendStakeApprove(REWARD, NodeStakeAddr)
                        }} >{t("confirm")}</div>
                    </div>
                </div>
            </Modal>

            <Modal zIndex={1000} open={unStakeOpen}
                style={{
                    marginTop: "20%",
                    maxWidth: "350px"
                }}
                onCancel={() => { setUnStakeOpen(false) }}
                title={t("Quantityofrelease")}
                footer={null}
            >
                <div >
                    <div className=' flex  mb-5'>
                        <p className=' leading-8 text-gray-500 mr-2 text-sm'>{t("Quantity")}:</p>
                        <Input className=' w-52 overflow-hidden' value={unStakeAmount} onChange={(e) => {
                            let valueNum = verifyNum(e.target.value)
                            setUnStakeAmount(valueNum)
                        }} addonAfter={<span><TokenName tokenAddr={REWARD} /></span>} />
                    </div>
                    <div>
                        <div className='tradeButton py-2' onClick={() => {
                            if (unStakeAmount == "" || new BigNumber(unStakeAmount).isZero()) {
                                setTipOpen(true);
                                setTipOpenState("error")
                                setTipOpenText(`${t("Pleasefillinthequantity")}`)
                                setTimeout(() => {
                                    setTipOpenState("")
                                    setTipOpen(false)
                                }, 2000);
                                return
                            }
                            sendUnstake()
                        }} >{t("confirm")}</div>
                    </div>
                </div>
            </Modal>
            <div className=' main '>
                <div>
                    <p className=' text-center font-Copperplate text-3xl mb-10 text-[#4a1d83]'>TradeOFF</p>
                </div>
                <div className="mx-6">
                    <p className=' text-center font-normal text-xl mb-2'></p>
                </div>

                <div className='mx-6 borderSelectToken rounded-xl bg-white mb-5'>

                    <div className='px-4 pt-4 pb-4 border-b border-[#ccc] flex'>
                        <div className=' bg-1 h-10 w-10 rounded-full'>
                            <img className=' h-10 w-10 p-2' src={menuLogo} alt="" />
                        </div>
                        <div className=' flex-1  mt-3 text-gray-500'>
                            <div className='text-xs flex'>
                                <p className=' flex-1 text-right '>{t("Netpledge")} {fromTokenValue(allStakeValue, 18, 2)}</p>
                            </div>
                        </div>
                    </div>
                    <div className='px-4'>
                        <div className=' pt-5 pb-2 flex'>
                            <p className=' leading-8 mr-4 text-gray-500'>{t("Selectnode")}:</p>
                            <Select className=' flex-1 overflow-hidden' value={stakeNode} onChange={(e) => {
                                console.log(e)
                                setStakeNode(e)
                            }}>
                                {
                                    nodeList && nodeList.map((item: INodeItem, index: number) => {
                                        return <Option key={index} value={item.nodeAddress} disabled={!item.nodeStatus}>
                                            {
                                                item.nodeTitle == undefined ? formatAccount(item.nodeAddress, 8, 8) : item.nodeTitle
                                            }
                                            ( {item.feeRate}% )
                                        </Option>
                                    })
                                }
                            </Select>
                        </div>
                        <div className=' pb-4'>
                            <p className=' text-xs py-2 text-gray-500'>{t("SelectnodeDetail")}</p>
                        </div>

                        <div className=' pb-7'>
                            <div className='tradeButton py-2' onClick={() => {
                                if (stakeNode == "") {
                                    return
                                }
                                setStakeOpen(true)
                            }} >{t("Stake")}</div>
                        </div>
                    </div>
                </div>

                <div className=' mx-6  rounded-xl mb-3'>
                    {
                        nodeList && nodeList.map((item: INodeItem, index: number) => {
                            return <StakeItem key={index} nodeAddress={item.nodeAddress} rate={item.feeRate} status={item.nodeStatus} setStakeNode={setStakeNode} sendHarvest={sendHarvest} setStakeOpen={setStakeOpen} setUnStakeOpen={setUnStakeOpen} nodeTitle={item.nodeTitle} />
                        })
                    }
                </div>
            </div>
        </div >

    )
}

export default Stake
interface IStakeItem {
    nodeAddress: string,
    rate: string,
    status: boolean,
    setStakeNode: Function,
    sendHarvest: Function,
    setStakeOpen: Function,
    setUnStakeOpen: Function,
    nodeTitle: any
}

function StakeItem({ nodeAddress, nodeTitle, rate, status, setStakeNode, sendHarvest, setStakeOpen, setUnStakeOpen }: IStakeItem) {
    const { account } = useGlobal()
    const { t } = useTranslation()
    const [reward, setReward] = useState<string>("0");
    const [pledgeValue, setPledgeValue] = useState<string>("0");
    const [lockValue, setLockValue] = useState<string>("0");

    useEffect(() => {
        getStakeInfo()
    })

    const getStakeInfo = async () => {
        let { data, code }: IResponse = await getReadData("stakeInfo", nodeStakeABI, NodeStakeAddr, [nodeAddress, account], account);
        if (code == 200) {
            setReward(data[3].toString())
            setPledgeValue(data[1].toString())
            setLockValue(data[0].toString())
        }
    }

    return <>
        {(!new BigNumber(pledgeValue).isZero() || !new BigNumber(lockValue).isZero() || !new BigNumber(reward).isZero()) && <Collapse
            defaultActiveKey={['1']}
            onChange={() => { }}
            className=' bg-white px-0 mb-5'
            expandIconPosition={"end"}
            items={[{
                key: nodeAddress,
                label: <div className='flex '>
                    <p className=' flex-1 font-bold text-lg leading-7'>
                        {
                            nodeTitle == undefined ? formatAccount(nodeAddress, 4, 4) : nodeTitle
                        }
                        ( {rate}% )
                    </p>
                    <div className='w-24 text-right leading-7 '>
                        {
                            status ? <div className='tradeButton p-0 w-24' onClick={() => {
                                setStakeNode(nodeAddress)
                                setStakeOpen(true)
                            }}> {t("Pledge")}</div> : <div className='tradeButtonGray p-0 w-24'  > {t("Pledge")}</div>
                        }
                    </div>
                </div>,
                children: <div className=' bg-white rounded-xl'>
                    <div className='flex   mb-2'>
                        <div className=' flex-1 flex'>
                            <p className=' w-12   text-sm text-gray-300 text-right leading-7'>{t("Totalpledge")}:</p>
                            <p className=' flex-1 text-right mr-10 font-bold text-lg'>{fromTokenValue(pledgeValue, 18, 2)}</p>
                        </div>
                        <div className='w-28 text-right leading-7 '></div>
                    </div>
                    <div className='flex   mb-2'>
                        <div className=' flex-1 flex'>
                            <p className=' w-12   text-sm text-gray-300 text-right leading-7'>{t("Released")}:</p>
                            <p className=' flex-1 text-right mr-10 font-bold text-lg'>{fromTokenValue(lockValue, 18, 2)}</p>
                        </div>
                        <div className=' w-28 leading-7 text-right'>
                            {
                                new BigNumber(lockValue).isGreaterThan(0) ? <div className='tradeButton p-0 w-24' onClick={() => {
                                    setStakeNode(nodeAddress)
                                    setUnStakeOpen(true)
                                }}> {t("Extraction")}</div> : <div className='tradeButtonGray p-0 w-24'  > {t("Extraction")}</div>
                            }
                        </div>
                    </div>
                    <div className='flex  mb-2'>
                        <div className=' flex-1 flex'>
                            <p className=' w-12   text-sm text-gray-300 text-right leading-7'>{t("Income")}:</p>
                            <p className=' flex-1 text-right mr-10 font-bold text-lg'>{fromTokenValue(reward, 18, 2)}</p>
                        </div>
                        <div className=' w-28 leading-7 text-right'>
                            {
                                new BigNumber(reward).isGreaterThan(0) ? <div className='tradeButton p-0 w-24' onClick={() => {
                                    sendHarvest(nodeAddress)
                                }}> {t("Extraction")}</div> : <div className='tradeButtonGray p-0 w-24'  >  {t("Extraction")}</div>
                            }
                        </div>
                    </div>
                </div>
            }]
            }
        >
        </Collapse>
        }
    </>
}