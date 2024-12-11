import {useMemo} from 'react'

import {TradeMode} from '@/lib/trade/states/useTradeMode'
import {TradeType} from '@/lib/trade/states/useTradeType'
import getTradeFlags from '@/views/Trade/components/utils/getTradeFlags'

export default function useTradeFlags(tradeType: TradeType, tradeMode: TradeMode) {
  return useMemo(() => getTradeFlags(tradeType, tradeMode), [tradeType, tradeMode])
}
