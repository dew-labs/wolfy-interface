import {BASIS_POINTS_DECIMALS} from '@/lib/trade/numbers/constants'
import expandDecimals from '@/utils/numbers/expandDecimals'

// TODO: use t3-env (@t3-oss/env-core) + TypeMap (typemap)
// NOTE: remember to update vite-env.d.ts
export const APP_NAME = import.meta.env.VITE_APP_NAME
export const API_URL = import.meta.env.VITE_API_URL
export const TITLE = import.meta.env.VITE_APP_TITLE
export const DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION
export const MODE = import.meta.env.MODE
export const DEBUG = ['test', 'development'].includes(import.meta.env.MODE)
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN
// eslint-disable-next-line sonarjs/no-redundant-boolean -- not redundant
export const ENABLE_DEVTOOLS: boolean = MODE === 'development' && false

// -----------------------------------------------------------------------------

export const UI_FEE_RECEIVER_ADDRESS =
  '0x0746CA2519Aaa863327f7D0147590c2e0f949feD3D61f2A160c356A7332cAE26'
export const LEVERAGE_DECIMALS = BASIS_POINTS_DECIMALS
export const LEVERAGE_PRECISION = expandDecimals(1, LEVERAGE_DECIMALS)

export const SLIPPAGE_DECIMALS = 6
export const SLIPPAGE_PRECISION = expandDecimals(1, SLIPPAGE_DECIMALS)
// TODO: implement slippage
export const DEFAULT_SLIPPAGE = expandDecimals(1 / 100, SLIPPAGE_DECIMALS) // 1%
export const DEFAULT_ACCEPTABLE_PRICE_IMPACT_BUFFER = 30 // 0.3%
