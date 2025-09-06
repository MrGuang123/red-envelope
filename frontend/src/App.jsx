import { useState, Suspense } from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { config } from './config/wagmi';
import Header from './components/Header';
import CreateEnvelope from './components/CreateEnvelope';
import SimpleEnvelopeList from './components/SimpleEnvelopeList';

import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});



function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEnvelopeCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            
            <main className="container mx-auto px-4 py-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* 左侧 - 发红包 */}
                <div>
                  <Suspense fallback={<div>加载中...</div>}>
                    <CreateEnvelope onEnvelopeCreated={handleEnvelopeCreated} />
                  </Suspense>
                </div>
                
                {/* 右侧 - 红包列表和抢红包 */}
                <div>
                  <Suspense fallback={<div>加载中...</div>}>
                    <SimpleEnvelopeList refreshTrigger={refreshTrigger} />
                  </Suspense>
                </div>
              </div>
            </main>

            {/* 页脚 */}
            <footer className="bg-white border-t mt-16">
              <div className="container mx-auto px-4 py-6">
                <div className="text-center text-gray-600">
                  <p>🧧 链上红包系统 - 让祝福在区块链上永存</p>
                  <p className="text-sm mt-2">
                    基于以太坊智能合约，安全、透明、去中心化
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
