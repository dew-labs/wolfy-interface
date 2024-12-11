import type {Token} from '@/constants/tokens'
import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import type {GasLimitsConfig} from '@/lib/trade/services/fetchGasLimits'
import type {Price} from '@/lib/trade/services/fetchTokenPrices'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'

export interface ExecutionFee {
  feeUsd: bigint
  feeTokenAmount: bigint
}

export function getExecutionFee(
  gasLimits: GasLimitsConfig,
  feeTokenPrice: Price,
  estimatedGasLimit: bigint,
  gasPrice: bigint,
  feeToken: Token,
): ExecutionFee {
  const baseGasLimit = gasLimits.estimatedFeeBaseGasLimit
  const multiplierFactor = gasLimits.estimatedFeeMultiplierFactor
  const adjustedGasLimit = baseGasLimit + applyFactor(estimatedGasLimit, multiplierFactor)

  const feeTokenAmount = adjustedGasLimit * gasPrice

  const feeUsd = convertTokenAmountToUsd(feeTokenAmount, feeToken.decimals, feeTokenPrice.min)

  return {
    feeUsd,
    feeTokenAmount,
  }
}
