import formatAmount from '@/lib/trade/numbers/formatAmount'

export default function formatLeverage(leverage?: bigint) {
  if (leverage === undefined) return undefined

  return `${formatAmount(leverage, 4, 2)}x`
}
