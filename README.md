# 🧧 链上红包系统

基于以太坊智能合约的去中心化红包系统，支持均分和随机两种发红包模式。

## ✨ 功能特性

- 🎁 **发红包**: 支持均分红包和拼手气红包两种模式
- 💰 **抢红包**: 用户可以抢取别人发的红包
- 🔔 **实时通知**: 基于合约事件的实时状态更新
- 👛 **钱包集成**: 支持多种钱包连接（MetaMask、WalletConnect等）
- 🌐 **ENS支持**: 显示用户的ENS域名和头像
- 📱 **响应式设计**: 适配桌面端和移动端

## 🏗️ 技术栈

### 智能合约
- **Solidity**: 智能合约开发语言
- **Hardhat**: 开发框架和测试环境
- **OpenZeppelin**: 安全的合约库

### 前端
- **React**: 用户界面框架
- **Viem**: 以太坊交互库
- **Wagmi**: React钩子库
- **RainbowKit**: 钱包连接组件
- **Tailwind CSS**: 样式框架
- **Lucide React**: 图标库

## 🚀 快速开始

### 1. 安装依赖

```bash
# 根目录依赖
yarn install

# 前端依赖
cd frontend
yarn install
```

### 2. 启动本地节点

```bash
yarn hardhat node
```

### 3. 部署合约

在新的终端窗口中：

```bash
yarn hardhat ignition deploy ./ignition/modules/RedEnvelope.ts --network localhost
```

### 4. 启动前端

```bash
cd frontend
yarn dev
```

### 5. 配置钱包

1. 打开 MetaMask 或其他Web3钱包
2. 添加本地网络：
   - 网络名称: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - 链ID: 31337
   - 货币符号: ETH
3. 导入测试账户（使用控制台显示的私钥）

## 📖 使用说明

### 发红包

1. 连接钱包
2. 在左侧"发红包"区域填写：
   - 红包总金额（ETH）
   - 红包数量
   - 选择红包类型（均分/拼手气）
   - 祝福语（可选）
3. 点击"发红包"按钮
4. 确认交易

### 抢红包

1. 在右侧红包列表中选择一个红包
2. 查看红包详情
3. 点击"抢红包"按钮（如果符合条件）
4. 确认交易

### 红包状态

- 🟢 **进行中**: 红包还有剩余，可以继续抢取
- 🔴 **已结束**: 红包已被抢完或被创建者关闭
- ✅ **已领取**: 当前用户已经领取过此红包

## 🔧 合约功能

### 主要函数

- `createEnvelope()`: 创建红包
- `claimEnvelope()`: 领取红包
- `refundEnvelope()`: 创建者退还剩余金额
- `getEnvelopeInfo()`: 获取红包信息
- `hasClaimed()`: 检查是否已领取
- `getClaimAmount()`: 获取领取金额

### 事件

- `EnvelopeCreated`: 红包创建
- `EnvelopeClaimed`: 红包被领取
- `EnvelopeCompleted`: 红包抢完
- `EnvelopeRefunded`: 红包被退还

## 🛡️ 安全特性

- ✅ 防止重复领取
- ✅ 创建者不能领取自己的红包
- ✅ 金额验证和溢出保护
- ✅ 随机算法（基于区块信息）
- ✅ 合约状态管理

## 🧪 测试

运行合约测试：

```bash
yarn hardhat test
```

## 📝 合约地址

- **本地网络**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Sepolia测试网**: 待部署

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 🎉 演示

1. 启动本地节点和前端服务
2. 访问 http://localhost:5173
3. 连接钱包并切换到本地网络
4. 开始发红包和抢红包！

## 🔍 注意事项

- 本项目仅用于学习和演示目的
- 随机算法使用区块信息，不是真正的随机数
- 在主网使用前请进行充分的安全审计
- 测试网络的私钥是公开的，不要用于主网

## 📞 联系方式

如有问题，请提交Issue或联系开发者。

---

🧧 **恭喜发财，新年快乐！** 🧧