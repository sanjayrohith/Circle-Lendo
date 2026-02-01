# Deployment Guide for CreditCoin Testnet

## Prerequisites

1. **Get your private key** from MetaMask or your wallet
2. **Fund your wallet** with tCTC (CreditCoin Testnet tokens)
3. **Set up environment variable** for your private key

## Setup

1. **Set your private key** using Hardhat keystore:
```bash
npx hardhat keystore set CREDITCOIN_PRIVATE_KEY
```

Or create a `.env` file (don't commit this!):
```bash
CREDITCOIN_PRIVATE_KEY=your_private_key_here
```

2. **Verify network configuration** in `hardhat.config.ts`:
   - Network: `creditcoinTestnet`
   - RPC URL: `https://rpc.cc3-testnet.creditcoin.network`
   - Chain ID: `102031`

## Deploy to CreditCoin Testnet

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network creditcoinTestnet
```

## Deployment Order

The script will deploy in this order:
1. **CreditRegistry** - Credit score tracking
2. **ReservePool** - Reserve fund management
3. **LendingCircleFactory** - Circle creation factory

## After Deployment

1. **Save the deployed addresses** from the output
2. **Update frontend config** in `frontend/lib/contracts/config.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  creditRegistry: "0x...", // Your deployed address
  reservePool: "0x...",    // Your deployed address
  factory: "0x...",        // Your deployed address
};
```

3. **Update the factory address** in ReservePool (if needed):
```bash
# The deploy script should handle this automatically
```

## Verify Deployment

Check your contracts on the block explorer:
- **CreditCoin Testnet Explorer**: https://creditcoin-testnet.blockscout.com
- Search for your contract addresses

## Network Details

- **Network Name**: Creditcoin Testnet
- **Chain ID**: 102031
- **Currency Symbol**: tCTC
- **RPC URL**: https://rpc.cc3-testnet.creditcoin.network
- **Block Explorer**: https://creditcoin-testnet.blockscout.com

## Troubleshooting

- **Insufficient funds**: Make sure your wallet has enough tCTC for gas
- **Network not found**: Verify the network is added to your wallet
- **Transaction failed**: Check gas price and network connectivity
