import expandDecimals from '@/utils/numbers/expandDecimals'

export const PRECISION = expandDecimals(1, 18)
export const BASIS_POINTS_DIVISOR_BIGINT = 10000n
export const BASIS_POINTS_DIVISOR = 10000
export const MAX_EXCEEDING_THRESHOLD = '1000000000'
export const MIN_EXCEEDING_THRESHOLD = '0.01'
export const USD_DECIMALS = 18 // Decimals of price feed, oracle price
