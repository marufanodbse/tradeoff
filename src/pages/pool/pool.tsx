import { useEffect, useState } from "react"
import Head from "../../components/head"
import NavCard from "../../components/navCard/navCard"
import { useGlobal } from "../../context/GlobalProvider"
import { removeDup } from "../../utils"
import { useNavigate } from "react-router-dom"
import PairItem from "./pairItem"
import { useTranslation } from "react-i18next"
export const pairData = ["0x796acbA6556f70A3c5756A0d8Fd0a10251c21050"]

const REWARD = process.env.REACT_APP_TOKEN_REWARD + "";
const USDT = process.env.REACT_APP_TOKEN_USDT + "";

function Pool() {
    const navigate = useNavigate();
    const { t } = useTranslation()
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
            setPairList(newArr)
        } else {
            setPairList(arr)
        }
    }
    return (<div>
        <Head />
        <div className="main">
            <div>
                <p className=' text-center font-Copperplate text-3xl mb-10 text-[#4a1d83]'>TradeOFF</p>
            </div>
            <div className="mx-6">
                <p className=' text-center font-normal text-xl mb-2'>{t("Yourliquidity")}</p>
            </div>
            <div className="swapItemBg pt-6 pb-5">
                <div className=" mb-5">
                    <NavCard cardName="pool" />
                </div>
                <div className="borderSelectToken mx-6 mb-8">
                    <div className=' p-4 '>
                        <div className=" mb-4">
                            <p className=" text-sm font-bold mb-1">{t("Rewards")}</p>
                            <p className=" text-xs">
                                {t("RewardsDetail")}
                            </p>
                        </div>
                    </div>
                </div>
                <div className=" flex mx-6">
                    <div className="flex-1 tradeButton py-1" onClick={() => {
                        navigate('/pool/addPair');
                    }}>{t("Importpool")}</div>
                    <div className=" w-10"></div>
                    <div className=" flex-1 tradeButton py-1"
                        onClick={() => {
                            navigate('/pool/add/' + REWARD + '/' + USDT);
                        }}
                    >{t("Addpool")}</div>
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