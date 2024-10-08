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
import React, {useMemo, useState} from 'react'
import type {PressEvent} from 'react-aria-components'
import {toast} from 'sonner'

import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
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

  const priceNumber = shrinkDecimals(price, USD_DECIMALS, priceDecimals, true, true)

  const marketTokenAmount = useMemo(() => {
    if (!marketData || !marketTokenData) return ''

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
    return shrinkDecimals(calculatedAmount, 0, amountDecimals, true, true)
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

  const handleLongTokenAmountChange = (value: string) => {
    setLongTokenAmount(value)
  }

  const maxShortToken = Number(
    shrinkDecimals(shortTokenBalance, marketData?.shortToken.decimals ?? 18),
  )

  console.log('maxShortToken', maxShortToken, 'shortAmount', parseFloat(shortTokenAmount))

  const handleShortTokenAmountChange = (value: string) => {
    setShortTokenAmount(value)
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
              parseFloat(marketTokenAmount) * 0.99,
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
            <a href={`https://sepolia.starkscan.co/tx/${data.tx}`} target='_blank' rel='noreferrer'>
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
          <p>Current Market Price: ${priceNumber}</p>
          <Input
            label={`${marketData.longToken.symbol} Amount (Max: ${Number(shrinkDecimals(longTokenBalance, marketData.longToken.decimals)).toFixed(4)})`}
            placeholder='Enter long token amount'
            value={longTokenAmount}
            type='number'
            min={0}
            max={maxLongToken}
            onChange={e => {
              handleLongTokenAmountChange(e.target.value)
            }}
          />
          <Input
            label={`${marketData.shortToken.symbol} Amount (Max: ${Number(shrinkDecimals(shortTokenBalance, marketData.shortToken.decimals)).toFixed(4)})`}
            placeholder='Enter short token amount'
            value={shortTokenAmount}
            type='number'
            min={0}
            max={maxShortToken}
            onChange={e => {
              handleShortTokenAmountChange(e.target.value)
            }}
          />
          <p>Received: ~ {marketTokenAmount} WM</p>
          {/* Add new information */}
          <p>Fees and price impact: ${feesAndPriceImpact}</p>
          <p>Network Fee: ${networkFee}</p>
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
