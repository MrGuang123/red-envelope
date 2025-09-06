import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { formatEther } from 'viem';
import { RED_ENVELOPE_ABI, RED_ENVELOPE_ADDRESS } from '../config/contracts';
import { Gift, Users, Clock, Shuffle, Equal, Loader2 } from 'lucide-react';

const SimpleEnvelopeList = ({ refreshTrigger }) => {
  const { address, chainId } = useAccount();
  const [envelopes, setEnvelopes] = useState([]);
  const [selectedEnvelope, setSelectedEnvelope] = useState(null);

  const contractAddress = RED_ENVELOPE_ADDRESS[chainId];

  // 获取红包总数 - 使用更安全的方式
  const { data: totalEnvelopes, error: totalError, refetch: refetchTotal } = useReadContract({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    functionName: 'getTotalEnvelopes',
    enabled: !!contractAddress,
    query: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  });

  // 监听红包创建事件，自动刷新列表
  useWatchContractEvent({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    eventName: 'EnvelopeCreated',
    enabled: !!contractAddress,
    onLogs: (logs) => {
      console.log('新红包创建:', logs);
      refetchTotal();
    },
  });

  // 监听红包被抢事件，自动刷新选中的红包
  useWatchContractEvent({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    eventName: 'EnvelopeClaimed',
    enabled: !!contractAddress,
    onLogs: (logs) => {
      console.log('红包被抢:', logs);
      // 触发重新渲染，让选中的红包重新获取数据
      setSelectedEnvelope(prev => prev === null ? null : prev);
    },
  });

  // 生成红包列表
  useEffect(() => {
    if (totalEnvelopes && Number(totalEnvelopes) > 0) {
      const count = Number(totalEnvelopes);
      const list = [];
      
      // 只显示最近的5个红包，避免太多请求
      const start = Math.max(0, count - 5);
      
      for (let i = count - 1; i >= start; i--) {
        list.push({ id: i });
      }
      
      setEnvelopes(list);
    } else if (!totalError) {
      // 如果没有红包但也没有错误，显示空状态
      setEnvelopes([]);
    }
  }, [totalEnvelopes, refreshTrigger, totalError]);

  if (totalError) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">红包列表</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">暂时无法加载红包列表</p>
          <p className="text-sm text-gray-400 mt-2">请稍后重试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">红包列表</h2>
        <div className="text-sm text-gray-600">
          {totalEnvelopes ? `总计: ${totalEnvelopes} 个` : '加载中...'}
        </div>
      </div>

      {envelopes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            🧧
          </div>
          <p className="text-gray-500 text-lg mb-2">还没有红包</p>
          <p className="text-gray-400 text-sm">
            创建第一个红包，开始分享喜悦吧！
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {envelopes.map((envelope) => (
            <EnvelopeItem
              key={envelope.id}
              envelopeId={envelope.id}
              isSelected={selectedEnvelope === envelope.id}
              onSelect={() => setSelectedEnvelope(selectedEnvelope === envelope.id ? null : envelope.id)}
            />
          ))}
          
          {selectedEnvelope !== null && (
            <div className="mt-6 border-t pt-6">
              <ClaimSection envelopeId={selectedEnvelope} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 红包项目组件
const EnvelopeItem = ({ envelopeId, isSelected, onSelect }) => {
  const { chainId } = useAccount();
  const contractAddress = RED_ENVELOPE_ADDRESS[chainId];

  const { data: envelopeData, error, isLoading, refetch: refetchEnvelopeItem } = useReadContract({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    functionName: 'getEnvelopeInfo',
    args: [BigInt(envelopeId)],
    enabled: !!contractAddress,
    query: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  });

  // 监听这个特定红包的被抢事件
  useWatchContractEvent({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    eventName: 'EnvelopeClaimed',
    enabled: !!contractAddress,
    onLogs: (logs) => {
      // 检查是否是当前红包被抢
      logs.forEach((log) => {
        if (log.args && Number(log.args.envelopeId) === envelopeId) {
          console.log(`红包 ${envelopeId} 被抢，刷新数据`);
          refetchEnvelopeItem();
        }
      });
    },
  });

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">加载红包 #{envelopeId}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4 border-red-200 bg-red-50">
        <div className="text-center py-4">
          <span className="text-red-600">红包 #{envelopeId} 加载失败</span>
        </div>
      </div>
    );
  }

  if (!envelopeData) {
    return null;
  }

  const [creator, totalAmount, remainingAmount, totalCount, remainingCount, isRandom, isActive, message] = envelopeData;

  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-red-200 hover:bg-red-50/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-800">红包 #{envelopeId}</span>
              {isRandom ? (
                <Shuffle className="w-4 h-4 text-orange-500" title="随机红包" />
              ) : (
                <Equal className="w-4 h-4 text-blue-500" title="均分红包" />
              )}
            </div>
            
            <div className="text-sm text-gray-600 mt-1">
              {message || '恭喜发财，大吉大利！'}
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
              <span className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {Number(remainingCount)}/{Number(totalCount)}
              </span>
              <span>
                剩余: {formatEther(remainingAmount)} ETH
              </span>
              <span className={`px-2 py-1 rounded ${
                isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {isActive ? '可抢' : '已完成'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-gray-800">
            {formatEther(totalAmount)} ETH
          </div>
          <div className="text-xs text-gray-500">
            来自: {creator.slice(0, 6)}...{creator.slice(-4)}
          </div>
        </div>
      </div>
    </div>
  );
};

// 抢红包组件
const ClaimSection = ({ envelopeId }) => {
  const { address, chainId } = useAccount();
  const contractAddress = RED_ENVELOPE_ADDRESS[chainId];

  // 获取红包信息
  const { data: envelopeData, refetch: refetchEnvelope } = useReadContract({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    functionName: 'getEnvelopeInfo',
    args: [BigInt(envelopeId)],
    enabled: !!contractAddress,
    query: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  });

  // 检查是否已经抢过
  const { data: hasClaimed, refetch: refetchClaimed } = useReadContract({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    functionName: 'hasClaimed',
    args: [BigInt(envelopeId), address],
    enabled: !!address && !!contractAddress,
    query: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  });

  // 抢红包交易
  const { 
    writeContract, 
    data: hash, 
    error: writeError, 
    isPending: isWritePending 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleClaim = () => {
    if (!contractAddress) return;
    
    writeContract({
      address: contractAddress,
      abi: RED_ENVELOPE_ABI,
      functionName: 'claimEnvelope',
      args: [BigInt(envelopeId)],
    });
  };

  // 成功后重新检查状态
  useEffect(() => {
    if (isConfirmed) {
      refetchClaimed();
      refetchEnvelope(); // 同时更新红包信息
    }
  }, [isConfirmed, refetchClaimed, refetchEnvelope]);

  // 解析红包数据
  if (!envelopeData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">加载红包信息...</p>
        </div>
      </div>
    );
  }

  const [creator, totalAmount, remainingAmount, totalCount, remainingCount, isRandom, isActive, message] = envelopeData;

  // 检查是否是自己创建的红包
  const isCreator = address && creator.toLowerCase() === address.toLowerCase();

  // 检查红包是否还有剩余
  const hasRemaining = Number(remainingCount) > 0 && isActive;

  // 1. 如果是创建者，不能抢自己的红包
  if (isCreator) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-center">
          <div className="text-2xl mb-2">👤</div>
          <p className="text-blue-800 font-medium">这是您创建的红包</p>
          <p className="text-blue-600 text-sm mt-1">不能抢自己发的红包哦</p>
          <div className="mt-3 text-xs text-blue-500">
            <p>红包状态: {hasRemaining ? '进行中' : '已完成'}</p>
            <p>剩余: {Number(remainingCount)}/{Number(totalCount)} 个</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. 如果红包已经抢完或不活跃
  if (!hasRemaining) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-center">
          <div className="text-2xl mb-2">😔</div>
          <p className="text-gray-700 font-medium">红包已经抢完了</p>
          <p className="text-gray-500 text-sm mt-1">来晚了一步，下次要快点哦</p>
          <div className="mt-3 text-xs text-gray-500">
            <p>总共: {Number(totalCount)} 个红包</p>
            <p>剩余: {Number(remainingCount)} 个</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. 如果已经抢过
  if (hasClaimed) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-center">
          <div className="text-2xl mb-2">🎉</div>
          <p className="text-yellow-800 font-medium">您已经抢过这个红包了！</p>
          <p className="text-yellow-600 text-sm mt-1">每个红包只能抢一次哦</p>
        </div>
      </div>
    );
  }

  // 4. 如果刚刚抢成功
  if (isConfirmed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="text-center">
          <div className="text-2xl mb-2">🎊</div>
          <p className="text-green-800 font-medium">红包抢成功！</p>
          <p className="text-green-600 text-sm mt-1">恭喜您获得了红包奖励！</p>
          <div className="mt-3 text-xs text-green-600">
            <p>红包剩余: {Number(remainingCount) - 1}/{Number(totalCount)} 个</p>
          </div>
        </div>
      </div>
    );
  }

  // 5. 正常的抢红包界面
  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
      <div className="text-center">
        <div className="text-3xl mb-3">🧧</div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">抢红包</h3>
        <div className="text-sm text-gray-600 mb-4">
          <p>剩余: {Number(remainingCount)}/{Number(totalCount)} 个</p>
          <p>金额: {formatEther(remainingAmount)} ETH</p>
        </div>
        
        {writeError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded text-red-700 text-sm">
            抢红包失败: {writeError.shortMessage || writeError.message}
          </div>
        )}
        
        <button
          onClick={handleClaim}
          disabled={isWritePending || isConfirming}
          className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-red-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
        >
          {isWritePending || isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isWritePending ? '确认中...' : '处理中...'}
            </>
          ) : (
            <>
              <Gift className="w-4 h-4 mr-2" />
              立即抢红包
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 mt-3">
          点击按钮抢红包，每个红包只能抢一次
        </p>
      </div>
    </div>
  );
};

export default SimpleEnvelopeList;
