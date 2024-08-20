import {useState} from 'react'
import {useLatest} from 'react-use'

import useTokensData from '@/lib/trade/hooks/useTokensData'

export default function useCollateralToken() {
  const tokensData = useTokensData()

  const [collateralTokenAddress, setCollateralAddress] = useState<string>()
  const latestCollateralTokenAddress = useLatest(collateralTokenAddress)
  const collateralTokenData = collateralTokenAddress
    ? tokensData?.get(collateralTokenAddress)
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
