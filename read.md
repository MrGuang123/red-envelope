# 🧧 红包系统部署信息

## 合约地址
- **本地网络**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **网络ID**: 31337
- **RPC URL**: http://127.0.0.1:8545

sepolia地址：
Deployed Addresses

RedEnvelopeModule#RedEnvelope - 0x54b7c1B0ff111AcAd646298f3cA0227f0C6804AD

## 前端服务
- **本地地址**: http://localhost:5173
- **状态**: ✅ 运行中（已优化稳定性）

## 测试账户
- **Account #0**: `0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266` (10000 ETH)
- **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

## 功能状态
- ✅ **发红包**: 功能正常，支持均分和随机模式
- ✅ **合约部署**: 成功部署到本地网络
- ✅ **钱包连接**: 支持MetaMask等钱包
- ✅ **页面稳定性**: 已修复空白页面问题

## 快速开始
1. 确保Hardhat节点运行中
2. 打开浏览器访问: http://localhost:5173
3. 连接钱包并添加本地网络配置：
   - 网络名称: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - 链ID: 31337
   - 货币符号: ETH
4. 导入测试账户私钥
5. 开始发红包！

## 当前版本特点
- 简化了前端架构，提高稳定性
- 优化了错误处理，避免页面崩溃
- 保留核心发红包功能
- 添加了交易状态反馈

## 注意事项
- Hardhat节点需要保持运行
- 测试账户私钥仅用于测试，不要在主网使用
- 红包创建成功后会显示确认信息