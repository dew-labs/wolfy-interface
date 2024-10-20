import {
  Button,
  Card,
  CardBody,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Slider,
  Tab,
  Tabs,
  Tooltip,
} from '@nextui-org/react'
import {useQueryClient} from '@tanstack/react-query'
import clsx from 'clsx'
import {useCallback, useRef, useState} from 'react'
import type {Key} from 'react-aria-components'
import {useLatest} from 'react-use'
import {OrderType} from 'satoru-sdk'
import {toast} from 'sonner'

import {DEFAULT_SLIPPAGE, LEVERAGE_DECIMALS, SLIPPAGE_PRECISION} from '@/constants/config'
import {getTokensMetadata} from '@/constants/tokens'
import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useConnect from '@/lib/starknet/hooks/useConnect'
import useIsWalletConnected from '@/lib/starknet/hooks/useIsWalletConnected'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import getScanUrl, {ScanType} from '@/lib/starknet/utils/getScanUrl'
import useGasPrice from '@/lib/trade/hooks/useGasPrice'
import usePositionsConstants from '@/lib/trade/hooks/usePositionConstants'
import useReferralInfo from '@/lib/trade/hooks/useReferralInfo'
import useTokenBalances from '@/lib/trade/hooks/useTokenBalances'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import sendOrder from '@/lib/trade/services/order/sendOrder'
import useTradeMode, {TRADE_MODE_LABEL, TradeMode} from '@/lib/trade/states/useTradeMode'
import useTradeType, {TRADE_TYPE_LABEL, TradeType} from '@/lib/trade/states/useTradeType'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'
import getLiquidationPrice from '@/lib/trade/utils/position/getLiquidationPrice'
import {getEntryPrice} from '@/lib/trade/utils/position/getPositionsInfo'
import calculatePriceFractionDigits from '@/lib/trade/utils/price/calculatePriceFractionDigits'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import errorMessageOrUndefined from '@/utils/errors/errorMessageOrUndefined'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'
import createResetableComponent from '@/utils/reset-component/createResettableComponent'

import useAvailableMarketsForIndexToken from './hooks/useAvailableMarketsForIndexToken'
import useCollateralToken from './hooks/useCollateralToken'
import useMarket from './hooks/useMarket'
import usePayToken from './hooks/usePayToken'
import useToken from './hooks/useToken'
import TokenInputs from './TokenInputs'

const AVAILABLE_TRADE_MODES: Record<TradeType, TradeMode[]> = {
  [TradeType.Long]: [
    TradeMode.Market,
    TradeMode.Limit,
    // TradeMode.Trigger
  ],
  [TradeType.Short]: [
    TradeMode.Market,
    TradeMode.Limit,
    // TradeMode.Trigger
  ],
  [TradeType.Swap]: [TradeMode.Market, TradeMode.Limit],
}

const SUPPORTED_TRADE_TYPES: TradeType[] = [
  TradeType.Long,
  TradeType.Short,
  // TradeType.Swap,
]

