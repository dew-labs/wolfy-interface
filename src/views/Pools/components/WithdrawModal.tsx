import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react'
import {useQueryClient} from '@tanstack/react-query'
import type {PressEvent} from 'react-aria-components'
import {toast} from 'sonner'

import useChainId from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import getScanUrl, {ScanType} from '@/lib/starknet/utils/getScanUrl'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import useMarketTokenBalances from '@/lib/trade/hooks/useMarketTokenBalances'
import useMarketTokensData from '@/lib/trade/hooks/useMarketTokensData'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import useUiFeeFactor from '@/lib/trade/hooks/useUiFeeFactor'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import sendWithdrawal from '@/lib/trade/services/market/sendWithdrawal'
import calculateMarketPrice from '@/lib/trade/utils/market/calculateMarketPrice'
import calculatePriceFractionDigits from '@/lib/trade/utils/price/calculatePriceFractionDigits'
import calculateTokenFractionDigits from '@/lib/trade/utils/price/calculateTokenFractionDigits'
import errorMessageOrUndefined from '@/utils/errors/errorMessageOrUndefined'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'
import {useDepositWithdrawalAmounts} from '@/views/Pools/hooks/useDepositWithdrawalAmounts'
import useDepositWithdrawalExecutionFee from '@/views/Pools/hooks/useDepositWithdrawalExecutionFee'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: MemoizedCallback<() => void>
  marketTokenAddress: string
}

