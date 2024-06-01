import { useEffect, useState } from "react";
import Head from "../../../components/head"
import TipPop from "../../../components/pop/TipPop"
import { useGlobal } from "../../../context/GlobalProvider";
import { IResponse, getReadData, sendStatus } from "../../../config/api";
import { usdtStakeABI } from "../../../abi/abi";
import { formatAccount, fromTokenValue, getTime, toTokenValue } from "../../../utils";
import { Checkbox, Radio, Tooltip } from "antd";
import { prepareWriteContract } from "wagmi/actions";
import { useTranslation } from "react-i18next";
let StakeAddr: any = process.env.REACT_APP_StakeAddr + ""

function Unstake() {
    const { account } = useGlobal()
    const { t } = useTranslation()
    const [tipOpen, setTipOpen] = useState<boolean>(false);
    const [tipOpenState, setTipOpenState] = useState<string>("loading");
    const [tipOpenText, setTipOpenText] = useState<string>("");
    const [unStakeList, setUnStakeList] = useState<any>([])

    const [sendList, setSendList] = useState<any>([])

    useEffect(() => {
        getUnstakeRecords()
    }, [account])

    const getUnstakeRecords = async () => {
        let { data, code }: IResponse = await getReadData("unstakeRecords", usdtStakeABI, StakeAddr, [0, 10000000], account);
        if (code == 200) {
            let arr: any = [];
            for (let index = 0; index < data[0].length; index++) {
                const element = data[0][index];
                const element1 = data[1][index];
                let obj = {
                    amount: element1.amount,
                    finished: element1.finished,
                    owner: element1.owner,
                    unstakeTime: element1.unstakeTime,
                    id: element
                }
                arr.push(obj)
            }

            setUnStakeList([...arr])
        }
    }

    const getStatus = (Id: any) => {
        let dataIndex = sendList.findIndex((item: any) => {
            return item.id == Id
        });
        if (dataIndex === -1) {
            return false
        } else {
            return true
        }
    }
    // payUnstakes
    const sendPayUnstakes = async () => {
        setTipOpen(true);
        setTipOpenState("loading")
         setTipOpenText(`${t("TransactionPacking")}`)
        try {
            let ids: any = [];
            for (let index = 0; index < sendList.length; index++) {
                const element = sendList[index];
                console.log(element)
                ids.push(element.id)
            }
            console.log("ids", ids);
            const Config = await prepareWriteContract({
                address: StakeAddr,
                abi: usdtStakeABI,
                functionName: 'payUnstakes',
                args: [ids],
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
        getUnstakeRecords()
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

    return (<div>
        <Head />
        <TipPop open={tipOpen} setOpen={setTipOpen} tipPopText={tipOpenText} tipPopState={tipOpenState} />

        <div className=' main '>
            <div className=" max-h-[600px] overflow-scroll">
                {
                    unStakeList.map((item: any, index: number) => {
                        return <div className='mx-6 rounded-xl bg-white mb-5 text-sm'>
                            <div className=" flex border-b  pt-3 pb-2">
                                <Tooltip title={item.owner}>
                                    <div className=" pl-4 flex-1">{formatAccount(item.owner, 8, 8)}</div>
                                </Tooltip>
                                <div className=" pr-4">
                                    {
                                        item.finished ? "已支付" : <Checkbox checked={getStatus(item.id)} onChange={(e) => {
                                            console.log(e)
                                            if (e.target.checked) {
                                                sendList.push(item)
                                                setSendList([...sendList])
                                            } else {
                                                let dataIndex = sendList.findIndex((itemData: any) => {
                                                    return itemData.id == item.id
                                                });

                                                console.log("dataIndex", dataIndex)
                                                setSendList([...sendList.splice(dataIndex + 1, 1)])
                                            }
                                        }}>去支付</Checkbox>
                                    }
                                </div>
                            </div>
                            <div className=" flex pb-3 pt-2">
                                <div className=" w-1/2 pl-4 font-medium">{fromTokenValue(item.amount, 18, 3)} USDT</div>
                                <div className=" w-1/2 pr-4"> {getTime(item.unstakeTime.toString())}</div>
                            </div>
                        </div>
                    })
                }
            </div>


        </div>

        <div className=" fixed bottom-0 w-full bg-[#1f0503]">
            {
                sendList.length > 0 ? <div className='tradeButton p-0 leading-7 my-3  w-40  m-auto' onClick={() => {
                    console.log(sendList)
                    sendPayUnstakes()
                }}> 支付</div> : <div className='tradeButtonGray p-0 leading-7 my-3  w-40  m-auto'> 支付</div>
            }
        </div>
    </div >)
}

export default Unstake