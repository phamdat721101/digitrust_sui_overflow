"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import bitcoin from "@/assets/images/crypto/bitcoin.svg";
import ethereum from "@/assets/images/crypto/ethereum.svg";
import bnb from "@/assets/images/crypto/bnb.svg";
import tether from "@/assets/images/crypto/tether.svg";
import usdc from "@/assets/images/crypto/usdc.svg";
import optimism from "@/assets/images/crypto/optimism.svg";
import dot from "@/assets/images/crypto/dot.svg";
import yfi from "@/assets/images/crypto/yfi.svg";
import bat from "@/assets/images/crypto/bat.svg";
import btt from "@/assets/images/crypto/btt.svg";
import dash from "@/assets/images/crypto/dash.svg";
import doge from "@/assets/images/crypto/doge.svg";
import uma from "@/assets/images/crypto/uma.svg";
import uni from "@/assets/images/crypto/uni.svg";
import sushi from "@/assets/images/crypto/sushi.svg";
import xtz from "@/assets/images/crypto/xtz.svg";
import sys from "@/assets/images/crypto/sys.svg";
import stx from "@/assets/images/crypto/stx.svg";
import ripple from "@/assets/images/crypto/ripple.svg";
import ont from "@/assets/images/crypto/ont.svg";
import eos from "@/assets/images/crypto/eos.svg";
import chz from "@/assets/images/crypto/chz.svg";
import enj from "@/assets/images/crypto/enj.svg";

import depositIc from "@/assets/images/icons/deposit-icon.png";
import downIc from "@/assets/images/icons/down-ic.png";
import arrowDownUpIc from "@/assets/images/icons/arrow-up-down-ic.png";
import searchIc from "@/assets/images/icons/search-icon.svg";
import filterIc from "@/assets/images/icons/filter-icon.svg";
import downloadIc from "@/assets/images/icons/download-icon.svg";
import chartAPY1 from "@/assets/images/icons/chart-apy1.png";
import chartAPY2 from "@/assets/images/icons/chart-apy2.png";

interface Vault {
  url: string;
  vault_id: string;
  vault_name: string;
  symbol: string;
  price: string;
  return: number;
  tvl: number;
  monthly_return: string;
  daily_return: string;
  manager: string;
  des: string;
  timestamp: number;
  chain: string;
  period: any;
  asset?: string[];
  assets: {
    name: string;
    img: string;
  }[];
}

const vaults = [
  {
    assets: [
      {
        name: "bitcoin",
        img: "https://dd.dexscreener.com/ds-data/tokens/sui/0x76cb819b01abed502bee8a702b4c2d547532c12f25001c9dea795a5e631c26f1::fud::fud.png",
      },
      {
        name: "yfi",
        img: yfi,
      },
      {
        name: "bat",
        img: bat,
      },
      {
        name: "btt",
        img: btt,
      },
      {
        name: "dash",
        img: dash,
      },
    ],
    apy: chartAPY1,
  },
  {
    assets: [
      {
        name: "ethereum",
        img: ethereum,
      },
      {
        name: "uni",
        img: uni,
      },
      {
        name: "doge",
        img: doge,
      },
      {
        name: "uma",
        img: uma,
      },
      {
        name: "sushi",
        img: sushi,
      },
    ],
    apy: chartAPY1,
  },
  {
    assets: [
      {
        name: "bnb",
        img: bnb,
      },
      {
        name: "sys",
        img: sys,
      },
      {
        name: "ripple",
        img: ripple,
      },
      {
        name: "xtz",
        img: xtz,
      },
      {
        name: "stx",
        img: stx,
      },
    ],
    apy: chartAPY2,
  },
  {
    assets: [
      {
        name: "tether",
        img: tether,
      },
      {
        name: "enj",
        img: enj,
      },
      {
        name: "ont",
        img: ont,
      },
      {
        name: "eos",
        img: eos,
      },
      {
        name: "chz",
        img: chz,
      },
    ],
    apy: chartAPY1,
  },
  // {
  //   assets: [
  //     {
  //       name: "usdc",
  //       img: usdc,
  //     },
  //     {
  //       name: "uni",
  //       img: uni,
  //     },
  //     {
  //       name: "sushi",
  //       img: sushi,
  //     },
  //     {
  //       name: "bat",
  //       img: bat,
  //     },
  //     {
  //       name: "ethereum",
  //       img: ethereum,
  //     },
  //   ],
  //   apy: chartAPY1,
  // },
  // {
  //   assets: [
  //     {
  //       name: "btt",
  //       img: btt,
  //     },
  //     {
  //       name: "uma",
  //       img: uma,
  //     },
  //     {
  //       name: "yfi",
  //       img: yfi,
  //     },
  //     {
  //       name: "doge",
  //       img: doge,
  //     },
  //     {
  //       name: "dash",
  //       img: dash,
  //     },
  //   ],
  //   apy: chartAPY2,
  // },
  // {
  //   assets: [
  //     {
  //       name: "enj",
  //       img: enj,
  //     },
  //     {
  //       name: "chz",
  //       img: chz,
  //     },
  //     {
  //       name: "bnb",
  //       img: bnb,
  //     },
  //     {
  //       name: "xtz",
  //       img: xtz,
  //     },
  //     {
  //       name: "ont",
  //       img: ont,
  //     },
  //   ],
  //   apy: chartAPY2,
  // },
];

