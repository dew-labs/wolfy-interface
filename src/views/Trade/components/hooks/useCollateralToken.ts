import {useState} from 'react'
import {useLatest} from 'react-use'

import {getTokenMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'

export default function useCollateralToken() {
  const [chainId] = useChainId()

  const [collateralTokenAddress, setCollateralAddress] = useState<string>()
  const latestCollateralTokenAddress = useLatest(collateralTokenAddress)
  const collateralTokenData = collateralTokenAddress
    ? getTokenMetadata(chainId, collateralTokenAddress)
    : undefined
  const [collateralTokenAmount, setCollateralTokenAmount] = useState(0n)
  const latestCollateralTokenAmount = useLatest(collateralTokenAmount)

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
