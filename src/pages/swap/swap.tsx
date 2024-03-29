import { useEffect, useState } from "react";
import Head from "../../components/head";
import TipPop from "../../components/pop/TipPop";
import NavCard from "../../components/navCard/navCard";
import TokenCyPop from "../../components/pop/tokenCyPop";
import BigNumber from "bignumber.js";
import { prepareWriteContract } from "wagmi/actions";
import { erc20ABI, routerABI } from "../../abi/abi";
import { useGlobal } from "../../context/GlobalProvider";
import { IResponse, fetchBalanceObj, getReadData, sendStatus } from "../../config/api";
import { maxInt256 } from "viem";
import TokenBalance from "../../components/token/tokenBalance";
import { verifyNum } from "../../utils/formatting";
import { formatNumber, fromTokenValue, toTokenValue } from "../../utils";
import TokenName from "../../components/token/TokenName";
import TokenIcon from "../../components/token/tokenIcon";
import { DownOutlined } from "@ant-design/icons";
import Popover from "antd/es/popover";
import SelectToken from "../../components/token/selectToken";

const INK = process.env.REACT_APP_TOKEN_INK + "";
const USDT = process.env.REACT_APP_TOKEN_USDT + "";
const factroryAddr = process.env.REACT_APP_FACTORY + "";
const routerAddr: any = process.env.REACT_APP_ROUTER + "";
export interface ITokenData {
  token: string,
  amount: string,
  amountView: string,
}

