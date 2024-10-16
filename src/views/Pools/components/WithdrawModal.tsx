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
import calculatePriceDecimals from '@/lib/trade/utils/price/calculatePriceDecimals'
import errorMessageOrUndefined from '@/utils/errors/errorMessageOrUndefined'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'

import {calculateMarketPrice} from './PoolsTable'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  marketTokenAddress: string
}

export default function WithdrawModal({isOpen, onClose, marketTokenAddress}: WithdrawModalProps) {
  const [wmAmount, setWmAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const queryClient = useQueryClient()
  const [chainId] = useChainId()
  const [wallet] = useWalletAccount()
  const tokenPrices = useTokenPrices(data => data)
  const marketsData = useMarketsData()
  const marketTokensData = useMarketTokensData()
  const marketTokenBalances = useMarketTokenBalances()

  const marketData = useMemo(
    () => marketsData?.get(marketTokenAddress),
    [marketsData, marketTokenAddress],
  )
  const marketTokenData = useMemo(
    () => marketTokensData?.get(marketTokenAddress),
    [marketTokensData, marketTokenAddress],
  )

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
  const userBalanceDisplayDecimals = calculatePriceDecimals(price, marketTokenData?.decimals ?? 18)
  const userBalanceString = shrinkDecimals(
    marketTokenBalances?.get(marketTokenAddress) ?? 0n,
    marketTokenData?.decimals ?? 18,
    userBalanceDisplayDecimals,
    false,
    true,
  )

  const priceDecimals = calculatePriceDecimals(price)

  const priceNumber = shrinkDecimals(price, USD_DECIMALS, priceDecimals, true, true)

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

    const longTokenDisplayDecimals = calculatePriceDecimals(
      latestLongTokenPrice.current,
      marketData.longToken.decimals,
    )
    const shortTokenDisplayDecimals = calculatePriceDecimals(
      latestShortTokenPrice.current,
      marketData.shortToken.decimals,
    )

    return {
      longTokenAmount: shrinkDecimals(
        longTokenAmount,
        marketData.longToken.decimals,
        longTokenDisplayDecimals,
        false,
        true,
      ),
      shortTokenAmount: shrinkDecimals(
        shortTokenAmount,
        marketData.shortToken.decimals,
        shortTokenDisplayDecimals,
        false,
        true,
      ),
    }
  }, [marketData, marketTokenData, wmAmount])

  const handleWmAmountChange = (value: string) => {
    setWmAmount(() => {
      const newValue = value.replace(/[^0-9.]/g, '')
      const numValue = parseFloat(newValue)
      if (isNaN(numValue)) return ''
      return numValue > userBalance ? userBalanceString : newValue
    })
  }

  const handleWmAmountSetToMax = () => {
    setWmAmount(userBalanceString.replace(/,/g, ''))
  }

  const isInputValid = useMemo(() => {
    const amount = parseFloat(wmAmount)
    return !isNaN(amount) && amount > 0 && amount <= userBalance
  }, [wmAmount, userBalance])

  const handleSubmit = (_e: PressEvent) => {
    if (!marketData || !wallet || !marketTokenData || !isInputValid) return

    setIsSubmitting(true)
    toast.promise(
      async () => {
        try {
          const wmAmountBigInt = expandDecimals(parseFloat(wmAmount), marketTokenData.decimals)

          const withdrawalParams = {
            receiver: wallet.address,
            market: marketTokenAddress,
            marketTokenAmount: wmAmountBigInt,
            minLongToken: expandDecimals(
              parseFloat(longTokenAmount) * 0.99,
              marketData.longToken.decimals,
            ), // 1% slippage
            minShortToken: expandDecimals(
              parseFloat(shortTokenAmount) * 0.99,
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
            <div>{errorMessageOrUndefined(error) ?? 'Withdrawal failed.'}</div>
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
        <ModalHeader className='flex flex-col gap-1'>Sell {marketData.name}</ModalHeader>
        <ModalBody>
          <p>Current Market Price: ${priceNumber}</p>
          <Input
            label={`WM Amount`}
            placeholder='Enter WM token amount'
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
