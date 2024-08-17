import {t} from 'i18next'
import type {OrderType} from 'satoru-sdk'

import type {Token} from '@/constants/tokens'
import formatUsd from '@/lib/trade/numbers/formatUsd'

import {isIncreaseOrderType} from './type/isIncreaseOrderType'

export default function getPositionOrderTitle(p: {
  orderType: OrderType
  isLong: boolean
  indexToken: Token
  sizeDeltaUsd: bigint
}) {
  const {orderType, isLong, indexToken, sizeDeltaUsd} = p

  const longShortText = isLong ? t('Long') : t('Short')
  const tokenText = `${indexToken.symbol} ${longShortText}`
  const sizeText = formatUsd(sizeDeltaUsd)
  const increaseOrDecreaseText = isIncreaseOrderType(orderType) ? t(`Increase`) : t(`Decrease`)

  return t(`{{increaseOrDecrease}} {{token}} by {{size}}`, {
    increaseOrDecrease: increaseOrDecreaseText,
    token: tokenText,
    size: sizeText,
  })
}
