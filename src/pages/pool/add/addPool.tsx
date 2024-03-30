import { useEffect, useState } from "react";
import Head from "../../../components/head"
import TokenCyPop from "../../../components/pop/tokenCyPop"
import { useGlobal } from "../../../context/GlobalProvider"
import { useNavigate, useParams } from "react-router-dom";
import TokenName from "../../../components/token/TokenName";
import { IResponse, fetchBalanceObj, getReadData, sendStatus } from "../../../config/api";
import { erc20ABI, factoryABI, pairABI, routerABI } from "../../../abi/abi";
import { fromTokenValue, removeTrailingZeros, toTokenValue, trimNumber } from "../../../utils";
import BigNumber from "bignumber.js";
import { prepareWriteContract } from "wagmi/actions";
import { maxInt256, zeroAddress } from "viem";
import { verifyNum } from "../../../utils/formatting";
import TokenBalance from "../../../components/token/tokenBalance";
import TipPop from "../../../components/pop/TipPop";
import { PlusOutlined } from "@ant-design/icons";
import TokenIcon from "../../../components/token/tokenIcon";
import SelectToken from "../../../components/token/selectToken";
const factroryAddr = process.env.REACT_APP_FACTORY + "";
const routerAddr: any = process.env.REACT_APP_ROUTER + "";
function AddPool() {
  const navigate = useNavigate();
  const { account } = useGlobal();
  const params = useParams();

  const [tipOpen, setTipOpen] = useState<boolean>(false);
  const [tipOpenState, setTipOpenState] = useState<string>("loading");
  const [tipOpenText, setTipOpenText] = useState<string>("");
  const [tokenPopOpen, setTpkenPopOpen] = useState<boolean>(false);
  const [tokenPopOpenType, setTpkenPopOpenType] = useState<string>("in");

  const [tokenA, setTokenA] = useState<string>("");
  const [tokenB, setTokenB] = useState<string>("");
  const [tokenAAmount, setTokenAAmount] = useState<string>('');
  const [tokenBAmount, setTokenBAmount] = useState<string>('');
  const [tokenAAmountSend, setTokenAAmountSend] = useState<string>('');
  const [tokenBAmountSend, setTokenBAmountSend] = useState<string>('');

  const [tokenADecimals, setTokenADecimals] = useState<any>("0")
  const [tokenBDecimals, setTokenBDecimals] = useState<any>("0")

  const [tokenAReserves, setTokenAReserves] = useState<string>("0")
  const [tokenBReserves, setTokenBReserves] = useState<string>("0")

  const [tokenAtoTokenB, setTokenAtoTokenB] = useState<string>("0")
  const [tokenBtoTokenA, setTokenBtoTokenA] = useState<string>("0")

  const [accountPairAmount, setAccountPairAmount] = useState<string>("0")
  const [pairTotal, setPairTotal] = useState<string>("0")

  const [pairAddr, setPairAddr] = useState<string>("")
  const [change, setChange] = useState<boolean>(true);

  useEffect(() => {
    init()
  }, [params, account]);

  const init = () => {
    setChange(!change)
    setTokenAAmount("")
    setTokenBAmount("")
    setTokenAAmountSend("")
    setTokenAAmountSend("")
    let tokena = params.tokenA || ""
    let tokenb = params.tokenB || ""

    if (tokena == "BNB") {
      tokena = process.env.REACT_APP_TOKEN_BNB + ""
    }
    if (tokenb == "BNB") {
      tokenb = process.env.REACT_APP_TOKEN_BNB + ""
    }
    setTokenA(tokena);
    setTokenB(tokenb);
    getAmountsOut(tokena, tokenb)
    getPair(tokena, tokenb)
  }

  const getAmountsOut = async (tokena: string, tokenb: string) => {
    try {
      let tokenAErc20 = await fetchBalanceObj(account, tokena)
      let tokenBErc20 = await fetchBalanceObj(account, tokenb)

      let tokenaDecimals = tokenAErc20.decimals
      let tokenbDecimals = tokenBErc20.decimals

      setTokenADecimals(tokenaDecimals)
      setTokenBDecimals(tokenbDecimals)

      let info: IResponse = await getReadData("getAmountsOut", routerABI, routerAddr, [toTokenValue(1, tokenaDecimals), [tokena, tokenb]], account)
      setTokenAtoTokenB(info.data[1].toString())
      let info1: IResponse = await getReadData("getAmountsOut", routerABI, routerAddr, [toTokenValue(1, tokenbDecimals), [tokenb, tokena]], account)
      setTokenBtoTokenA(info1.data[1].toString())
    } catch (error) {
      setTokenAtoTokenB("0")
      setTokenBtoTokenA("0")
    }
  }

  const getPair = async (tokena: string, tokenb: string) => {
    try {
      let pairAddrData = await getReadData("getPair", factoryABI, factroryAddr, [tokena, tokenb], account);
      if (pairAddrData.code == 200) {
        let address = pairAddrData.data
        setPairAddr(address)
        try {
          let pairBalance = await getReadData("balanceOf", pairABI, address, [account], account);
          console.log(pairBalance, "pairBalance")
          setAccountPairAmount(pairBalance.data.toString())
          let total = await getReadData("totalSupply", pairABI, address, [], account);
          setPairTotal(total.data.toString())
          let token0Data = await getReadData("token0", pairABI, address, [], account);
          let reserves = await getReadData("getReserves", pairABI, address, [], account);
          if (tokena == token0Data.data) {
            setTokenAReserves(reserves.data[0].toString());
            setTokenBReserves(reserves.data[1].toString());
          } else {
            setTokenAReserves(reserves.data[1].toString());
            setTokenBReserves(reserves.data[0].toString());
          }
        } catch (error) {
          setAccountPairAmount("0");
          setPairTotal("0");
          setTokenAReserves("0");
          setTokenBReserves("0");
        }
      } else {
        setPairAddr("")
        setAccountPairAmount("0");
        setPairTotal("0");
        setTokenAReserves("0");
        setTokenBReserves("0");
        return
      }
    } catch (error) {
      setPairAddr("")
      setAccountPairAmount("0");
      setPairTotal("0");
      setTokenAReserves("0");
      setTokenBReserves("0");
    }
  }

  const onChangeAmount = (amount0: string, amount1: string, type?: string) => {
    if (tokenAReserves != '0' && tokenBReserves != '0') {
      if (amount0.length == 0 || amount1.length == 0) {
        setTokenAAmount("");
        setTokenAAmountSend("")
        setTokenBAmount("");
        setTokenBAmountSend("")
        return;
      }

      if (new BigNumber(amount0).isZero() && new BigNumber(amount1).isZero()) {
        setTokenAAmount(amount0);
        setTokenAAmountSend(toTokenValue(amount0, Number(tokenADecimals)))
        setTokenBAmount(amount1);
        setTokenBAmountSend(toTokenValue(amount1, Number(tokenBDecimals)))
        return;
      }

      if (amount0 != '0') {
        setTokenAAmount(amount0);
        setTokenAAmountSend(toTokenValue(amount0, Number(tokenADecimals)))
        setTokenBAmount(new BigNumber(fromTokenValue(new BigNumber(tokenBReserves).multipliedBy(toTokenValue(amount0, Number(tokenADecimals))).div(new BigNumber(tokenAReserves)).toFixed(), Number(tokenBDecimals))).toFixed(6));
        setTokenBAmountSend(new BigNumber(tokenBReserves).multipliedBy(toTokenValue(amount0, Number(tokenADecimals))).div(new BigNumber(tokenAReserves)).toFixed());
      } else {
        setTokenAAmount(new BigNumber(fromTokenValue(new BigNumber(tokenAReserves).multipliedBy(toTokenValue(amount1, Number(tokenBDecimals))).div(new BigNumber(tokenBReserves)).toFixed(), Number(tokenADecimals))).toFixed(6));
        setTokenAAmountSend(new BigNumber(tokenAReserves).multipliedBy(toTokenValue(amount1, Number(tokenBDecimals))).div(new BigNumber(tokenBReserves)).toFixed());
        setTokenBAmount(amount1);
        setTokenBAmountSend(toTokenValue(amount1, Number(tokenBDecimals)))
      }
    } else {
      if (new BigNumber(type + "").isZero()) {
        setTokenAAmount(amount0);
        setTokenAAmountSend(toTokenValue(amount0, Number(tokenADecimals)))
        setTokenBAmount(tokenBAmount);
        setTokenBAmountSend(toTokenValue(tokenBAmount, Number(tokenBDecimals)))
      } else {
        setTokenAAmount(tokenAAmount);
        setTokenAAmountSend(toTokenValue(tokenAAmount, Number(tokenADecimals)))
        setTokenBAmount(amount1);
        setTokenBAmountSend(toTokenValue(amount1, Number(tokenBDecimals)))
      }
    }
  }

  const sendAddLiquidityApprove = async (token: any, sendAmount: any, sendType: boolean) => {
    console.log(token)
    setTipOpen(true);
    setTipOpenState("loading")
    setTipOpenText("加载中...")
    try {
      const allowanceConfig: any = await prepareWriteContract({
        address: token,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [account, routerAddr],
      })
      const balanceConfig: any = await fetchBalanceObj(account, token)
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
          address: token,
          abi: erc20ABI,
          functionName: 'approve',
          args: [routerAddr, BigInt(maxInt256)],
        })

        let status = await sendStatus(approveConfig)

        if (status) {
          console.log("授权成功")
          setTipOpenText("授权成功...")
          setTimeout(() => {
            if (sendType) {
              sendAddLiquidity()
            } else {
              sendAddLiquidityApprove(tokenB, tokenBAmountSend, true)
            }

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
        if (sendType) {
          sendAddLiquidity()
        } else {
          sendAddLiquidityApprove(tokenB, tokenBAmountSend, true)
        }
      }
    } catch (error) {
      sendTipErr()
    }
  }

  const sendAddLiquidity = async () => {
    let deadline = parseInt(new Date().getTime() / 1000 + "") + 120;
    if (tokenA == process.env.REACT_APP_TOKEN_BNB || tokenA == "BNB") {
      try {
        const sendConfig = await prepareWriteContract({
          address: routerAddr,
          abi: routerABI,
          functionName: 'addLiquidityETH',
          args: [tokenB, toTokenValue(tokenBAmount, Number(tokenBDecimals)), 0, 0, account, deadline,],
          account: account,
          value: BigInt(toTokenValue(tokenAAmount, Number(tokenADecimals)))
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
    } else if (tokenB == process.env.REACT_APP_TOKEN_BNB || tokenB == "BNB") {

      try {
        const sendConfig = await prepareWriteContract({
          address: routerAddr,
          abi: routerABI,
          functionName: 'addLiquidityETH',
          args: [tokenA, toTokenValue(tokenA, Number(tokenADecimals)), 0, 0, account, deadline],
          account: account,
          value: BigInt(toTokenValue(tokenBAmount, Number(tokenBDecimals)))
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
          functionName: 'addLiquidity',
          args: [tokenA, tokenB, new BigNumber(tokenAAmountSend).toFixed(0), new BigNumber(tokenBAmountSend).toFixed(0), new BigNumber(tokenAAmountSend).toFixed(0), new BigNumber(tokenBAmountSend).toFixed(0), account, deadline],
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
  }

  const sendTipSuccess = () => {
    setTipOpenState("success")
    setTipOpenText("交易成功")
    setTimeout(() => {
      init()
      setTipOpen(false)
      setTipOpenState("")
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

  return (<div>
    <Head />
    <TipPop open={tipOpen} setOpen={setTipOpen} tipPopText={tipOpenText} tipPopState={tipOpenState} />
    <TokenCyPop open={tokenPopOpen} setOpen={setTpkenPopOpen} tokenType={tokenPopOpenType} linkType={"add"} linkTokenA={tokenA} linkTokenB={tokenB} />
    <div className="main">
      <div className='mx-6 rounded-xl bg-white px-5 py-3 mb-8'>
        <div className="flex mb-4">
          <div onClick={() => {
            navigate('/pool')
          }}>
            <svg className="sc-1tguxka-4 kSTWMO blackOrwhite" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </div>
          <div className="flex-1">
            <p className=" font-medium text-center " >添加流动池</p>
          </div>
        </div>
        <div className=" bg-1 rounded-lg  p-4 mb-4">
          <p className="  text-sm">提示:使用此工具可查找未自动出现在界面中的流动池。</p>
        </div>

        <div className=" rounded-xl bg-1 border border-1 p-3">
          <div className="flex ">
            <div className=" flex bg-white rounded-full px-2 py-1 mb-2" onClick={() => {
              setTpkenPopOpen(true)
              setTpkenPopOpenType("in")
            }}>
              <SelectToken tokenAddr={tokenA + ""} />
            </div>

            <div className="inputBox flex-1">
              <input className=' font-medium text-lg leading-8 h-8 bg-1 w-full border-none outline-none text-right' type="text" value={tokenAAmount} onChange={(e) => {
                let value = e.target.value;
                onChangeAmount(verifyNum(value), '0', "0");
              }} placeholder='0.0' />
            </div>
          </div>
          <div className=" flex text-sm">
            <p className=" "> 余额:</p>
            <p>
              <TokenBalance token={tokenA + ""} addr={account + ''} decimalPlaces={3} change={change} />
            </p>
          </div>
        </div>

        <div className=" text-center py-2  w-full ">
          <PlusOutlined />
        </div>

        <div className=" rounded-xl bg-1 border border-1 p-3 mb-5">
          <div className="flex ">
            <div className=" flex bg-white rounded-full px-2 py-1 mb-2" onClick={() => {
              setTpkenPopOpen(true)
              setTpkenPopOpenType("out")
            }}>
              <SelectToken tokenAddr={tokenB + ""} />
            </div>

            <div className="inputBox flex-1">
              <input className=' font-medium text-lg leading-8 h-8 bg-1 w-full border-none outline-none text-right' type="text" value={tokenBAmount} onChange={(e) => {
                let value = e.target.value;
                onChangeAmount('0', verifyNum(value), "1");
              }} placeholder='0.0' />
            </div>
          </div>
          <div className=" flex text-sm">
            <p className=" "> 余额:  </p>
            <p><TokenBalance token={tokenB + ""} addr={account + ''} decimalPlaces={3} change={change} /></p>
          </div>
        </div>

        <div className="rounded-xl bg-1  border border-1 mb-5 " >
          <div className=" p-3">
            <p className=" font-medium">兑换率和流动池份额</p>
          </div>
          <div className=" px-3 py-2 rounded-xl bg-1  border border-1 flex">
            <div className=" flex-1 ">
              <p className="">{trimNumber(fromTokenValue(tokenAtoTokenB, Number(tokenBDecimals), 4), 3)}</p>
              <p className=" text-sm">
                <TokenName tokenAddr={tokenA + ""} />每<TokenName tokenAddr={tokenB + ""} />
              </p>
            </div>
            <div className=" flex-1 ">
              <p className="">{trimNumber(fromTokenValue(tokenBtoTokenA, Number(tokenADecimals), 6), 3)}</p>
              <p className="text-sm">
                <TokenName tokenAddr={tokenB + ""} /> 每 <TokenName tokenAddr={tokenA + ""} />
              </p>
            </div>
            <div className=" flex-1">
              <p className="">
                {tokenAAmount !== "" ? <>
                  {
                    new BigNumber(toTokenValue(tokenAAmount, Number(tokenADecimals))).dividedBy(new BigNumber(tokenAReserves).plus(toTokenValue(tokenAAmount, Number(tokenADecimals)))).multipliedBy(100).isLessThan(0.01) ? "<0.01" : trimNumber(new BigNumber(toTokenValue(tokenAAmount, Number(tokenADecimals))).dividedBy(new BigNumber(tokenAReserves).plus(toTokenValue(tokenAAmount, Number(tokenADecimals)))).multipliedBy(100).toFixed(6), 3)
                  }
                </> : "0.00"}%
              </p>
              <p className="text-sm">
                流动池份额
              </p>
            </div>
          </div>
        </div>

        <div className="">
          {
            tokenAAmountSend == "" && tokenBAmountSend == "" ? <div className="tradeButtonGray py-2" >
              添加流动性
            </div> : <div className='tradeButton py-2' onClick={() => {
              sendAddLiquidityApprove(tokenA, tokenAAmountSend, false)
            }} >添加流动性</div>
          }

        </div>
      </div>


      {
        pairAddr !== zeroAddress ? <div className="mx-6 rounded-xl bg-white px-5 py-3 mb-8">
          <div>
            <p className=" font-medium"> 您的流动资金仓位</p>
          </div>
          <div className="flex  py-2 ">
            <div className="flex-1 ">
              <div className="flex text-sm">
                <div className='flex'>
                  <div className='tokenA'>
                    <TokenIcon tokenAddr={tokenA + ""} />
                  </div>
                  <div className=' relative z-10  -left-2'>
                    <TokenIcon tokenAddr={tokenB + ""} />
                  </div>
                </div>
                <div className="leading-6">
                  <TokenName tokenAddr={tokenA + ""} /> / <TokenName tokenAddr={tokenB + ""} />
                </div>
              </div>
            </div>
            <div className="text-sm leading-6"><TokenBalance token={pairAddr} addr={account + ""} decimalPlaces={6} change={change} /></div>
          </div>
          <div className="flex  text-sm">
            <div className="flex-1">您的流动池份额:</div>
            <div>
              {accountPairAmount == "0" ? 0 : removeTrailingZeros(new BigNumber(accountPairAmount).multipliedBy(100).dividedBy(pairTotal).toNumber(), 3)}%
            </div>
          </div>
          <div className="flex  text-sm">
            <div className="flex-1"><TokenName tokenAddr={tokenA + ""} />:</div>
            <div>
              {
                fromTokenValue(new BigNumber(tokenAReserves).multipliedBy(accountPairAmount).dividedBy(pairTotal).toFixed(), Number(tokenADecimals), 3)
              }
            </div>
          </div>
          <div className="flex  text-sm">
            <div className="flex-1"><TokenName tokenAddr={tokenB + ""} />:</div>
            <div>
              {
                fromTokenValue(new BigNumber(tokenBReserves).multipliedBy(accountPairAmount).dividedBy(pairTotal).toFixed(), Number(tokenBDecimals), 3)
              }

            </div>
          </div>
        </div> : <></>
      }
    </div>
  </div>)
}

export default AddPool