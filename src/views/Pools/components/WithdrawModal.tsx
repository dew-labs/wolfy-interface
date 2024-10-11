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

  const userBalance = useMemo(() => {
    if (!marketTokenBalances || !marketTokenData) return '0'
    const balance = marketTokenBalances.get(marketTokenAddress) ?? 0n
    return shrinkDecimals(balance, marketTokenData.decimals, 6)
  }, [marketTokenBalances, marketTokenData, marketTokenAddress])

  const price =
    marketData && marketTokenData
      ? calculateMarketPrice(marketData, marketTokenData, tokenPrices) ||
        expandDecimals(1, USD_DECIMALS)
      : expandDecimals(1, USD_DECIMALS)

  const priceDecimals = calculatePriceDecimals(price)

  const priceNumber = shrinkDecimals(price, USD_DECIMALS, priceDecimals, true, true)

  const {longTokenAmount, shortTokenAmount} = useMemo(() => {
    if (!marketData || !marketTokenData || !wmAmount) {
      return {longTokenAmount: '', shortTokenAmount: ''}
    }

    const wmAmountBigInt = BigInt(Math.floor(parseFloat(wmAmount) * 10 ** marketTokenData.decimals))
    const totalSupply = marketTokenData.totalSupply

    if (totalSupply === 0n) {
      return {longTokenAmount: '0', shortTokenAmount: '0'}
    }

    const longTokenAmount = (wmAmountBigInt * marketData.longPoolAmount) / totalSupply
    const shortTokenAmount = (wmAmountBigInt * marketData.shortPoolAmount) / totalSupply

    return {
      longTokenAmount: shrinkDecimals(longTokenAmount, marketData.longToken.decimals, 6),
      shortTokenAmount: shrinkDecimals(shortTokenAmount, marketData.shortToken.decimals, 6),
    }
  }, [marketData, marketTokenData, wmAmount])

  const handleWmAmountChange = (value: string) => {
    const numValue = parseFloat(value)
    const maxValue = parseFloat(userBalance)
    if (!isNaN(numValue) && numValue <= maxValue) {
      setWmAmount(value)
    } else if (numValue > maxValue) {
      setWmAmount(userBalance)
    }
  }

  const isInputValid = useMemo(() => {
    const amount = parseFloat(wmAmount)
    return !isNaN(amount) && amount > 0 && amount <= parseFloat(userBalance)
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
            label={`WM Amount (Max: ${userBalance})`}
            placeholder='Enter WM token amount'
            value={wmAmount}
            onChange={e => {
              handleWmAmountChange(e.target.value)
            }}
          />
          <p>
            You will receive: ~ {longTokenAmount} {marketData.longToken.symbol} and{' '}
            {shortTokenAmount} {marketData.shortToken.symbol}
          </p>
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
            {isSubmitting ? 'Submitting...' : 'Sell'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
