import {ec, num, shortString} from 'starknet'

type Hashable = string | bigint | boolean | number

export function getKey(v: Hashable | Hashable[]) {
  const values = Array.isArray(v) ? v : [v]
  return ec.starkCurve.poseidonHashMany(
    values.map(value => {
      if (typeof value === 'boolean') return BigInt(value ? 1 : 0)
      if (typeof value === 'string') {
        if (num.isHex(value)) return num.toBigInt(value)
        return BigInt(shortString.encodeShortString(value))
      }
      if (typeof value === 'number') return BigInt(value)
      return value
    }),
  )
}

export const POSITION_IMPACT_FACTOR_KEY = getKey('POSITION_IMPACT_FACTOR')
export const MAX_POSITION_IMPACT_FACTOR_KEY = getKey('MAX_POS_IMPACT_FACTOR')
export const POSITION_IMPACT_EXPONENT_FACTOR_KEY = getKey('POS_IMPACT_EXP_FACTOR')
export const POSITION_FEE_FACTOR_KEY = getKey('POSITION_FEE_FACTOR')
export const SWAP_IMPACT_FACTOR_KEY = getKey('SWAP_IMPACT_FACTOR')
export const SWAP_IMPACT_EXPONENT_FACTOR_KEY = getKey('SWAP_IMPACT_EXP_FACTOR')
export const SWAP_FEE_FACTOR_KEY = getKey('SWAP_FEE_FACTOR')
export const BORROWING_FEE_RECEIVER_FACTOR = getKey('BORROWING_FEE_RECEIVER_FACTOR')
export const SWAP_FEE_RECEIVER_FACTOR = getKey('SWAP_FEE_RECEIVER_FACTOR')
export const POSITION_FEE_RECEIVER_FACTOR = getKey('POSITION_FEE_RECEIVER_FACTOR')
export const OPEN_INTEREST_KEY = getKey('OPEN_INTEREST')
export const OPEN_INTEREST_IN_TOKENS_KEY = getKey('OPEN_INTEREST_IN_TOKENS')
export const POOL_AMOUNT_KEY = getKey('POOL_AMOUNT')
export const MAX_POOL_AMOUNT_KEY = getKey('MAX_POOL_AMOUNT')
export const RESERVE_FACTOR_KEY = getKey('RESERVE_FACTOR')
export const OPEN_INTEREST_RESERVE_FACTOR_KEY = getKey('OI_RESERVE_FACTOR')
export const MAX_OPEN_INTEREST_KEY = getKey('MAX_OPEN_INTEREST')
export const NONCE_KEY = getKey('NONCE')
export const BORROWING_FACTOR_KEY = getKey('BORROWING_FACTOR')
export const BORROWING_EXPONENT_FACTOR_KEY = getKey('BORROWING_EXPONENT_FACTOR')
export const CUMULATIVE_BORROWING_FACTOR_KEY = getKey('CUMULATIVE_BORROWING_FACTOR')
export const TOTAL_BORROWING_KEY = getKey('TOTAL_BORROWING')
export const FUNDING_FACTOR_KEY = getKey('FUNDING_FACTOR')
export const STABLE_FUNDING_FACTOR_KEY = getKey('STABLE_FUNDING_FACTOR')
export const FUNDING_EXPONENT_FACTOR_KEY = getKey('FUNDING_EXPONENT_FACTOR')
export const MAX_PNL_FACTOR_KEY = getKey('MAX_PNL_FACTOR')
export const MAX_PNL_FACTOR_FOR_WITHDRAWALS_KEY = getKey('MAX_PNL_FACT_FOR_WITHDRAWALS')
export const MAX_PNL_FACTOR_FOR_DEPOSITS_KEY = getKey('MAX_PNL_FACTOR_FOR_DEPOSITS')
export const MAX_PNL_FACTOR_FOR_TRADERS_KEY = getKey('MAX_PNL_FACT_FOR_TRADERS')
export const MAX_POSITION_IMPACT_FACTOR_FOR_LIQUIDATIONS_KEY = getKey('MAX_POS_IMP_FACT_FOR_LIQ')
export const POSITION_IMPACT_POOL_AMOUNT_KEY = getKey('POS_IMPACT_POOL_AMT')
export const SWAP_IMPACT_POOL_AMOUNT_KEY = getKey('SWAP_IMPACT_POOL_AMT')
export const MIN_COLLATERAL_USD_KEY = getKey('MIN_COLLATERAL_USD')
export const MIN_COLLATERAL_FACTOR_KEY = getKey('MIN_COLLATERAL_FACTOR')
export const MIN_COLLATERAL_FACTOR_FOR_OPEN_INTEREST_MULTIPLIER_KEY = getKey(
  'MIN_COLL_FACT_FOR_OI_MULT',
)
export const MIN_POSITION_SIZE_USD_KEY = getKey('MIN_POSITION_SIZE_USD')
export const DEPOSIT_GAS_LIMIT_KEY = getKey('DEPOSIT_GAS_LIMIT')
export const WITHDRAWAL_GAS_LIMIT_KEY = getKey('WITHDRAW_GAS_LIMIT')
export const INCREASE_ORDER_GAS_LIMIT_KEY = getKey('INCR_ORD_GAS_LIMIT')
export const DECREASE_ORDER_GAS_LIMIT_KEY = getKey('DECR_ORD_GAS_LIMIT')
export const SWAP_ORDER_GAS_LIMIT_KEY = getKey('SWAP_ORD_GAS_LIMIT')
export const SINGLE_SWAP_GAS_LIMIT_KEY = getKey('SINGLE_SWAP_GAS_LIMIT')
export const TOKEN_TRANSFER_GAS_LIMIT_KEY = getKey('TOKEN_TRANS_GAS_LIMIT')
export const NATIVE_TOKEN_TRANSFER_GAS_LIMIT_KEY = getKey('NATIVE_TKN_TRANS_GL')
export const MARKET_LIST_KEY = getKey('MARKET_LIST')
export const POSITION_LIST_KEY = getKey('POSITION_LIST')
export const ACCOUNT_POSITION_LIST_KEY = getKey('ACCOUNT_POSITION_LIST')
export const ORDER_LIST_KEY = getKey('ORDER_LIST')
export const ACCOUNT_ORDER_LIST_KEY = getKey('ACCOUNT_ORDER_LIST')
export const CLAIMABLE_FUNDING_AMOUNT = getKey('CLAIMABLE_FUNDING_AMOUNT')
export const VIRTUAL_TOKEN_ID_KEY = getKey('VIRTUAL_TOKEN_ID')
export const VIRTUAL_MARKET_ID_KEY = getKey('VIRTUAL_MARKET_ID')
export const VIRTUAL_INVENTORY_FOR_POSITIONS_KEY = getKey('VIRT_INV_FOR_POSITIONS')
export const VIRTUAL_INVENTORY_FOR_SWAPS_KEY = getKey('VIRT_INV_FOR_SWAPS')
export const AFFILIATE_REWARD_KEY = getKey('AFFILIATE_REWARD')
export const IS_MARKET_DISABLED_KEY = getKey('IS_MARKET_DISABLED')
export const UI_FEE_FACTOR = getKey('UI_FEE_FACTOR')

