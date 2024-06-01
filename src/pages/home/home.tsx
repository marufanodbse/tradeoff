import { useTranslation } from 'react-i18next'
import Head from '../../components/head'

function Home() {
  const { t } = useTranslation()
  return (
    <div>
      <Head />
      <div className='main font-DengXian'>
        <div>
          <p className=' text-center font-Copperplate text-3xl mb-10 text-[#4a1d83]'>TradeOFF</p>
        </div>
        <div className='homeItemBg  px-6 py-8'>
          <div className=' mb-8 text-white'>
            <p className='  font-normal  text-xl mb-3 text-center'> {t("Introduce")}</p>
            <p className="indent-6  text-xs">
              {t("IntroduceDetail")}
            </p>
          </div>

          <div className='  text-white'>
            <p className='  font-normal  text-xl mb-6 text-center'> {t("Features")}</p>
            <div className=' flex text-xs text-center mb-4'>
              <div className=' w-1/2 mr-3 rounded-xl  py-2 bg-[#EE5D16]'>{t("FeaturesItem1")}</div>
              <div className=' w-1/2 ml-3 rounded-xl py-2 bg-[#778DAF]'>{t("FeaturesItem2")}</div>
            </div>
            <div className=' flex text-xs text-center'>
              <div className=' w-1/2 mr-3 rounded-xl py-2  bg-[#DDD246]'>{t("FeaturesItem3")}</div>
              <div className=' w-1/2 ml-3 rounded-xl py-2 bg-[#756C9F]'>{t("FeaturesItem4")}</div>
            </div>
          </div>
        </div>
        <div className=' mt-4'>
          <p className='  font-normal text-[#30174A]  text-xl mb-6 text-center'> {t("innovative")} </p>
          <div className=' flex'>
            <div className=' flex-1 ml-3 bg-white pl-1 rounded-lg h-60 mb-5'>
              <p className='font-normal mb-3 mt-2 text-[#FF5A00] '>{t("DMW")}</p>
              <p className=' text-xs text-[#0C1A71]'>
                {t("DMWitem1")} <br />
                {t("DMWitem2")} <br />
                {t("DMWitem3")} <br />
                {t("DMWitem4")} <br />
                {t("DMWitem5")} <br />
              </p>
            </div>
            <div className=' flex-1 mx-3 bg-white pl-1 rounded-lg h-60 mb-5'>
              <p className='font-normal mb-3 mt-2 text-[#3400DD]'>{t("Martingel")}</p>
              <p className=' text-xs text-[#0C1A71]'>
                {t("MartingelDeatil")}
              </p>
            </div>
            <div className=' flex-1 mr-3 bg-white pl-1 rounded-lg h-60 mb-5'>
              <p className=' font-normal mb-3 mt-2 text-[#9C00DD]'>{t("Restaking")}</p>
              <p className=' text-xs text-[#0C1A71]'>{t("RestakingDetail")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home