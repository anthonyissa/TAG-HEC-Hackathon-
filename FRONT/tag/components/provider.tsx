"use client";

import { Signer } from "ethers";
import { createContext, useEffect, useState } from "react";

import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";
import { createUserProfile } from "@/lib/addData";
import { UserProfile } from "@/lib/types";

export const ProviderContext = createContext<{
  wallet?: BeaconWallet;
  connected?: boolean;
  connectWallet?: () => Promise<{
    success: boolean;
    wallet: string | undefined;
  }>;
  disconnectWallet?: () => Promise<void>;
  getAddress?: () => Promise<string | undefined>;
  userProfile?: UserProfile;
  setUserProfile?: React.Dispatch<
    React.SetStateAction<UserProfile | undefined>
  >;
}>({});

export default function Provider({ children }: { children: React.ReactNode }) {
  const tezos = new TezosToolkit("https://ghostnet.ecadinfra.com");

  const [wallet, setWallet] = useState(new BeaconWallet({ name: "Ghostnet" }));
  const [connected, setConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>();

  const connectWallet = async () => {
    let account = await wallet.client.getActiveAccount();
    if (!account) {
      await wallet.requestPermissions();
      account = await wallet.client.getActiveAccount();
    }
    await createUserProfile(account!.address);
    return { success: true, wallet: account?.address };
  };

  const disconnectWallet = async () => {
    await wallet.client.disconnect();
    setConnected(false);
  };

  const isWalletConnected = async () => {
    const account = await wallet.client.getActiveAccount();
    return !!account;
  };

  const getAddress = async () => {
    const account = await wallet.client.getActiveAccount();
    return account?.address;
  };

  useEffect(() => {
    (async () => {
      setConnected(await isWalletConnected());
    })();
  }, [wallet]);

  return (
    <ProviderContext.Provider
      value={{
        wallet,
        connected,
        connectWallet,
        disconnectWallet,
        getAddress,
        userProfile,
        setUserProfile,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}
