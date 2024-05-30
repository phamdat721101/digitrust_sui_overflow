'use client';
import { NextIntlClientProvider } from "next-intl";
import { getMessages, DEFAULT_LOCALE } from ".";
import {NextUIProvider} from "@nextui-org/system";
import {WalletProvider} from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';
import Web3ModalProvider from './context';
import { OnbordaProvider } from "onborda";

// eslint-disable-next-line react/function-component-definition
export default async function LocaleProvider(props) {
  const { children, locale = DEFAULT_LOCALE } = props;

  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NextUIProvider>
        <OnbordaProvider>
          <Web3ModalProvider>
              <WalletProvider>
                  {children}
              </WalletProvider>
          </Web3ModalProvider>
        </OnbordaProvider>
      </NextUIProvider>
    </NextIntlClientProvider>
  );
}
