'use client'

import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth'
import { ReactNode } from 'react'

interface PrivyProviderProps {
  children: ReactNode
}

export default function PrivyProvider({ children }: PrivyProviderProps) {
  const mantleChain = {
    id: 5000, // Mantle Network
    name: 'Mantle',
    nativeCurrency: {
      decimals: 18,
      name: 'Mantle',
      symbol: 'MNT',
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.mantle.xyz'],
      },
      public: {
        http: ['https://rpc.mantle.xyz'],
      },
    },
  }

  return (
    <BasePrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        // Configuración básica
        loginMethods: ['wallet', 'email'],
        appearance: {
          theme: 'dark',
          accentColor: '#00ffff',
          logo: undefined
        },
        // Configuración para el contexto de la lotería
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: mantleChain,
        supportedChains: [mantleChain]
      }}
    >
      {children}
    </BasePrivyProvider>
  )
}
