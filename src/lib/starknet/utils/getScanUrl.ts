import {StarknetChainId} from 'wolfy-sdk'

export const ScanType = {
  Block: 'block',
  Class: 'class',
  Contract: 'contract',
  Transaction: 'tx',
} as const
export type ScanType = (typeof ScanType)[keyof typeof ScanType]

export default function getScanUrl(
  chainId: StarknetChainId,
  type: ScanType = ScanType.Transaction,
  address: string,
) {
  const baseUrl = (() => {
    switch (chainId) {
      case StarknetChainId.SN_MAIN:
        return 'https://voyager.online'
      case StarknetChainId.SN_SEPOLIA:
        return 'https://sepolia.voyager.online'
      case StarknetChainId.SN_KATANA:
        return '' // NOTE: katana don't have a scan
    }
  })()

  const scanType = (() => {
    switch (type) {
      case ScanType.Block:
        return 'block'
      case ScanType.Class:
        return 'class'
      case ScanType.Contract:
        return 'contract'
      case ScanType.Transaction:
        return 'tx'
    }
  })()

  return `${baseUrl}/${scanType}/${address}`
}
