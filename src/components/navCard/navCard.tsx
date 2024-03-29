import { useEffect } from "react"
import { useNavigate } from "react-router-dom";


interface INavCard {
    cardName: string
}

export default function NavCard({ cardName }: INavCard) {
    const navigate = useNavigate();
    useEffect(() => {
        // console.log(cardName)
    }, [cardName])

    const handleClickNav = (url: string) => {
        navigate(url);
    };

    return (<div className=" mx-6  py-1 px-5 bg-[#f1e7e7] rounded-full mb-5">
        <div className="flex">
            <div className={`${cardName == 'swap' ? " bg-[#3e0d09] text-white" : " "}  flex-1   text-center rounded-full py-1 cursor-pointer`} onClick={() => { handleClickNav("/swap") }}> swap</div>
            <div className={`${cardName == 'pool' ? " bg-[#3e0d09]  text-white" : ""}  flex-1   text-center rounded-full py-1 cursor-pointer`} onClick={() => { handleClickNav("/pool") }}> pool</div>
        </div>
    </div>
    )
}