// -----------------------------------------------------------------------------

export function positionImpactFactorKey(market: Hashable, isPositive: boolean) {
  return getKey([POSITION_IMPACT_FACTOR_KEY, market, isPositive])
}

export function positionImpactExponentFactorKey(market: Hashable) {
  return getKey([POSITION_IMPACT_EXPONENT_FACTOR_KEY, market])
}

export function maxPositionImpactFactorKey(market: Hashable, isPositive: boolean) {
  return getKey([MAX_POSITION_IMPACT_FACTOR_KEY, market, isPositive])
}

export function positionFeeFactorKey(market: Hashable, forPositiveImpact: boolean) {
  return getKey([POSITION_FEE_FACTOR_KEY, market, forPositiveImpact])
}

export function swapImpactFactorKey(market: Hashable, isPositive: boolean) {
  return getKey([SWAP_IMPACT_FACTOR_KEY, market, isPositive])
}

export function swapImpactExponentFactorKey(market: Hashable) {
  return getKey([SWAP_IMPACT_EXPONENT_FACTOR_KEY, market])
}

export function swapFeeFactorKey(market: Hashable, forPositiveImpact: boolean) {
  return getKey([SWAP_FEE_FACTOR_KEY, market, forPositiveImpact])
}

export function openInterestKey(market: Hashable, collateralToken: Hashable, isLong: boolean) {
  return getKey([OPEN_INTEREST_KEY, market, collateralToken, isLong])
}

export function openInterestInTokensKey(
  market: Hashable,
  collateralToken: Hashable,
  isLong: boolean,
) {
  return getKey([OPEN_INTEREST_IN_TOKENS_KEY, market, collateralToken, isLong])
}

export function poolAmountKey(market: Hashable, token: Hashable) {
  return getKey([POOL_AMOUNT_KEY, market, token])
}

export function reserveFactorKey(market: Hashable, isLong: boolean) {
  return getKey([RESERVE_FACTOR_KEY, market, isLong])
}

export function openInterestReserveFactorKey(market: Hashable, isLong: boolean) {
  return getKey([OPEN_INTEREST_RESERVE_FACTOR_KEY, market, isLong])
}

