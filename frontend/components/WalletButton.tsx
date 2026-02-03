"use client";

import { useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { formatAddress } from "@/lib/utils";
import { CREDITCOIN_CHAIN } from "@/lib/contracts/config";

export function WalletButton() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Automatically switch to CreditCoin chain when wallet connects
  useEffect(() => {
    if (isConnected && chainId !== CREDITCOIN_CHAIN.id) {
      // Wait a bit for connection to settle, then switch chain
      const timer = setTimeout(async () => {
        try {
          // If MetaMask, add network first if needed
          if (connector?.id === "metaMask" && typeof window !== "undefined" && window.ethereum) {
            try {
              // Check if network exists, if not add it
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: `0x${CREDITCOIN_CHAIN.id.toString(16)}`,
                    chainName: CREDITCOIN_CHAIN.name,
                    nativeCurrency: {
                      name: CREDITCOIN_CHAIN.nativeCurrency.name,
                      symbol: CREDITCOIN_CHAIN.nativeCurrency.symbol,
                      decimals: CREDITCOIN_CHAIN.nativeCurrency.decimals,
                    },
                    rpcUrls: CREDITCOIN_CHAIN.rpcUrls.default.http,
                    blockExplorerUrls: [CREDITCOIN_CHAIN.blockExplorers.default.url],
                  },
                ],
              });
            } catch (addError: any) {
              // Network might already exist, that's fine
              if (addError.code !== 4902) {
                console.log("Network might already exist:", addError);
              }
            }
          }
          
          // Switch to CreditCoin chain
          await switchChain({ chainId: CREDITCOIN_CHAIN.id });
        } catch (error) {
          console.error("Error switching to CreditCoin chain:", error);
        }
      }, 500); // Small delay to ensure connection is ready

      return () => clearTimeout(timer);
    }
  }, [isConnected, chainId, connector, switchChain]);

  const handleConnect = async (connector: any) => {
    try {
      // For MetaMask, add CreditCoin network first if it doesn't exist
      if (connector.id === "metaMask" && typeof window !== "undefined" && window.ethereum) {
        try {
          // Try to add the network (will fail silently if already exists)
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${CREDITCOIN_CHAIN.id.toString(16)}`,
                chainName: CREDITCOIN_CHAIN.name,
                nativeCurrency: {
                  name: CREDITCOIN_CHAIN.nativeCurrency.name,
                  symbol: CREDITCOIN_CHAIN.nativeCurrency.symbol,
                  decimals: CREDITCOIN_CHAIN.nativeCurrency.decimals,
                },
                rpcUrls: CREDITCOIN_CHAIN.rpcUrls.default.http,
                blockExplorerUrls: [CREDITCOIN_CHAIN.blockExplorers.default.url],
              },
            ],
          });
        } catch (addError: any) {
          // Network might already exist (code 4902), that's fine
          if (addError.code !== 4902) {
            console.log("Network add result:", addError);
          }
        }
      }

      // Connect wallet
      await connect({ connector, chainId: CREDITCOIN_CHAIN.id });
      
      // After connection, ensure we're on CreditCoin chain
      // The useEffect will handle the switch if needed
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="text-sm font-mono text-slate-900 block">{formatAddress(address)}</span>
          <span className="text-xs text-slate-500">
            {chainId === CREDITCOIN_CHAIN.id ? (
              <span className="text-emerald-600">✓ {CREDITCOIN_CHAIN.name}</span>
            ) : (
              <span className="text-rose-600">⚠ Wrong Network</span>
            )}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => handleConnect(connector)}
          disabled={isPending}
          className="px-4 py-2 rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50"
        >
          {isPending ? "Connecting..." : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}