const Controller = createResetableComponent(function ({reset}) {
  const [chainId] = useChainId()
  const latestReset = useLatest(reset)
  const queryClient = useQueryClient()
  const [wallet] = useWalletAccount()
  const latestWallet = useLatest(wallet)
  const accountAddress = useAccountAddress()
  const latestAccountAddress = useLatest(accountAddress)
  const tokensMetadata = getTokensMetadata(chainId)
  const _gasPrice = useGasPrice()
  const tokenBalancesData = useTokenBalances()
  const latestChainId = useRef(chainId)

  const [tradeType, setTradeType] = useTradeType()
  const latestTradeType = useLatest(tradeType)
  const [tradeMode, setTradeMode] = useTradeMode()
  const latestTradeMode = useLatest(tradeMode)

  const {
    tokenAddress,
    tokenAmount,
    setTokenAmount,
    tokenAmountUsd,
    latestTokenAmountUsd,
    setTokenAmountUsd,
    tokenPrice,
    latestDerivedTokenPrice,
    setTokenPrice,
    tokenData,
    latestTokenDecimals,
  } = useToken(tradeMode)

  const availableMarkets = useAvailableMarketsForIndexToken(tokenAddress)

  const {
    marketAddress,
    latestMarketAddress,
    setMarketAddress,
    availableCollateralTokenAddresses,
    latestAvailableCollateralTokenAddresses,
    poolName,
    marketData,
  } = useMarket()

  const tokenPricesData = useTokenPrices(data => {
    return {
      tokenPrice: data.get(tokenAddress ?? ''),
      longTokenPrice: data.get(marketData?.longTokenAddress ?? ''),
      shortTokenPrice: data.get(marketData?.shortTokenAddress ?? ''),
    }
  })

  ;(function setDefaultMarketAddress() {
    if (!tokenAddress || !availableMarkets.length) return

    const currentMarketAddressIsAvailable =
      !!marketAddress &&
      availableMarkets.map(market => market.marketTokenAddress).includes(marketAddress)

    if (!currentMarketAddressIsAvailable) {
      setMarketAddress(availableMarkets[0]?.marketTokenAddress)
    }
  })()

  const {
    collateralTokenAddress,
    latestCollateralTokenAddress,
    setCollateralAddress,
    collateralTokenData,
    collateralTokenAmount,
    latestCollateralTokenAmount,
    setCollateralTokenAmount,
  } = useCollateralToken()

  ;(function setDefaultCollateralTokenAddress() {
    if (!availableCollateralTokenAddresses.length) return
    if (
      (!collateralTokenAddress ||
        !availableCollateralTokenAddresses.includes(collateralTokenAddress)) &&
      availableCollateralTokenAddresses[0]
    ) {
      setCollateralAddress(availableCollateralTokenAddresses[0])
    }
  })()

  const {
    payTokenAddress,
    setPayTokenAddress,
    payTokenAmount,
    setPayTokenAmount,
    payTokenAmountUsd,
    maxLeverageNumber,
    leverageInput,
    setLeverageInput,
    handleLeverageChange,
    leverage,
    leverageNumber,
    maxLeverage,
    payTokenData,
    setLeverageInputFocused,
  } = usePayToken(tradeMode, tokenAddress, tokenPrice, tokenAmountUsd, setTokenAmountUsd)

  ;(function syncPayTokenAddressWithCollateralTokenAddress() {
    if (collateralTokenAddress !== payTokenAddress) {
      setPayTokenAddress(collateralTokenAddress)
    }
    if (collateralTokenAmount !== payTokenAmount) {
      setCollateralTokenAmount(payTokenAmount)
    }
  })()

  const handleChangeTradeType = useCallback(
    (value: Key) => {
      setTradeType(value as TradeType)
    },
    [setTradeType],
  )

  const handleChangeTradeMode = useCallback(
    (value: Key) => {
      const tradeMode = value as TradeMode
      setTradeMode(tradeMode)
    },
    [setTradeMode],
  )

  const handlePoolChange = useCallback(
    (value: unknown) => {
      if (typeof value !== 'string') return
      setMarketAddress(value)
    },
    [setMarketAddress],
  )

  const handleCollateralChange = useCallback(
    (value: unknown) => {
      if (typeof value !== 'string') return
      if (!latestAvailableCollateralTokenAddresses.current.length) return
      if (!latestAvailableCollateralTokenAddresses.current.includes(value)) return
      setCollateralAddress(value)
    },
    [setCollateralAddress, latestAvailableCollateralTokenAddresses],
  )

  const referralInfo = useReferralInfo()

  const positionConstants = usePositionsConstants()

  const priceFractionDigits = calculatePriceFractionDigits(
    tokenAddress && tokenPricesData ? tokenPricesData.tokenPrice?.min : 0,
  )

  const liquidationPrice =
    payTokenData &&
    marketData &&
    getLiquidationPrice({
      sizeInUsd: tokenAmountUsd,
      sizeInTokens: tokenAmount,
      collateralAmount: payTokenAmount,
      collateralUsd: payTokenAmountUsd,
      collateralToken: payTokenData,
      marketInfo: marketData,
      pendingFundingFeesUsd: 0n,
      pendingBorrowingFeesUsd: 0n,
      minCollateralUsd: positionConstants?.minCollateralUsd ?? 0n,
      isLong: tradeType === TradeType.Long,
      useMaxPriceImpact: false, // NOTE: Should be true when the configuration is right
      referralInfo: referralInfo,
    })

  const liquidationPriceText = liquidationPrice
    ? formatNumber(shrinkDecimals(liquidationPrice, USD_DECIMALS), Format.USD, {
        exactFractionDigits: true,
        fractionDigits: priceFractionDigits,
      })
    : '-'

  const executionPrice =
    tokenData &&
    getEntryPrice({
      sizeInUsd: tokenAmountUsd,
      sizeInTokens: tokenAmount,
      indexToken: tokenData,
    })

  const executionPriceText = executionPrice
    ? formatNumber(shrinkDecimals(executionPrice, USD_DECIMALS), Format.USD, {
        exactFractionDigits: true,
        fractionDigits: priceFractionDigits,
      })
    : '-'

  const isConnected = useIsWalletConnected()
  const latestIsConnected = useLatest(isConnected)
  const connect = useConnect()

  const availableLiquidity = (() => {
    if (tradeType === TradeType.Long) return marketData?.longPoolAmount ?? 0n
    return marketData?.shortPoolAmount ?? 0n
  })()

  const availableLiquidityUsd = (() => {
    const longTokenAddress = marketData?.longTokenAddress
    const shortTokenAddress = marketData?.shortTokenAddress

    const longTokenDecimals = marketData?.longToken.decimals ?? 0
    const shortTokenDecimals = marketData?.shortToken.decimals ?? 0

    let longTokenPrice = tokenPricesData?.longTokenPrice?.min ?? 0n
    let shortTokenPrice = tokenPricesData?.shortTokenPrice?.min ?? 0n

    if (tradeMode === TradeMode.Limit && tokenAddress === payTokenAddress) {
      if (tokenAddress === longTokenAddress && tokenPrice) longTokenPrice = tokenPrice
      if (tokenAddress === shortTokenAddress && tokenPrice) shortTokenPrice = tokenPrice
    }

    return convertTokenAmountToUsd(
      availableLiquidity,
      tradeType === TradeType.Long ? longTokenDecimals : shortTokenDecimals,
      tradeType === TradeType.Long ? longTokenPrice : shortTokenPrice,
    )
  })()

  const availableLiquidityUsdText = formatNumber(
    shrinkDecimals(availableLiquidityUsd, USD_DECIMALS),
    Format.USD,
  )

  const isValidSize = tokenAmount <= availableLiquidity
  const isValidPayTokenAmount =
    !!tokenBalancesData &&
    !!payTokenAddress &&
    payTokenAmount <= (tokenBalancesData.get(payTokenAddress) ?? 0n)
  const isValidTokenAmount = tokenAmount > 0n
  const isValidLeverage = leverage > 0n && leverage <= maxLeverage
  const isValidOrder = isValidLeverage && isValidTokenAmount && isValidPayTokenAmount && isValidSize

  const invalidMessage = (() => {
    if (!isValidTokenAmount) return 'Order size must be greater than 0'
    if (!isValidPayTokenAmount) return 'Insufficient collateral balance'
    if (!isValidSize) return 'Insufficient liquidity'
    if (!isValidLeverage)
      return (
        'Leverage must be between 1 and ' +
        formatNumber(shrinkDecimals(maxLeverage, LEVERAGE_DECIMALS), Format.PLAIN, {
          exactFractionDigits: true,
          fractionDigits: 0,
        })
      )
    return ''
  })()

  const [isPlacing, setIsPlacing] = useState(false)

  const handleSubmitBtnPress = useCallback(() => {
    if (!latestIsConnected.current || !latestWallet.current) {
      connect()
      return
    }

    const isLong = latestTradeType.current === TradeType.Long
    const receiver = latestAccountAddress.current
    const market = latestMarketAddress.current
    const initialCollateralToken = latestCollateralTokenAddress.current
    const sizeDeltaUsd = latestTokenAmountUsd.current
    const initialCollateralDeltaAmount = latestCollateralTokenAmount.current

    if (!market) return
    if (!receiver) return
    if (!initialCollateralToken) return

    const tradeMode = latestTradeMode.current

    const currentPrice =
      latestDerivedTokenPrice.current / expandDecimals(1, latestTokenDecimals.current)

    const triggerPrice = tradeMode === TradeMode.Market ? 0n : currentPrice
    let differences = (currentPrice * DEFAULT_SLIPPAGE) / SLIPPAGE_PRECISION
    if (!isLong) {
      differences = -differences
    }
    const acceptablePrice = currentPrice + differences
    const orderType = (() => {
      // Swap not supported yet
      switch (tradeMode) {
        case TradeMode.Limit:
          return OrderType.LimitIncrease
        case TradeMode.Market:
          return OrderType.MarketIncrease
        default:
          throw new Error('Unsupported trade mode')
      }
    })()

    setIsPlacing(true)
    toast.promise(
      sendOrder(latestWallet.current, {
        receiver,
        market,
        initialCollateralToken,
        sizeDeltaUsd,
        initialCollateralDeltaAmount,
        orderType,
        isLong,
        triggerPrice,
        acceptablePrice,
        referralCode: 0,
      }),
      {
        loading: 'Placing your order...',
        description: 'Waiting for transaction confirmation',
        success: data => {
          void queryClient.invalidateQueries({
            queryKey: ['orders', latestChainId.current, latestAccountAddress.current],
          })
          latestReset.current()
          return (
            <>
              Order placed.
              <a
                href={getScanUrl(latestChainId.current, ScanType.Transaction, data.tx)}
                target='_blank'
                rel='noreferrer'
              >
                View tx
              </a>
            </>
          )
        },
        finally: () => {
          setIsPlacing(false)
        },
        error: error => {
          return (
            <>
              <div>{errorMessageOrUndefined(error) ?? 'Place order failed.'}</div>
            </>
          )
        },
      },
    )
  }, [
    connect,
    latestCollateralTokenAddress,
    latestCollateralTokenAmount,
    latestMarketAddress,
    latestTokenAmountUsd,
    latestDerivedTokenPrice,
    latestTradeMode,
    latestTradeType,
    latestWallet,
    queryClient,
    latestTokenDecimals,
  ])

  return (
    <div className='flex w-full min-w-80 flex-col md:max-w-sm'>
      <Card>
        <CardBody>
          <Tabs
            size='lg'
            selectedKey={tradeType}
            onSelectionChange={handleChangeTradeType}
            aria-label='Trade type'
            classNames={{
              tabList: 'gap-2 w-full relative',
            }}
            color={tradeType === TradeType.Long ? 'success' : 'danger'}
          >
            {SUPPORTED_TRADE_TYPES.map(type => (
              <Tab key={type} title={TRADE_TYPE_LABEL[type]} />
            ))}
          </Tabs>
          <Tabs
            size='sm'
            variant='underlined'
            selectedKey={tradeMode}
            onSelectionChange={handleChangeTradeMode}
            aria-label='Trade mode'
          >
            {AVAILABLE_TRADE_MODES[tradeType].map(type => (
              <Tab key={type} title={TRADE_MODE_LABEL[type]} />
            ))}
          </Tabs>
          <div className='mt-2 flex w-full justify-between'>
            <div className='flex items-center'>Pool</div>
            <Dropdown backdrop='opaque'>
              <DropdownTrigger>
                <Button variant='flat'>{poolName}</Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='Change pool' onAction={handlePoolChange}>
                {availableMarkets.map(market => {
                  return (
                    <DropdownItem key={market.marketTokenAddress}>
                      {getMarketPoolName(market)}
                    </DropdownItem>
                  )
                })}
              </DropdownMenu>
            </Dropdown>
          </div>
          {tradeMode !== TradeMode.Trigger && (
            <TokenInputs
              marketAddress={marketAddress}
              tradeType={tradeType}
              tradeMode={tradeMode}
              availablePayTokenAddresses={availableCollateralTokenAddresses}
              payTokenAmount={payTokenAmount}
              setPayTokenAmount={setPayTokenAmount}
              payTokenAmountUsd={payTokenAmountUsd}
              payTokenAddress={collateralTokenAddress}
              setPayTokenAddress={setCollateralAddress}
              tokenAmount={tokenAmount}
              setTokenAmount={setTokenAmount}
              tokenAmountUsd={tokenAmountUsd}
              tokenPrice={tokenPrice}
              setTokenPrice={setTokenPrice}
            />
          )}
          <Slider
            size='md'
            step={1}
            color='foreground'
            label='Leverage'
            maxValue={maxLeverageNumber}
            minValue={1}
            defaultValue={1}
            className='mt-4'
            classNames={{
              thumb: '!rounded-none before:!rounded-none after:!rounded-none',
              track: '!rounded-none',
            }}
            renderValue={({_, ...props}) => (
              <output {...props}>
                {'x '}
                <Tooltip
                  className='rounded-md text-tiny text-default-500'
                  content='Press Enter to confirm'
                  placement='left'
                >
                  <input
                    className={clsx(
                      'w-16 rounded-small border-medium bg-default-100 px-1 py-0.5 text-right text-small font-medium text-default-700 outline-none transition-colors hover:border-primary focus:border-primary',
                      leverage > 0n && !isValidLeverage
                        ? 'border-danger-500'
                        : 'border-transparent',
                    )}
                    type='text'
                    aria-label='Leverage value'
                    value={leverageInput}
                    onChange={e => {
                      const v = e.target.value
                      setLeverageInput(v)
                    }}
                    max={maxLeverageNumber}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleLeverageChange(leverageInput)
                      }
                    }}
                    onFocus={() => {
                      setLeverageInputFocused(true)
                    }}
                    onBlur={() => {
                      setLeverageInputFocused(false)
                    }}
                  />
                </Tooltip>
              </output>
            )}
            value={leverageNumber}
            onChange={handleLeverageChange}
            // TODO: generate marks based on maximum leverage
            // marks={[
            //   {
            //     value: 1,
            //     label: '1',
            //   },
            //   {
            //     value: 10,
            //     label: '10',
            //   },
            //   {
            //     value: 25,
            //     label: '25',
            //   },
            //   {
            //     value: 50,
            //     label: '50',
            //   },
            //   {
            //     value: 75,
            //     label: '75',
            //   },
            //   {
            //     value: 100,
            //     label: '100',
            //   },
            // ]}
          />
          <div className='mt-2 flex w-full justify-between'>
            <div className='flex items-center'>Collateral in</div>
            <Dropdown backdrop='blur'>
              <DropdownTrigger>
                <Button variant='flat'>{collateralTokenData?.symbol}</Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='Change collateral' onAction={handleCollateralChange}>
                {availableCollateralTokenAddresses.map(tokenAddress => (
                  <DropdownItem key={tokenAddress}>
                    {tokensMetadata.get(tokenAddress)?.symbol ?? ''}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          <Divider className='mt-3 opacity-50' />
          <div className='text-sm'>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Execution Price</div>
              <div className='flex items-center'>{executionPriceText}</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Liquidation Price</div>
              <div className='flex items-center'>{liquidationPriceText}</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Available Liquidity</div>
              <div
                className={clsx(
                  'flex items-center',
                  tokenAmount > 0 && !isValidSize && 'text-danger-500',
                )}
              >
                {availableLiquidityUsdText}
              </div>
            </div>
          </div>
          <Divider className='mt-3 opacity-50' />
          <div className='text-sm'>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Fee</div>
              <div className='flex items-center'>$0</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Network Fee</div>
              <div className='flex items-center'>$0</div>
            </div>
          </div>
          <div className='mt-4 w-full'>
            <Tooltip
              showArrow={true}
              color='danger'
              content={invalidMessage}
              isDisabled={isValidOrder}
            >
              <Button
                color='primary'
                className='w-full'
                size='lg'
                onPress={handleSubmitBtnPress}
                isDisabled={isConnected && !isValidOrder}
                isLoading={isPlacing}
              >
                {!isConnected ? 'Connect Wallet' : !isPlacing ? 'Place Order' : 'Placing Order...'}
              </Button>
            </Tooltip>
          </div>
        </CardBody>
      </Card>
      {/* <Card className='mt-4'>
        <CardBody>
          {`${TRADE_TYPE_LABEL[tradeType]} ...`}
          <Divider className='mt-3 opacity-50' />
          <div className='text-sm'>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Market</div>
              <div className='flex items-center'>ETH/USD[WETH]</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Ask Price (Entry)</div>
              <div className='flex items-center'>$3,179.33</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Net Rate</div>
              <div className='flex items-center'>-0.0047% / 1h</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Available Liquidity</div>
              <div className='flex items-center'>$1,983,118.56</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Open Interest Balance</div>
              <div className='flex items-center'>
                <div className='flex'>
                  <div className='rounded-l bg-emerald-700 px-2 py-1 text-white'>50%</div>
                  <div className='rounded-r bg-rose-700 px-2 py-1 text-white'>43%</div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card> */}
    </div>
  )
})

export default Controller
