# Quick Deploy Guide - CreditCoin Testnet

## Network Configuration ✅
- **Network Name**: Creditcoin Testnet
- **RPC URL**: `https://rpc.cc3-testnet.creditcoin.network`
- **Chain ID**: `102031`
- **Currency Symbol**: `tCTC`
- **Block Explorer**: `https://creditcoin-testnet.blockscout.com`

## Step 1: Set Your Private Key

Set your private key for address `0x348b754103e12434aee3df42471ad939911939dd`:

```bash
cd blockchain
npx hardhat keystore set CREDITCOIN_PRIVATE_KEY
```

When prompted, paste your private key (starts with `0x`).

## Step 2: Deploy All Contracts

```bash
npx hardhat run scripts/deploy.js --network creditcoinTestnet
```

## What Gets Deployed

1. **CreditRegistry** - Credit score tracking
2. **ReservePool** - Reserve fund management  
3. **LendingCircleFactory** - Circle creation factory

## Step 3: Update Frontend

After deployment, copy the addresses from the output and update:

```typescript
// frontend/lib/contracts/config.ts
export const CONTRACT_ADDRESSES = {
  creditRegistry: "0x...", // From deployment output
  reservePool: "0x...",     // From deployment output
  factory: "0x...",         // From deployment output
};
```

## Troubleshooting

- **"No accounts configured"**: Run `npx hardhat keystore set CREDITCOIN_PRIVATE_KEY`
- **"Insufficient funds"**: Make sure your wallet has tCTC tokens
- **"Network error"**: Check RPC URL is accessible
