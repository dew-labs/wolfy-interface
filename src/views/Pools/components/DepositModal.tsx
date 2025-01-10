import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react'
import {useQueryClient} from '@tanstack/react-query'
import clsx from 'clsx'
import {
  type ChangeEventHandler,
  memo,
  type MemoizedCallback,
  useCallback,
  useMemo,
  useState,
} from 'react'
import type {PressEvent} from 'react-aria-components'
import {useLatest} from 'react-use'
import {toast} from 'sonner'

import useChainId from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import getScanUrl, {ScanType} from '@/lib/starknet/utils/getScanUrl'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import useMarketTokensData from '@/lib/trade/hooks/useMarketTokensData'
import useTokenBalances from '@/lib/trade/hooks/useTokenBalances'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import useUiFeeFactor from '@/lib/trade/hooks/useUiFeeFactor'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import sendDeposit from '@/lib/trade/services/market/sendDeposit'
import calculateMarketPrice from '@/lib/trade/utils/market/calculateMarketPrice'
import calculatePriceFractionDigits from '@/lib/trade/utils/price/calculatePriceFractionDigits'
import calculateTokenFractionDigits from '@/lib/trade/utils/price/calculateTokenFractionDigits'
import errorMessageOrUndefined from '@/utils/errors/errorMessageOrUndefined'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'
import {useDepositWithdrawalAmounts} from '@/views/Pools/hooks/useDepositWithdrawalAmounts'
import useDepositWithdrawalExecutionFee from '@/views/Pools/hooks/useDepositWithdrawalExecutionFee'

interface DepositModalProps {
  isOpen: boolean
  onClose: MemoizedCallback<() => void>
  marketTokenAddress: string
  orderType: 'buy' | 'sell'
}

