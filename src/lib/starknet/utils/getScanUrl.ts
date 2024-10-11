import {StarknetChainId} from 'satoru-sdk'

export enum ScanType {
  Block = 'Block',
  Class = 'Class',
  Contract = 'Contract',
  Transaction = 'Transaction',
}

export default function getScanUrl(
  chainId: StarknetChainId,
  type = ScanType.Transaction,
  address: string,
) {
  const baseUrl = (function () {
    switch (chainId) {
      case StarknetChainId.SN_MAIN:
        return 'https://voyager.online'
      case StarknetChainId.SN_SEPOLIA:
        return 'https://sepolia.voyager.online'
      default:
        return 'https://voyager.online'
    }
  })()

  const scanType = (function () {
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
