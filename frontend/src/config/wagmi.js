import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, sepolia, localhost, mainnet } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: '红包系统',
  projectId: 'YOUR_PROJECT_ID', // 从 WalletConnect Cloud 获取
  chains: [
    {
      ...localhost,
      id: 31337,
    },
    // hardhat, 
    sepolia,
    mainnet // 添加以太坊主网支持 ENS
  ],
  ssr: false,
});
