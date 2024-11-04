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
import React, {type ChangeEventHandler, useCallback, useMemo, useState} from 'react'
import type {PressEvent} from 'react-aria-components'
import {useLatest} from 'react-use'
import {toast} from 'sonner'

import useChainId from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import getScanUrl, {ScanType} from '@/lib/starknet/utils/getScanUrl'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import useMarketTokenBalances from '@/lib/trade/hooks/useMarketTokenBalances'
import useMarketTokensData from '@/lib/trade/hooks/useMarketTokensData'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import sendWithdrawal from '@/lib/trade/services/market/sendWithdrawal'
import calculatePriceFractionDigits from '@/lib/trade/utils/price/calculatePriceFractionDigits'
import calculateTokenFractionDigits from '@/lib/trade/utils/price/calculateTokenFractionDigits'
import errorMessageOrUndefined from '@/utils/errors/errorMessageOrUndefined'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'

import {calculateMarketPrice} from './PoolsTable'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  marketTokenAddress: string
}

export default function WithdrawModal({isOpen, onClose, marketTokenAddress}: WithdrawModalProps) {
  const latestMarketTokenAddress = useLatest(marketTokenAddress)

  const [wmAmount, setWmAmount] = useState('')
  const latestWmAmount = useLatest(wmAmount)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const queryClient = useQueryClient()
  const [chainId] = useChainId()
  const latestChainId = useLatest(chainId)
  const [wallet] = useWalletAccount()
  const latestWallet = useLatest(wallet)
  const tokenPrices = useTokenPrices(data => data)
  const marketsData = useMarketsData()
  const marketTokensData = useMarketTokensData()
  const marketTokenBalances = useMarketTokenBalances()

  const marketData = useMemo(
    () => marketsData?.get(marketTokenAddress),
    [marketsData, marketTokenAddress],
  )
  const latestMarketData = useLatest(marketData)
  const marketTokenData = useMemo(
    () => marketTokensData?.get(marketTokenAddress),
    [marketTokensData, marketTokenAddress],
  )
  const latestMarketTokenData = useLatest(marketTokenData)
  const price =
    marketData && marketTokenData
      ? calculateMarketPrice(marketData, marketTokenData, tokenPrices) ||
        expandDecimals(1, USD_DECIMALS)
      : expandDecimals(1, USD_DECIMALS)

  const userBalance = Number(
    shrinkDecimals(
      marketTokenBalances?.get(marketTokenAddress) ?? 0n,
      marketTokenData?.decimals ?? 18,
    ),
  )
  const latestUserBalance = useLatest(userBalance)
  const userBalanceFractionDigits = calculateTokenFractionDigits(price)
  const userBalanceNumber = Number(
    shrinkDecimals(
      marketTokenBalances?.get(marketTokenAddress) ?? 0n,
      marketTokenData?.decimals ?? 18,
    ),
  )
  const latestUserBalanceNumber = useLatest(userBalanceNumber)
  const userBalanceString = formatNumber(
    shrinkDecimals(
      marketTokenBalances?.get(marketTokenAddress) ?? 0n,
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

  const {longTokenPrice, shortTokenPrice} = useMemo(() => {
    if (!tokenPrices || !marketData) return {longTokenPrice: 0n, shortTokenPrice: 0n}
    return {
      longTokenPrice: tokenPrices.get(marketData.longTokenAddress)?.max ?? 0n,
      shortTokenPrice: tokenPrices.get(marketData.shortTokenAddress)?.max ?? 0n,
    }
  }, [tokenPrices, marketData])
  const latestLongTokenPrice = useLatest(longTokenPrice)
  const latestShortTokenPrice = useLatest(shortTokenPrice)

  const {longTokenAmount, shortTokenAmount} = useMemo(() => {
    if (!marketData || !marketTokenData || !wmAmount) {
      return {longTokenAmount: '0', shortTokenAmount: '0'}
    }

    const wmAmountBigInt = BigInt(Math.floor(parseFloat(wmAmount) * 10 ** marketTokenData.decimals))
    const totalSupply = marketTokenData.totalSupply

    if (totalSupply === 0n) {
      return {longTokenAmount: '0', shortTokenAmount: '0'}
    }

    const longTokenAmount = (wmAmountBigInt * marketData.longPoolAmount) / totalSupply
    const shortTokenAmount = (wmAmountBigInt * marketData.shortPoolAmount) / totalSupply

    const longTokenFractionDigits = calculateTokenFractionDigits(latestLongTokenPrice.current)
    const shortTokenFractionDigits = calculateTokenFractionDigits(latestShortTokenPrice.current)

    return {
      longTokenAmount: formatNumber(
        shrinkDecimals(longTokenAmount, marketData.longToken.decimals),
        Format.PLAIN,
        {
          exactFractionDigits: true,
          fractionDigits: longTokenFractionDigits,
        },
      ),
      shortTokenAmount: formatNumber(
        shrinkDecimals(shortTokenAmount, marketData.shortToken.decimals),
        Format.PLAIN,
        {
          exactFractionDigits: true,
          fractionDigits: shortTokenFractionDigits,
        },
      ),
    }
  }, [marketData, marketTokenData, wmAmount])

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

      if (!marketData || !wallet || !marketTokenData || !isInputValid) return

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
              minLongToken: expandDecimals(
                parseFloat(latestLongTokenAmount.current) * 0.99,
                marketData.longToken.decimals,
              ), // 1% slippage
              minShortToken: expandDecimals(
                parseFloat(latestShortTokenAmount.current) * 0.99,
                marketData.shortToken.decimals,
              ), // 1% slippage
            }

            const result = await sendWithdrawal(wallet, withdrawalParams)
            await queryClient.invalidateQueries({queryKey: ['marketTokenBalances']})
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
          error: error => (
            <>
              <div>{errorMessageOrUndefined(error) ?? 'Withdrawal failed.'}</div>
            </>
          ),
        },
      )
    },
    [onClose, queryClient],
  )

  // Add new state for fees and price impact
  const [feesAndPriceImpact, _setFeesAndPriceImpact] = useState('0')
  const [networkFee, _setNetworkFee] = useState('0')

  const onWmAmountChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      handleWmAmountChange(e.target.value)
    },
    [handleWmAmountChange],
  )

  if (!marketData || !marketTokenData) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>Sell {marketData.name}</ModalHeader>
        <ModalBody>
          <p>Current Market Price: {priceNumber}</p>
          <Input
            label={`WM Amount`}
            placeholder='Enter WM token amount'
            value={wmAmount}
            onChange={onWmAmountChange}
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
              <span className='text-sm'>You will receive:</span>
              <span className='text-right'>
                ~ {longTokenAmount} {marketData.longToken.symbol}
                <br />~ {shortTokenAmount} {marketData.shortToken.symbol}
              </span>
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
            {isSubmitting ? 'Submitting...' : 'Sell'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
