import React, { useEffect, useState } from 'react'
import Head from '../../components/head'
import { useParams } from 'react-router-dom';
import { useGlobal } from '../../context/GlobalProvider';
import { getReadData, sendStatus } from '../../config/api';
import { usdtStakeABI } from '../../abi/abi';
import { zeroAddress } from 'viem';
import Modal from 'antd/es/modal/Modal';
import Input from 'antd/es/input';
import { prepareWriteContract } from 'wagmi/actions';
import TipPop from '../../components/pop/TipPop';

let StakeAddr: any = process.env.REACT_APP_StakeAddr + ""
let UsdtAddr: any = process.env.REACT_APP_TOKEN_USDT + ""
function Home() {
  const { account } = useGlobal()
  const params = useParams()
  const [registerOpen, setRegisterOpen] = useState<boolean>(false);
  const [registerAddress, setRegisterAddress] = useState<string>("");


  const [tipOpen, setTipOpen] = useState<boolean>(false);
  const [tipOpenState, setTipOpenState] = useState<string>("loading");
  const [tipOpenText, setTipOpenText] = useState<string>("");


  useEffect(() => {
    init()
  }, [account, params])

  const init = async () => {
    if (params.shareAddress && account) {
      setRegisterAddress(params.shareAddress)
      try {
        let isTopData = await getReadData("isTopers", usdtStakeABI, StakeAddr, [account], account);
        let invitersData = await getReadData("inviters", usdtStakeABI, StakeAddr, [account], account);
        console.log("isTopData", isTopData, invitersData)
        if (isTopData.code == 200 && invitersData.code == 200 && isTopData.data == zeroAddress && invitersData.data == zeroAddress) {
          setRegisterOpen(true)
        } else {
          setRegisterOpen(false)
        }
      } catch (error) {
        setRegisterOpen(false)
      }
    } else {
      setRegisterOpen(false)
    }
  }
  // function register(address inviter) external;
  const sendRegister = async () => {
    setTipOpen(true);
    setTipOpenState("loading")
    setTipOpenText("加载中...")
    try {
      const stakeConfig = await prepareWriteContract({
        address: StakeAddr,
        abi: usdtStakeABI,
        functionName: 'register',
        args: [registerAddress],
        account: account
      })
      console.log("stakeConfig", stakeConfig)
      setTipOpenText("注册中...")
      let status = await sendStatus(stakeConfig)

      if (status) {
        sendTipSuccess()
      } else {
        sendTipErr()
      }
    } catch (error) {
      console.log("stakeConfig", error)
      sendTipErr()
    }
  }

  const sendTipSuccess = () => {
    setTipOpenState("success")
    setTipOpenText("注册成功")
    setTimeout(() => {
      init()
      setTipOpen(false)
      setTipOpenState("")
    }, 2000);
  }

  const sendTipErr = () => {
    setTipOpenState("error")
    setTipOpenText("注册失败")
    setTimeout(() => {
      setTipOpen(false)
      setTipOpenState("")
    }, 2000);
  }
  return (
    <div>
      <Head />
      <TipPop open={tipOpen} setOpen={setTipOpen} tipPopText={tipOpenText} tipPopState={tipOpenState} />

      <Modal zIndex={1000} open={registerOpen}
        style={{
          marginTop: "20%",
          maxWidth: "350px"
        }}
        onCancel={() => { setRegisterOpen(false) }}
        title="填写推荐人"
        footer={null}
      >
        <div >
          <div className=' mb-5'>
            <Input value={registerAddress} disabled />
          </div>
          <div>
            <div className='tradeButton py-2' onClick={() => {
              sendRegister()
            }} >确定</div>
          </div>
        </div>
      </Modal>
      <div className='main'>
        <div className="mx-6 text-white">
          <p className=' text-center font-bold text-2xl mb-3'>Stake</p>
          <p className="indent-8 pb-8 text-xs">
            BABY Social DAO致力于Web3.0、Metaverse和NFT领域，让世界各地的区块链爱好者通过寻找宝贝来重新定义资源融合。这样，区块链爱好者可以愉快地参与而不影响他们的日常生活和工作，同时获得相应的区块链财富。
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home