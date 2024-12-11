import {BASIS_POINTS_DECIMALS} from '@/lib/trade/numbers/constants'
import expandDecimals from '@/utils/numbers/expandDecimals'

// NOTE: remember to update vite-env.d.ts
export const APP_NAME = import.meta.env.VITE_APP_NAME
export const API_URL = import.meta.env.VITE_API_URL
export const TITLE = import.meta.env.VITE_APP_TITLE
export const DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION
export const MODE = import.meta.env.MODE
export const DEBUG = ['test', 'development'].includes(import.meta.env.MODE)
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN

// -----------------------------------------------------------------------------

export const UI_FEE_RECEIVER_ADDRESS =
  '0x012DbB7c032CF0A31Dab27BE9faE65eA446A469E07D346ae301db5A7F391547F'
export const LEVERAGE_DECIMALS = BASIS_POINTS_DECIMALS
export const LEVERAGE_PRECISION = expandDecimals(1, LEVERAGE_DECIMALS)

export const SLIPPAGE_DECIMALS = 6
export const SLIPPAGE_PRECISION = expandDecimals(1, SLIPPAGE_DECIMALS)
// TODO: implement slippage
export const DEFAULT_SLIPPAGE = expandDecimals(1 / 100, SLIPPAGE_DECIMALS) // 1%
export const DEFAULT_ACCEPTABLE_PRICE_IMPACT_BUFFER = 30 // 0.3%