export default memo(function WithdrawModal({
  isOpen,
  onClose,
  marketTokenAddress,
}: WithdrawModalProps) {
  const latestMarketTokenAddress = useLatest(marketTokenAddress)

  const [wmAmount, setWmAmount] = useState('')
  const latestWmAmount = useLatest(wmAmount)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const queryClient = useQueryClient()
  const [chainId] = useChainId()
  const latestChainId = useLatest(chainId)
  const [wallet] = useWalletAccount()
  const latestWallet = useLatest(wallet)
  //TODO: optimize, do not subscribe to entire token prices
  const {data: tokenPrices = new Map()} = useTokenPrices()
  const {data: marketsData = new Map()} = useMarketsData()
  const {data: marketTokensData = new Map()} = useMarketTokensData()
  const {data: marketTokenBalances = new Map()} = useMarketTokenBalances()
  const {data: uiFeeFactor = 0n} = useUiFeeFactor()

  const marketData = useMemo(
    () => marketsData.get(marketTokenAddress),
    [marketsData, marketTokenAddress],
  )
  const latestMarketData = useLatest(marketData)
  const marketTokenData = useMemo(
    () => marketTokensData.get(marketTokenAddress),
    [marketTokensData, marketTokenAddress],
  )
  const latestMarketTokenData = useLatest(marketTokenData)

  const {longTokenPrice, shortTokenPrice} = useMemo(() => {
    if (!marketData) return {}
    return {
      longTokenPrice: tokenPrices.get(marketData.longTokenAddress),
      shortTokenPrice: tokenPrices.get(marketData.shortTokenAddress),
    }
  }, [tokenPrices, marketData])

  const price = calculateMarketPrice(
    marketData,
    marketTokenData,
    longTokenPrice,
    shortTokenPrice,
  ).max

  const userBalance = Number(
    shrinkDecimals(
      marketTokenBalances.get(marketTokenAddress) ?? 0n,
      marketTokenData?.decimals ?? 18,
    ),
  )
  const latestUserBalance = useLatest(userBalance)
  const userBalanceFractionDigits = calculateTokenFractionDigits(price)
  const userBalanceNumber = Number(
    shrinkDecimals(
      marketTokenBalances.get(marketTokenAddress) ?? 0n,
      marketTokenData?.decimals ?? 18,
    ),
  )
  const latestUserBalanceNumber = useLatest(userBalanceNumber)
  const userBalanceString = formatNumber(
    shrinkDecimals(
      marketTokenBalances.get(marketTokenAddress) ?? 0n,
      marketTokenData?.decimals ?? 18,
    ),
    Format.PLAIN,
    {
      fractionDigits: userBalanceFractionDigits,
    },
  )

  const priceFractionDigits = calculatePriceFractionDigits(price)

  const priceNumber = formatNumber(shrinkDecimals(price, USD_DECIMALS), Format.USD, {
    exactFractionDigits: true,
    fractionDigits: priceFractionDigits,
  })

  const wmAmountBigInt = useMemo(
    () => (wmAmount ? expandDecimals(parseFloat(wmAmount), marketTokenData?.decimals ?? 18) : 0n),
    [wmAmount, marketTokenData?.decimals],
  )

  const executionFee = useDepositWithdrawalExecutionFee(0n, 0n, false)

  const latestFeeTokenAmount = useLatest(executionFee?.feeTokenAmount)
  const latestFeeToken = useLatest(executionFee?.feeToken)

  const feeUsdText = formatNumber(
    shrinkDecimals(executionFee?.feeUsd ?? 0n, USD_DECIMALS),
    Format.USD,
    {
      exactFractionDigits: false,
      fractionDigits: 6,
    },
  )

  const feeTokenAmountText = formatNumber(
    shrinkDecimals(executionFee?.feeTokenAmount ?? 0n, executionFee?.feeToken.decimals ?? 18),
    Format.READABLE,
    {
      exactFractionDigits: false,
      fractionDigits: 6,
    },
  )

  const amounts = useDepositWithdrawalAmounts({
    isDeposit: false,
    marketInfo: marketData,
    marketToken: marketTokenData,
    longTokenInputState: {
      address: marketData?.longTokenAddress,
      amount: 0n,
    },
    shortTokenInputState: {
      address: marketData?.shortTokenAddress,
      amount: 0n,
    },
    marketTokenAmount: wmAmountBigInt,
    uiFeeFactor,
    focusedInput: 'market',
  })
  const {swapFeeUsd, swapPriceImpactDeltaUsd} = amounts ?? {}

  const feesAndPriceImpact = (swapFeeUsd ?? 0n) + (swapPriceImpactDeltaUsd ?? 0n)
  const feesAndPriceImpactText = formatNumber(
    shrinkDecimals(feesAndPriceImpact, USD_DECIMALS),
    Format.USD,
    {
      exactFractionDigits: false,
      fractionDigits: 6,
    },
  )

  const {longTokenAmount, shortTokenAmount} = amounts ?? {}

  const {longTokenAmountText, shortTokenAmountText} = useMemo(() => {
    if (!amounts) return {longTokenAmount: '0', shortTokenAmount: '0'}

    const longTokenFractionDigits = calculateTokenFractionDigits(longTokenPrice?.max)
    const shortTokenFractionDigits = calculateTokenFractionDigits(shortTokenPrice?.max)

    return {
      longTokenAmountText: formatNumber(
        shrinkDecimals(amounts.longTokenAmount, marketData?.longToken.decimals ?? 18),
        Format.READABLE,
        {
          exactFractionDigits: false,
          fractionDigits: longTokenFractionDigits,
        },
      ),
      shortTokenAmountText: formatNumber(
        shrinkDecimals(amounts.shortTokenAmount, marketData?.shortToken.decimals ?? 18),
        Format.READABLE,
        {
          exactFractionDigits: false,
          fractionDigits: shortTokenFractionDigits,
        },
      ),
    }
  }, [amounts, longTokenPrice?.max, shortTokenPrice?.max, marketData])

  const latestLongTokenAmount = useLatest(longTokenAmount)
  const latestShortTokenAmount = useLatest(shortTokenAmount)

  const handleWmAmountChange = useCallback((value: string) => {
    setWmAmount(() => {
      const newValue = value.replace(/[^0-9.]/g, '')
      const numValue = parseFloat(newValue)
      if (isNaN(numValue)) return ''
      return numValue > latestUserBalance.current ? latestUserBalance.current.toString() : newValue
    })
  }, [])

  const handleWmAmountSetToMax = useCallback(() => {
    setWmAmount(latestUserBalanceNumber.current.toString())
  }, [])

  const isInputValid = useMemo(() => {
    const amount = parseFloat(wmAmount)
    return !isNaN(amount) && amount > 0 && amount <= userBalance
  }, [wmAmount, userBalance])
  const latestIsInputValid = useLatest(isInputValid)

  const handleSubmit = useCallback(
    (_e: PressEvent) => {
      const wallet = latestWallet.current
      const marketData = latestMarketData.current
      const marketTokenData = latestMarketTokenData.current
      const isInputValid = latestIsInputValid.current
      const feeTokenAmount = latestFeeTokenAmount.current
      const feeToken = latestFeeToken.current

      if (
        !marketData ||
        !wallet ||
        !marketTokenData ||
        !isInputValid ||
        !feeToken ||
        feeTokenAmount === undefined
      )
        return

      setIsSubmitting(true)
      toast.promise(
        async () => {
          try {
            const wmAmountBigInt = expandDecimals(
              parseFloat(latestWmAmount.current),
              marketTokenData.decimals,
            )

            const withdrawalParams = {
              receiver: wallet.address,
              market: latestMarketTokenAddress.current,
              marketTokenAmount: wmAmountBigInt,
              minLongToken: ((latestLongTokenAmount.current ?? 0n) * 99n) / 100n, // 1% slippage
              minShortToken: ((latestShortTokenAmount.current ?? 0n) * 99n) / 100n, // 1% slippage
              longTokenSwapPath: [],
              shortTokenSwapPath: [],
              executionFee: feeTokenAmount,
            }

            const result = await sendWithdrawal(wallet, withdrawalParams, feeToken)

            await Promise.all([
              queryClient.invalidateQueries({
                queryKey: ['marketTokenBalances', latestChainId.current],
              }),
              queryClient.invalidateQueries({
                queryKey: ['marketTokensData', latestChainId.current],
              }),
            ])

            onClose()
            return result
          } finally {
            setIsSubmitting(false)
          }
        },
        {
          loading: 'Submitting withdrawal...',
          success: data => (
            <>
              Withdrawal successful.
              <a
                href={getScanUrl(latestChainId.current, ScanType.Transaction, data.tx)}
                target='_blank'
                rel='noreferrer'
              >
                View transaction
              </a>
            </>
          ),
          error: error => <div>{errorMessageOrUndefined(error) ?? 'Withdrawal failed.'}</div>,
        },
      )
    },
    [onClose, queryClient],
  )

  if (!marketData || !marketTokenData) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>Withdraw {marketData.name}</ModalHeader>
        <ModalBody>
          <p>Current Market Price: {priceNumber}</p>
          <Input
            label='WM Amount'
            placeholder='Enter WM amount'
            value={wmAmount}
            onChange={e => {
              handleWmAmountChange(e.target.value)
            }}
            endContent={
              <button
                className={clsx(
                  'absolute right-3 top-2 m-0 whitespace-nowrap p-0 text-xs',
                  parseFloat(wmAmount.replace(/,/g, '')) > userBalance && 'text-danger-500',
                )}
                onClick={handleWmAmountSetToMax}
                type='button'
              >
                Max: {userBalanceString}
              </button>
            }
          />
          <div className='flex flex-col gap-2'>
            <div className='flex justify-between'>
              <span className='text-sm'>Receive:</span>
              <div className='text-right'>
                <div>
                  ~ {longTokenAmountText} {marketData.longToken.symbol}
                </div>
                <div>
                  ~ {shortTokenAmountText} {marketData.shortToken.symbol}
                </div>
              </div>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Fees and price impact:</span>
              <span>{feesAndPriceImpactText}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Network Fee:</span>
              <div className='text-right'>
                <div>{feeUsdText}</div>
                <div className='text-xs'>
                  {feeTokenAmountText} {executionFee?.feeToken.symbol}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color='danger' variant='light' onPress={onClose}>
            Cancel
          </Button>
          <Button
            color='primary'
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={!isInputValid}
          >
            {isSubmitting ? 'Submitting...' : 'Withdraw'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})
