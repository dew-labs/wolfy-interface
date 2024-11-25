import expandDecimals from '@/utils/numbers/expandDecimals'

// These config values are used in contracts, backend,... and many places, shouldn't be changed
export const PRECISION = expandDecimals(1, 18) // DIVISOR
export const USD_DECIMALS = 30 // Decimals of price feed, oracle price
export const BASIS_POINTS_DECIMALS = 4
export const BASIS_POINTS_DIVISOR = Number(expandDecimals(1, BASIS_POINTS_DECIMALS)) // 1 BPS = 0.0001 = 0.01%
export const BASIS_POINTS_DIVISOR_BIGINT = expandDecimals(1, BASIS_POINTS_DECIMALS)
export const MAX_EXCEEDING_THRESHOLD = '1000000000'
export const MIN_EXCEEDING_THRESHOLD = '0.01'
