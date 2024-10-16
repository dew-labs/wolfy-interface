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
import React, {useMemo, useState} from 'react'
import type {PressEvent} from 'react-aria-components'
import {toast} from 'sonner'

import useChainId from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import getScanUrl, {ScanType} from '@/lib/starknet/utils/getScanUrl'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import useMarketTokensData from '@/lib/trade/hooks/useMarketTokensData'
import useTokenBalances from '@/lib/trade/hooks/useTokenBalances'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import sendDeposit from '@/lib/trade/services/market/sendDeposit'
import calculatePriceDecimals from '@/lib/trade/utils/price/calculatePriceDecimals'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import errorMessageOrUndefined from '@/utils/errors/errorMessageOrUndefined'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'

import {calculateMarketPrice} from './PoolsTable'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  marketTokenAddress: string
  orderType: 'buy' | 'sell'
}

export default function DepositModal({
  isOpen,
  onClose,
  marketTokenAddress,
  orderType,
}: DepositModalProps) {
  const [chainId] = useChainId()

  const [longTokenAmount, setLongTokenAmount] = useState('')
  const [shortTokenAmount, setShortTokenAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const queryClient = useQueryClient()
  const [wallet] = useWalletAccount()
  const tokenPrices = useTokenPrices(data => data)
  const marketsData = useMarketsData()
  const marketTokensData = useMarketTokensData()
  const tokenBalances = useTokenBalances()

  const marketData = useMemo(
    () => marketsData?.get(marketTokenAddress),
    [marketsData, marketTokenAddress],
  )
  const marketTokenData = useMemo(
    () => marketTokensData?.get(marketTokenAddress),
    [marketTokensData, marketTokenAddress],
  )

  const {longTokenPrice, shortTokenPrice} = useMemo(() => {
    if (!tokenPrices || !marketData) return {longTokenPrice: 0n, shortTokenPrice: 0n}
    return {
      longTokenPrice: tokenPrices.get(marketData.longTokenAddress)?.max ?? 0n,
      shortTokenPrice: tokenPrices.get(marketData.shortTokenAddress)?.max ?? 0n,
    }
  }, [tokenPrices, marketData])

  const price =
    marketData && marketTokenData
      ? calculateMarketPrice(marketData, marketTokenData, tokenPrices) ||
        expandDecimals(1, USD_DECIMALS)
      : expandDecimals(1, USD_DECIMALS)

  const priceDecimals = calculatePriceDecimals(price)

  const priceNumber = formatNumber(shrinkDecimals(price, USD_DECIMALS), Format.USD, {
    exactFractionDigits: true,
    fractionDigits: priceDecimals,
  })

  const marketTokenAmount = useMemo(() => {
    if (!marketData || !marketTokenData)
      return {
        number: 0,
        text: '0',
      }

    const longAmount = parseFloat(longTokenAmount) || 0
    const shortAmount = parseFloat(shortTokenAmount) || 0

    const longValueUsd = convertTokenAmountToUsd(
      BigInt(Math.floor(longAmount * 10 ** marketData.longToken.decimals)),
      marketData.longToken.decimals,
      longTokenPrice,
    )

    const shortValueUsd = convertTokenAmountToUsd(
      BigInt(Math.floor(shortAmount * 10 ** marketData.shortToken.decimals)),
      marketData.shortToken.decimals,
      shortTokenPrice,
    )

    const totalValueUsd = longValueUsd + shortValueUsd

    // This is a simplified calculation and should be replaced with the actual formula
    // based on your protocol's specifics
    const calculatedAmount = Number(totalValueUsd) / Number(price)

    const amountDecimals = calculatePriceDecimals(
      BigInt(Math.floor(calculatedAmount / 10 ** USD_DECIMALS)),
    )
    return {
      number: calculatedAmount,
      text: formatNumber(calculatedAmount, Format.READABLE, {
        exactFractionDigits: true,
        fractionDigits: amountDecimals,
      }),
    }
  }, [
    marketData,
    marketTokenData,
    longTokenAmount,
    shortTokenAmount,
    longTokenPrice,
    shortTokenPrice,
    price,
  ])

  const [longTokenBalance, shortTokenBalance] = useMemo(() => {
    if (!marketData || !tokenBalances) return [0n, 0n]
    return [
      tokenBalances.get(marketData.longTokenAddress) ?? 0n,
      tokenBalances.get(marketData.shortTokenAddress) ?? 0n,
    ]
  }, [marketData, tokenBalances])

  const maxLongToken = Number(
    shrinkDecimals(longTokenBalance, marketData?.longToken.decimals ?? 18),
  )

  const longTokenDisplayDecimals = calculatePriceDecimals(
    longTokenBalance,
    marketData?.longToken.decimals ?? 18,
  )

  const maxLongTokenString = formatNumber(
    shrinkDecimals(longTokenBalance, marketData?.longToken.decimals ?? 18),
    Format.READABLE,
    {
      exactFractionDigits: true,
      fractionDigits: longTokenDisplayDecimals,
    },
  )

  const handleLongTokenAmountChange = (value: string) => {
    setLongTokenAmount(() => {
      const newValue = value.replace(/[^0-9.]/g, '')
      const numValue = parseFloat(newValue)
      if (isNaN(numValue)) return ''
      return numValue > maxLongToken ? maxLongToken.toString() : newValue
    })
  }

  const maxShortToken = Number(
    shrinkDecimals(shortTokenBalance, marketData?.shortToken.decimals ?? 18),
  )

  const shortTokenDisplayDecimals = calculatePriceDecimals(
    shortTokenBalance,
    marketData?.shortToken.decimals ?? 18,
  )

  const maxShortTokenString = formatNumber(
    shrinkDecimals(shortTokenBalance, marketData?.shortToken.decimals ?? 18),
    Format.READABLE,
    {
      exactFractionDigits: true,
      fractionDigits: shortTokenDisplayDecimals,
    },
  )

  const handleShortTokenAmountChange = (value: string) => {
    setShortTokenAmount(() => {
      const newValue = value.replace(/[^0-9.]/g, '')
      const numValue = parseFloat(newValue)
      if (isNaN(numValue)) return ''
      return numValue > maxShortToken ? maxShortToken.toString() : newValue
    })
  }

  const handleLongTokenSetToMax = () => {
    setLongTokenAmount(maxLongToken.toString())
  }

  const handleShortTokenSetToMax = () => {
    setShortTokenAmount(maxShortToken.toString())
  }

  const isInputValid = useMemo(() => {
    const longAmount = parseFloat(longTokenAmount) || 0
    const shortAmount = parseFloat(shortTokenAmount) || 0
    return (
      (longAmount > 0 || shortAmount > 0) &&
      longAmount <= maxLongToken &&
      shortAmount <= maxShortToken
    )
  }, [longTokenAmount, shortTokenAmount, maxLongToken, maxShortToken])

  const handleSubmit = (_e: PressEvent) => {
    if (!marketData || !wallet || !marketTokenData || !isInputValid) return

    setIsSubmitting(true)
    toast.promise(
      async () => {
        try {
          const longAmount = expandDecimals(
            parseFloat(longTokenAmount) || 0,
            marketData.longToken.decimals,
          )
          const shortAmount = expandDecimals(
            parseFloat(shortTokenAmount) || 0,
            marketData.shortToken.decimals,
          )

          const depositParams = {
            receiver: wallet.address,
            market: marketTokenAddress,
            initialLongToken: marketData.longTokenAddress,
            initialLongTokenAmount: longAmount,
            initialShortToken: marketData.shortTokenAddress,
            initialShortTokenAmount: shortAmount,
            minMarketToken: expandDecimals(
              marketTokenAmount.number * 0.99,
              marketTokenData.decimals,
            ), // 1% slippage
          }

          const result = await sendDeposit(wallet, depositParams)
          await queryClient.invalidateQueries({queryKey: ['marketTokenBalances']})
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
              href={getScanUrl(chainId, ScanType.Transaction, data.tx)}
              target='_blank'
              rel='noreferrer'
            >
              View transaction
            </a>
          </>
        ),
        error: error => (
          <>
            <div>{errorMessageOrUndefined(error) ?? 'Deposit failed.'}</div>
          </>
        ),
      },
    )
  }

  // Add new state for fees and price impact
  const [feesAndPriceImpact, _setFeesAndPriceImpact] = useState('0')
  const [networkFee, _setNetworkFee] = useState('0')

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
            value={longTokenAmount}
            onChange={e => {
              handleLongTokenAmountChange(e.target.value)
            }}
            endContent={
              <button
                className={clsx(
                  'absolute right-3 top-2 m-0 whitespace-nowrap p-0 text-xs',
                  parseFloat(longTokenAmount.replace(/,/g, '')) > maxLongToken && 'text-danger-500',
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
            value={shortTokenAmount}
            onChange={e => {
              handleShortTokenAmountChange(e.target.value)
            }}
            endContent={
              <button
                className={clsx(
                  'absolute right-3 top-2 m-0 whitespace-nowrap p-0 text-xs',
                  parseFloat(shortTokenAmount.replace(/,/g, '')) > maxShortToken &&
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
              <span>~ {marketTokenAmount.text} WM</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Fees and price impact:</span>
              <span>${feesAndPriceImpact}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Network Fee:</span>
              <span>${networkFee}</span>
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
}
