import { Modal } from 'antd'
import { useState } from 'react'
import TokenBalance from '../token/tokenBalance'
import { useNavigate } from 'react-router-dom'
import { ITokenData } from '../../pages/swap/swap'
import { useGlobal } from '../../context/GlobalProvider'
import TokenName from '../token/TokenName'
import TokenIcon from '../token/tokenIcon'
interface OpenStatus {
    open: boolean,
    setOpen: Function,
    tokenType: string,
    tokenIn?: ITokenData,
    setTokenIn?: Function,
    tokenOut?: ITokenData,
    setTokenOut?: Function,
    linkType?: string,
    linkTokenA?: string,
    linkTokenB?: string,
    setTokenA?: Function,
    setTokenB?: Function,
}

const REWARD = process.env.REACT_APP_TOKEN_REWARD + "";
const USDT = process.env.REACT_APP_TOKEN_USDT + "";
const FREE = process.env.REACT_APP_TOKEN_FREE + "";
function TokenCyPop({ open, setOpen, tokenType, tokenIn, setTokenIn, tokenOut, setTokenOut, linkType, linkTokenA, linkTokenB, setTokenA, setTokenB }: OpenStatus) {
    const navigate = useNavigate();
    const { account } = useGlobal()
    const [type, setType] = useState<boolean>(false);
    const [typeManger, setTypeManger] = useState<boolean>(true);
    const [localData, setLocalData] = useState<any>([]);
    const [tokenList, setTopkenList] = useState<any>([REWARD, USDT, FREE])

    const handleCy = (item: any) => {
        if (tokenOut && setTokenOut && setTokenIn && tokenIn) {
            let obj: ITokenData = {
                amount: "",
                token: "",
                amountView: ""
            };
            obj.token = item
            if (tokenType == "in") {
                tokenOut.amount = "";
                tokenOut.amountView = "";
                setTokenOut({ ...tokenOut });
                setTokenIn(obj)
            } else if (tokenType == "out") {
                setTokenOut(obj)
                tokenIn.amount = "";
                tokenIn.amountView = "";
                setTokenIn({ ...tokenIn });
            }

        } else if (linkTokenA && linkTokenB && linkType) {
            if (tokenType == "in") {
                navigate('/pool/add/' + item + '/' + linkTokenB)
            } else if (tokenType == "out") {
                navigate('/pool/add/' + linkTokenA + '/' + item)
            }
        } else if (setTokenA && setTokenB) {
            if (tokenType == "in") {
                setTokenA(item)
            } else if (tokenType == "out") {
                setTokenB(item)
            }
        }
        setOpen(false)
    }

    return (
        <Modal
            className=''
            open={open}
            centered
            footer={null}
            closeIcon={null}
            width={"300px"}
        >
            <div className='flex  mb-4'>
                <div className="flex-1  font-medium">选择代币</div>
                <div onClick={() => {
                    setOpen(false)
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="sc-hia0it-1 cinYcx"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
            </div>
            <div className=' overflow-y-scroll h-min-20 h-max-35'>
                {
                    tokenList.map((item: any, index: number) => {
                        return <div key={index} className='flex mb-2 leading-6' onClick={() => {
                            handleCy(item)
                        }}>
                            <div className='flex-1 flex'>
                                <TokenIcon tokenAddr={item + ""} />
                                <span className=' ml-3'> <TokenName tokenAddr={item} /> </span>
                            </div>
                            <div>
                                <TokenBalance token={item} addr={account + ""} decimalPlaces={4} />
                            </div>
                        </div>
                    })
                }
            </div>

        </Modal>
    )
}

export default TokenCyPop