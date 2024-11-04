import {Input, Select, SelectItem, type SharedSelection} from '@nextui-org/react'
import clsx from 'clsx'
import {memo, type MemoizedCallbackOrDispatch, useCallback, useMemo, useState} from 'react'

import {getTokensMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import useTokenBalances from '@/lib/trade/hooks/useTokenBalances'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import {TradeMode} from '@/lib/trade/states/useTradeMode'
import {TradeType} from '@/lib/trade/states/useTradeType'
import {cleanNumberString} from '@/utils/numberInputs'
import abs from '@/utils/numbers/bigint/abs'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'

const INPUT_2_LABEL: Record<TradeType, string> = {
  [TradeType.Long]: 'To long',
  [TradeType.Short]: 'To short',
  [TradeType.Swap]: 'To receive',
}

interface Props {
  tradeType: TradeType
  tradeMode: Exclude<TradeMode, TradeMode.Trigger>
  marketAddress: string | undefined
  tokenAmount: bigint
  setTokenAmount: MemoizedCallbackOrDispatch<(amount: bigint) => void>
  tokenAmountUsd: bigint
  payTokenAmountUsd: bigint
  tokenPrice: bigint | undefined
  setTokenPrice: MemoizedCallbackOrDispatch<(price: bigint | undefined) => void>
  availablePayTokenAddresses: string[]
  payTokenAddress: string | undefined
  setPayTokenAddress: MemoizedCallbackOrDispatch<(tokenAddress: string | undefined) => void>
  payTokenAmount: bigint
  setPayTokenAmount: MemoizedCallbackOrDispatch<(amount: bigint) => void>
}

const ACCEPTABLE_DIFF = 2n

const PRICE_INPUT_CLASS_NAMES = {
  input: 'appearance-none',
}

const TOKEN_AMOUNT_INPUT_CLASS_NAMES = {
  inputWrapper: 'h-20 relative',
  label: 'relative top-4 overflow-visible',
  input: 'appearance-none text-3xl',
}

const SELECT_CLASS_NAMES = {
  base: 'w-min',
  label: 'visually-hidden',
  innerWrapper: 'group-data-[has-label=true]:pt-0 w-full',
  trigger: 'h-10 min-h-10 min-w-24 w-24 max-w-24',
  value: 'text-center',
}
export default memo(function TokenInputs({
  tradeType,
  tradeMode,
  marketAddress,
  availablePayTokenAddresses,
  payTokenAmount,
  setPayTokenAmount,
  payTokenAddress,
  setPayTokenAddress,
  tokenPrice,
  setTokenPrice,
  tokenAmount,
  payTokenAmountUsd,
  tokenAmountUsd,
  setTokenAmount,
}: Props) {
  const [chainId] = useChainId()
  const tokensMetadata = getTokensMetadata(chainId)
  const tokenBalances = useTokenBalances()
  const marketsData = useMarketsData()

  // -------------------------------------------------------------------------------------------------------------------

  const payTokenData = payTokenAddress ? tokensMetadata.get(payTokenAddress) : undefined
  const payTokenDecimals = payTokenData?.decimals ?? 0
  const payTokenBalance = tokenBalances?.get(payTokenAddress ?? '') ?? 0n
  const payTokenBalanceShrinked = formatNumber(
    shrinkDecimals(payTokenBalance, payTokenDecimals),
    Format.READABLE,
    {
      exactFractionDigits: true,
      fractionDigits: 2,
    },
  )

  const [payTokenAmountInput, setPayTokenAmountInput] = useState(() =>
    shrinkDecimals(payTokenAmount, payTokenDecimals),
  )
  const [payTokenAmountInputIsFocused, setPayTokenAmountInputIsFocused] = useState(false)

  const payTokenAmountUsdShrinked = payTokenAmountUsd
    ? formatNumber(shrinkDecimals(payTokenAmountUsd, USD_DECIMALS), Format.USD)
    : '$0'

  const handlePayTokenAmountInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const valueInput = cleanNumberString(value)
      try {
        const valueBigInt = expandDecimals(valueInput, payTokenDecimals)

        setPayTokenAmountInput(valueInput)
        setPayTokenAmount(valueBigInt)
      } catch {
        console.error('Invalid token amount input')
      }
    },
    [setPayTokenAmount, payTokenDecimals],
  )

  const handlePayTokenAmountSetToMax = useCallback(() => {
    setPayTokenAmount(payTokenBalance)
  }, [payTokenBalance, setPayTokenAmount])

  ;(function syncPayTokenAmountInputWithPayTokenAmount() {
    if (payTokenAmountInputIsFocused) return
    if (!payTokenDecimals) return
    const inputExpanded = expandDecimals(payTokenAmountInput, payTokenDecimals)

    const diff = abs(inputExpanded - payTokenAmount)
    if (diff > ACCEPTABLE_DIFF) {
      const newPayTokenAmountInput = shrinkDecimals(payTokenAmount, payTokenDecimals)
      setPayTokenAmountInput(newPayTokenAmountInput)
    }
  })()

  // -------------------------------------------------------------------------------------------------------------------
  const marketData = marketAddress ? marketsData?.get(marketAddress) : undefined

  const tokenData = marketData?.longToken
  const shortTokenData = marketData?.shortToken

  const tokenDecimals = tokenData?.decimals ?? 0
  const [tokenAmountInput, setTokenAmountInput] = useState(() =>
    shrinkDecimals(tokenAmount, tokenDecimals),
  )
  const [tokenAmountInputIsFocussed, setTokenAmountInputIsFocused] = useState(false)
  const tokenAmountUsdShrinked = tokenAmountUsd
    ? formatNumber(shrinkDecimals(tokenAmountUsd, USD_DECIMALS), Format.USD)
    : '0'

  const handleTokenAmountInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const valueInput = cleanNumberString(value)
      const valueBigint = expandDecimals(valueInput, tokenDecimals)

      setTokenAmountInput(valueInput)
      setTokenAmount(valueBigint)
    },
    [tokenDecimals, setTokenAmount],
  )

  ;(function syncTokenAmountInputWithTokenAmount() {
    if (tokenAmountInputIsFocussed) return
    if (!tokenDecimals) return
    const inputExpanded = expandDecimals(tokenAmountInput, tokenDecimals)
    const diff = abs(inputExpanded - tokenAmount)
    if (diff > ACCEPTABLE_DIFF) {
      setTokenAmountInput(shrinkDecimals(tokenAmount, tokenDecimals))
    }
  })()

  // -------------------------------------------------------------------------------------------------------------------

  const [tokenPriceInput, setTokenPriceInput] = useState(() =>
    tokenPrice ? shrinkDecimals(tokenPrice, USD_DECIMALS) : '',
  )

  const handleTokenPriceInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const valueInput = cleanNumberString(value)
      const valueBigint = expandDecimals(valueInput, USD_DECIMALS)

      setTokenPriceInput(valueInput)
      setTokenPrice(valueBigint)
    },
    [setTokenPrice, setTokenPriceInput],
  )

  // -------------------------------------------------------------------------------------------------------------------

  const isValidPayTokenAmount =
    !!payTokenAddress && payTokenAmount <= (tokenBalances?.get(payTokenAddress) ?? 0n)

  const onSelectionChange = useCallback(
    (selection: SharedSelection) => {
      if (!selection.currentKey) return
      setPayTokenAddress(selection.currentKey)
    },
    [setPayTokenAddress],
  )

  const payTokenSelectedKeys = useMemo(() => {
    return payTokenAddress ? [payTokenAddress] : []
  }, [payTokenAddress])

  return (
    <>
      {tradeMode === TradeMode.Limit && (
        <Input
          className='mt-4'
          size='lg'
          type='text'
          label={`At price:`}
          placeholder='0.0'
          classNames={PRICE_INPUT_CLASS_NAMES}
          value={tokenPriceInput}
          onChange={handleTokenPriceInputChange}
          // startContent={
          //   <div className='pointer-events-none flex items-center'>
          //     <span className='text-small text-default-400'>$</span>
          //   </div>
          // }
          endContent={
            <div className='pointer-events-none flex h-full items-center justify-center'>
              <span className='text-lg text-default-400'>
                {shortTokenData?.symbol}&nbsp;=&nbsp;1&nbsp;{tokenData?.symbol}
              </span>
            </div>
          }
        />
      )}
      <Input
        className='mt-4'
        size='lg'
        type='text'
        label={`Pay: ${payTokenAmountUsdShrinked}`}
        value={payTokenAmountInput}
        onChange={handlePayTokenAmountInputChange}
        onFocusChange={setPayTokenAmountInputIsFocused}
        placeholder='0.0'
        classNames={TOKEN_AMOUNT_INPUT_CLASS_NAMES}
        endContent={
          <>
            <button
              className={clsx(
                'absolute right-3 top-2 m-0 whitespace-nowrap p-0 text-xs',
                payTokenData && !isValidPayTokenAmount && 'text-danger-500',
              )}
              onClick={handlePayTokenAmountSetToMax}
            >
              Balance: ~{payTokenBalanceShrinked}
            </button>
            <Select
              aria-label='Select pay asset'
              className='max-w-xs'
              variant='bordered'
              selectedKeys={payTokenSelectedKeys}
              onSelectionChange={onSelectionChange}
              selectorIcon={<></>}
              classNames={SELECT_CLASS_NAMES}
            >
              {availablePayTokenAddresses.map(address => (
                <SelectItem key={address}>{tokensMetadata.get(address)?.symbol}</SelectItem>
              ))}
            </Select>
          </>
        }
      />
      <Input
        className='mt-4'
        size='lg'
        type='text'
        label={`${INPUT_2_LABEL[tradeType]}: ${tokenAmountUsdShrinked}`}
        placeholder='0.0'
        classNames={PRICE_INPUT_CLASS_NAMES}
        value={tokenAmountInput}
        onChange={handleTokenAmountInputChange}
        onFocusChange={setTokenAmountInputIsFocused}
        // startContent={
        //   <div className='pointer-events-none flex items-center'>
        //     <span className='text-small text-default-400'>$</span>
        //   </div>
        // }
        endContent={
          <div className='pointer-events-none flex h-full items-center justify-center'>
            <span className='text-lg text-default-400'>{tokenData?.symbol}</span>
          </div>
        }
      />
    </>
  )
})
