import { HashRouter, Route, Routes } from 'react-router-dom';
import Head from './components/head';
import { useAccount } from 'wagmi';
import { useUpdateGlobal } from './context/GlobalProvider';
import { useEffect } from 'react';
import Home from './pages/home/home';
import Stake from './pages/stake/stake';
import StakeInfo from './pages/stake/stakeInfo/stakeInfo';

const App = () => {
  const { address } = useAccount();
  const updateGlobal = useUpdateGlobal();

  useEffect(() => {
    updateGlobal({
      account: address
    })
  }, [address])

  return (
    <div className='App'>
      <HashRouter>
       
        <Routes >
          <Route path="/" element={<Home />} />
          <Route path="/home/:shareAddress?" element={<Home />} />
          <Route path="/stake" element={<Stake />} />
          <Route path="/myStake" element={<StakeInfo />} />
        </Routes>
      </HashRouter>
    </div>

  );
};

export default App;
