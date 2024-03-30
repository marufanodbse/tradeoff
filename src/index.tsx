import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import './index.css';

import '@rainbow-me/rainbowkit/styles.css';
import { Chain, darkTheme, getDefaultWallets, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  bsc,bscTestnet
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import App from './App';

import GlobalProvider from './context/GlobalProvider';
let net = process.env.REACT_APP_NetWork + ""



const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    bscTestnet
  ],
  [publicProvider()]
);

console.log("net", net)
const { connectors } = getDefaultWallets({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains,
});

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
