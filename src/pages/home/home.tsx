import Head from '../../components/head'
import { Col, Row } from 'antd';

function Home() {

  return (
    <div>
      <Head />
      <div className='main'>
        <div className="mx-6 text-white">
          <div className=' mb-8'>
            <p className=' font-bold text-xl mb-3'>一、介绍</p>
            <p className="indent-6  text-xs">
              TradeOFF是一款适用于加密资产投资的，无风险高收益的DeFi平台设施。针对链上原生的加密
              资产，TradeOFF通过消除美金本位风险，并取缔追加保证金机制和基于DeFi的特性来重新定义
              期权交易。
            </p>
          </div>
          <div className=' mb-8'>
            <p className=' font-bold text-xl mb-4'>二、TradeOFF的核心特征</p>
            <div className=' flex text-xs text-center mb-4'>
              <div className=' w-1/2 mr-3 rounded-full py-2 bg-[rgb(225,95,59)] '>增加投资收益</div>
              <div className=' w-1/2 ml-3 rounded-full py-2 bg-[rgb(119,141,175)]'>自动执行合约</div>
            </div>
            <div className=' flex text-xs text-center'>
              <div className=' w-1/2 mr-3 rounded-full py-2  bg-[rgb(221,210,70)]'>外部风险隔离</div>
              <div className=' w-1/2 ml-3 rounded-full py-2 bg-[rgb(117,108,159)]'>无前置交易成本</div>
            </div>
          </div>

          <div className=' mb-8'>
            <p className=' font-bold text-xl mb-4'>三、TradeOFF的创新机制</p>


            <Row gutter={16}>
              <Col xs={12} sm={8}>
                <div className=' bg-white p-3 rounded-lg h-40 mb-5'>
                  <p className='font-normal mb-4 text-[rgb(225,95,59)] '>DMW</p>
                  <p className=' text-xs text-black'>
                    Decentralized <br />
                    Mortgage<br />
                    Warehouse<br />
                    去中心化质押债仓
                  </p>
                </div>
              </Col>

              <Col xs={12} sm={8}>
                <div className=' bg-white p-3 rounded-lg h-40 mb-5'>
                  <p className='font-normal mb-4 text-[rgb(76,53,190)]'>马丁格尔</p>
                  <p className=' text-xs text-black'>
                    Martingale:一种投资系统，其中投资的美元价值在损失后不断增加，或者头寸规模随着投资组合规模的减小而增加。
                  </p>
                </div>
              </Col>

              <Col xs={12} sm={8}>
                <div className=' bg-white p-3 rounded-lg h-40 mb-5'>
                  <p className=' font-normal mb-4 text-[rgb(139,178,187)]'>Restaking</p>
                  <p className=' text-xs text-black'> Restaking是将流动性质押平台代币资产用于在其他网络和区块链的验证者进行质押，以获得更多收益。</p>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home