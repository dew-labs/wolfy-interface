import {
  Input,
  Select,
  type SelectedItems,
  SelectItem,
  type SharedSelection,
  Tooltip,
} from '@nextui-org/react'
import clsx from 'clsx'
import {memo, type MemoizedCallbackOrDispatch, useCallback, useMemo} from 'react'
import {useLatest} from 'react-use'

import {getTokensMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import useTokenBalances from '@/lib/trade/hooks/useTokenBalances'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import {DEFAULT_PRICE} from '@/lib/trade/services/fetchTokenPrices'
import {TradeMode} from '@/lib/trade/states/useTradeMode'
import {TradeType} from '@/lib/trade/states/useTradeType'
import calculateTokenFractionDigits from '@/lib/trade/utils/price/calculateTokenFractionDigits'
import {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'

import useTokenInput, {InputMode} from './hooks/useTokenInput'

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
  setTokenAmount: MemoizedCallbackOrDispatch<bigint>
  tokenAmountUsd: bigint
  tokenPrice: bigint | undefined
  setTokenPrice: MemoizedCallbackOrDispatch<bigint>
  availablePayTokenAddresses: string[]
  payTokenAddress: string | undefined
  setPayTokenAddress: MemoizedCallbackOrDispatch<string | undefined>
  payTokenAmount: bigint
  setPayTokenAmount: MemoizedCallbackOrDispatch<bigint>
  sync: boolean
}

const SIZE_CLASS_NAMES = {
  input: 'appearance-none',
  label: 'relative top-4 overflow-visible',
  inputWrapper: 'data-[hover=true]:bg-default-200',
}

const TOKEN_AMOUNT_INPUT_CLASS_NAMES = {
  inputWrapper: 'h-20 relative data-[hover=true]:bg-default-200',
  label: 'relative top-4 overflow-visible',
  input: 'appearance-none text-3xl',
}

const SELECT_CLASS_NAMES = {
  base: 'w-min',
  label: 'visually-hidden',
  innerWrapper: 'group-data-[has-label=true]:pt-0 w-full',
  trigger: 'h-10 min-h-10 min-w-32 w-32 max-w-32',
  value: 'flex items-center gap-2 justify-center',
}

const SELECT_LISTBOX_PROPS = {
  itemClasses: {
    title: 'flex items-center gap-2',
  },
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
  setTokenAmount,
  sync,
}: Readonly<Props>) {
  const [chainId] = useChainId()
  const tokensMetadata = getTokensMetadata(chainId)
  const latestTokensMetadata = useLatest(tokensMetadata)

  // TODO: optimize, extract this query to a single function to avoid closure memory leak
  const {data: payTokenBalance = 0n} = useTokenBalances(
    useCallback(
      data => {
        return data.get(payTokenAddress ?? '')
      },
      [payTokenAddress],
    ),
  )

  // TODO: optimize, extract this query to a single function to avoid closure memory leak
  const {data: currentMarketData} = useMarketsData(
    useCallback(
      data => {
        return data.get(marketAddress ?? '')
      },
      [marketAddress],
    ),
  )

  // TODO: optimize, extract this query to a single function to avoid closure memory leak
  const {data: realTokenPrice} = useTokenPrices(
    useCallback(
      data => {
        return data.get(currentMarketData?.indexToken.address ?? '')
      },
      [currentMarketData],
    ),
  )

  const {data: payTokenPrice} = useTokenPrices(
    useCallback(
      data => {
        return data.get(payTokenAddress ?? '')
      },
      [payTokenAddress],
    ),
  )

  const derivedTokenPrice =
    tradeMode === TradeMode.Limit ? {min: tokenPrice ?? 0n, max: tokenPrice ?? 0n} : realTokenPrice
  const derivedPayTokenPrice =
    payTokenAddress === currentMarketData?.indexToken.address ? derivedTokenPrice : payTokenPrice
  // -------------------------------------------------------------------------------------------------------------------

  const payTokenData = payTokenAddress ? tokensMetadata.get(payTokenAddress) : undefined
  const payTokenDecimals = payTokenData?.decimals ?? 0
  const payTokenDisplayDecimals = calculateTokenFractionDigits(derivedPayTokenPrice?.max)
  const payTokenBalanceShrinked = formatNumber(
    shrinkDecimals(payTokenBalance, payTokenDecimals),
    Format.READABLE,
    {
      exactFractionDigits: true,
      fractionDigits: payTokenDisplayDecimals,
    },
  )

  const handlePayTokenAmountSetToMax = useCallback(() => {
    setPayTokenAmount(payTokenBalance)
  }, [payTokenBalance, setPayTokenAmount])

  const {
    mode: payTokenInputMode,
    input: payTokenAmountInput,
    usdInput: payTokenAmountUsdInput,
    handleInputFocusChange: handlePayTokenInputFocusChange,
    handleInputChange: handlePayTokenAmountInputChange,
    handleUsdInputChange: handlePayTokenUsdInputChange,
    handleUsdInputFocusChange: handlePayTokenUsdInputFocusChange,
    setMode: setPayTokenInputMode,
  } = useTokenInput(
    payTokenDecimals,
    payTokenAmount,
    setPayTokenAmount,
    derivedPayTokenPrice ?? DEFAULT_PRICE,
  )

  const payTokenUsdText = payTokenAmountUsdInput
    ? formatNumber(payTokenAmountUsdInput, Format.USD)
    : '$0'

  const payTokenAmountText = `${
    payTokenAmountInput
      ? formatNumber(payTokenAmountInput, Format.READABLE, {
          exactFractionDigits: true,
          fractionDigits: payTokenDisplayDecimals,
        })
      : `0`
  } ${payTokenData?.symbol}`

  const togglePayTokenInputMode = useCallback(() => {
    setPayTokenInputMode(prev => (prev === InputMode.Token ? InputMode.Usd : InputMode.Token))
  }, [setPayTokenInputMode])

  // -------------------------------------------------------------------------------------------------------------------
  const tokenData = currentMarketData?.indexToken
  const tokenDisplayDecimals = calculateTokenFractionDigits(derivedTokenPrice?.max)

  const tokenDecimals = tokenData?.decimals ?? 0

  const {
    mode: tokenInputMode,
    input: tokenAmountInput,
    usdInput: tokenAmountUsdInput,
    handleInputFocusChange: handleTokenInputFocusChange,
    handleInputChange: handleTokenAmountInputChange,
    handleUsdInputChange: handleTokenUsdInputChange,
    handleUsdInputFocusChange: handleTokenUsdInputFocusChange,
    setMode: setTokenInputMode,
  } = useTokenInput(
    tokenDecimals,
    tokenAmount,
    setTokenAmount,
    derivedTokenPrice ?? DEFAULT_PRICE,
    {
      sync,
    },
  )

  const toggleTokenInputMode = useCallback(() => {
    setTokenInputMode(prev => (prev === InputMode.Token ? InputMode.Usd : InputMode.Token))
  }, [setTokenInputMode])

  const tokenUsdText = tokenAmountUsdInput ? formatNumber(tokenAmountUsdInput, Format.USD) : '$0'

  const tokenAmountText = `${
    tokenAmountInput
      ? formatNumber(tokenAmountInput, Format.READABLE, {
          exactFractionDigits: true,
          fractionDigits: tokenDisplayDecimals,
        })
      : `0`
  } ${tokenData?.symbol}`

  // -------------------------------------------------------------------------------------------------------------------

  const {input: tokenPriceInput, handleInputChange: handleTokenPriceInputChange} = useTokenInput(
    USD_DECIMALS,
    tokenPrice,
    setTokenPrice,
    {
      min: 1000000000000000000000000000000n,
      max: 1000000000000000000000000000000n,
    },
    {
      mode: InputMode.Token,
      lockMode: true,
    },
  )

  // -------------------------------------------------------------------------------------------------------------------

  const availablePayTokenAddressesObject = useMemo(() => {
    return availablePayTokenAddresses.map(address => ({
      address,
    }))
  }, [availablePayTokenAddresses])

  const renderPayTokenSelectedValue = useCallback((items: SelectedItems) => {
    const key = items[0]?.key
    const token = typeof key === 'string' ? latestTokensMetadata.current.get(key) : undefined
    return (
      <>
        <img src={token?.imageUrl} alt='' className='h-6' />
        {token?.symbol}
      </>
    )
  }, [])

  const renderPayTokenItem = useCallback(({address}: {address: string}) => {
    const token = latestTokensMetadata.current.get(address)
    return (
      <SelectItem key={address} textValue={token?.symbol ?? ''}>
        <img src={token?.imageUrl} alt='' className='h-6' />
        {token?.symbol}
      </SelectItem>
    )
  }, [])

  const isValidPayTokenAmount = !!payTokenAddress && payTokenAmount <= payTokenBalance

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
          classNames={{
            input: 'appearance-none',
            inputWrapper: 'data-[hover=true]:bg-default-200',
          }}
          value={tokenPriceInput}
          onChange={handleTokenPriceInputChange}
          startContent={
            <div className='pointer-events-none mb-[2px] flex items-center'>
              <span className='text-small text-default-400'>$</span>
            </div>
          }
          endContent={
            <div className='pointer-events-none flex h-full min-w-max items-center justify-center'>
              <span className='mr-1 whitespace-nowrap text-lg text-default-400'>per</span>
              <img src={tokenData?.imageUrl} alt='' className='size-6' />
              <span className='whitespace-nowrap text-lg text-default-400'>
                {tokenData?.symbol}
              </span>
            </div>
          }
        />
      )}
      <Input
        className='mt-4'
        size='lg'
        type='text'
        label={
          <Tooltip
            className='rounded-md text-tiny text-default-500'
            content={`Press to switch to [${payTokenInputMode === InputMode.Token ? 'Usd' : 'Token'}] mode`}
            showArrow
            placement='top'
          >
            <button
              className={clsx('absolute bottom-0 whitespace-nowrap p-0')}
              onClick={togglePayTokenInputMode}
            >
              Pay: {payTokenInputMode === InputMode.Token ? payTokenUsdText : payTokenAmountText}
            </button>
          </Tooltip>
        }
        value={payTokenInputMode === InputMode.Token ? payTokenAmountInput : payTokenAmountUsdInput}
        onChange={
          payTokenInputMode === InputMode.Token
            ? handlePayTokenAmountInputChange
            : handlePayTokenUsdInputChange
        }
        onFocusChange={
          payTokenInputMode === InputMode.Token
            ? handlePayTokenInputFocusChange
            : handlePayTokenUsdInputFocusChange
        }
        placeholder='0.0'
        classNames={TOKEN_AMOUNT_INPUT_CLASS_NAMES}
        startContent={
          payTokenInputMode === InputMode.Usd ? (
            <div className='pointer-events-none mb-[2px] flex items-center'>
              <span className='text-2xl text-default-400'>$</span>
            </div>
          ) : (
            ''
          )
        }
        endContent={
          <>
            {payTokenInputMode === InputMode.Usd && (
              <div className='pointer-events-none mb-1 mr-2 flex items-center'>
                <span className='text-2xl text-default-400'>in</span>
              </div>
            )}
            <Tooltip
              className='rounded-md text-tiny text-default-500'
              content='Press to use all balance'
              showArrow
              placement='top'
            >
              <button
                className={clsx(
                  'absolute right-3 top-2 m-0 whitespace-nowrap p-0 text-xs',
                  payTokenData && !isValidPayTokenAmount && 'text-danger-500',
                )}
                onClick={handlePayTokenAmountSetToMax}
              >
                Balance: ~{payTokenBalanceShrinked}
              </button>
            </Tooltip>
            {/* TODO: use drawer instead of select, provide more information about the token */}
            <Select
              aria-label='Select pay asset'
              className='max-w-xs'
              variant='bordered'
              selectedKeys={payTokenSelectedKeys}
              onSelectionChange={onSelectionChange}
              selectorIcon={<span />}
              classNames={SELECT_CLASS_NAMES}
              disallowEmptySelection
              selectionMode='single'
              listboxProps={SELECT_LISTBOX_PROPS}
              renderValue={renderPayTokenSelectedValue}
              items={availablePayTokenAddressesObject}
            >
              {renderPayTokenItem}
            </Select>
          </>
        }
      />
      <Input
        className='mt-4'
        size='lg'
        type='text'
        label={
          <Tooltip
            className='rounded-md text-tiny text-default-500'
            content={`Press to switch to [${tokenInputMode === InputMode.Token ? 'Usd' : 'Token'}] mode`}
            showArrow
            placement='top'
          >
            <button
              className={clsx('absolute bottom-0 whitespace-nowrap p-0')}
              onClick={toggleTokenInputMode}
            >
              {INPUT_2_LABEL[tradeType]}:{' '}
              {tokenInputMode === InputMode.Token ? tokenUsdText : tokenAmountText}
            </button>
          </Tooltip>
        }
        placeholder='0.0'
        classNames={SIZE_CLASS_NAMES}
        value={tokenInputMode === InputMode.Token ? tokenAmountInput : tokenAmountUsdInput}
        onChange={
          tokenInputMode === InputMode.Token
            ? handleTokenAmountInputChange
            : handleTokenUsdInputChange
        }
        onFocusChange={
          tokenInputMode === InputMode.Token
            ? handleTokenInputFocusChange
            : handleTokenUsdInputFocusChange
        }
        startContent={
          tokenInputMode === InputMode.Usd ? (
            <div className='pointer-events-none mb-[2px] flex items-center'>
              <span className='text-sm text-default-400'>$</span>
            </div>
          ) : (
            ''
          )
        }
        endContent={
          <div className='pointer-events-none flex h-full min-w-max items-center justify-center gap-2'>
            {tokenInputMode === InputMode.Usd && (
              <span className='whitespace-nowrap text-lg text-default-400'>in</span>
            )}
            <img src={tokenData?.imageUrl} alt='' className='size-6' />
            <span className='whitespace-nowrap text-lg text-default-400'>{tokenData?.symbol}</span>
          </div>
        }
      />
    </>
  )
})
