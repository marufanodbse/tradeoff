import { HashRouter, Route, Routes } from 'react-router-dom';
import Head from './components/head';
import { useAccount } from 'wagmi';
import { useUpdateGlobal } from './context/GlobalProvider';
import { useEffect } from 'react';
import Home from './pages/home/home';
import Stake from './pages/stake/stake';
import StakeInfo from './pages/stake/stakeInfo/stakeInfo';
import Ipo from './pages/ipo/ipo';
import Swap from './pages/swap/swap';
import Pool from './pages/pool/pool';
import AddPair from './pages/pool/addPair/addPair';
import AddPool from './pages/pool/add/addPool';
import RemovePool from './pages/pool/remove/removePool';

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
          {/* <Route path="/home/:shareAddress?" element={<Home />} /> */}
          <Route path="/home" element={<Home />} />
          <Route path="/stake/:shareAddress?" element={<Stake />} />
          <Route path="/myStake" element={<StakeInfo />} />
          <Route path="/ipo" element={<Ipo />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/pool" element={<Pool />} />
          <Route path="/pool/addPair" element={<AddPair />} />
          <Route path="/pool/add/:tokenA/:tokenB" element={<AddPool />} />
          <Route path="/pool/remove/:tokenA/:tokenB" element={<RemovePool />} />
        </Routes>
      </HashRouter>
    </div>

  );
};

export default App;
