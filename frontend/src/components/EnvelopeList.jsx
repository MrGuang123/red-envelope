import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { formatEther } from 'viem';
import { RED_ENVELOPE_ABI, RED_ENVELOPE_ADDRESS } from '../config/contracts';
import ClaimEnvelope from './ClaimEnvelope';
import { Gift, Shuffle, Equal, Loader2 } from 'lucide-react';

const EnvelopeList = () => {
  const { chainId } = useAccount();
  const [envelopes, setEnvelopes] = useState([]);
  const [selectedEnvelope, setSelectedEnvelope] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const contractAddress = RED_ENVELOPE_ADDRESS[chainId];

  // 获取红包总数
  const { data: totalEnvelopes, refetch: refetchTotal, error: totalError } = useReadContract({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    functionName: 'getTotalEnvelopes',
    enabled: !!contractAddress,
  });

  // 如果获取总数失败，显示错误状态而不是让页面崩溃
  if (totalError) {
    console.error('获取红包总数失败:', totalError);
  }

  // 监听红包创建事件
  useWatchContractEvent({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    eventName: 'EnvelopeCreated',
    onLogs(logs) {
      console.log('新红包创建:', logs);
      setRefreshTrigger(prev => prev + 1);
      // 显示通知
      logs.forEach(log => {
        showNotification(`🎉 新红包创建！总金额 ${formatEther(log.args.totalAmount)} ETH`, 'success');
      });
    },
  });

  // 监听红包领取事件
  useWatchContractEvent({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    eventName: 'EnvelopeClaimed',
    onLogs(logs) {
      console.log('红包被领取:', logs);
      setRefreshTrigger(prev => prev + 1);
      // 显示通知
      logs.forEach(log => {
        showNotification(`💰 有人抢到了 ${formatEther(log.args.amount)} ETH！`, 'info');
      });
    },
  });

  // 监听红包完成事件
  useWatchContractEvent({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    eventName: 'EnvelopeCompleted',
    onLogs(logs) {
      console.log('红包抢完:', logs);
      setRefreshTrigger(prev => prev + 1);
      // 显示通知
      logs.forEach(log => {
        showNotification('🎊 红包已被抢完！', 'warning');
      });
    },
  });

  // 获取红包列表
  useEffect(() => {
    const fetchEnvelopes = async () => {
      if (!contractAddress || !totalEnvelopes || Number(totalEnvelopes) === 0) return;

      const envelopeList = [];
      const count = Number(totalEnvelopes);
      
      // 获取最近的10个红包
      const start = Math.max(0, count - 10);
      
      for (let i = count - 1; i >= start; i--) {
        envelopeList.push({
          id: i,
        });
      }
      
      setEnvelopes(envelopeList);
    };

    fetchEnvelopes();
  }, [contractAddress, totalEnvelopes, refreshTrigger]);

  // 简单的通知系统
  const showNotification = (message, type = 'info') => {
    // 这里可以集成更复杂的通知库，比如 react-toastify
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // 简单的浏览器通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('红包系统', {
        body: message,
        icon: '/vite.svg'
      });
    }
  };

  // 请求通知权限
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleEnvelopeClaimed = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!contractAddress) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">请连接到支持的网络</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Gift className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-800">红包列表</h2>
          </div>
          <div className="text-sm text-gray-600">
            总共 {totalEnvelopes ? Number(totalEnvelopes) : 0} 个红包
          </div>
        </div>

        {!totalEnvelopes || Number(totalEnvelopes) === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">还没有红包</p>
            <p className="text-gray-400">快来发第一个红包吧！</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {envelopes.map((envelope) => (
              <EnvelopeListItem 
                key={envelope.id}
                envelopeId={envelope.id}
                onSelect={() => setSelectedEnvelope(envelope.id)}
                isSelected={selectedEnvelope === envelope.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* 选中的红包详情 */}
      {selectedEnvelope !== null && (
        <ClaimEnvelope 
          envelopeId={selectedEnvelope}
          onEnvelopeClaimed={handleEnvelopeClaimed}
        />
      )}
    </div>
  );
};

// 红包列表项组件
const EnvelopeListItem = ({ envelopeId, onSelect, isSelected }) => {
  const { chainId } = useAccount();
  const contractAddress = RED_ENVELOPE_ADDRESS[chainId];

  const { data: envelopeData, error } = useReadContract({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    functionName: 'getEnvelopeInfo',
    args: [BigInt(envelopeId)],
    enabled: !!contractAddress && envelopeId >= 0,
  });

  if (error) {
    console.error(`获取红包 ${envelopeId} 信息失败:`, error);
    return (
      <div className="border rounded-lg p-4 border-red-200 bg-red-50">
        <div className="text-center py-4">
          <span className="text-red-600">红包 #{envelopeId} 加载失败</span>
        </div>
      </div>
    );
  }

  if (!envelopeData) {
    return (
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">加载中...</span>
        </div>
      </div>
    );
  }

  const [creator, totalAmount, remainingAmount, totalCount, remainingCount, isRandom, isActive, message] = envelopeData;

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const progress = totalCount > 0 ? ((totalCount - remainingCount) / totalCount) * 100 : 0;

  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${isRandom ? 'bg-purple-100' : 'bg-blue-100'}`}>
            {isRandom ? (
              <Shuffle className="w-5 h-5 text-purple-600" />
            ) : (
              <Equal className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">
                红包 #{envelopeId}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isActive ? '进行中' : '已结束'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              来自 {formatAddress(creator)}
            </p>
            {message && (
              <p className="text-sm text-gray-500 italic mt-1">
                "{message.length > 20 ? message.slice(0, 20) + '...' : message}"
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="font-bold text-lg">
            {formatEther(totalAmount)} ETH
          </div>
          <div className="text-sm text-gray-600">
            {Number(totalCount - remainingCount)}/{Number(totalCount)} 个
          </div>
          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvelopeList;
