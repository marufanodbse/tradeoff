import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useGlobal } from "../../context/GlobalProvider"
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Drawer from "antd/es/drawer";
import { homeIcon, ipoIcon, languageIcon, menuIcon, menuLogo, myIcon, nodeIcon, returnIcon, stakeIcon, swapIcon } from "../../image";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { IResponse, getReadData } from "../../config/api";
import { ipoABI, usdtStakeABI } from "../../abi/abi";

interface IHead {
  setOpen?: Function
  ipoChange?: Boolean
  isRegister?: Boolean
}
let StakeAddr: any = process.env.REACT_APP_StakeAddr + ""

function Head({ setOpen, isRegister }: IHead) {
  const { account } = useGlobal()
  const navigate = useNavigate();
  const { t } = useTranslation()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [path, setPath] = useState<string>('/');
  const [managerAddr, setManagerAddr] = useState<string>("")

  useEffect(() => {
    setPath(location.pathname);
    getManager()
  }, [isRegister, account, location.pathname])

  const navLink = (url: string) => {
    navigate(url)
  }

  const changeLanguage = () => {
    let changeLanguageStr
    if (i18n.language == "zh_CN") {
      changeLanguageStr = 'en_US'
    } else {
      changeLanguageStr = 'zh_CN'
    }
    i18n.changeLanguage(changeLanguageStr);
  }

  const getManager = async () => {
    let { data, code }: IResponse = await getReadData("manager", usdtStakeABI, StakeAddr, [], account);
    if (code == 200) {
      setManagerAddr(data)
    }
  }

  return (
    <>
      <Drawer
        placement={"top"}
        closable={false}
        onClose={() => {
          setMenuOpen(false)
        }}
        height={"350px"}
        open={menuOpen}
      >
        <div className="navBg flex px-5 py-4">
          <div>
            <img className='  mt-1 mr-4 ' src={menuIcon} width={32} alt="" />
          </div>
          <div className=" flex-1">
            <div className=" text-2xl text-navColor font-normal leading-8  font-FZLTXHK pb-8"> TradeOff</div>
            <div >
              {/* <div className=' text-navColor mb-4 flex' onClick={() => {
                navLink("/home")
                setMenuOpen(false)
              }} >
                <img className=" w-6 h-6 mr-6" src={homeIcon} alt="" />
                <p className=' text-base ' >{t("Home")}</p>
              </div> */}

              <div className='text-navColor  mb-4 flex' onClick={() => {
                navLink("/node")
                setMenuOpen(false)
              }} >
                <img className="w-6 h-6 mr-6" src={nodeIcon} alt="" />
                <p className=' text-base ' >{t("Node")}</p>
              </div>
              <div className=' text-navColor mb-4 flex' onClick={() => {
                navLink("/swap")
                setMenuOpen(false)
              }} >
                <img className=" w-6 h-6 mr-6" src={swapIcon} alt="" />
                <p className=' text-base ' >{t("Exchange")}</p>
              </div>

              <div className=' text-navColor mb-4 flex' onClick={() => {
                navLink("/stake")
                setMenuOpen(false)
              }}>
                <img className=" w-6 h-6 mr-6" src={stakeIcon} alt="" />
                <p className=' text-base ' >{t("Pledge")}</p>
              </div>
              <div className=' text-navColor mb-4 flex' onClick={() => {
                changeLanguage()
                setMenuOpen(false)
              }} >
                <img className=" w-6 h-6 mr-6" src={languageIcon} alt="" />
                <p className=' text-base ' >{t("language")}</p>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
      <div className='  z-50 backdrop-blur-xl fixed top-0 left-0 w-full h-12 px-2'>
        <div className='container text-black flex justify-between items-center mx-auto h-full'>
          <div className='  flex'>
            <img className=' mr-2 ' width={24} height={24} src={menuIcon}
              onClick={() => {
                setMenuOpen(true)
              }} alt=''
            />
            <img className=' mr-2 ' src={menuLogo} width={24} height={24} alt="" />
            <span className=' leading-6 text-xl font-bold font-FZLTXHK text-[#4a1d83]'>TradeOFF</span>
          </div>
          <div className=' relative flex items-center justify-center  cursor-pointer '>
            <ConnectButton showBalance={false} accountStatus="address" />
          </div>
        </div>
      </div>
    </>
  )
}

export default Head