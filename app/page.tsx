"use client";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  ConnectButton,
  useAccount,
  useParticleAuth,
  usePublicClient,
  useWallets,
  type SolanaChain,
} from "@particle-network/connectkit";
import {
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import Link from "next/link";
import { useEffect } from "react";
import { WbaPrereq, IDL } from "../programs/wba_prereq";

export default function Home() {
  const { isConnected, isConnecting, address, chainId } = useAccount();
  const { getUserInfo } = useParticleAuth();
  const publicClient = usePublicClient<SolanaChain>();
  const [primaryWallet] = useWallets();

  const executeTx = async () => {
    if (!address || !publicClient) return;
    const walletClient = primaryWallet.getWalletClient<SolanaChain>();

    const { blockhash } = await publicClient.getLatestBlockhash({
      commitment: "finalized",
    });

    const messageV0 = new TransactionMessage({
      payerKey: new PublicKey(address),
      recentBlockhash: blockhash,
      instructions: [
        SystemProgram.transfer({
          fromPubkey: new PublicKey(address),
          toPubkey: new PublicKey(
            "519YcH3xs93ny76Zzsoxp8ZF3s9fNS1BwEB33vvBxype"
          ),
          lamports: 100000,
        }),
      ],
    }).compileToV0Message();
    const transaction = new VersionedTransaction(messageV0);
    const vtran = await walletClient.signTransaction(transaction);
    const transactionResponse = await publicClient.sendTransaction(vtran);
    console.log("Transaction sent:", transactionResponse);
  };
  const signMessage = async () => {
    console.log("Primary wallet:", address);
    console.log("Signing message...");
    try {
      const walletClient = primaryWallet.getWalletClient<SolanaChain>();
      const message = "Gm Particle Network. I am signing a message!";
      const nonce = new TextEncoder().encode(message);
      const signature = await walletClient.signMessage(nonce);
      console.log("Signature:", signature);
    } catch (error) {
      console.error("Error signing message:", error);
    }
  };

  const callContract = async () => {
    if (!address || !publicClient) return;
    const walletClient = primaryWallet.getWalletClient<SolanaChain>();
    const provider = new AnchorProvider(publicClient, walletClient, {
      commitment: "confirmed",
    });

    const program: Program<WbaPrereq> = new Program(IDL, provider);

    const enrollment_seeds = [
      Buffer.from("prereq"),
      new PublicKey(address).toBuffer(),
    ];
    const [enrollment_key, _bump] = PublicKey.findProgramAddressSync(
      enrollment_seeds,
      program.programId
    );

    const instruction = await program.methods
      .complete(Buffer.from("test", "utf8"))
      .accounts({
        signer: new PublicKey(address),
      })
      .instruction();

    const { blockhash } = await publicClient.getLatestBlockhash({
      commitment: "finalized",
    });

    const messageV0 = new TransactionMessage({
      payerKey: new PublicKey(address),
      recentBlockhash: blockhash,
      instructions: [instruction],
    }).compileToV0Message();
    const transaction = new VersionedTransaction(messageV0);
    const vtran = await walletClient.signTransaction(transaction);
    const transactionResponse = await publicClient.sendTransaction(vtran);
    console.log("Transaction sent:", transactionResponse);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUserInfo();
        console.log(userInfo);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
      }
    };

    if (isConnected) {
      fetchUserInfo();
    }
  }, [isConnected, getUserInfo]);

  return (
    <div className="container min-h-screen flex justify-center items-center mx-auto flex-col gap-4">
      <div className="absolute top-6 right-6">
        {isConnecting && <div>Connecting...</div>}
        <ConnectButton />
      </div>
      {isConnected && (
        <div>
          {address} - {chainId}
          <button onClick={signMessage}>sign message</button>
          <button onClick={executeTx}>ext message</button>
          <button onClick={callContract}>call contract</button>
        </div>
      )}

      <Link
        href="https://demo.particle.network"
        target="_blank"
        className="text-2xl text-purple-500"
      >
        Particle Demo
      </Link>

      <Link
        href="https://developers.particle.network"
        target="_blank"
        className="text-2xl text-purple-500"
      >
        Document
      </Link>
    </div>
  );
}