export default memo(function DepositModal({
  isOpen,
  onClose,
  marketTokenAddress,
  orderType,
}: DepositModalProps) {
  const [chainId] = useChainId()

  const queryClient = useQueryClient()
  const [wallet] = useWalletAccount()
  // TODO: optimize, do not subscribe to entire token prices
  const {data: tokenPrices = new Map()} = useTokenPrices()
  const {data: marketsData = new Map()} = useMarketsData()
  const {data: marketTokensData = new Map()} = useMarketTokensData()
  const {data: tokenBalances = new Map()} = useTokenBalances()
  const {data: uiFeeFactor = 0n} = useUiFeeFactor()

  const [longTokenAmountInput, setLongTokenAmountInput] = useState('')
  const [shortTokenAmountInput, setShortTokenAmountInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const marketData = useMemo(
    () => marketsData.get(marketTokenAddress),
    [marketsData, marketTokenAddress],
  )

  const longTokenAmount = marketData
    ? expandDecimals(parseFloat(longTokenAmountInput) || 0, marketData.longToken.decimals)
    : 0n
  const latestLongTokenAmount = useLatest(longTokenAmount)
  const shortTokenAmount = marketData
    ? expandDecimals(parseFloat(shortTokenAmountInput) || 0, marketData.shortToken.decimals)
    : 0n
  const latestShortTokenAmount = useLatest(shortTokenAmount)
  const marketTokenData = useMemo(
    () => marketTokensData.get(marketTokenAddress),
    [marketTokensData, marketTokenAddress],
  )

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

  const priceFractionDigits = calculatePriceFractionDigits(price)

  const priceNumber = formatNumber(shrinkDecimals(price, USD_DECIMALS), Format.USD, {
    exactFractionDigits: true,
    fractionDigits: priceFractionDigits,
  })

  // const marketTokenAmount = useMemo(() => {
  //   if (!marketData || !marketTokenData)
  //     return {
  //       number: 0,
  //       text: '0',
  //     }

  //   const longAmount = parseFloat(longTokenAmountInput) || 0
  //   const shortAmount = parseFloat(shortTokenAmountInput) || 0

  //   const longValueUsd = convertTokenAmountToUsd(
  //     BigInt(Math.floor(longAmount * 10 ** marketData.longToken.decimals)),
  //     marketData.longToken.decimals,
  //     longTokenPrice?.max,
  //   )

  //   const shortValueUsd = convertTokenAmountToUsd(
  //     BigInt(Math.floor(shortAmount * 10 ** marketData.shortToken.decimals)),
  //     marketData.shortToken.decimals,
  //     shortTokenPrice?.max,
  //   )

  //   const totalValueUsd = longValueUsd + shortValueUsd

  //   // This is a simplified calculation and should be replaced with the actual formula
  //   // based on your protocol's specifics
  //   const calculatedAmount = Number(totalValueUsd) / Number(price)

  //   const amountDecimals = calculateTokenFractionDigits(
  //     BigInt(Math.floor(calculatedAmount / 10 ** USD_DECIMALS)),
  //   )

  //   const value = expandDecimals(calculatedAmount, marketTokenData.decimals)

  //   return {
  //     value,
  //     number: calculatedAmount,
  //     text: formatNumber(calculatedAmount, Format.READABLE, {
  //       exactFractionDigits: true,
  //       fractionDigits: amountDecimals,
  //     }),
  //   }
  // }, [
  //   marketData,
  //   marketTokenData,
  //   longTokenAmountInput,
  //   shortTokenAmountInput,
  //   longTokenPrice,
  //   shortTokenPrice,
  //   price,
  // ])

  const [longTokenBalance, shortTokenBalance] = useMemo(() => {
    if (!marketData) return [0n, 0n]
    return [
      tokenBalances.get(marketData.longTokenAddress) ?? 0n,
      tokenBalances.get(marketData.shortTokenAddress) ?? 0n,
    ]
  }, [marketData, tokenBalances])

  const maxLongToken = Number(
    shrinkDecimals(longTokenBalance, marketData?.longToken.decimals ?? 18),
  )
  const latestMaxLongToken = useLatest(maxLongToken)

  const longTokenDisplayDecimals = calculateTokenFractionDigits(longTokenPrice?.max)

  const maxLongTokenString = formatNumber(
    shrinkDecimals(longTokenBalance, marketData?.longToken.decimals ?? 18),
    Format.READABLE,
    {
      exactFractionDigits: true,
      fractionDigits: longTokenDisplayDecimals,
    },
  )

  const handleLongTokenAmountChange = useCallback((value: string) => {
    setLongTokenAmountInput(() => {
      const newValue = value.replace(/[^0-9.]/g, '')
      const numValue = parseFloat(newValue)
      if (isNaN(numValue)) return ''
      return numValue > latestMaxLongToken.current
        ? latestMaxLongToken.current.toString()
        : newValue
    })
  }, [])

  const maxShortToken = Number(
    shrinkDecimals(shortTokenBalance, marketData?.shortToken.decimals ?? 18),
  )
  const latestMaxShortToken = useLatest(maxShortToken)

  const shortTokenDisplayDecimals = calculateTokenFractionDigits(shortTokenPrice?.max)

  const maxShortTokenString = formatNumber(
    shrinkDecimals(shortTokenBalance, marketData?.shortToken.decimals ?? 18),
    Format.READABLE,
    {
      exactFractionDigits: true,
      fractionDigits: shortTokenDisplayDecimals,
    },
  )

  const handleShortTokenAmountChange = useCallback((value: string) => {
    setShortTokenAmountInput(() => {
      const newValue = value.replace(/[^0-9.]/g, '')
      const numValue = parseFloat(newValue)
      if (isNaN(numValue)) return ''
      return numValue > latestMaxShortToken.current
        ? latestMaxShortToken.current.toString()
        : newValue
    })
  }, [])

  const handleLongTokenSetToMax = useCallback(() => {
    setLongTokenAmountInput(latestMaxLongToken.current.toString())
  }, [])

  const handleShortTokenSetToMax = useCallback(() => {
    setShortTokenAmountInput(latestMaxShortToken.current.toString())
  }, [])

  // -------------------------------------------------------------------------------------------------------------------

  const executionFee = useDepositWithdrawalExecutionFee(longTokenAmount, shortTokenAmount, true)

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

  // -------------------------------------------------------------------------------------------------------------------

  // TODO: use the output of this hook and support user input market token amount => change the focusedInput
  const amounts = useDepositWithdrawalAmounts({
    isDeposit: true,
    marketInfo: marketData,
    marketToken: marketTokenData,
    longTokenInputState: {
      address: marketData?.longTokenAddress,
      amount: longTokenAmount,
    },
    shortTokenInputState: {
      address: marketData?.shortTokenAddress,
      amount: shortTokenAmount,
    },
    marketTokenAmount: 0n,
    uiFeeFactor,
    focusedInput: 'longCollateral',
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

  const marketTokenAmountText = formatNumber(
    shrinkDecimals(amounts?.marketTokenAmount ?? 0n, marketTokenData?.decimals ?? 18),
    Format.READABLE,
    {
      exactFractionDigits: false,
      fractionDigits: 6,
    },
  )
  // -------------------------------------------------------------------------------------------------------------------

  const isInputValid = useMemo(() => {
    const longAmount = parseFloat(longTokenAmountInput) || 0
    const shortAmount = parseFloat(shortTokenAmountInput) || 0
    return (
      (longAmount > 0 || shortAmount > 0) &&
      longAmount <= maxLongToken &&
      shortAmount <= maxShortToken
    )
  }, [longTokenAmountInput, shortTokenAmountInput, maxLongToken, maxShortToken])

  const latestMarketTokenAddress = useLatest(marketTokenAddress)
  const latestChainId = useLatest(chainId)
  const latestWallet = useLatest(wallet)
  const latestMarketData = useLatest(marketData)
  const latestMarketTokenData = useLatest(marketTokenData)
  const latestMarketTokenAmount = useLatest(amounts?.marketTokenAmount)
  const latestIsInputValid = useLatest(isInputValid)

  const handleSubmit = useCallback(
    (_e: PressEvent) => {
      const marketData = latestMarketData.current
      const wallet = latestWallet.current
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
            const depositParams = {
              receiver: wallet.address,
              market: latestMarketTokenAddress.current,
              initialLongToken: marketData.longTokenAddress,
              initialLongTokenAmount: latestLongTokenAmount.current,
              initialShortToken: marketData.shortTokenAddress,
              initialShortTokenAmount: latestShortTokenAmount.current,
              minMarketToken: ((latestMarketTokenAmount.current ?? 0n) * 99n) / 100n, // 1% slippage
              executionFee: feeTokenAmount,
              longTokenSwapPath: [],
              shortTokenSwapPath: [],
            }

            const result = await sendDeposit(wallet, depositParams, feeToken)

            await Promise.allSettled([
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
          loading: 'Submitting deposit...',
          success: data => (
            <>
              Deposit successful.
              <a
                href={getScanUrl(latestChainId.current, ScanType.Transaction, data.tx)}
                target='_blank'
                rel='noreferrer'
              >
                View transaction
              </a>
            </>
          ),
          error: error => <div>{errorMessageOrUndefined(error) ?? 'Deposit failed.'}</div>,
        },
      )
    },
    [onClose, queryClient],
  )

  const onLongTokenAmountChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      handleLongTokenAmountChange(e.target.value)
    },
    [handleLongTokenAmountChange],
  )

  const onShortTokenAmountChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      handleShortTokenAmountChange(e.target.value)
    },
    [handleShortTokenAmountChange],
  )

  if (!marketData || !marketTokenData) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          {orderType === 'buy' ? 'Buy' : 'Sell'} {marketData.name}
        </ModalHeader>
        <ModalBody>
          <p>Current Market Price: {priceNumber}</p>
          <Input
            label={`${marketData.longToken.symbol} Amount`}
            placeholder='Enter long token amount'
            value={longTokenAmountInput}
            onChange={onLongTokenAmountChange}
            endContent={
              <button
                className={clsx(
                  'absolute right-3 top-2 m-0 whitespace-nowrap p-0 text-xs',
                  parseFloat(longTokenAmountInput.replace(/,/g, '')) > maxLongToken &&
                    'text-danger-500',
                )}
                onClick={handleLongTokenSetToMax}
                type='button'
              >
                Max: {maxLongTokenString}
              </button>
            }
          />
          <Input
            label={`${marketData.shortToken.symbol} Amount`}
            placeholder='Enter short token amount'
            value={shortTokenAmountInput}
            onChange={onShortTokenAmountChange}
            endContent={
              <button
                className={clsx(
                  'absolute right-3 top-2 m-0 whitespace-nowrap p-0 text-xs',
                  parseFloat(shortTokenAmountInput.replace(/,/g, '')) > maxShortToken &&
                    'text-danger-500',
                )}
                onClick={handleShortTokenSetToMax}
                type='button'
              >
                Max: {maxShortTokenString}
              </button>
            }
          />
          <div className='flex flex-col gap-2'>
            <div className='flex justify-between'>
              <span className='text-sm'>Received:</span>
              <span>~ {marketTokenAmountText} WM</span>
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
            {isSubmitting ? 'Submitting...' : 'Buy'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})
