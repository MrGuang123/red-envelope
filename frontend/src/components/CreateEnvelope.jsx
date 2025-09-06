import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { RED_ENVELOPE_ABI, RED_ENVELOPE_ADDRESS } from '../config/contracts';
import { Send, Shuffle, Equal, Loader2 } from 'lucide-react';

const CreateEnvelope = ({ onEnvelopeCreated }) => {
  const { address, chainId } = useAccount();
  const [formData, setFormData] = useState({
    amount: '',
    count: '',
    isRandom: false,
    message: ''
  });
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = '请输入有效的红包金额';
    }
    
    if (!formData.count || parseInt(formData.count) <= 0) {
      newErrors.count = '请输入有效的红包数量';
    } else if (parseInt(formData.count) > 100) {
      newErrors.count = '红包数量不能超过100个';
    }
    
    if (formData.message.length > 200) {
      newErrors.message = '祝福语不能超过200个字符';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const contractAddress = RED_ENVELOPE_ADDRESS[chainId];
      if (!contractAddress) {
        throw new Error('当前网络不支持，请切换到支持的网络');
      }

      await writeContract({
        address: contractAddress,
        abi: RED_ENVELOPE_ABI,
        functionName: 'createEnvelope',
        args: [
          BigInt(formData.count),
          formData.isRandom,
          formData.message || '恭喜发财，新年快乐！'
        ],
        value: parseEther(formData.amount)
      });
    } catch (err) {
      console.error('创建红包失败:', err);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      amount: '',
      count: '',
      isRandom: false,
      message: ''
    });
    setErrors({});
  };

  // 监听交易确认
  useEffect(() => {
    if (isConfirmed) {
      console.log('红包创建成功！');
      if (onEnvelopeCreated) {
        onEnvelopeCreated();
      }
      // 延迟重置表单，避免立即重渲染
      setTimeout(() => {
        resetForm();
      }, 1000);
    }
  }, [isConfirmed]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Send className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-800">发红包</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 红包金额 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            红包总金额 (ETH)
          </label>
          <input
            type="number"
            step="0.001"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入红包总金额"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* 红包数量 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            红包数量
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.count}
            onChange={(e) => setFormData({...formData, count: e.target.value})}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
              errors.count ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入红包数量"
          />
          {errors.count && (
            <p className="mt-1 text-sm text-red-600">{errors.count}</p>
          )}
        </div>

        {/* 红包类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            红包类型
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({...formData, isRandom: false})}
              className={`flex items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                !formData.isRandom 
                  ? 'border-red-500 bg-red-50 text-red-700' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <Equal className="w-5 h-5 mr-2" />
              均分红包
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, isRandom: true})}
              className={`flex items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                formData.isRandom 
                  ? 'border-red-500 bg-red-50 text-red-700' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <Shuffle className="w-5 h-5 mr-2" />
              拼手气红包
            </button>
          </div>
        </div>

        {/* 祝福语 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            祝福语 (可选)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            rows={3}
            maxLength={200}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="恭喜发财，新年快乐！"
          />
          <div className="flex justify-between mt-1">
            {errors.message && (
              <p className="text-sm text-red-600">{errors.message}</p>
            )}
            <p className="text-sm text-gray-500 ml-auto">
              {formData.message.length}/200
            </p>
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={!address || isPending || isConfirming}
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
              <Send className="w-5 h-5" />
              <span>发红包</span>
            </>
          )}
        </button>

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">
              创建失败: {error.shortMessage || error.message}
            </p>
          </div>
        )}

        {/* 成功信息 */}
        {isConfirmed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm">
              🎉 红包创建成功！
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateEnvelope;
