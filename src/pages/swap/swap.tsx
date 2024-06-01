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
import Popover from "antd/es/popover";
import SelectToken from "../../components/token/selectToken";
import { Input } from "antd";
import { swapSetIcon } from "../../image";
import { ArrowDownOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const REWARD = process.env.REACT_APP_TOKEN_REWARD + "";
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
  const { t } = useTranslation()
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
    token: REWARD,
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
      let tokenInErc20 = await fetchBalanceObj(account, tokena)
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
    setTipOpenText(`${t("TransactionPacking")}`)
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
        setTipOpenState("error")
        setTipOpenText(`${t("Insufficientbalance")}`)
        setTimeout(() => {
          setTipOpenState("")
          setTipOpen(false)
        }, 2000);
        return
      }

      if (new BigNumber(allowanceConfig.result.toString()).isLessThan(sendAmount)) {
       setTipOpenText(`${t("Authorizing")}`)
        const approveConfig = await prepareWriteContract({
          address: tokenAddr,
          abi: erc20ABI,
          functionName: 'approve',
          args: [routerAddr, BigInt(maxInt256)],
        })

        let status = await sendStatus(approveConfig)

        if (status) {
         setTipOpenText(`${t("AuthorizationSuccessful")}`)
          setTimeout(() => {
            sendSwapApprove()
          }, 1000);
        } else {
          setTipOpenState("error")
          setTipOpenText(`${t("AuthorizationFailed")}`)
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
    setTipOpenText(`${t("successfulTransaction")}`)
    setTimeout(() => {
      setTipOpen(false)
      setTipOpenState("")
      init()
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
  const getSetHtml = () => {
    return <div className=' min-w-[280px] '>
      <div className=" mb-2">
        <p className='textColor'>{t("settings")} </p>
      </div>
      <div className=" mb-1">
        <p className='textColor'>{t("Sliding")}</p>
      </div>

      <div className=' flex mb-2'>

        <div className=" flex-1">
          <p className=" text-center">
            <span onClick={() => {
              setSlipValue('0.1')
            }} className={`${Number(slipValue) == 0.1 ? "navCardSelect text-white" : " "} py-1 px-3 border rounded-xl`}>0.1 %</span>
          </p>
        </div>
        <div className=" flex-1">
          <p className=" text-center">
            <span onClick={() => {
              setSlipValue('0.2')
            }} className={`${Number(slipValue) == 0.2 ? "navCardSelect text-white" : " "} py-1 px-3 border rounded-xl`}>0.2 %</span>
          </p>
        </div>

        <div className=" flex-1">
          <p className=" text-center">
            <span onClick={() => {
              setSlipValue('0.5')
            }} className={`${Number(slipValue) == 0.5 ? "navCardSelect text-white" : " "} py-1 px-3 border rounded-xl`}>0.5 %</span>
          </p>
        </div>

        <div className=" flex-1">
          <p className=" text-center">
            <span onClick={() => {
              setSlipValue('1')
            }} className={`${Number(slipValue) == 1 ? "navCardSelect text-white" : " "} py-1 px-3 border rounded-xl`}>1 %</span>
          </p>
        </div>
      </div>
      <div className="flex">
        <Input type="text" className=" rounded-xl px-1  flex-1 text-right overflow-scroll " value={slipValue} onChange={(e) => {
          let value = e.target.value;
          value = verifyNum(value);
          setSlipValue(value)
        }} addonAfter={<span>%</span>} placeholder='0.0' />
      </div>
    </div>
  }

  return (<div>
    <Head />
    <TipPop open={tipOpen} setOpen={setTipOpen} tipPopText={tipOpenText} tipPopState={tipOpenState} />
    <TokenCyPop open={tokenPopOpen} setOpen={setTpkenPopOpen} tokenType={tokenPopOpenType} tokenIn={tokenIn} setTokenIn={setTokenIn} tokenOut={tokenOut} setTokenOut={setTokenOut} />

    <div className="main">
      <div>
        <p className=' text-center font-Copperplate text-3xl mb-10 text-[#4a1d83]'>TradeOFF</p>
      </div>
      <div className="mx-6">
        <p className=' text-center font-normal text-xl mb-2'>SWAP</p>
      </div>
      <div className="swapItemBg pt-6 pb-5">
        <NavCard cardName="swap" />
        <div className='mx-6 rounded-xl'>
          <div className="flex mb-3">
            <div className="flex-1" >
              <p className=" font-medium">Swap</p>
            </div>
            <div>
              <Popover placement="bottomRight" content={getSetHtml} trigger="click">
                <img className=" w-6 h-6" src={swapSetIcon} alt="" />
              </Popover>
            </div>
          </div>
          <div className="  borderSelectToken ">
            <div className=" mx-4 my-3">
              <div className="flex ">
                <div className=" flex bg-white rounded-full px-2 py-1 mb-2" onClick={() => {
                  setTpkenPopOpenType("in")
                  setTpkenPopOpen(true)
                }}>
                  <SelectToken tokenAddr={tokenIn.token + ""} />
                </div>
                <div className=" flex-1">
                  <input className=' font-medium text-lg leading-8 h-8  w-full border-none outline-none text-right' type="text" value={tokenIn.amountView} onChange={(e) => {
                    onChangeIn(e)
                  }} placeholder='0.0' />
                </div>
              </div>
              <div className=" flex text-sm pb-1">
                <p className=" "> {t("Balance")}:</p>
                <p>
                  <TokenBalance token={tokenIn.token} addr={account + ''} decimalPlaces={3} change={change} />
                </p>
                <p className=" text-red-500" onClick={() => { MaxIn() }}>({t("Maximum")})</p>
              </div>
            </div>
          </div>

          <div className=" bg-white relative  h-10 w-10 mt-3 rounded-lg z-10    " style={{ margin: " 0 auto", marginTop: "-12px", marginBottom: "-12px" }} onClick={() => {
          }}>
            <div className="  borderSelectToken ">
              <ArrowDownOutlined className=" p-3" />
            </div>
          </div>
          <div className="  borderSelectToken  mb-8">
            <div className=" mx-4 my-3">
              <div className="flex ">
                <div className=" flex bg-white rounded-full px-2 py-1 mb-2" onClick={() => {
                  setTpkenPopOpenType("out")
                  setTpkenPopOpen(true)
                }}>
                  <SelectToken tokenAddr={tokenOut.token + ""} />
                </div>

                <div className="inputBox flex-1">
                  <input className=' font-medium text-lg leading-8 h-8 w-full border-none outline-none text-right' type="text" value={tokenOut.amountView} onChange={(e) => {
                    onChangeOut(e)
                  }} placeholder='0.0' />
                </div>
              </div>
              <div className=" flex text-sm pb-1">
                <p className=" "> {t("Balance")}:  </p>
                <p>
                  <TokenBalance token={tokenOut.token} addr={account + ''} decimalPlaces={3} change={change} />
                </p>
              </div>
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
              }} >{t("Exchange")}</div> : <div className='tradeButtonGray py-2' onClick={() => {
              }} >{t("Exchange")}</div>
            }
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Swap