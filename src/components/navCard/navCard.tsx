import { useEffect } from "react"
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";


interface INavCard {
    cardName: string
}

export default function NavCard({ cardName }: INavCard) {
    const navigate = useNavigate();
    const {t}=useTranslation()
    useEffect(() => {
    }, [cardName])

    const handleClickNav = (url: string) => {
        navigate(url);
    };

    return (<div className=" mx-6  py-2 px-5 bg-white rounded-xl mb-3">
        <div className="flex">
            <div className={`${cardName == 'swap' ? " navCardSelect  text-white" : " "} font-navCard  flex-1   text-center rounded-full py-1 cursor-pointer`} onClick={() => { handleClickNav("/swap") }}> {t("swap")}</div>
            <div className={`${cardName == 'pool' ? " navCardSelect  text-white" : ""} font-navCard  flex-1   text-center rounded-full py-1 cursor-pointer`} onClick={() => { handleClickNav("/pool") }}> {t("pool")}</div>
        </div>
    </div>
    )
}
