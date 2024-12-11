import {useState} from 'react'
import {useLatest} from 'react-use'

import {getTokenMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'

export default function useCollateralToken(availableCollateralTokenAddresses: string[]) {
  const [chainId] = useChainId()

  const [collateralTokenAddress, setCollateralAddress] = useState<string>()
  const latestCollateralTokenAddress = useLatest(collateralTokenAddress)
  const collateralTokenData = collateralTokenAddress
    ? getTokenMetadata(chainId, collateralTokenAddress)
    : undefined
  const [collateralTokenAmount, setCollateralTokenAmount] = useState(0n)
  const latestCollateralTokenAmount = useLatest(collateralTokenAmount)

  ;(function setDefaultCollateralTokenAddress() {
    if (!availableCollateralTokenAddresses.length) return
    if (
      (!collateralTokenAddress ||
        !availableCollateralTokenAddresses.includes(collateralTokenAddress)) &&
      availableCollateralTokenAddresses[0]
    ) {
      setCollateralAddress(availableCollateralTokenAddresses[0])
    }
  })()

  return {
    collateralTokenAddress,
    latestCollateralTokenAddress,
    setCollateralAddress,
    collateralTokenData,
    collateralTokenAmount,
    latestCollateralTokenAmount,
    setCollateralTokenAmount,
  }
}
