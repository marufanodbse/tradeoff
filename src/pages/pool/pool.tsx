import { useEffect, useState } from "react"
import Head from "../../components/head"
import NavCard from "../../components/navCard/navCard"
import { useGlobal } from "../../context/GlobalProvider"
import { removeDup } from "../../utils"
import { useNavigate } from "react-router-dom"
import PairItem from "./pairItem"
export const pairData = ["0x796acbA6556f70A3c5756A0d8Fd0a10251c21050"]

const INK = process.env.REACT_APP_TOKEN_INK + "";
const USDT = process.env.REACT_APP_TOKEN_USDT + "";

function Pool() {
    const navigate = useNavigate();
    const { account } = useGlobal()
    const [pairList, setPairList] = useState<any>([])

    useEffect(() => {
        getPaird()
    }, [account])

    const getPaird = async () => {
        let localPairData = localStorage.getItem("localPairData") + "";
        let arr = pairData
        if (localPairData) {
            var newArr = removeDup(arr.concat(JSON.parse(localPairData)));
            console.log(newArr)
            setPairList(newArr)
        } else {
            setPairList(arr)
        }
    }
    return (<div>
        <Head />
        <div className="main">
            <div className="mx-6 text-white">
                <p className=' text-center font-bold text-2xl mb-6'>您的流动性</p>
            </div>
            <div className=" mb-10">
                <NavCard cardName="pool" />
            </div>
            <div className='mx-6 rounded-xl bg-white p-4 mb-8'>
                <div className=" mb-4">
                    <p className=" text-sm font-bold mb-1">流动资金提供者奖励</p>
                    <p className=" text-xs">
                        流动资金提供者在所有交易中按其在流动池中的份额获得0.3%的手续费。手续费按实时累计方式添加到流动池中，可与流动资金一起赎回。
                    </p>
                </div>
                <div className=" flex">
                    <div className="flex-1 tradeButton py-1" onClick={() => {
                        navigate('/pool/addPair');
                    }}> 导入流动池</div>
                    <div className=" w-10"></div>
                    <div className=" flex-1 tradeButton py-1"
                        onClick={() => {
                            navigate('/pool/add/' + INK + '/' + USDT);
                        }}
                    > 添加流动池</div>
                </div>
            </div>

            <div className="pairList">
                {
                    pairList.length > 0 && pairList.map((item: any, index: number) => {
                        return <PairItem pairaddr={item} key={index} />
                    })
                }
            </div>
        </div>
    </div>

    )
}

export default Pool