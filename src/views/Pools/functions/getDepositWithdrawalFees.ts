import {getFeeItem} from '@/lib/trade/utils/fee/getFeeItem'
import {getTotalFeeItem} from '@/lib/trade/utils/fee/getTotalFeeItem'
import type {DepositWithdrawalAmounts} from '@/views/Pools/hooks/useDepositWithdrawalAmounts'

export default function getDepositWithdrawalFees({
  isDeposit,
  amounts,
}: {
  isDeposit: boolean
  amounts: DepositWithdrawalAmounts
}) {
  const basisUsd = isDeposit ? amounts.longTokenUsd + amounts.shortTokenUsd : amounts.marketTokenUsd

  const swapFee = getFeeItem(amounts.swapFeeUsd * -1n, basisUsd)
  const swapPriceImpact = getFeeItem(amounts.swapPriceImpactDeltaUsd, basisUsd)
  const uiFee = getFeeItem(amounts.uiFeeUsd * -1n, basisUsd, {
    shouldRoundUp: true,
  })

  const totalFees = getTotalFeeItem([swapPriceImpact, swapFee, uiFee].filter(Boolean))
  return {
    swapFee,
    swapPriceImpact,
    totalFees,
    uiFee,
  }
}
