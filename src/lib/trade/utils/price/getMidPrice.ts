import type {Price} from '@/lib/trade/services/fetchTokenPrices'

export default function getMidPrice(prices: Price) {
  return (prices.min + prices.max) / 2n
}
