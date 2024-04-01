import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import './index.css';

import '@rainbow-me/rainbowkit/styles.css';
import { Chain, connectorsForWallets, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  bsc, bscTestnet
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import App from './App';
import { metaMaskWallet, okxWallet, imTokenWallet, tokenPocketWallet, rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import GlobalProvider from './context/GlobalProvider';
let net = process.env.REACT_APP_NetWork + ""

const INK: Chain = {
  id: 54321,
  name: 'INK TestNet',
  network: 'INK TestNet',
  iconUrl: null,
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://gethdev.inkfinance.xyz'] },
    public: { http: ['https://gethdev.inkfinance.xyz'] },
  },
  blockExplorers: {
    etherscan: { name: 'BscScan', url: "https://exploredev.inkfinance.xyz" },
    default: { name: 'BscScan', url: "https://exploredev.inkfinance.xyz" },
  }
};

let projectId = "ae6db5c9c381306507026b30055a5bbe"

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    net == "INK" ? INK : net == "BSCTEST" ? bscTestnet : bsc,
  ],
  [publicProvider()]
);

console.log("net", net)

const connectors = connectorsForWallets([
  {
    groupName: 'Popular',
    wallets: [
      metaMaskWallet({ projectId, chains }),
      rainbowWallet({ projectId, chains }),
      walletConnectWallet({ projectId, chains }),
      tokenPocketWallet({ projectId, chains })
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <GlobalProvider>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains} >
          <App />
        </RainbowKitProvider>
      </WagmiConfig>
    </GlobalProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
