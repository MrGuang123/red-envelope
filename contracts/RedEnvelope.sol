// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";

contract RedEnvelope {
    struct Envelope {
        address creator;
        uint256 totalAmount;
        uint256 remainingAmount;
        uint256 totalCount;
        uint256 remainingCount;
        bool isRandom;
        bool isActive;
        string message;
        uint256 createdAt;
        mapping(address => bool) claimed;
        mapping(address => uint256) claimAmounts;
        address[] claimers;
    }

    mapping(uint256 => Envelope) public envelopes;
    uint256 public nextEnvelopeId;
    
    // 事件定义
    event EnvelopeCreated(
        uint256 indexed envelopeId,
        address indexed creator,
        uint256 totalAmount,
        uint256 totalCount,
        bool isRandom,
        string message
    );
    
    event EnvelopeClaimed(
        uint256 indexed envelopeId,
        address indexed claimer,
        uint256 amount,
        uint256 remainingCount,
        uint256 remainingAmount
    );
    
    event EnvelopeCompleted(
        uint256 indexed envelopeId,
        address indexed creator,
        uint256 totalAmount,
        uint256 totalCount
    );
    
    event EnvelopeRefunded(
        uint256 indexed envelopeId,
        address indexed creator,
        uint256 refundAmount
    );

    // 创建红包
    function createEnvelope(
        uint256 _count,
        bool _isRandom,
        string memory _message
    ) external payable returns (uint256) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_count > 0, "Count must be greater than 0");
        require(_count <= 100, "Count cannot exceed 100");
        require(bytes(_message).length <= 200, "Message too long");
        
        uint256 envelopeId = nextEnvelopeId++;
        Envelope storage envelope = envelopes[envelopeId];
        
        envelope.creator = msg.sender;
        envelope.totalAmount = msg.value;
        envelope.remainingAmount = msg.value;
        envelope.totalCount = _count;
        envelope.remainingCount = _count;
        envelope.isRandom = _isRandom;
        envelope.isActive = true;
        envelope.message = _message;
        envelope.createdAt = block.timestamp;
        
        emit EnvelopeCreated(
            envelopeId,
            msg.sender,
            msg.value,
            _count,
            _isRandom,
            _message
        );
        
        return envelopeId;
    }
    
    // 抢红包
    function claimEnvelope(uint256 _envelopeId) external {
        Envelope storage envelope = envelopes[_envelopeId];
        
        require(envelope.isActive, "Envelope is not active");
        require(envelope.remainingCount > 0, "No more envelopes left");
        require(!envelope.claimed[msg.sender], "Already claimed");
        require(msg.sender != envelope.creator, "Creator cannot claim own envelope");
        
        uint256 claimAmount;
        
        if (envelope.remainingCount == 1) {
            // 最后一个红包，获得所有剩余金额
            claimAmount = envelope.remainingAmount;
        } else if (envelope.isRandom) {
            // 随机红包：使用简单的伪随机算法
            claimAmount = _getRandomAmount(envelope.remainingAmount, envelope.remainingCount, _envelopeId);
        } else {
            // 均分红包
            claimAmount = envelope.remainingAmount / envelope.remainingCount;
        }
        
        // 确保金额不为0且不超过剩余金额
        require(claimAmount > 0, "Claim amount is 0");
        require(claimAmount <= envelope.remainingAmount, "Insufficient remaining amount");
        
        // 更新状态
        envelope.claimed[msg.sender] = true;
        envelope.claimAmounts[msg.sender] = claimAmount;
        envelope.claimers.push(msg.sender);
        envelope.remainingAmount -= claimAmount;
        envelope.remainingCount--;
        
        // 转账
        payable(msg.sender).transfer(claimAmount);
        
        emit EnvelopeClaimed(
            _envelopeId,
            msg.sender,
            claimAmount,
            envelope.remainingCount,
            envelope.remainingAmount
        );
        
        // 检查是否完成
        if (envelope.remainingCount == 0) {
            envelope.isActive = false;
            emit EnvelopeCompleted(_envelopeId, envelope.creator, envelope.totalAmount, envelope.totalCount);
        }
    }
    
    // 创建者可以关闭红包并退还剩余金额
    function refundEnvelope(uint256 _envelopeId) external {
        Envelope storage envelope = envelopes[_envelopeId];
        
        require(envelope.creator == msg.sender, "Only creator can refund");
        require(envelope.isActive, "Envelope is not active");
        require(envelope.remainingAmount > 0, "No remaining amount to refund");
        
        uint256 refundAmount = envelope.remainingAmount;
        envelope.remainingAmount = 0;
        envelope.isActive = false;
        
        payable(msg.sender).transfer(refundAmount);
        
        emit EnvelopeRefunded(_envelopeId, msg.sender, refundAmount);
    }
    
    // 获取红包信息
    function getEnvelopeInfo(uint256 _envelopeId) external view returns (
        address creator,
        uint256 totalAmount,
        uint256 remainingAmount,
        uint256 totalCount,
        uint256 remainingCount,
        bool isRandom,
        bool isActive,
        string memory message,
        uint256 createdAt
    ) {
        Envelope storage envelope = envelopes[_envelopeId];
        return (
            envelope.creator,
            envelope.totalAmount,
            envelope.remainingAmount,
            envelope.totalCount,
            envelope.remainingCount,
            envelope.isRandom,
            envelope.isActive,
            envelope.message,
            envelope.createdAt
        );
    }
    
    // 检查用户是否已经领取
    function hasClaimed(uint256 _envelopeId, address _user) external view returns (bool) {
        return envelopes[_envelopeId].claimed[_user];
    }
    
    // 获取用户领取的金额
    function getClaimAmount(uint256 _envelopeId, address _user) external view returns (uint256) {
        return envelopes[_envelopeId].claimAmounts[_user];
    }
    
    // 获取所有领取者
    function getClaimers(uint256 _envelopeId) external view returns (address[] memory) {
        return envelopes[_envelopeId].claimers;
    }
    
    // 简单的伪随机数生成（注意：这不是真正的随机，仅用于演示）
    function _getRandomAmount(uint256 _remainingAmount, uint256 _remainingCount, uint256 _envelopeId) private view returns (uint256) {
        // 确保最后一个人至少能得到1 wei
        uint256 maxAmount = _remainingAmount - (_remainingCount - 1);
        
        // 使用区块信息和用户地址生成伪随机数
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            _envelopeId,
            _remainingCount
        )));
        
        // 计算平均值
        uint256 average = _remainingAmount / _remainingCount;
        
        // 随机范围：平均值的 10% 到 200%
        uint256 minAmount = average / 10;
        if (minAmount == 0) minAmount = 1;
        
        uint256 range = average * 2 - minAmount;
        if (range == 0) range = 1;
        
        uint256 randomAmount = minAmount + (randomSeed % range);
        
        // 确保不超过最大可用金额
        if (randomAmount > maxAmount) {
            randomAmount = maxAmount;
        }
        
        return randomAmount;
    }
    
    // 获取总红包数量
    function getTotalEnvelopes() external view returns (uint256) {
        return nextEnvelopeId;
    }
}
