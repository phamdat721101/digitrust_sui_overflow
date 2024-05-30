"use client";
import { formatNumberByCurrency } from "@/utils";
import React,{useEffect} from "react";
import BlockBalance from "./BlockBalance";
import GeneralInfo from "./GeneralInfo";
import TabInfoProfile from "./Tab";
import {useWallet} from '@suiet/wallet-kit'
import SkeletonProfile from "./SkeletonProfile/SkeletonProfile";
import { useWalletInfo } from '@web3modal/wagmi/react';

type TVault = {
  name: string;
  balance: number;
  list_price: string;
  current_price: string;
  manager: string;
  tvl: number;
  monthly_return: string;
  daily_return: string;
  logo_url: string;
};

type TProfileContainerProps = {
  name: string;
  wallet?: string;
  description?: string;
  holdingAmount: number;
  managedAmount: number;
  dgtAmount: number;
  logoUrl?: string;
  vaults: TVault[];
};

const ProfileContainer = (props: TProfileContainerProps) => {
  const {
    name,
    holdingAmount,
    managedAmount,
    vaults,
    description,
    logoUrl,
    wallet,
    dgtAmount,
  } = props;

  const suiwallet = useWallet();
  const EVMWallet = useWalletInfo().walletInfo;

  useEffect(() => {
      console.log('wallet status', suiwallet.status)
      console.log('connected wallet name', suiwallet.name)
      console.log('connected account info', suiwallet.account)
    }, [suiwallet.connected])

  return (
      <div>
        {(suiwallet.connected || EVMWallet != undefined) &&
              <div>
                <GeneralInfo
                    name={name}
                    userAddress={wallet}
                    description={description}
                    avatar={logoUrl}
                  />
                  <div className="md:grid-cols-3 gap-3 grid mt-6">
                    <BlockBalance
                      title="HOLDINGS"
                      value={formatNumberByCurrency(holdingAmount, "USD")}
                    />
                    <BlockBalance
                      title="TOTAL MANAGED"
                      value={formatNumberByCurrency(managedAmount, "USD")}
                    />
                    <BlockBalance
                      title="VOTING POWER"
                      value={formatNumberByCurrency(dgtAmount, "USD")}
                    />
                  </div>
                  <TabInfoProfile />
              </div> 
                        
        }
        {
          suiwallet.status == 'disconnected' && EVMWallet == undefined &&
          <div>
            <SkeletonProfile/>
          </div>
        }
      </div>
  );
};

export default ProfileContainer;
