import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useEnsName, useEnsAvatar, useChainId } from 'wagmi';
import { Gift } from 'lucide-react';

const Header = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // 只在以太坊主网上查询 ENS
  const shouldQueryENS = chainId === 1;
  
  const { data: ensName, error: ensNameError } = useEnsName({ 
    address, 
    chainId: 1,
    enabled: shouldQueryENS && !!address
  });
  
  const { data: ensAvatar, error: ensAvatarError } = useEnsAvatar({ 
    name: ensName, 
    chainId: 1,
    enabled: shouldQueryENS && !!ensName
  });
  
  // 调试信息
  console.log('当前链ID:', chainId);
  console.log('是否查询ENS:', shouldQueryENS);
  console.log('ENS名称:', ensName);
  console.log('ENS头像:', ensAvatar);
  console.log('ENS错误:', { ensNameError, ensAvatarError });

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 左侧 - 标题和Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">链上红包系统</h1>
              <p className="text-red-100 text-sm">发红包，抢红包，新年快乐！</p>
            </div>
          </div>

          {/* 右侧 - 钱包连接和用户信息 */}
          <div className="flex items-center space-x-4">
            {isConnected && (
              <div className="hidden md:flex items-center space-x-3 bg-white/10 rounded-lg px-4 py-2">
                {ensAvatar && (
                  <img 
                    src={ensAvatar} 
                    alt="ENS Avatar" 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {ensName || formatAddress(address)}
                  </div>
                  {ensName && (
                    <div className="text-xs text-red-200">
                      {formatAddress(address)}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="connect-button-wrapper">
              <ConnectButton 
                chainStatus="icon"
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
                showBalance={{
                  smallScreen: false,
                  largeScreen: true,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
