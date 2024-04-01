import React, { ReactElement, useEffect, useState } from 'react'
import { useGlobal } from '../../../context/GlobalProvider'
import { IResponse, MIN_UNIT256_BYTES32, getReadData, sendStatus } from '../../../config/api'
import { usdtStakeABI } from '../../../abi/abi'
import { formatAccount, fromTokenValue, getTime } from '../../../utils'
import { prepareWriteContract } from 'wagmi/actions'
import TipPop from '../../../components/pop/TipPop'
import Head from '../../../components/head'
import BigNumber from "bignumber.js";
import { changeIcon, checkIcon, copyIcon, lockEdIcon, lockIcon } from '../../../image'
import copy from 'copy-to-clipboard';

let StakeAddr: any = process.env.REACT_APP_StakeAddr + ""
let UsdtAddr: any = process.env.REACT_APP_TOKEN_USDT + ""
const link = process.env.REACT_APP_LINK + "";

const OneDay = process.env.REACT_APP_ONEDAY + "";


function StakeInfo() {
    const { account } = useGlobal();
    const [tipOpen, setTipOpen] = useState<boolean>(false);
    const [tipOpenState, setTipOpenState] = useState<string>("loading");
    const [tipOpenText, setTipOpenText] = useState<string>("");

    const [userPower, setUserPower] = useState<string>("0");
    const [userPowerAdd, setUserPowerAdd] = useState<string>("0");
    const [allPower, setAllPower] = useState<string>("0");
    const [rewardAmount, setRewardAmount] = useState<string>("0");
    const [stakeAmount, setStakeAmount] = useState<string>("0");
    const [releaseAmount, setReleaseAmount] = useState<string>("0");

    const [stakeList, setStakeList] = useState<any>([])
    const [stakeDays, setStakeDays] = useState<string>("90");

    useEffect(() => {
        if (account) {
            init()
            getStakeDays()
        }
    }, [account])

    const init = () => {
        getPowerOf()
        getRewardValue()
        getStakeRecords()
        getStakeRecordInfo()
    }

    // stakeDays
    const getStakeDays = async () => {
        let { data, code }: IResponse = await getReadData("stakeDays", usdtStakeABI, StakeAddr, [], account);
        console.log("getStakeDays", data)
        if (code == 200) {
            setStakeDays(data.toString())
        }
    }

    const getStakeRecordInfo = async () => {
        let { data, code }: IResponse = await getReadData("stakeRecordInfo", usdtStakeABI, StakeAddr, [account], account);
        console.log("getStakeRecordInfo", data)
        if (code == 200) {
            setStakeAmount(data[0])
            setReleaseAmount(data[1])
        } else {
            setStakeAmount("0");
            setReleaseAmount("0");
        }
    }
    const getPowerOf = async () => {
        let { data, code }: IResponse = await getReadData("powerOf", usdtStakeABI, StakeAddr, [account], account);
        if (code == 200) {
            setUserPower(data[0]);
            setAllPower(data[1])
        } else {
            setUserPower("0");
            setAllPower("0")
        }
    }

    const getRewardValue = async () => {
        let { data, code }: IResponse = await getReadData("rewardValue", usdtStakeABI, StakeAddr, [account], account);
        if (code == 200) {
            setRewardAmount(data)
        } else {
            setRewardAmount("0")
        }
    }
    // stakeRecords
    const getStakeRecords = async () => {
        let { data, code }: IResponse = await getReadData("stakeRecords", usdtStakeABI, StakeAddr, [account], account);
        if (code == 200) {
            let Arr: any = [];

            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                let obj = {
                    value: "0",
                    releaseTime: "0",
                    stakeTime: "0",
                    unStakeId: "",
                }

                obj.value = element.value;
                obj.releaseTime = element.releaseTime;
                obj.stakeTime = element.stakeTime;
                if (index === 0) {
                    obj.unStakeId = element.unStakeId
                } else {
                    if (element.unStakeId == MIN_UNIT256_BYTES32 && Arr[Arr.length - 1].unStakeId != MIN_UNIT256_BYTES32) {
                        obj.unStakeId = Arr[Arr.length - 1].unStakeId
                    } else {
                        obj.unStakeId = element.unStakeId
                    }
                }
                Arr.push(obj)
            }

            console.log(Arr)
            setStakeList([...Arr]);
            let powerNum = "0"
            for (let j = 0; j < Arr.length; j++) {
                const element = Arr[j];
                if (element.unStakeId == MIN_UNIT256_BYTES32) {
                    let level = new BigNumber(new BigNumber(element.releaseTime).minus(element.stakeTime).toString()).dividedBy(OneDay).dividedBy(stakeDays).toNumber()
                    console.log("level", level, element.value)
                    powerNum = new BigNumber(powerNum).plus(new BigNumber(element.value).multipliedBy(level == 1 ? 1 : level == 2 ? 1.5 : 2).toString()).toString()
                }
            }
            setUserPowerAdd(powerNum)
        } else {
            setStakeList([])
        }
    }
    // unstake
    const sendUnstake = async () => {
        setTipOpen(true);
        setTipOpenState("loading")
        setTipOpenText("加载中...")
        try {
            const unstakeConfig = await prepareWriteContract({
                address: StakeAddr,
                abi: usdtStakeABI,
                functionName: 'unstake',
                args: [],
            })
            console.log("sendUnstake", unstakeConfig)

            let status = await sendStatus(unstakeConfig)

            if (status) {
                console.log("交易成功")
                sendTipSuccess()
            } else {
                console.log("交易失败")
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
        setTipOpenText("加载中...")
        try {
            const unstakeConfig = await prepareWriteContract({
                address: StakeAddr,
                abi: usdtStakeABI,
                functionName: 'harvest',
                args: [],
            })
            console.log("sendUnstake", unstakeConfig)

            let status = await sendStatus(unstakeConfig)

            if (status) {
                console.log("交易成功")
                sendTipSuccess()
            } else {
                console.log("交易失败")
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
            init()
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
            <div className=' main'>
                <div className='mx-6  bg-white text-center rounded-xl p-3 mt-5 mb-8'>
                    <div className='flex'>
                        <div className=" w-1/2">
                            <p className='text-man  text-sm'>我的算力</p>
                            <p className=' font-bold text-lg'>
                                {fromTokenValue(userPowerAdd, 18, 2)} + {fromTokenValue(new BigNumber(userPower).minus(userPowerAdd).toString(), 18, 2)}
                            </p>
                        </div>
                        <div className=" w-1/2">
                            <p className='text-man  text-sm'>全网算力</p>
                            <p className=' font-bold text-lg'>{fromTokenValue(allPower, 18, 2)}</p>
                        </div>
                    </div>
                </div>
                <div className='mx-6  bg-white text-center rounded-xl p-3 mt-5 mb-8'>
                    <div className='font-bold text-xl flex leading-8'>
                        分享链接:
                        <div className=" flex mt-1" onClick={() => {
                            copy(link + account + "");
                            setTipOpen(true)
                            setTipOpenState("success")
                            setTipOpenText("复制成功")
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
                <div className=' mx-6 bg-white rounded-xl p-3'>
                    <div className=' text-center pb-4 text-man font-bold text-lg '> 质押信息</div>
                    <div className='flex   mb-3'>
                        <div className=' flex-1 flex'>
                            <p className=' w-12 text-man  text-sm text-gray-300 text-right leading-7'>总质押:</p>
                            <p className=' flex-1 text-right mr-4 font-bold text-lg'>{fromTokenValue(stakeAmount, 18, 2)}</p>
                        </div>
                        <div className='  w-24'>
                        </div>
                    </div>
                    <div className='flex   mb-3'>
                        <div className=' flex-1 flex'>
                            <p className=' w-12 text-man  text-sm text-gray-300 text-right leading-7'>已释放:</p>
                            <p className=' flex-1 text-right mr-4 font-bold text-lg'>{fromTokenValue(releaseAmount, 18, 2)}</p>
                        </div>

                        <div className=' w-24 leading-7'>
                            {
                                new BigNumber(releaseAmount).isZero() ? <div className='tradeButtonGray p-0 w-24'  > 解押</div> : <div className='tradeButton p-0' style={{ width: "100px" }} onClick={() => { sendUnstake() }}> 解押</div>
                            }
                        </div>
                    </div>
                    <div className='flex   mb-3'>
                        <div className=' flex-1 flex'>
                            <p className=' w-12 text-man  text-sm text-gray-300 text-right leading-7'>收益:</p>
                            <p className=' flex-1 text-right mr-4 font-bold text-lg'>{fromTokenValue(rewardAmount, 18, 2)}</p>
                        </div>
                        <div className='  w-24 leading-7 text-right'>
                            {
                                new BigNumber(rewardAmount).isZero() ? <div className='tradeButtonGray p-0 w-24' > 提取收益</div> : <div className='tradeButton p-0 ' style={{ width: "100px" }} onClick={() => { sendHarvest() }}> 提取收益</div>
                            }
                        </div>
                    </div>
                </div>
                <div className=' mx-6 bg-white rounded-xl  mt-5 mb-8 p-3'>
                    <div className=' text-center  text-man font-bold text-lg'> 质押记录</div>
                    <div className=' pt-4 min-h-[120px] max-h-[400px] overflow-scroll'>

                        {
                            stakeList && stakeList.map((item: any, index: number) => {
                                return <StakeItemState key={index} value={item.value} releaseTime={item.releaseTime.toString()} unStakeId={item.unStakeId} stakeTime={item.stakeTime} />
                            })
                        }
                    </div>
                </div>
            </div>
        </div>

    )
}

export default StakeInfo
interface IStakeItemState {
    releaseTime: any,
    unStakeId: any,
    value: any,
    stakeTime: any
}

function StakeItemState({ value, releaseTime, unStakeId, stakeTime }: IStakeItemState) {
    const { account } = useGlobal();
    const [state, setState] = useState<number>(1);
    const [unStakeTime, setUnStakeTime] = useState<any>("0");
    useEffect(() => {
        getState(releaseTime, unStakeId)
    })
    // 已解锁 处理中 已完成

    const getState = async (time: any, stakeId: any) => {
        let nowTime = new Date().getTime() / 1000;
        if (stakeId == MIN_UNIT256_BYTES32) {
            if (new BigNumber(time).isLessThan(nowTime)) {
                setState(1)
            } else {
                setState(2)
            }
        } else {
            try {
                let { data, code }: IResponse = await getReadData("unstakeRecord", usdtStakeABI, StakeAddr, [stakeId], account);
                console.log("unstakeRecord", data)
                setUnStakeTime(data.unstakeTime)
                if (code == 200) {
                    if (data.finished) {
                        setState(3)
                    } else {
                        setState(4)
                    }
                } else {
                    setState(1)
                }
            } catch (error) {
                setState(1)
            }
        }
    }
    const getHtml = (num: Number) => {
        let html: ReactElement = <></>
        if (num == 1) {
            html = <div className='  flex '>
                <img className=' w-4 h-4' src={lockEdIcon} alt="" />
                <p className=' px-1'>已解锁</p>
            </div>
        } else if (num == 2) {
            html = <div className='  flex  '>
                <img className=' w-4 h-4' src={lockIcon} alt="" />
                <p className=' px-1'>锁定中</p>
            </div>
        } else if (num == 3) {
            html = <div className='  flex  '>
                <img className=' w-4 h-4' src={checkIcon} alt="" />
                <p className=' px-1'>已完成</p>
            </div>
        } else if (num == 4) {
            html = <div className='  flex '>
                <img className=' w-4 h-4' src={changeIcon} alt="" />
                <p className=' px-1'>处理中</p>
            </div>
        }
        return html
    }

    return <div className=' text-xs border border-[#cc4a4a] rounded-xl py-2 px-3 mb-1'>
        <div className=' flex'>
            <div className=' w-1/2'>
                <p>
                    <span className='text-gray-500 pr-1'>质押金额:</span>
                    {fromTokenValue(value, 18, 2)}
                </p>
            </div>
            <div className=' w-1/2 flex'>
                <p className=' '>
                    <span className='text-gray-500 pr-1'>当前状态:</span>
                </p>
                {
                    state && getHtml(state)
                }
            </div>
        </div>
        <div>
            <p>
                <span className='text-gray-500 pr-1'> 质押时间:</span>
                {getTime(new BigNumber(stakeTime).toNumber())}
            </p>
        </div>
        <div>
            <p>
                <span className='text-gray-500 pr-1'>
                    {
                        state == 3 || state == 4 ? "退出" : "解锁"
                    }
                    时间:</span>
                {
                    state == 3 || state == 4 ? getTime(new BigNumber(unStakeTime).toNumber()) : getTime(new BigNumber(releaseTime).toNumber())
                }
            </p>
        </div>
    </div>
}

