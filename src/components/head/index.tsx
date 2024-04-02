import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useGlobal } from "../../context/GlobalProvider"
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Drawer from "antd/es/drawer";
import { homeIcon, ipoIcon, menuIcon, menuLogo, myIcon, returnIcon, stakeIcon, swapIcon } from "../../image";
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

  const changeLanguage = (changeLanguageStr: string) => {
    setMenuOpen(false)
    i18n.changeLanguage(changeLanguageStr)
  }

  const getManager = async () => {
    let { data, code }: IResponse = await getReadData("manager", usdtStakeABI, StakeAddr, [], account);
    console.log("getManager", data)
    if (code == 200) {
      setManagerAddr(data)
    }
  }

  return (
    <div className=' bg-[#1f0503] border-b border-[#000] z-50 backdrop-blur-xl fixed top-0 left-0 w-full h-12 px-2'>
      <div className='container text-black flex justify-between items-center mx-auto h-full'>
        <div className='  flex'>
          <img className=' mr-1 ' width={28} height={28} src={menuIcon}
            onClick={() => {
              setMenuOpen(true)
            }} alt=''
          />
          <Drawer
            placement={"left"}
            closable={false}
            onClose={() => {
              setMenuOpen(false)
            }}
            width={"200px"}
            style={{
              background: "#1f0503",
            }}
            open={menuOpen}
          >
            <div className=" flex border-b px-4 py-3">
              <img width={32} height={32} src={menuLogo} alt="" />
              <div className=" ml-4 text-lg font-bold leading-8 text-white"> Trade Off</div>
            </div>
            <div className=" px-6 pt-3 ">
              <div className=' text-white mb-4 flex' >
                <img className=" w-5 h-5 mr-2" src={homeIcon} alt="" />
                <p className='  ' onClick={() => {
                  navLink("/home")
                  setMenuOpen(false)
                }}>首页</p>
              </div>
              <div className=' text-white mb-4 flex' >
                <img className=" w-5 h-5 mr-2" src={ipoIcon} alt="" />
                <p className='  ' onClick={() => {
                  navLink("/ipo")
                  setMenuOpen(false)
                }}>IPO</p>
              </div>
              <div className=' text-white mb-4 flex' >
                <img className=" w-5 h-5 mr-2" src={swapIcon} alt="" />
                <p className='  ' onClick={() => {
                  navLink("/swap")
                  setMenuOpen(false)
                }}>兑换</p>
              </div>

              <div className=' text-white mb-4 flex' >
                <img className=" w-5 h-5 mr-2" src={stakeIcon} alt="" />
                <p className='  ' onClick={() => {
                  navLink("/stake")
                  setMenuOpen(false)
                }}>质押</p>
              </div>
              <div className=' text-white mb-4  flex' >
                <img className=" w-5 h-5 mr-2" src={myIcon} alt="" />
                <p className='  ' onClick={() => {
                  navLink("/myStake")
                  setMenuOpen(false)
                }}>我的质押</p>
              </div>
              {
                managerAddr == account && <div className=' text-white mb-4  flex' >
                  <img className=" w-5 h-5 mr-2" src={returnIcon} alt="" />
                  <p className='  ' onClick={() => {
                    navLink("/unStake")
                    setMenuOpen(false)
                  }}>赎回记录</p>
                </div>
              }

            </div>
          </Drawer>
          <img className=' mr-1 ' src={menuLogo} width={28} height={28} alt="" />
          <span className=' leading-7 font-bold text-white '>TRADE OFF</span>
        </div>

        <div className=' relative flex items-center justify-center  cursor-pointer '>
          <ConnectButton showBalance={false} accountStatus="address" />
        </div>
      </div>
    </div>
  )
}

export default Head