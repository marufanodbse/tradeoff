import Head from '../../../components/head'
import { useNavigate, useParams } from 'react-router-dom';
import { IResponse, fetchBalanceObj, getReadData, sendStatus } from '../../../config/api';
import { useEffect, useState } from 'react';
import { useGlobal } from '../../../context/GlobalProvider';
import { erc20ABI, factoryABI, pairABI, routerABI } from '../../../abi/abi';
import TokenName from '../../../components/token/TokenName';
import Slider from 'antd/es/slider';
import { fromTokenValue, toTokenValue } from '../../../utils';
import { maxInt256 } from 'viem';
import BigNumber from "bignumber.js";
import TipPop from '../../../components/pop/TipPop';
import { prepareWriteContract } from 'wagmi/actions';
import { ArrowDownOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const factroryAddr = process.env.REACT_APP_FACTORY + "";
const routerAddr: any = process.env.REACT_APP_ROUTER + "";
function RemovePool() {
  const params = useParams();
  const navigate = useNavigate();
  const { account } = useGlobal();

  const [value, setValue] = useState<number>(50);

  const [tokenA, setTokenA] = useState<string>(params.tokenA + "");
  const [tokenB, setTokenB] = useState<string>(params.tokenB + "");

  const [tokenADecimals, setTokenADecimals] = useState<any>("0")
  const [tokenBDecimals, setTokenBDecimals] = useState<any>("0")

  const [tokenAReserves, setTokenAReserves] = useState<string>("0")
  const [tokenBReserves, setTokenBReserves] = useState<string>("0")

  const [tokenAtoTokenB, setTokenAtoTokenB] = useState<string>("0")
  const [tokenBtoTokenA, setTokenBtoTokenA] = useState<string>("0")


  const [accountPairAmount, setAccountPairAmount] = useState<string>("0")
  const [pairTotal, setPairTotal] = useState<string>("0")

  const [pairAddress, setPairAddress] = useState<string>("");

  const [tipOpen, setTipOpen] = useState<boolean>(false);
  const [tipOpenState, setTipOpenState] = useState<string>("loading");
  const [tipOpenText, setTipOpenText] = useState<string>("");

  useEffect(() => {
    init()
  }, [params]);

  const init = () => {
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

  const getPair = async (tokena: string, tokenb: string) => {
    if (tokena == "BNB") {
      tokena = process.env.REACT_APP_TOKEN_BNB + ""
    }
    if (tokenb == "BNB") {
      tokenb = process.env.REACT_APP_TOKEN_BNB + ""
    }

    try {
      let pairAddrData = await getReadData("getPair", factoryABI, factroryAddr, [tokena, tokenb], account);
      if (pairAddrData.code == 200) {
        let address = pairAddrData.data
        setPairAddress(address)

        let pairBalance = await getReadData("balanceOf", pairABI, address, [account], account);
        console.log("pairBalance", pairBalance)
        setAccountPairAmount(pairBalance.data.toString())
        let total = await getReadData("totalSupply", pairABI, address, [], account);
        setPairTotal(total.data.toString())
        let token0Data = await getReadData("token0", pairABI, address, [], account);
        let reserves = await getReadData("getReserves", pairABI, address, [], account);
        console.log("getReserves", reserves)
        if (tokena == token0Data.data) {
          setTokenAReserves(reserves.data[0].toString());
          setTokenBReserves(reserves.data[1].toString());
        } else {
          setTokenAReserves(reserves.data[1].toString());
          setTokenBReserves(reserves.data[0].toString());
        }
      } else {
        setPairAddress("")
        setAccountPairAmount("0");
        setPairTotal("0");
        setTokenAReserves("0");
        setTokenBReserves("0");
        return
      }
    } catch (error) {
      console.log(error)
      setPairAddress("")
      setAccountPairAmount("0");
      setPairTotal("0");
      setTokenAReserves("0");
      setTokenBReserves("0");
    }
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
    }
  }

  const getValue = (value: any) => {
    console.log(value)
    setValue(value);
  };

  const sendRemoveLiquidityApprove = async (token: any) => {
    setTipOpen(true);
    setTipOpenState("loading")
    setTipOpenText("加载中...")
    let liquidityAmount = new BigNumber(accountPairAmount).toFixed();

    if (value < 100) {
      liquidityAmount = new BigNumber(liquidityAmount).multipliedBy(value).dividedBy(100).toFixed(0);
    }

    try {
      const allowanceConfig: any = await prepareWriteContract({
        address: token,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [account, routerAddr],
      })
      console.log("allowanceConfig", allowanceConfig)
      if (new BigNumber(allowanceConfig.result.toString()).isLessThan(liquidityAmount)) {
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
            sendRemoveLiquidityApprove(token)
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
        sendRemoveLiquidity(liquidityAmount)
      }
    } catch (err: any) {
      sendTipErr()
    }
  }


  const sendRemoveLiquidity = async (liquidityAmount: any) => {
    let deadline = parseInt(new Date().getTime() / 1000 + "") + 120;
    if (tokenA == "BNB" || tokenA == process.env.REACT_APP_TOKEN_BNB + "") {
      removeLiquidityETH(tokenB, liquidityAmount, 0, 0, account, deadline);
    } else if (tokenB == "BNB" || tokenB == process.env.REACT_APP_TOKEN_BNB + "") {
      removeLiquidityETH(tokenA, liquidityAmount, 0, 0, account, deadline);
    } else {
      try {
        const sendConfig = await prepareWriteContract({
          address: routerAddr,
          abi: routerABI,
          functionName: 'removeLiquidity',
          args: [tokenA, tokenB, liquidityAmount, 0, 0, account, deadline],
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
  };

  const removeLiquidityETH = async (token: string, liquidityAmount: any, amountTokenMin: any, amountETHMin: any, to: any, deadline: any) => {

    try {
      const sendConfig = await prepareWriteContract({
        address: routerAddr,
        abi: routerABI,
        functionName: 'removeLiquidityETH',
        args: [token, liquidityAmount, amountTokenMin, amountETHMin, to, deadline,],
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


  const sendTipSuccess = () => {
    setTipOpenState("success")
    setTipOpenText("交易成功")
    setTimeout(() => {
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

    <div className="main">
      <div className='mx-6 rounded-xl bg-white px-5 py-3 mb-8'>
        <div className="flex mb-4">
          <div onClick={() => {
            navigate('/pool')
          }}>
            <ArrowLeftOutlined />
          </div>
          <div className="flex-1">
            <p className=" font-medium text-center " >移除流动池</p>
          </div>
        </div>

        <div className=" bg-1 mt-5 rounded-xl p-3 ">
          <div className="flex">
            <p className=' flex-1'>移除LP</p>
            <p> {fromTokenValue(new BigNumber(accountPairAmount).multipliedBy(value).dividedBy(100).toString(), 18, 3)}</p>
          </div>
          <div className=" font-medium text-3xl py-2" >
            {value} %
          </div>
          <div>
            <Slider
              defaultValue={value}
              value={value}
              styles={{
                track: {
                  background: "#bd0e21",
                },
                tracks: {
                  background: "#bd0e21",
                },
                handle: {
                  background: "#bd0e21",
                }
              }}
              tooltip={{ formatter: null }} onChange={(e) => { getValue(e) }} />
          </div>
          <div className="flex text-center ">
            <div className="flex-1">
              <span onClick={() => {
                setValue(25)
              }}>25%</span>
            </div>
            <div className="flex-1">
              <span onClick={() => {
                setValue(50)
              }}>50%</span>
            </div>
            <div className="flex-1">
              <span onClick={() => {
                setValue(75)
              }}>75%</span>
            </div>
            <div className="flex-1">
              <span onClick={() => {
                setValue(100)
              }}>100%</span>
            </div>
          </div>
        </div>
        <div className=" text-center py-2  w-full ">
          <ArrowDownOutlined />
        </div>
        <div className=" bg-1 rounded-xl p-3 mb-4">
          <div className="flex  font-medium">
            <div className="flex-1 ">
              {
                fromTokenValue(new BigNumber(tokenAReserves).multipliedBy(accountPairAmount).dividedBy(pairTotal).multipliedBy(value).dividedBy(100).toFixed(), Number(tokenADecimals), 6)
              }
            </div>
            <div>
              <TokenName tokenAddr={tokenA} />
            </div>
          </div>
          <div className="flex  font-medium">
            <div className="flex-1 ">
              {
                fromTokenValue(new BigNumber(tokenBReserves).multipliedBy(accountPairAmount).dividedBy(pairTotal).multipliedBy(value).dividedBy(100).toFixed(), Number(tokenBDecimals), 6)
              }
            </div>
            <div>
              <TokenName tokenAddr={tokenB} />
            </div>
          </div>
        </div>

        <div className=" text-xs mb-4" >
          <div>
            兑换率:
          </div>
          <div className="flex-1 text-right">
            <p>1 <TokenName tokenAddr={tokenA} /> ={fromTokenValue(tokenAtoTokenB, Number(tokenBDecimals), 6)} <TokenName tokenAddr={tokenB} /></p>
            <p>1 <TokenName tokenAddr={tokenB} /> ={fromTokenValue(tokenBtoTokenA, Number(tokenADecimals), 6)} <TokenName tokenAddr={tokenA} /></p>
          </div>
        </div>

        <div className="flex-1" style={{
          margin: "0px 10px"
        }}>
          <div className='tradeButton py-2' onClick={() => {
            sendRemoveLiquidityApprove(pairAddress)
          }} >移除</div>
        </div>
      </div>
    </div>
  </div>)
}

export default RemovePool