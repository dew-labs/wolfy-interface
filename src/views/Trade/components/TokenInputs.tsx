import {Input, Select, SelectItem} from '@nextui-org/react'
import {type MemoizedCallbackOrDispatch, useCallback, useState} from 'react'

import useTokensData from '@/lib/trade/hooks/useTokensData'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import {TradeMode} from '@/lib/trade/states/useTradeMode'
import {TradeType} from '@/lib/trade/states/useTradeType'
import abs from '@/utils/numbers/bigint/abs'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'

const INPUT_2_LABEL: Record<TradeType, string> = {
  [TradeType.Long]: 'To long',
  [TradeType.Short]: 'To short',
  [TradeType.Swap]: 'To receive',
}

interface Props {
  tradeType: TradeType
  tradeMode: Exclude<TradeMode, TradeMode.Trigger>
  tokenAddress: string | undefined
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

export default function TokenInputs({
  tradeType,
  tradeMode,
  tokenAddress,
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
  const tokensData = useTokensData()

  // -------------------------------------------------------------------------------------------------------------------

  const payTokenData = tokensData && payTokenAddress ? tokensData.get(payTokenAddress) : undefined
  const payTokenDecimals = payTokenData?.decimals ?? 0
  const payTokenBalance = payTokenData?.balance ?? 0n
  const payTokenBalanceShrinked = shrinkDecimals(payTokenBalance, payTokenDecimals, 2, true)

  const [payTokenAmountInput, setPayTokenAmountInput] = useState(() =>
    shrinkDecimals(payTokenAmount, payTokenDecimals),
  )

  const payTokenAmountUsdShrinked = payTokenAmountUsd
    ? shrinkDecimals(payTokenAmountUsd, payTokenDecimals, 2, true)
    : '0'

  const handlePayTokenAmountInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const valueInput = value.replace(/[^0-9.]/g, '')
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

  ;(function syncPayTokenAmountInputWithPayTokenAmount() {
    if (!payTokenDecimals) return
    const inputExpanded = expandDecimals(payTokenAmountInput, payTokenDecimals)

    const diff = abs(inputExpanded - payTokenAmount)
    if (diff > ACCEPTABLE_DIFF) {
      const newPayTokenAmountInput = shrinkDecimals(payTokenAmount, payTokenDecimals)
      setPayTokenAmountInput(newPayTokenAmountInput)
    }
  })()

  // -------------------------------------------------------------------------------------------------------------------

  const tokenData = tokensData && tokenAddress ? tokensData.get(tokenAddress) : undefined

  const tokenDecimals = tokenData?.decimals ?? 0
  const [tokenAmountInput, setTokenAmountInput] = useState(() =>
    shrinkDecimals(tokenAmount, tokenDecimals),
  )
  const tokenAmountUsdShrinked = tokenAmountUsd
    ? shrinkDecimals(tokenAmountUsd, tokenDecimals, 2, true)
    : '0'

  const handleTokenAmountInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const valueInput = value.replace(/[^0-9.]/g, '')
      const valueBigint = expandDecimals(valueInput, tokenDecimals)

      setTokenAmountInput(valueInput)
      setTokenAmount(valueBigint)
    },
    [tokenDecimals, setTokenAmount],
  )

  ;(function syncTokenAmountInputWithTokenAmount() {
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
      const valueInput = value.replace(/[^0-9.]/g, '')
      const valueBigint = expandDecimals(valueInput, USD_DECIMALS)

      setTokenPriceInput(valueInput)
      setTokenPrice(valueBigint)
    },
    [setTokenPrice, setTokenPriceInput],
  )

  // -------------------------------------------------------------------------------------------------------------------

  return (
    <>
      {tradeMode === TradeMode.Limit && (
        <Input
          className='mt-4'
          size='lg'
          type='text'
          label={`At price:`}
          placeholder='0.0'
          classNames={{
            input: 'appearance-none',
          }}
          value={tokenPriceInput}
          onChange={handleTokenPriceInputChange}
          // startContent={
          //   <div className='pointer-events-none flex items-center'>
          //     <span className='text-small text-default-400'>$</span>
          //   </div>
          // }
          endContent={
            <div className='pointer-events-none flex h-full items-center justify-center'>
              <span className='text-lg text-default-400'>=&nbsp;1&nbsp;{tokenData?.symbol}</span>
            </div>
          }
        />
      )}
      <Input
        className='mt-4'
        size='lg'
        type='text'
        label={`Pay: $${payTokenAmountUsdShrinked}`}
        value={payTokenAmountInput}
        onChange={handlePayTokenAmountInputChange}
        placeholder='0.0'
        classNames={{
          inputWrapper: 'h-20 relative',
          label: 'relative top-4 overflow-visible',
          input: 'appearance-none text-3xl',
        }}
        endContent={
          <>
            <div className='absolute right-3 top-2 whitespace-nowrap text-xs'>
              Balance: ~{payTokenData && payTokenBalanceShrinked}
            </div>
            <Select
              aria-label='Select pay asset'
              className='max-w-xs'
              variant='bordered'
              selectedKeys={payTokenAddress ? [payTokenAddress] : []}
              onSelectionChange={selection => {
                if (!selection.currentKey) return
                setPayTokenAddress(selection.currentKey)
              }}
              selectorIcon={<></>}
              classNames={{
                base: 'w-min',
                label: 'visually-hidden',
                innerWrapper: 'group-data-[has-label=true]:pt-0 w-full',
                trigger: 'h-10 min-h-10 min-w-24 w-24 max-w-24',
                value: 'text-center',
              }}
            >
              {availablePayTokenAddresses.map(address => (
                <SelectItem key={address}>
                  {tokensData ? tokensData.get(address)?.symbol : ''}
                </SelectItem>
              ))}
            </Select>
          </>
        }
      />
      <Input
        className='mt-4'
        size='lg'
        type='text'
        label={`${INPUT_2_LABEL[tradeType]}: $${tokenAmountUsdShrinked}`}
        placeholder='0.0'
        classNames={{
          input: 'appearance-none',
        }}
        value={tokenAmountInput}
        onChange={handleTokenAmountInputChange}
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
}
