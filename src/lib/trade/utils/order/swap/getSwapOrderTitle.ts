import type {Token} from '@/constants/tokens'
import formatTokenAmount from '@/lib/trade/numbers/formatTokenAmount'
import * as m from '@/paraglide/messages'

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

  if (!fromTokenText || !toTokenText) {
    return ''
  }

  return m.game_fancy_manatee_flip({from: fromTokenText, to: toTokenText})
}
