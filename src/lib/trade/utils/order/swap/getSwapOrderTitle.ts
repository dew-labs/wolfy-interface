import {t} from 'i18next'

import type {Token} from '@/constants/tokens'
import formatTokenAmount from '@/lib/trade/numbers/formatTokenAmount'

export default function getSwapOrderTitle(p: {
  initialCollateralToken: Token
  targetCollateralToken: Token
  initialCollateralAmount: bigint
  minOutputAmount: bigint
}) {
  const {initialCollateralToken, initialCollateralAmount, targetCollateralToken, minOutputAmount} =
    p

  const fromTokenText = formatTokenAmount(
    initialCollateralAmount,
    initialCollateralToken.decimals,
    initialCollateralToken.symbol,
  )

  const toTokenText = formatTokenAmount(
    minOutputAmount,
    targetCollateralToken.decimals,
    targetCollateralToken.symbol,
  )

  return t(`Swap {{from}} for {{to}}`, {from: fromTokenText, to: toTokenText})
}
