import type {Price} from '@/lib/trade/services/fetchTokenPrices'

import shouldUseMaxPrice from './shouldUseMaxPrice'

export function getMarkPrice(p: {price: Price; isIncrease: boolean; isLong: boolean}) {
  const {price, isIncrease, isLong} = p

  const useMaxPrice = shouldUseMaxPrice(isIncrease, isLong)

  return useMaxPrice ? price.max : price.min
}