function Swap() {
  const { account } = useGlobal();

  const [tipOpen, setTipOpen] = useState<boolean>(false);
  const [tipOpenState, setTipOpenState] = useState<string>("loading");
  const [tipOpenText, setTipOpenText] = useState<string>("");

  const [tokenIn, setTokenIn] = useState<ITokenData>({
    amount: '',
    token: USDT,
    amountView: '',
  });

  const [tokenOut, setTokenOut] = useState<ITokenData>({
    amount: '',
    token: INK,
    amountView: '',
  });

  const [tokenADecimals, setTokenADecimals] = useState<any>("0")
  const [tokenBDecimals, setTokenBDecimals] = useState<any>("0")

  const [tokenPopOpen, setTpkenPopOpen] = useState<boolean>(false);
  const [tokenPopOpenType, setTpkenPopOpenType] = useState<string>("in");

  const [change, setChange] = useState<boolean>(true);
  const [slipValue, setSlipValue] = useState<string>('0.5');
  const [time, setTime] = useState<string>('1800');

  const [canChange, setCanChange] = useState<boolean>(true);

  useEffect(() => {
    if (tokenIn.token && tokenOut.token && account) {
      getDecimals(tokenIn.token, tokenOut.token)
    }
  }, [account, tokenIn.token, tokenOut.token])

  const init = () => {
    tokenIn.amount = "";
    tokenIn.amountView = "";
    tokenOut.amount = "";
    tokenOut.amountView = "";
    setChange(!change)
  }

  const getDecimals = async (tokena: string, tokenb: string) => {
    if (tokena == "BNB") {
      setTokenADecimals("18")
    } else {
      console.log("account, tokena", account, tokena)
      let tokenInErc20 = await fetchBalanceObj(account, tokena)
      console.log("tokenInErc20 tokena", tokenInErc20)
      let tokenaDecimals = tokenInErc20.decimals
      setTokenADecimals(tokenaDecimals)
    }
    if (tokenb == "BNB") {
      setTokenBDecimals("18")
    } else {
      let tokenOutErc20 = await fetchBalanceObj(account, tokena)
      let tokenbDecimals = tokenOutErc20.decimals
      setTokenBDecimals(tokenbDecimals)
    }
  }

  const onChangeIn = async (e: any) => {
    let value = e.target.value;
    value = verifyNum(value);
    console.log(value)
    tokenIn.amount = toTokenValue(value, Number(tokenADecimals));
    tokenIn.amountView = value;
    setTokenIn({ ...tokenIn });
    if (tokenIn.token == tokenOut.token) {
      tokenOut.amount = toTokenValue(value, Number(tokenADecimals));
      tokenOut.amountView = new BigNumber(value).toFixed(4);
      setTokenOut({ ...tokenOut });
      return
    }
    if (tokenOut.token) {
      getAmountsOut();
    }
  };


  const onChangeOut = (e: any) => {
    let value = e.target.value;
    value = verifyNum(value);
    tokenOut.amount = toTokenValue(value, Number(tokenBDecimals));
    tokenOut.amountView = value;

    setTokenOut({ ...tokenOut });
    if (tokenIn.token == tokenOut.token) {
      tokenIn.amount = toTokenValue(value, Number(tokenBDecimals));
      tokenIn.amountView = new BigNumber(value).toFixed(4);
      setTokenIn({ ...tokenIn });
      return
    }
    if (tokenIn.token) {
      getAmountsIn();
    }
  };

  const getAmountsOut = async () => {
    console.log(1)
    if (!tokenIn.amount || tokenIn.amount == '0') {
      tokenOut.amount = "";
      tokenOut.amountView = "";
      setTokenOut({ ...tokenOut });
      return
    }
    if (new BigNumber(tokenIn.amount).isZero()) {
      return;
    }
    let tokenInCake = tokenIn.token
    let tokenOutCake = tokenOut.token
    if (tokenIn.token == "BNB") {
      tokenInCake = process.env.REACT_APP_TOKEN_BNB + ""
    }
    if (tokenOut.token == "BNB") {
      tokenOutCake = process.env.REACT_APP_TOKEN_BNB + ""
    }

    try {
      let info: IResponse = await getReadData("getAmountsOut", routerABI, routerAddr, [tokenIn.amount, [tokenInCake, tokenOutCake]], account)
      if (info.code == 200) {
        setCanChange(true)
        tokenOut.amount = info.data[1].toString();
        tokenOut.amountView = formatNumber(fromTokenValue(info.data[1].toString(), Number(tokenBDecimals)), 4) + "";
        setTokenOut({ ...tokenOut });
      } else {
        setCanChange(false)
      }
    } catch (error) {
      setCanChange(false)
    }
  };

  const MaxIn = async () => {
    try {
      const balanceConfig: any = await fetchBalanceObj(account, tokenIn.token)
      tokenIn.amount = balanceConfig.value;
      tokenIn.amountView = fromTokenValue(balanceConfig.value, Number(balanceConfig.decimals), 4);
      setTokenIn({ ...tokenIn });
      if (tokenIn.token == tokenOut.token) {
        tokenOut.amount = balanceConfig.value;
        tokenOut.amountView = fromTokenValue(balanceConfig.value, Number(balanceConfig.decimals), 4);
        setTokenOut({ ...tokenOut });
        return
      }
      if (tokenOut.token) {
        getAmountsOut();
      }
    } catch (error) {

    }

  }

  const getAmountsIn = async () => {
    if (!tokenOut.amount || tokenOut.amount == '0') {
      tokenIn.amount = "";
      tokenIn.amountView = "";
      setTokenIn({ ...tokenIn });
      return
    }

    if (new BigNumber(tokenOut.amount).isZero()) {
      return;
    }
    let tokenInCake = tokenIn.token
    let tokenOutCake = tokenOut.token

    if (tokenIn.token == "BNB") {
      tokenInCake = process.env.REACT_APP_TOKEN_BNB + ""
    }
    if (tokenOut.token == "BNB") {
      tokenOutCake = process.env.REACT_APP_TOKEN_BNB + ""
    }

    try {
      let info: IResponse = await getReadData("getAmountsIn", routerABI, routerAddr, [tokenOut.amount, [tokenInCake, tokenOutCake]], account)
      if (info.code == 200) {
        setCanChange(true)
        tokenIn.amount = info.data[0].toString();
        tokenIn.amountView = formatNumber(fromTokenValue(info.data[0].toString(), Number(tokenADecimals)), 4) + "";
        setTokenIn({ ...tokenIn });
      } else {
        setCanChange(false)
      }
    } catch (error) {
      setCanChange(false)
    }
  };

  const sendSwapApprove = async () => {
    setTipOpen(true);
    setTipOpenState("loading")
    setTipOpenText("加载中...")
    let tokenAddr: any = tokenIn.token
    try {
      const allowanceConfig: any = await prepareWriteContract({
        address: tokenAddr,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [account, routerAddr],
      })
      const balanceConfig: any = await fetchBalanceObj(account, tokenAddr)

      let sendAmount = tokenIn.amount

      if (new BigNumber(balanceConfig.value).isLessThan(sendAmount)) {
        console.log("余额不足")
        setTipOpenState("error")
        setTipOpenText("余额不足")
        setTimeout(() => {
          setTipOpenState("")
          setTipOpen(false)
        }, 2000);
        return
      }

      if (new BigNumber(allowanceConfig.result.toString()).isLessThan(sendAmount)) {
        setTipOpenText("授权中...")
        const approveConfig = await prepareWriteContract({
          address: tokenAddr,
          abi: erc20ABI,
          functionName: 'approve',
          args: [routerAddr, BigInt(maxInt256)],
        })

        let status = await sendStatus(approveConfig)

        if (status) {
          console.log("授权成功")
          setTipOpenText("授权成功...")
          setTimeout(() => {
            sendSwapApprove()
          }, 1000);
        } else {
          setTipOpenState("error")
          setTipOpenText("授权失败")
          setTimeout(() => {
            setTipOpenState("")
            setTipOpen(false)
          }, 2000);
        }
      } else {
        sendSwap()
      }
    } catch (error) {
      sendTipErr()
    }
  }

  const sendSwap = async () => {
    let tokenInCake = tokenIn.token
    let tokenOutCake = tokenOut.token

    if (tokenIn.token == process.env.REACT_APP_TOKEN_BNB || tokenIn.token == "BNB") {
      tokenInCake = process.env.REACT_APP_TOKEN_BNB + ""
    }
    if (tokenOut.token == process.env.REACT_APP_TOKEN_BNB || tokenOut.token == "BNB") {
      tokenOutCake = process.env.REACT_APP_TOKEN_BNB + ""
    }

    let sendSlipValue = "0"
    if (slipValue == "") {
      sendSlipValue = "0.5"
    } else {
      sendSlipValue = slipValue
    }

    let deadline = parseInt(new Date().getTime() / 1000 + "") + Number(time);
    let amountOutMin = new BigNumber(tokenOut.amount).multipliedBy((100 - Number(sendSlipValue)) / 100).toFixed(0, 1);
    let amountIn = tokenIn.amount

    try {
      if (tokenInCake == process.env.REACT_APP_TOKEN_BNB + "") {
        try {
          const sendConfig = await prepareWriteContract({
            address: routerAddr,
            abi: routerABI,
            functionName: 'swapExactETHForTokens',
            args: [amountOutMin, [tokenInCake, tokenOutCake], account, deadline,],
            account: account,
            value: BigInt(amountIn)
          })
          console.log("sendConfig", sendConfig)
          let status = await sendStatus(sendConfig)
          if (status) {
            sendTipSuccess()
          } else {
            sendTipErr()
          }
        } catch (error) {
          sendTipErr()
        }
      } else if (tokenOutCake == process.env.REACT_APP_TOKEN_BNB + "") {
        try {
          const sendConfig = await prepareWriteContract({
            address: routerAddr,
            abi: routerABI,
            functionName: 'swapExactTokensForETH',
            args: [amountIn, amountOutMin, [tokenInCake, tokenOutCake], account, deadline],
            account: account,
          })
          console.log("sendConfig", sendConfig)

          let status = await sendStatus(sendConfig)
          if (status) {
            sendTipSuccess()
          } else {
            sendTipErr()
          }
        } catch (error) {
          sendTipErr()
        }
      } else {
        try {
          const sendConfig = await prepareWriteContract({
            address: routerAddr,
            abi: routerABI,
            functionName: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
            args: [tokenIn.amount, amountOutMin, [tokenInCake, tokenOutCake], account, deadline],
            account: account,
          })
          console.log("sendConfig", sendConfig)

          let status = await sendStatus(sendConfig)
          if (status) {
            sendTipSuccess()
          } else {
            sendTipErr()
          }
        } catch (error) {
          sendTipErr()
        }
      }
    } catch (error) {
      sendTipErr()
    }
  };

  const sendTipSuccess = () => {
    setTipOpenState("success")
    setTipOpenText("交易成功")
    setTimeout(() => {
      setTipOpen(false)
      setTipOpenState("")
      init()
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
  const getSetHtml = () => {
    return <div className=' min-w-[280px] '>
      <div className=" mb-2">
        <p className='textColor'>交易设置 </p>
      </div>
      <div className=" mb-1">
        <p className='textColor'>滑点容差</p>
      </div>

      <div className=' flex mb-2'>

        <div className=" flex-1">
          <p className=" text-center">
            <span onClick={() => {
              setSlipValue('0.1')
            }} className={`${Number(slipValue) == 0.1 ? "bg-[#3e0d09] text-white" : " "} py-1 px-3 border rounded-full`}>0.1 %</span>
          </p>
        </div>
        <div className=" flex-1">
          <p className=" text-center">
            <span onClick={() => {
              setSlipValue('0.2')
            }} className={`${Number(slipValue) == 0.2 ? "bg-[#3e0d09] text-white" : " "} py-1 px-3 border rounded-full`}>0.2 %</span>
          </p>
        </div>

        <div className=" flex-1">
          <p className=" text-center">
            <span onClick={() => {
              setSlipValue('0.5')
            }} className={`${Number(slipValue) == 0.5 ? "bg-[#3e0d09] text-white" : " "} py-1 px-3 border rounded-full`}>0.5 %</span>
          </p>
        </div>

        <div className=" flex-1">
          <p className=" text-center">
            <span onClick={() => {
              setSlipValue('1')
            }} className={`${Number(slipValue) == 1 ? "bg-[#3e0d09] text-white" : " "} py-1 px-3 border rounded-full`}>1 %</span>
          </p>
        </div>
      </div>
      <div className="flex">
        <input type="text" className="outline-none rounded-full  flex-1 text-right overflow-scroll leading-8 border ml-3 pr-6" value={slipValue} onChange={(e) => {
          let value = e.target.value;
          value = verifyNum(value);
          setSlipValue(value)
        }} placeholder='0.0' />
        <p className=" leading-8">%</p>
      </div>
    </div>
  }

  return (<div>
    <Head />
    <TipPop open={tipOpen} setOpen={setTipOpen} tipPopText={tipOpenText} tipPopState={tipOpenState} />
    <TokenCyPop open={tokenPopOpen} setOpen={setTpkenPopOpen} tokenType={tokenPopOpenType} tokenIn={tokenIn} setTokenIn={setTokenIn} tokenOut={tokenOut} setTokenOut={setTokenOut} />

    <div className="main">
      <div className="mx-6 text-white">
        <p className=' text-center font-bold text-2xl mb-6'>SWAP</p>

      </div>
      <div>
        <NavCard cardName="swap" />
      </div>
      <div className='mx-6 rounded-xl bg-white p-4'>
        <div className="flex mb-3">
          <div className="flex-1" >
            <p className=" font-medium">Swap</p>
          </div>
          <div>
            <Popover placement="bottomRight" content={getSetHtml} trigger="click">
              <svg className="sc-ow6uye-0 dKgVBY textColor" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </Popover>
          </div>
        </div>
        <div className=" rounded-xl bg-1 border border-1 p-3">
          <div className="flex ">
            <div className=" flex bg-white rounded-full px-2 py-1 mb-2" onClick={() => {
              setTpkenPopOpenType("in")
              setTpkenPopOpen(true)
            }}>
              <SelectToken tokenAddr={tokenIn.token + ""} />
            </div>

            <div className=" flex-1">
              <input className=' font-medium text-lg leading-8 h-8 bg-1 w-full border-none outline-none text-right' type="text" value={tokenIn.amountView} onChange={(e) => {
                onChangeIn(e)
              }} placeholder='0.0' />
            </div>
          </div>
          <div className=" flex text-sm">
            <p className=" "> 余额:</p>
            <p>
              <TokenBalance token={tokenIn.token} addr={account + ''} decimalPlaces={3} change={change} />
            </p>
            <p className=" text-red-500" onClick={() => { MaxIn() }}>(最大值)</p>
          </div>
        </div>
        <div className=" bg-1 relative  h-8 w-8 mt-3 p-1 rounded-lg z-10  border-2  border-white" style={{ margin: " 0 auto", marginTop: "-12px", marginBottom: "-12px" }} onClick={() => {
        }}>
          <svg style={{ marginLeft: "2px", marginTop: "2px" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
        </div>

        <div className=" rounded-xl bg-1 border border-1 p-3 mb-3">
          <div className="flex ">
            <div className=" flex bg-white rounded-full px-2 py-1 mb-2" onClick={() => {
              setTpkenPopOpenType("out")
              setTpkenPopOpen(true)
            }}>
              <SelectToken tokenAddr={tokenOut.token + ""} />
            </div>

            <div className="inputBox flex-1">
              <input className=' font-medium text-lg leading-8 h-8 bg-1 w-full border-none outline-none text-right' type="text" value={tokenOut.amountView} onChange={(e) => {
                onChangeOut(e)
              }} placeholder='0.0' />
            </div>
          </div>
          <div className=" flex text-sm">
            <p className=" "> 余额:  </p>
            <p>
              <TokenBalance token={tokenOut.token} addr={account + ''} decimalPlaces={3} change={change} />
            </p>
          </div>
        </div>
        {
          canChange && tokenIn.token !== tokenOut.token && new BigNumber(tokenIn.amount).isGreaterThan(0) && new BigNumber(tokenOut.amount).isGreaterThan(0) && <div className=" pb-3">
            <div className=" ">
              <p className="blackOrwhite font16" > 1 <TokenName tokenAddr={tokenIn.token} /> = {new BigNumber(tokenOut.amountView).dividedBy(tokenIn.amountView).toFixed(3)}<TokenName tokenAddr={tokenOut.token} /></p>
            </div>
          </div>
        }
        <div className=' pb-1'>
          {
            canChange ? <div className='tradeButton py-2' onClick={() => {
              sendSwapApprove()
            }} >兑换</div> : <div className='tradeButtonGray py-2' onClick={() => {
            }} >兑换</div>
          }
        </div>
      </div>
    </div>
  </div>
  )
}

export default Swap