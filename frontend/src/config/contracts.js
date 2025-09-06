// 红包合约ABI
export const RED_ENVELOPE_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "_count", "type": "uint256"},
      {"internalType": "bool", "name": "_isRandom", "type": "bool"},
      {"internalType": "string", "name": "_message", "type": "string"}
    ],
    "name": "createEnvelope",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_envelopeId", "type": "uint256"}],
    "name": "claimEnvelope",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_envelopeId", "type": "uint256"}],
    "name": "refundEnvelope",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_envelopeId", "type": "uint256"}],
    "name": "getEnvelopeInfo",
    "outputs": [
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "uint256", "name": "totalAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "remainingAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "totalCount", "type": "uint256"},
      {"internalType": "uint256", "name": "remainingCount", "type": "uint256"},
      {"internalType": "bool", "name": "isRandom", "type": "bool"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "string", "name": "message", "type": "string"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_envelopeId", "type": "uint256"},
      {"internalType": "address", "name": "_user", "type": "address"}
    ],
    "name": "hasClaimed",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_envelopeId", "type": "uint256"},
      {"internalType": "address", "name": "_user", "type": "address"}
    ],
    "name": "getClaimAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_envelopeId", "type": "uint256"}],
    "name": "getClaimers",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalEnvelopes",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "envelopeId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "creator", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "totalCount", "type": "uint256"},
      {"indexed": false, "internalType": "bool", "name": "isRandom", "type": "bool"},
      {"indexed": false, "internalType": "string", "name": "message", "type": "string"}
    ],
    "name": "EnvelopeCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "envelopeId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "claimer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "remainingCount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "remainingAmount", "type": "uint256"}
    ],
    "name": "EnvelopeClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "envelopeId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "creator", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "totalCount", "type": "uint256"}
    ],
    "name": "EnvelopeCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "envelopeId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "creator", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "refundAmount", "type": "uint256"}
    ],
    "name": "EnvelopeRefunded",
    "type": "event"
  }
];

// 合约地址 - 已部署
export const RED_ENVELOPE_ADDRESS = {
  31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Hardhat 本地网络
  // 1337: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Hardhat 本地网络 (备用)
  11155111: "0x54b7c1B0ff111AcAd646298f3cA0227f0C6804AD", // Sepolia 测试网 - 部署后填入
};
