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

function StakeInfo() {
    const { account } = useGlobal();
    const [tipOpen, setTipOpen] = useState<boolean>(false);
    const [tipOpenState, setTipOpenState] = useState<string>("loading");
    const [tipOpenText, setTipOpenText] = useState<string>("");

    const [userPower, setUserPower] = useState<string>("0");
    const [allPower, setAllPower] = useState<string>("0");
    const [rewardAmount, setRewardAmount] = useState<string>("0");
    const [stakeAmount, setStakeAmount] = useState<string>("0");
    const [releaseAmount, setReleaseAmount] = useState<string>("0");

    const [pageIndex, setPageIndex] = useState<string>("1");
    const [pageCount, setPageCount] = useState<string>("1000000");

    // uint endIndex,
    // uint addition
    const [stakeList, setStakeList] = useState<any>([])
    useEffect(() => {
        if (account) {
            init()
        }
    }, [account])

    const init = () => {
        getPowerOf()
        getRewardValue()
        getStakeRecords(pageIndex)
        getStakeRecordInfo()
    }

    // stakeRecordInfo

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
        console.log("powerOfData", data)
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
    const getStakeRecords = async (index: any) => {
        setPageIndex(index)
        let start = new BigNumber(new BigNumber(index).minus(1).toString()).multipliedBy(pageCount).toString();
        let end = new BigNumber(index).multipliedBy(pageCount).toString()
        let { data, code }: IResponse = await getReadData("stakeRecords", usdtStakeABI, StakeAddr, [account, start, end], account);
        if (code == 200) {
            let Arr: any = []
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                let obj = {
                    value: "0",
                    releaseTime: "0",
                    addition: "0",
                    unStakeId: "",
                }
                obj.value = element.value;
                obj.releaseTime = element.releaseTime;
                obj.addition = element.addition;
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
            console.log("getStakeRecords arr", Arr)
            console.log("getStakeRecords data", data)
            setStakeList([...Arr])

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
                            <p className=' font-bold text-lg'>{fromTokenValue(userPower, 18, 2)}</p>
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
                    <div className=' text-center pb-4 text-man font-bold text-lg'> 质押信息</div>
                    <div className='flex leading-8  mb-3'>
                        <div className=' flex-1 '>
                            <span className='text-man  text-sm text-gray-300'>总质押:</span>
                            <span className=' ml-2 font-bold text-lg'>{fromTokenValue(stakeAmount, 18, 2)}</span>
                        </div>
                        <div>
                        </div>
                    </div>
                    <div className='flex leading-8  mb-3'>
                        <div className=' flex-1 '>
                            <span className='text-man  text-sm text-gray-300'>已释放:</span>
                            <span className=' ml-2 font-bold text-lg'>{fromTokenValue(releaseAmount, 18, 2)}</span>
                        </div>
                        <div>
                            <div className='tradeButton p-0' style={{ width: "100px" }} onClick={() => { sendUnstake() }}> 解押</div>
                        </div>
                    </div>
                    <div className='flex leading-8  mb-3'>
                        <div className=' flex-1 '>
                            <span className='text-man  text-sm text-gray-300'>收益:</span>
                            <span className=' ml-2 font-bold text-lg'>{fromTokenValue(rewardAmount, 18, 2)}</span>
                        </div>
                        <div>
                            <div className='tradeButton p-0' style={{ width: "100px" }} onClick={() => { sendHarvest() }}> 提取收益</div>
                        </div>
                    </div>
                </div>
                <div className=' mx-6 bg-white rounded-xl  mt-5 mb-8 p-3'>
                    <div className=' flex '>
                        <div className=' flex-1'>金额</div>
                        <div className='  w-36'>解锁时间</div>
                        <div className='w-20'>状态</div>
                    </div>
                    <div className=' pt-4 min-h-[150px] max-h-[270px] overflow-scroll'>
                        {
                            stakeList && stakeList.map((item: any, index: number) => {
                                return <div key={index} className=' flex text-sm pb-2 '>
                                    <div className='flex-1 leading-8'>{fromTokenValue(item.value, 18, 2)}</div>
                                    <div className=' w-36 leading-8' >{getTime(item.releaseTime.toString())}</div>
                                    <div className=' w-20 text-center'><StakeItemState releaseTime={item.releaseTime.toString()} unStakeId={item.unStakeId} /></div>
                                </div>
                            })
                        }
                    </div>
                    {/* <div className=' flex pt-3'>
                        <div>
                            <div className={`${pageIndex == "1" ? "tradeButtonGray" : "tradeButton"}   py-1 px-3`} onClick={() => {
                                if (pageIndex == "1") {
                                    console.log("diyiye")
                                } else {
                                    getStakeRecords(Number(pageIndex) - 1)
                                }
                            }}> 上一页</div>
                        </div>
                        <div className=' flex-1 text-center'>{pageIndex} </div>
                        <div>
                            <div className={`${new BigNumber(stakeList.length).isLessThan(pageCount) ? "tradeButtonGray" : "tradeButton"}   py-1 px-3`} onClick={() => {
                                if (new BigNumber(stakeList.length).isLessThan(pageCount)) {
                                    console.log("最后一页")
                                } else {
                                    getStakeRecords(Number(pageIndex) + 1)
                                }
                            }}> 下一页</div>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>

    )
}

export default StakeInfo
interface IStakeItemState {
    releaseTime: any,
    unStakeId: any,
}

function StakeItemState({ releaseTime, unStakeId }: IStakeItemState) {
    const { account } = useGlobal();
    const [state, setState] = useState<number>(1);
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
            html = <div className='  flex border border-[#cc4a4a] rounded-3xl py-1 px-1'>
                <img className=' w-5 h-5' src={lockEdIcon} alt="" />
                <p className=' pl-1'>已解锁</p>
            </div>
        } else if (num == 2) {
            html = <div className='  flex border border-[#cc4a4a] rounded-3xl py-1 px-1'>
                <img className=' w-5 h-5' src={lockIcon} alt="" />
                <p className=' pl-1'>锁定中</p>
            </div>
        } else if (num == 3) {
            html = <div className='  flex border border-[#cc4a4a] rounded-3xl py-1 px-1'>
                <img className=' w-5 h-5' src={checkIcon} alt="" />
                <p className=' pl-1'>已完成</p>
            </div>
        } else if (num == 4) {
            html = <div className='  flex border border-[#cc4a4a] rounded-3xl py-1 px-1'>
                <img className=' w-5 h-5' src={changeIcon} alt="" />
                <p className=' pl-1'>处理中</p>
            </div>
        }

        return html
    }

    return <div>
        {
            state && getHtml(state)
        }
    </div>
}

