"use client";

import React from "react";

import { ConnectKitProvider, createConfig } from "@particle-network/connectkit";
import { authWalletConnectors } from "@particle-network/connectkit/auth";
import type { Chain } from "@particle-network/connectkit/chains";
// embedded wallet start
import { EntryPosition, wallet } from "@particle-network/connectkit/wallet";
// embedded wallet end

// solana start
import { solana, solanaDevnet } from "@particle-network/connectkit/chains";
import {
  injected,
  solanaWalletConnectors,
} from "@particle-network/connectkit/solana";
// solana end

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY as string;
const appId = process.env.NEXT_PUBLIC_APP_ID as string;

if (!projectId || !clientKey || !appId) {
  throw new Error("Please configure the Particle project in .env first!");
}

const supportChains: Chain[] = [];

// solana start
supportChains.push(solanaDevnet);
// solana end

const config = createConfig({
  projectId,
  clientKey,
  appId,
  appearance: {
    recommendedWallets: [
      { walletId: "phantom", label: "Recommended" },
      { walletId: "coinbaseWallet", label: "Popular" },
    ],
    language: "en-US",
    connectorsOrder: ["email", "social", "wallet"],
    logo: "https://explorer.solana.com/_next/static/media/dark-explorer-logo.8d80d8ed.svg",
  },
  walletConnectors: [
    authWalletConnectors({
      authTypes: ["email", "google", "twitter", "facebook"],
      fiatCoin: "USD",
      promptSettingConfig: {
        promptMasterPasswordSettingWhenLogin: 1, // optional
        promptPaymentPasswordSettingWhenSign: 1, // optional
      },
    }),

    // solana start
    solanaWalletConnectors({
      connectorFns: [
        injected({ target: "phantom" }),
        injected({ target: "coinbaseWallet" }),
        injected({ target: "bitKeep" }),
        injected({ target: "trustWallet" }),
        injected({
          target: {
            icon: "https://play-lh.googleusercontent.com/EhgMPJGUYrA7-8PNfOdZgVGzxrOw4toX8tQXv-YzIvN6sAMYFunQ55MVo2SS_hLiNm8=w240-h480-rw",
            id: "backpack", // wallet unique id
            name: "Backpack Wallet",
            provider: (window) => {
              return (window as any)?.backpack;
            },
          },
        }),
      ],
    }),
    // solana end
  ],
  plugins: [
    // embedded wallet start
    wallet({
      visible: true,
      entryPosition: EntryPosition.TR,
    }),
    // embedded wallet end
  ],
  chains: supportChains as unknown as readonly [Chain, ...Chain[]],
});

// Wrap your application with this component.
export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
  return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
};
