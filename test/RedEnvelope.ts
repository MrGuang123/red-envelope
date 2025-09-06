import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther, formatEther } from "viem";

describe("RedEnvelope", function () {
  let redEnvelopeAddress: `0x${string}`;
  let owner: `0x${string}`;
  let addr1: `0x${string}`;
  let addr2: `0x${string}`;
  let addr3: `0x${string}`;

  beforeEach(async function () {
    // 获取账户
    const [ownerAccount, addr1Account, addr2Account, addr3Account] = await hre.viem.getWalletClients();
    owner = ownerAccount.account.address;
    addr1 = addr1Account.account.address;
    addr2 = addr2Account.account.address;
    addr3 = addr3Account.account.address;
    
    // 部署合约
    const redEnvelope = await hre.viem.deployContract("RedEnvelope");
    redEnvelopeAddress = redEnvelope.address;
  });

  describe("创建红包", function () {
    it("应该能够创建均分红包", async function () {
      const publicClient = await hre.viem.getPublicClient();
      const walletClient = await hre.viem.getWalletClient(owner);
      
      const amount = parseEther("1");
      const count = 3n;
      const message = "新年快乐！";

      // 创建红包
      const hash = await walletClient.writeContract({
        address: redEnvelopeAddress,
        abi: [
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
          }
        ],
        functionName: "createEnvelope",
        args: [count, false, message],
        value: amount
      });

      // 等待交易确认
      await publicClient.waitForTransactionReceipt({ hash });

      // 验证红包信息
      const envelopeInfo = await publicClient.readContract({
        address: redEnvelopeAddress,
        abi: [
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
          }
        ],
        functionName: "getEnvelopeInfo",
        args: [0n]
      });

      expect(getAddress(envelopeInfo[0])).to.equal(getAddress(owner));
      expect(envelopeInfo[1]).to.equal(amount);
      expect(envelopeInfo[2]).to.equal(amount);
      expect(envelopeInfo[3]).to.equal(count);
      expect(envelopeInfo[4]).to.equal(count);
      expect(envelopeInfo[5]).to.be.false;
      expect(envelopeInfo[6]).to.be.true;
      expect(envelopeInfo[7]).to.equal(message);
    });

    it("应该能够创建随机红包", async function () {
      const publicClient = await hre.viem.getPublicClient();
      const walletClient = await hre.viem.getWalletClient(owner);
      
      const amount = parseEther("1");
      const count = 5n;
      const message = "恭喜发财！";

      const hash = await walletClient.writeContract({
        address: redEnvelopeAddress,
        abi: [
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
          }
        ],
        functionName: "createEnvelope",
        args: [count, true, message],
        value: amount
      });

      await publicClient.waitForTransactionReceipt({ hash });

      const envelopeInfo = await publicClient.readContract({
        address: redEnvelopeAddress,
        abi: [
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
          }
        ],
        functionName: "getEnvelopeInfo",
        args: [0n]
      });

      expect(envelopeInfo[5]).to.be.true; // isRandom
    });
  });

  describe("领取红包", function () {
    beforeEach(async function () {
      const walletClient = await hre.viem.getWalletClient(owner);
      const publicClient = await hre.viem.getPublicClient();
      
      const amount = parseEther("1");
      const hash = await walletClient.writeContract({
        address: redEnvelopeAddress,
        abi: [
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
          }
        ],
        functionName: "createEnvelope",
        args: [3n, false, "测试红包"],
        value: amount
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
    });

    it("应该能够领取均分红包", async function () {
      const walletClient = await hre.viem.getWalletClient(addr1);
      const publicClient = await hre.viem.getPublicClient();

      const hash = await walletClient.writeContract({
        address: redEnvelopeAddress,
        abi: [
          {
            "inputs": [{"internalType": "uint256", "name": "_envelopeId", "type": "uint256"}],
            "name": "claimEnvelope",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: "claimEnvelope",
        args: [0n]
      });

      await publicClient.waitForTransactionReceipt({ hash });

      // 检查是否已领取
      const hasClaimed = await publicClient.readContract({
        address: redEnvelopeAddress,
        abi: [
          {
            "inputs": [
              {"internalType": "uint256", "name": "_envelopeId", "type": "uint256"},
              {"internalType": "address", "name": "_user", "type": "address"}
            ],
            "name": "hasClaimed",
            "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        functionName: "hasClaimed",
        args: [0n, addr1]
      });

      expect(hasClaimed).to.be.true;
    });
  });
});