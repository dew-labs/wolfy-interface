import useFeeToken from '@/lib/trade/hooks/useFeeToken'
import useGasLimits from '@/lib/trade/hooks/useGasLimits'
import useGasPrice from '@/lib/trade/hooks/useGasPrice'
import estimateExecuteDepositGasLimit from '@/lib/trade/utils/fee/estimateExecuteDepositGasLimit'
import estimateExecuteWithdrawalGasLimit from '@/lib/trade/utils/fee/estimateExecuteWithdrawalGasLimit'
import {getExecutionFee} from '@/lib/trade/utils/fee/getExecutionFee'

export default function useDepositWithdrawalExecutionFee(
  longTokenAmount: bigint,
  shortTokenAmount: bigint,
  isDeposit: boolean,
) {
  const {data: gasLimits} = useGasLimits()
  const {data: gasPrice} = useGasPrice()
  const {feeToken, feeTokenPrice} = useFeeToken()

  if (!gasLimits || !gasPrice) return undefined

  let executionFee

  if (isDeposit) {
    const estimatedGasLimit = estimateExecuteDepositGasLimit(gasLimits, {
      initialLongTokenAmount: longTokenAmount,
      initialShortTokenAmount: shortTokenAmount,
    })

    executionFee = getExecutionFee(gasLimits, feeTokenPrice, estimatedGasLimit, gasPrice, feeToken)
  } else {
    const estimatedGasLimit = estimateExecuteWithdrawalGasLimit(gasLimits, {})

    executionFee = getExecutionFee(gasLimits, feeTokenPrice, estimatedGasLimit, gasPrice, feeToken)
  }

  return {
    ...executionFee,
    feeToken,
    feeTokenPrice,
  }
}
