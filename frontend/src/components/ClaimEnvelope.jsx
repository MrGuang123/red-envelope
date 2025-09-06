import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { RED_ENVELOPE_ABI, RED_ENVELOPE_ADDRESS } from '../config/contracts';
import { Gift, Users, Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';

const ClaimEnvelope = ({ envelopeId, onEnvelopeClaimed }) => {
  const { address, chainId } = useAccount();
  const [envelopeInfo, setEnvelopeInfo] = useState(null);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [claimAmount, setClaimAmount] = useState('0');

  const contractAddress = RED_ENVELOPE_ADDRESS[chainId];

  // 获取红包信息
  const { data: envelopeData, refetch: refetchEnvelope, error: envelopeError } = useReadContract({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    functionName: 'getEnvelopeInfo',
    args: [BigInt(envelopeId)],
    enabled: !!contractAddress && envelopeId !== undefined && envelopeId >= 0,
  });

  // 检查是否已领取
  const { data: claimedStatus, refetch: refetchClaimed } = useReadContract({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    functionName: 'hasClaimed',
    args: [BigInt(envelopeId), address],
    enabled: !!contractAddress && !!address && envelopeId !== undefined,
  });

  // 获取领取金额
  const { data: userClaimAmount, refetch: refetchClaimAmount } = useReadContract({
    address: contractAddress,
    abi: RED_ENVELOPE_ABI,
    functionName: 'getClaimAmount',
    args: [BigInt(envelopeId), address],
    enabled: !!contractAddress && !!address && envelopeId !== undefined && claimedStatus,
  });

  // 抢红包交易
  const { 
    data: hash,
    error,
    isPending,
    writeContract 
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({
      hash,
    });

  // 更新状态
  useEffect(() => {
    if (envelopeData) {
      const [creator, totalAmount, remainingAmount, totalCount, remainingCount, isRandom, isActive, message, createdAt] = envelopeData;
      setEnvelopeInfo({
        creator,
        totalAmount,
        remainingAmount,
        totalCount,
        remainingCount,
        isRandom,
        isActive,
        message,
        createdAt
      });
    }
  }, [envelopeData]);

  useEffect(() => {
    setHasClaimed(!!claimedStatus);
  }, [claimedStatus]);

  useEffect(() => {
    if (userClaimAmount) {
      setClaimAmount(formatEther(userClaimAmount));
    }
  }, [userClaimAmount]);

  // 交易确认后刷新数据
  useEffect(() => {
    if (isConfirmed) {
      refetchEnvelope();
      refetchClaimed();
      refetchClaimAmount();
      if (onEnvelopeClaimed) {
        onEnvelopeClaimed();
      }
    }
  }, [isConfirmed, refetchEnvelope, refetchClaimed, refetchClaimAmount, onEnvelopeClaimed]);

  const handleClaim = async () => {
    if (!contractAddress) {
      alert('当前网络不支持，请切换到支持的网络');
      return;
    }

    try {
      await writeContract({
        address: contractAddress,
        abi: RED_ENVELOPE_ABI,
        functionName: 'claimEnvelope',
        args: [BigInt(envelopeId)]
      });
    } catch (err) {
      console.error('抢红包失败:', err);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString('zh-CN');
  };

  if (envelopeError) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 mb-2">红包信息加载失败</p>
            <p className="text-gray-500 text-sm">请检查红包ID是否正确</p>
          </div>
        </div>
      </div>
    );
  }

  if (!envelopeInfo) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <span className="ml-2 text-gray-600">加载红包信息中...</span>
        </div>
      </div>
    );
  }

  const isCreator = address?.toLowerCase() === envelopeInfo.creator?.toLowerCase();
  const canClaim = !isCreator && !hasClaimed && envelopeInfo.isActive && envelopeInfo.remainingCount > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 红包头部 */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-full">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {envelopeInfo.isRandom ? '拼手气红包' : '均分红包'}
              </h3>
              <p className="text-red-100">
                来自 {formatAddress(envelopeInfo.creator)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatEther(envelopeInfo.totalAmount)} ETH
            </div>
            <div className="text-red-100 text-sm">
              总金额
            </div>
          </div>
        </div>
        
        {envelopeInfo.message && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-center italic">"{envelopeInfo.message}"</p>
          </div>
        )}
      </div>

      {/* 红包信息 */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">
              {Number(envelopeInfo.remainingCount)}/{Number(envelopeInfo.totalCount)} 个
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600 text-sm">
              {formatTime(envelopeInfo.createdAt)}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">剩余金额:</span>
            <span className="font-bold text-lg">
              {formatEther(envelopeInfo.remainingAmount)} ETH
            </span>
          </div>
        </div>

        {/* 状态显示 */}
        {isCreator && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span className="text-blue-700">这是您发的红包</span>
            </div>
          </div>
        )}

        {hasClaimed && !isCreator && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-700">您已领取</span>
              </div>
              <span className="font-bold text-green-700">
                {claimAmount} ETH
              </span>
            </div>
          </div>
        )}

        {!envelopeInfo.isActive && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">红包已结束</span>
            </div>
          </div>
        )}

        {envelopeInfo.isActive && envelopeInfo.remainingCount === 0n && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-700">红包已被抢完</span>
            </div>
          </div>
        )}

        {/* 抢红包按钮 */}
        {canClaim && (
          <button
            onClick={handleClaim}
            disabled={isPending || isConfirming}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 px-6 rounded-lg font-medium hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
          >
            {(isPending || isConfirming) ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>
                  {isPending ? '确认交易中...' : '等待确认...'}
                </span>
              </>
            ) : (
              <>
                <Gift className="w-5 h-5" />
                <span>抢红包</span>
              </>
            )}
          </button>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">
              抢红包失败: {error.shortMessage || error.message}
            </p>
          </div>
        )}

        {/* 成功信息 */}
        {isConfirmed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm">
              🎉 抢红包成功！
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimEnvelope;