export function maxOpenInterestKey(market: Hashable, isLong: boolean) {
  return getKey([MAX_OPEN_INTEREST_KEY, market, isLong])
}

export function borrowingFactorKey(market: Hashable, isLong: boolean) {
  return getKey([BORROWING_FACTOR_KEY, market, isLong])
}

export function borrowingExponentFactorKey(market: Hashable, isLong: boolean) {
  return getKey([BORROWING_EXPONENT_FACTOR_KEY, market, isLong])
}

export function cumulativeBorrowingFactorKey(market: Hashable, isLong: boolean) {
  return getKey([CUMULATIVE_BORROWING_FACTOR_KEY, market, isLong])
}

export function totalBorrowingKey(market: Hashable, isLong: boolean) {
  return getKey([TOTAL_BORROWING_KEY, market, isLong])
}

export function fundingFactorKey(market: Hashable) {
  return getKey([FUNDING_FACTOR_KEY, market])
}

export function stableFundingFactorKey(market: Hashable) {
  return getKey([STABLE_FUNDING_FACTOR_KEY, market])
}

export function fundingExponentFactorKey(market: Hashable) {
  return getKey([FUNDING_EXPONENT_FACTOR_KEY, market])
}

export function maxPnlFactorKey(pnlFactorType: Hashable, market: Hashable, isLong: boolean) {
  return getKey([MAX_PNL_FACTOR_KEY, pnlFactorType, market, isLong])
}

export function positionImpactPoolAmountKey(market: Hashable) {
  return getKey([POSITION_IMPACT_POOL_AMOUNT_KEY, market])
}

export function maxPositionImpactFactorForLiquidationsKey(market: Hashable) {
  return getKey([MAX_POSITION_IMPACT_FACTOR_FOR_LIQUIDATIONS_KEY, market])
}

export function swapImpactPoolAmountKey(market: Hashable, token: Hashable) {
  return getKey([SWAP_IMPACT_POOL_AMOUNT_KEY, market, token])
}

export function orderKey(dataStoreAddress: Hashable, nonce: bigint) {
  return getKey([dataStoreAddress, nonce])
}

export function depositGasLimitKey(singleToken: boolean) {
  return getKey([DEPOSIT_GAS_LIMIT_KEY, singleToken])
}

export function withdrawalGasLimitKey() {
  return getKey([WITHDRAWAL_GAS_LIMIT_KEY])
}

export function accountOrderListKey(account: Hashable) {
  return getKey([ACCOUNT_ORDER_LIST_KEY, account])
}

export function accountPositionListKey(account: Hashable) {
  return getKey([ACCOUNT_POSITION_LIST_KEY, account])
}

export function minCollateralFactorKey(market: Hashable) {
  return getKey([MIN_COLLATERAL_FACTOR_KEY, market])
}

export function minCollateralFactorForOpenInterest(market: Hashable, isLong: boolean) {
  return getKey([MIN_COLLATERAL_FACTOR_FOR_OPEN_INTEREST_MULTIPLIER_KEY, market, isLong])
}

export function hashedPositionKey(
  account: Hashable,
  market: Hashable,
  collateralToken: Hashable,
  isLong: boolean,
) {
  return getKey([account, market, collateralToken, isLong])
}

export function claimableFundingAmountKey(market: Hashable, token: Hashable, account: Hashable) {
  return getKey([CLAIMABLE_FUNDING_AMOUNT, market, token, account])
}
export function virtualTokenIdKey(token: Hashable) {
  return getKey([VIRTUAL_TOKEN_ID_KEY, token])
}

export function virtualMarketIdKey(market: Hashable) {
  return getKey([VIRTUAL_MARKET_ID_KEY, market])
}

export function virtualInventoryForSwapsKey(virtualMarketId: Hashable, token: Hashable) {
  return getKey([VIRTUAL_INVENTORY_FOR_SWAPS_KEY, virtualMarketId, token])
}

export function virtualInventoryForPositionsKey(virtualTokenId: Hashable) {
  return getKey([VIRTUAL_INVENTORY_FOR_POSITIONS_KEY, virtualTokenId])
}

export function affiliateRewardKey(market: Hashable, token: Hashable, account: Hashable) {
  return getKey([AFFILIATE_REWARD_KEY, market, token, account])
}

export function isMarketDisabledKey(market: Hashable) {
  return getKey([IS_MARKET_DISABLED_KEY, market])
}

export function maxPoolAmountKey(market: Hashable, token: Hashable) {
  return getKey([MAX_POOL_AMOUNT_KEY, market, token])
}

export function uiFeeFactorKey(address: Hashable) {
  return getKey([UI_FEE_FACTOR, address])
}
