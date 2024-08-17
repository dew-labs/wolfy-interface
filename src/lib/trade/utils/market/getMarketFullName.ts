import {type Token} from '@/constants/tokens'

import getMarketIndexName from './getMarketIndexName'
import getMarketPoolName from './getMarketPoolName'

export default function getMarketFullName(p: {
  longToken: Token
  shortToken: Token
  indexToken: Token
  isSpotOnly: boolean
}) {
  const {indexToken, longToken, shortToken, isSpotOnly} = p

  return `${getMarketIndexName({indexToken, isSpotOnly})} [${getMarketPoolName({longToken, shortToken})}]`
}