export default function VaultsList() {
  const [data, setData] = useState<any>();

  let vaultsList: Vault[];

  // Call Api
  useEffect(() => {
    const fetchDataDetails = async () => {
      // Api Default
      const response = await fetch("https://dgt-dev.vercel.app/v1/vaults");
      const data = await response.json();

      setData(data);
    };

    fetchDataDetails();
  }, []);
  // End call api

  vaultsList = data || [];

  const mergedData = vaults.map((obj1, index) => {
    return { ...obj1, ...vaultsList[index] };
  });
  console.log(mergedData);

  return (
    <div className="pt-[80px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-semibold text-[#2563EB] text-[36px] leading-[54px]">
            All Vaults
          </h1>
          <p className="pt-1 text-[#90A3BF] leading-6">Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <form className="flex items-center bg-white border border-[#ECEFF1] rounded-lg">
            <button type="submit" className="px-[17px] py-[14px]">
              {/* <FontAwesomeIcon
                icon={faSearch}
                width="1.25rem"
                height="1.25rem"
                color="#2563EB"
              /> */}
              <Image className="w-5 h-5" src={searchIc} alt="search-icon" />
            </button>
            <input type="text" placeholder="Search to a vault" name="search" />
          </form>

          <form className="flex items-center bg-white border border-[#ECEFF1] rounded-lg">
            <button type="submit" className="px-[17px] py-[14px]">
              {/* <FontAwesomeIcon
                icon={faFilter}
                width="1.25rem"
                height="1.25rem"
                color="#2563EB"
              /> */}
              <Image className="w-5 h-5" src={filterIc} alt="filter-icon" />
            </button>
            <input type="text" placeholder="Filter by: Newest" name="filter" />
            <Image className="mr-[9px]" src={downIc} alt="down-icon" />
          </form>

          <button className="rounded-[6px] bg-blue-600 px-5 py-2.5 text-white duration-200 hover:bg-blue-600/85 xl:px-6">
            <div className="flex gap-3">
              {/* <FontAwesomeIcon
                icon={faFileDownload}
                width="14px"
                height="17px"
                color="white"
              /> */}
              <Image
                className="w-3.5 h-auto"
                src={downloadIc}
                alt="download-icon"
              />
              <span className="leading-6">Export</span>
            </div>
          </button>
        </div>
      </div>
      <div>
        <table className="mt-[30px] w-full text-base text-left text-[#1F2937] border border-[#C3D4E9] rounded-lg">
          <thead>
            <tr className="border-b border-[#C3D4E9]">
              <th className="w-[20%] pl-6 py-6">Vault Name</th>
              <th className="w-[14%] py-6">Price</th>
              <th className="w-[13%] flex items-center gap-1 py-6">
                <span>TVL</span>
                <Image
                  className="w-[16px] h-[16px]"
                  src={arrowDownUpIc}
                  alt="arrow-icon"
                />
              </th>
              <th className="w-[14%] py-6">Asset</th>
              <th className="w-[13%] py-6">7 Days</th>
              <th className="w-[12%] py-6">Return</th>
              <th className="pr-6 py-6"></th>
            </tr>
          </thead>
          <tbody>
            {mergedData.map((vault) => (
              <tr className="border-b border-[#C3D4E9]">
                <td className="w-[20%] pl-6 py-6">
                  <div className="flex items-center gap-4">
                    <Image
                      className="h-[32px] w-[32px]"
                      src={vault.url}
                      alt={vault.vault_name}
                      width={32}
                      height={32}
                    />
                    <span>{vault.vault_name}</span>
                    <span className="text-[#90A3BF]">{vault.symbol}</span>
                  </div>
                </td>
                <td className="w-[14%] py-6">{vault.price}</td>
                <td className="w-[13%] py-6">{vault.tvl}</td>
                <td className="w-[14%] py-6">
                  <div className="w-full flex items-center">
                    {vault.assets.map((asset) => (
                      <Image
                        className="w-[26px] h-[26px] object-cover rounded-[50%] bg-white [&:not(:first-child)]:-ml-[8px]"
                        src={asset.img}
                        alt={asset.name}
                        width={26}
                        height={26}
                      />
                    ))}
                  </div>
                </td>
                <td className="w-[13%] py-6">
                  <Image src={vault.apy} alt="chart" />
                </td>
                <td className="w-[12%] py-6 text-[#10B981]">
                  {vault.monthly_return}
                </td>
                <td className="pr-6 py-6">
                  <button className="border rounded-[10px] border-[#2563EB]" id="onborda-step1">
                    <div className="flex items-center px-[26px] gap-2 py-[5px] text-[#2563EB]">
                      <Image
                        className="w-[18px] h-[18px]"
                        src={depositIc}
                        alt="deposit-icon"
                      />
                      <span className="font-normal">
                        <a href="/detail">Deposit</a>
                      </span>
                    </div>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
