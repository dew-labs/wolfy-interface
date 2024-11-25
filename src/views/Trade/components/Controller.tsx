import {
  Button,
  Card,
  CardBody,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Slider,
  Tab,
  Tabs,
  Tooltip,
} from '@nextui-org/react'
import {useQueryClient} from '@tanstack/react-query'
import clsx from 'clsx'
import {
  type ChangeEventHandler,
  type DOMAttributes,
  type KeyboardEventHandler,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {Key} from 'react-aria-components'
import {useLatest} from 'react-use'
import {toast} from 'sonner'
import {OrderType, type StarknetChainId} from 'wolfy-sdk'

import {DEFAULT_SLIPPAGE, LEVERAGE_DECIMALS, SLIPPAGE_PRECISION} from '@/constants/config'
import {FEE_TOKEN_ADDRESS, getTokenMetadata, getTokensMetadata} from '@/constants/tokens'
import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useConnect from '@/lib/starknet/hooks/useConnect'
import useIsWalletConnected from '@/lib/starknet/hooks/useIsWalletConnected'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import getScanUrl, {ScanType} from '@/lib/starknet/utils/getScanUrl'
import useGasLimits from '@/lib/trade/hooks/useGasLimits'
import useGasPrice from '@/lib/trade/hooks/useGasPrice'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import usePositionsConstants from '@/lib/trade/hooks/usePositionConstants'
import usePositionsInfoData from '@/lib/trade/hooks/usePositionsInfoData'
import useReferralInfo from '@/lib/trade/hooks/useReferralInfo'
import useTokenBalances from '@/lib/trade/hooks/useTokenBalances'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import useUiFeeFactor from '@/lib/trade/hooks/useUiFeeFactor'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import {getStringReprenetationOfPosition} from '@/lib/trade/services/fetchPositions'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import sendOrder from '@/lib/trade/services/order/sendOrder'
import useTradeMode, {TRADE_MODE_LABEL, TradeMode} from '@/lib/trade/states/useTradeMode'
import useTradeType, {TRADE_TYPE_LABEL, TradeType} from '@/lib/trade/states/useTradeType'
import estimateExecuteOrderGasLimit from '@/lib/trade/utils/fee/estimateExecuteOrderGasLimit'
import {getExecutionFee} from '@/lib/trade/utils/fee/getExecutionFee'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'
import {getIncreasePositionAmounts} from '@/lib/trade/utils/order/increase/getIncreasePositionAmounts'
import createSwapEstimator from '@/lib/trade/utils/order/swap/createSwapEstimator'
import findAllPaths from '@/lib/trade/utils/order/swap/findAllPaths'
import {getBestSwapPath} from '@/lib/trade/utils/order/swap/getBestSwapPath'
import getMarketsGraph from '@/lib/trade/utils/order/swap/getMarketsGraph'
import {getSwapAmountsByFromValue} from '@/lib/trade/utils/order/swap/getSwapAmountsByFromValue'
import {getSwapAmountsByToValue} from '@/lib/trade/utils/order/swap/getSwapAmountsByToValue'
import getSwapPathStats from '@/lib/trade/utils/order/swap/getSwapPathStats'
import type {FindSwapPath} from '@/lib/trade/utils/order/swap/types'
import getLiquidationPrice from '@/lib/trade/utils/position/getLiquidationPrice'
import {getEntryPrice} from '@/lib/trade/utils/position/getPositionsInfo'
import calculatePriceFractionDigits from '@/lib/trade/utils/price/calculatePriceFractionDigits'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import {getMarkPrice} from '@/lib/trade/utils/price/getMarkPrice'
import type {TokensRatio} from '@/lib/trade/utils/token/getTokensRatioByAmounts'
import getTokensRatioByPrice from '@/lib/trade/utils/token/getTokensRatioByPrice'
import errorMessageOrUndefined from '@/utils/errors/errorMessageOrUndefined'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'
import createResetableComponent from '@/utils/reset-component/createResettableComponent'

import useAcceptablePriceImpact from './hooks/useAcceptablePriceImpact'
import useAvailableMarketsForIndexToken from './hooks/useAvailableMarketsForIndexToken'
import useCollateralToken from './hooks/useCollateralToken'
import useMarket from './hooks/useMarket'
import usePayToken from './hooks/usePayToken'
import useStrategy from './hooks/useStrategy'
import useToken from './hooks/useToken'
import TokenInputs from './TokenInputs'

const getAllPaths = (
  fromTokenAddress: string | undefined,
  toTokenAddress: string | undefined,
  marketsData: MarketsData | undefined,
  tokenPricesData: TokenPricesData | undefined,
) => {
  if (!marketsData || !tokenPricesData || !fromTokenAddress || !toTokenAddress) return undefined

  const graph = getMarketsGraph(marketsData)
  const isSameToken = fromTokenAddress === toTokenAddress

  if (isSameToken) {
    return undefined
  }

  return findAllPaths(marketsData, graph, fromTokenAddress, toTokenAddress, tokenPricesData)?.sort(
    (a, b) => (b.liquidity - a.liquidity > 0 ? 1 : -1),
  )
}

const getSwapEstimator = (
  marketsData: MarketsData | undefined,
  tokenPricesData: TokenPricesData | undefined,
) => {
  if (!marketsData || !tokenPricesData) return undefined
  return createSwapEstimator(marketsData, tokenPricesData)
}

const createFindSwapPath = (
  fromTokenAddress: string | undefined,
  toTokenAddress: string | undefined,
  marketsData: MarketsData | undefined,
  tokenPricesData: TokenPricesData | undefined,
) => {
  const allPaths = getAllPaths(fromTokenAddress, toTokenAddress, marketsData, tokenPricesData)
  const estimator = getSwapEstimator(marketsData, tokenPricesData)

  const findSwapPath: FindSwapPath = (usdIn: bigint, opts: {byLiquidity?: boolean}) => {
    if (
      !allPaths?.length ||
      !allPaths[0] ||
      !estimator ||
      !marketsData ||
      !fromTokenAddress ||
      !tokenPricesData
    ) {
      return undefined
    }

    let swapPath: string[] | undefined = undefined

    if (opts.byLiquidity) {
      swapPath = allPaths[0].path
    } else {
      swapPath = getBestSwapPath(allPaths, usdIn, estimator)
    }

    if (!swapPath) {
      return undefined
    }

    return getSwapPathStats({
      marketsData,
      tokenPricesData,
      swapPath,
      initialCollateralAddress: fromTokenAddress,
      shouldApplyPriceImpact: true,
      usdIn,
    })
  }

  return findSwapPath
}

const getTradeRatios = function ({
  chainId,
  tradeFlags,
  fromTokenAddress,
  toTokenAddress,
  tokenPrice,
  tokenPricesData,
}: {
  chainId: StarknetChainId
  tradeFlags: TradeFlags
  fromTokenAddress: string | undefined
  toTokenAddress: string | undefined
  tokenPrice: bigint | undefined
  tokenPricesData: TokenPricesData | undefined
}) {
  const {isSwap, isLong, isIncrease} = tradeFlags
  if (!isSwap || !fromTokenAddress || !toTokenAddress || !tokenPricesData) return {}

  const toToken = getTokenMetadata(chainId, toTokenAddress)
  const toTokenPrice = tokenPricesData.get(toToken.address) ?? undefined
  const fromToken = getTokenMetadata(chainId, fromTokenAddress)
  const fromTokenPrice = tokenPricesData.get(fromToken.address) ?? undefined

  if (fromTokenPrice === undefined || toTokenPrice === undefined) return {}

  const markPrice = getMarkPrice({price: toTokenPrice, isIncrease, isLong})
  const triggerRatioValue = tokenPrice

  if (!markPrice) return {}

  const markRatio = getTokensRatioByPrice({
    fromToken,
    toToken,
    fromPrice: fromTokenPrice.min,
    toPrice: markPrice,
  })

  if (triggerRatioValue === undefined) {
    return {markRatio}
  }

  const triggerRatio: TokensRatio = {
    ratio: triggerRatioValue > 0n ? triggerRatioValue : markRatio.ratio,
    largestToken: markRatio.largestToken,
    smallestToken: markRatio.smallestToken,
  }

  return {
    markRatio,
    triggerRatio,
  }
}

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

const TABS_CLASS_NAMES = {
  tabList: 'gap-2 w-full relative',
}

const SLIDER_CLASS_NAMES = {
  thumb: '!rounded-none before:!rounded-none after:!rounded-none',
  track: '!rounded-none',
}

const ACCEPTABLE_PRICE_IMPACT_CLASS_NAMES = {
  input: 'text-right',
}

export interface TradeFlags {
  isLong: boolean
  isShort: boolean
  isSwap: boolean
  /**
   * ```ts
   * isLong || isShort
   * ```
   */
  isPosition: boolean
  isIncrease: boolean
  isTrigger: boolean
  isMarket: boolean
  isLimit: boolean
}

const getTradeFlags = (tradeType: TradeType, tradeMode: TradeMode): TradeFlags => {
  const isLong = tradeType === TradeType.Long
  const isShort = tradeType === TradeType.Short
  const isSwap = tradeType === TradeType.Swap
  const isPosition = isLong || isShort
  const isMarket = tradeMode === TradeMode.Market
  const isLimit = tradeMode === TradeMode.Limit
  const isTrigger = tradeMode === TradeMode.Trigger
  const isIncrease = isPosition && (isMarket || isLimit)

  const tradeFlags: TradeFlags = {
    isLong,
    isShort,
    isSwap,
    isPosition,
    isIncrease,
    isMarket,
    isLimit,
    isTrigger,
  }

  return tradeFlags
}

const Controller = createResetableComponent(function ({reset}) {
  const latestReset = useLatest(reset)
  const [chainId] = useChainId()
  const latestChainId = useRef(chainId)
  const queryClient = useQueryClient()
  const [wallet] = useWalletAccount()
  const latestWallet = useLatest(wallet)
  const accountAddress = useAccountAddress()
  const latestAccountAddress = useLatest(accountAddress)
  const tokensMetadata = getTokensMetadata(chainId)
  const {data: gasPrice} = useGasPrice()
  const {data: gasLimits} = useGasLimits()
  const {data: uiFeeFactor} = useUiFeeFactor()
  const {data: referralInfo} = useReferralInfo()
  const {data: tokenBalancesData} = useTokenBalances()

  // TODO
  const {
    // isLeverageLocked,
    // latestIsLeverageLocked,
    // setIsLeverageLocked,
    strategy,
    focusedInput,
    // latestFocusedInput,
    // setFocusedInput,
  } = useStrategy()
  const [tradeType, setTradeType] = useTradeType()
  const latestTradeType = useLatest(tradeType)
  const [tradeMode, setTradeMode] = useTradeMode()
  const latestTradeMode = useLatest(tradeMode)
  const tradeFlags = useMemo(() => getTradeFlags(tradeType, tradeMode), [tradeType, tradeMode])

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

  // Index token
  const {
    tokenAddress,
    tokenAmount,
    setTokenAmount,
    tokenAmountUsd,
    latestTokenAmountUsd,
    setTokenAmountUsd,
    tokenPrice,
    derivedTokenPrice,
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

  const handlePoolChange = useCallback(
    (value: unknown) => {
      if (typeof value !== 'string') return
      setMarketAddress(value)
    },
    [setMarketAddress],
  )

  ;(function setDefaultMarketAddress() {
    if (!tokenAddress || !availableMarkets.length) return

    const currentMarketAddressIsAvailable =
      !!marketAddress &&
      availableMarkets.map(market => market.marketTokenAddress).includes(marketAddress)

    if (!currentMarketAddressIsAvailable) {
      setMarketAddress(availableMarkets[0]?.marketTokenAddress)
    }
  })()

  // collateralToken/toToken: The token that we will swap to, from payToken
  const {
    collateralTokenAddress,
    latestCollateralTokenAddress,
    setCollateralAddress,
    collateralTokenData,
    collateralTokenAmount,
    latestCollateralTokenAmount,
    setCollateralTokenAmount,
  } = useCollateralToken()

  const handleCollateralChange = useCallback(
    (value: unknown) => {
      if (typeof value !== 'string') return
      if (!latestAvailableCollateralTokenAddresses.current.length) return
      if (!latestAvailableCollateralTokenAddresses.current.includes(value)) return
      setCollateralAddress(value)
    },
    [setCollateralAddress, latestAvailableCollateralTokenAddresses],
  )

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

  // payToken/fromToken: The token that the user pays with
  const {
    payTokenData,
    payTokenAddress,
    setPayTokenAddress,
    payTokenAmount,
    setPayTokenAmount,
    payTokenAmountUsd,
    leverageInput,
    latestLeverageInput,
    setLeverageInput,
    setLeverageInputFocused,
    leverage,
    leverageNumber,
    handleLeverageChange,
    maxLeverage,
    maxLeverageNumber,
  } = usePayToken(tradeMode, tokenAddress, tokenPrice, tokenAmountUsd, setTokenAmountUsd)

  ;(function syncPayTokenAddressWithCollateralTokenAddress() {
    if (collateralTokenAddress !== payTokenAddress) {
      setPayTokenAddress(collateralTokenAddress)
    }
    if (collateralTokenAmount !== payTokenAmount) {
      setCollateralTokenAmount(payTokenAmount)
    }
  })()

  const {
    acceptablePriceImpactBps,
    acceptablePriceImpactBpsInput,
    handleAcceptablePriceImpactBpsInputChange,
    handleAcceptablePriceImpactBpsInputBlur,
  } = useAcceptablePriceImpact()

  const {data: tokenPricesDataShortlisted} = useTokenPrices(data => {
    return {
      tokenPrice: data.get(tokenAddress ?? ''),
      payTokenPrice: data.get(payTokenAddress ?? ''),
      collateralTokenPrice: data.get(collateralTokenAddress ?? ''),
      longTokenPrice: data.get(marketData?.longTokenAddress ?? ''),
      shortTokenPrice: data.get(marketData?.shortTokenAddress ?? ''),
      feeTokenPrice: data.get(FEE_TOKEN_ADDRESS.get(chainId) ?? ''),
    }
  })

  const {data: positionConstants} = usePositionsConstants()

  const priceFractionDigits = calculatePriceFractionDigits(
    tokenAddress && tokenPricesDataShortlisted ? tokenPricesDataShortlisted.tokenPrice?.min : 0,
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

    let longTokenPrice = tokenPricesDataShortlisted?.longTokenPrice?.min ?? 0n
    let shortTokenPrice = tokenPricesDataShortlisted?.shortTokenPrice?.min ?? 0n

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

  const isValidSize = tokenAmountUsd <= availableLiquidityUsd

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

  const {data: marketsData} = useMarketsData()
  const {data: tokenPricesData} = useTokenPrices(data => data)

  const swapAmounts = (() => {
    const payToken = payTokenAddress ? tokensMetadata.get(payTokenAddress) : undefined
    const payTokenPrice = tokenPricesDataShortlisted?.payTokenPrice?.min
    const collateralToken = collateralTokenAddress
      ? tokensMetadata.get(collateralTokenAddress)
      : undefined
    const tradeFlags = getTradeFlags(TradeType.Swap, tradeMode)

    if (!payToken || !collateralToken || !tokenPricesData || !payTokenPrice) return undefined

    const findSwapPath = createFindSwapPath(
      payTokenAddress,
      tradeFlags.isPosition ? collateralTokenAddress : collateralTokenAddress,
      marketsData,
      tokenPricesData,
    )

    const {markRatio, triggerRatio} = getTradeRatios({
      chainId,
      tradeFlags,
      fromTokenAddress: payTokenAddress,
      toTokenAddress: collateralTokenAddress,
      tokenPrice: derivedTokenPrice,
      tokenPricesData,
    })

    if (markRatio === undefined) return undefined

    if (focusedInput === 'from') {
      return getSwapAmountsByFromValue({
        tokenIn: payToken,
        tokenOut: collateralToken,
        amountIn: payTokenAmount,
        triggerRatio: triggerRatio ?? markRatio,
        isLimit: tradeFlags.isLimit,
        findSwapPath,
        uiFeeFactor,
        tokenPricesData,
      })
    } else {
      return getSwapAmountsByToValue({
        tokenIn: payToken,
        tokenOut: collateralToken,
        amountOut: collateralTokenAmount,
        triggerRatio: triggerRatio ?? markRatio,
        isLimit: tradeFlags.isLimit,
        findSwapPath,
        uiFeeFactor,
        tokenPricesData,
      })
    }
  })()

  const {data: positions} = usePositionsInfoData(data => data.positionsInfoViaStringRepresentation)

  const position = useMemo(() => {
    if (!accountAddress || !marketData?.marketTokenAddress || !collateralTokenAddress)
      return undefined
    const positionString = getStringReprenetationOfPosition(
      accountAddress,
      marketData.marketTokenAddress,
      collateralTokenAddress,
      tradeFlags.isLong,
    )

    return positions?.get(positionString)
  }, [
    accountAddress,
    collateralTokenAddress,
    marketData?.marketTokenAddress,
    tradeFlags.isLong,
    positions,
  ])

  const increaseAmounts = (() => {
    console.log({collateralTokenData, payTokenData, tokenPricesData, marketData, referralInfo})

    if (!collateralTokenData || !payTokenData || !tokenPricesData || !marketData) return undefined

    // const tokenTypeForSwapRoute = tradeFlags.isPosition ? 'collateralToken' : 'indexToken'

    const findSwapPath = createFindSwapPath(
      payTokenAddress,
      // TODO: what is this logic?
      // tokenTypeForSwapRoute === 'indexToken' ? indexTokenAddress : collateralTokenAddress,
      collateralTokenAddress,
      marketsData,
      tokenPricesData,
    )

    return getIncreasePositionAmounts({
      marketInfo: marketData,
      collateralToken: collateralTokenData,
      collateralTokenAmount,
      initialCollateralToken: payTokenData,
      initialCollateralAmount: payTokenAmount,
      isLong: tradeFlags.isLong,
      leverage,
      triggerPrice: tradeFlags.isLimit ? derivedTokenPrice : undefined,
      position,
      fixedAcceptablePriceImpactBps: acceptablePriceImpactBps,
      acceptablePriceImpactBuffer: 100, // TODO: settings
      findSwapPath,
      userReferralInfo: referralInfo,
      uiFeeFactor,
      strategy,
      tokenPricesData,
    })
  })()

  console.log(increaseAmounts)

  // const decreaseAmounts = (() => {})()

  // const tradeFees = (() => {
  //   const tradeFeesType = (() => {
  //     if (tradeType === TradeType.Swap) return 'swap'
  //     if (tradeMode === TradeMode.Trigger) return 'decrease'
  //     return 'increase'
  //   })()

  //   switch (tradeFeesType) {
  //     case 'swap': {
  //       if (!swapAmounts?.swapPathStats) return undefined

  //       return getTradeFees({
  //         initialCollateralUsd: swapAmounts.usdIn,
  //         collateralDeltaUsd: 0n,
  //         sizeDeltaUsd: 0n,
  //         swapSteps: swapAmounts.swapPathStats.swapSteps,
  //         positionFeeUsd: 0n,
  //         swapPriceImpactDeltaUsd: swapAmounts.swapPathStats.totalSwapPriceImpactDeltaUsd,
  //         positionPriceImpactDeltaUsd: 0n,
  //         priceImpactDiffUsd: 0n,
  //         borrowingFeeUsd: 0n,
  //         fundingFeeUsd: 0n,
  //         feeDiscountUsd: 0n,
  //         swapProfitFeeUsd: 0n,
  //         uiFeeFactor,
  //       })
  //     }
  //     case 'increase': {
  //       if (!increaseAmounts) return undefined

  //       return getTradeFees({
  //         initialCollateralUsd: increaseAmounts.initialCollateralUsd,
  //         collateralDeltaUsd: increaseAmounts.initialCollateralUsd, // pay token amount in usd
  //         sizeDeltaUsd: increaseAmounts.sizeDeltaUsd,
  //         swapSteps: increaseAmounts.swapPathStats?.swapSteps ?? [],
  //         positionFeeUsd: increaseAmounts.positionFeeUsd,
  //         swapPriceImpactDeltaUsd:
  //           increaseAmounts.swapPathStats?.totalSwapPriceImpactDeltaUsd ?? 0n,
  //         positionPriceImpactDeltaUsd: increaseAmounts.positionPriceImpactDeltaUsd,
  //         priceImpactDiffUsd: 0n,
  //         borrowingFeeUsd: position?.pendingBorrowingFeesUsd ?? 0n,
  //         fundingFeeUsd: position?.pendingFundingFeesUsd ?? 0n,
  //         feeDiscountUsd: increaseAmounts.feeDiscountUsd,
  //         swapProfitFeeUsd: 0n,
  //         uiFeeFactor,
  //       })
  //     }
  //     case 'decrease': {
  //       if (!decreaseAmounts || !position) return undefined

  //       const sizeReductionBps =
  //         (decreaseAmounts.sizeDeltaUsd * BASIS_POINTS_DIVISOR_BIGINT) / position.sizeInUsd

  //       const collateralDeltaUsd =
  //         (position.collateralUsd * sizeReductionBps) / BASIS_POINTS_DIVISOR_BIGINT

  //       return getTradeFees({
  //         initialCollateralUsd: position.collateralUsd,
  //         collateralDeltaUsd,
  //         sizeDeltaUsd: decreaseAmounts.sizeDeltaUsd,
  //         swapSteps: [],
  //         positionFeeUsd: decreaseAmounts.positionFeeUsd,
  //         swapPriceImpactDeltaUsd: 0n,
  //         positionPriceImpactDeltaUsd: decreaseAmounts.positionPriceImpactDeltaUsd,
  //         priceImpactDiffUsd: decreaseAmounts.priceImpactDiffUsd,
  //         borrowingFeeUsd: decreaseAmounts.borrowingFeeUsd,
  //         fundingFeeUsd: decreaseAmounts.fundingFeeUsd,
  //         feeDiscountUsd: decreaseAmounts.feeDiscountUsd,
  //         swapProfitFeeUsd: decreaseAmounts.swapProfitFeeUsd,
  //         uiFeeFactor,
  //       })
  //     }
  //     default:
  //       return undefined
  //   }
  // })()

  // console.log(tradeFees)

  const executionFee = useMemo(() => {
    const {isIncrease, isTrigger, isSwap} = tradeFlags
    const feeTokenPrice = tokenPricesDataShortlisted?.feeTokenPrice
    if (!feeTokenPrice || !gasLimits || !gasPrice) return undefined

    let estimatedGas: bigint | undefined

    if (isIncrease) {
      estimatedGas = estimateExecuteOrderGasLimit('increase', gasLimits, {
        swapPath: increaseAmounts?.swapPathStats?.swapPath,
      })
    }

    if (isTrigger) {
      estimatedGas = estimateExecuteOrderGasLimit('decrease', gasLimits, {})
    }

    if (isSwap) {
      estimatedGas = estimateExecuteOrderGasLimit('swap', gasLimits, {
        swapPath: swapAmounts?.swapPathStats?.swapPath,
      })
    }

    if (!estimatedGas) return undefined

    return getExecutionFee(gasLimits, feeTokenPrice, estimatedGas, gasPrice)
  }, [
    tradeFlags,
    tokenPricesDataShortlisted?.feeTokenPrice,
    gasLimits,
    gasPrice,
    increaseAmounts?.swapPathStats?.swapPath,
    swapAmounts?.swapPathStats?.swapPath,
  ])

  //----------------------------------------------------------------------------

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

  const onLeverageInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      const v = e.target.value
      setLeverageInput(v)
    },
    [setLeverageInput],
  )

  const onLeverageInputKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    e => {
      if (e.key === 'Enter') {
        handleLeverageChange(latestLeverageInput.current)
      }
    },
    [handleLeverageChange, latestLeverageInput],
  )

  const onLeverageInputFocus = useCallback(() => {
    setLeverageInputFocused(true)
  }, [setLeverageInputFocused])

  const onLeverageInputBlur = useCallback(() => {
    setLeverageInputFocused(false)
  }, [setLeverageInputFocused])

  const sliderRenderValue = useCallback(
    (props: DOMAttributes<HTMLOutputElement>) => (
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
              leverage > 0n && !isValidLeverage ? 'border-danger-500' : 'border-transparent',
            )}
            type='text'
            aria-label='Leverage value'
            value={leverageInput}
            onChange={onLeverageInputChange}
            max={maxLeverageNumber}
            onKeyDown={onLeverageInputKeyDown}
            onFocus={onLeverageInputFocus}
            onBlur={onLeverageInputBlur}
          />
        </Tooltip>
      </output>
    ),
    [
      isValidLeverage,
      leverage,
      leverageInput,
      maxLeverageNumber,
      onLeverageInputBlur,
      onLeverageInputChange,
      onLeverageInputFocus,
      onLeverageInputKeyDown,
    ],
  )

  return (
    <div className='flex w-full min-w-80 flex-col md:max-w-sm'>
      <Card>
        <CardBody>
          <Tabs
            size='lg'
            selectedKey={tradeType}
            onSelectionChange={handleChangeTradeType}
            aria-label='Trade type'
            classNames={TABS_CLASS_NAMES}
            color={tradeType === TradeType.Long ? 'success' : 'danger'}
          >
            {SUPPORTED_TRADE_TYPES.map(type => (
              <Tab key={type} title={TRADE_TYPE_LABEL[type]} className='font-serif' />
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
              <Tab key={type} title={TRADE_MODE_LABEL[type]} className='font-serif' />
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
            classNames={SLIDER_CLASS_NAMES}
            renderValue={sliderRenderValue}
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
          {tradeMode === TradeMode.Limit && (
            <>
              <Divider className='mt-3 opacity-50' />
              <div className='mt-3 flex w-full justify-between text-sm'>
                <div className='flex items-center'>Acceptable Price Impact</div>
                <Input
                  type='text'
                  size='sm'
                  value={acceptablePriceImpactBpsInput}
                  className='w-20'
                  classNames={ACCEPTABLE_PRICE_IMPACT_CLASS_NAMES}
                  startContent={<div className='text-tiny'>-</div>}
                  endContent={<div className='text-tiny'>%</div>}
                  onChange={handleAcceptablePriceImpactBpsInputChange}
                  onBlur={handleAcceptablePriceImpactBpsInputBlur}
                />
              </div>
            </>
          )}
          <Divider className='mt-3 opacity-50' />
          <div className='text-sm'>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Execution Price</div>
              <div className='flex items-center'>{executionPriceText}</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Liquidation Price</div>
              <div className='flex items-center underline decoration-pink-600 decoration-wavy decoration-1 underline-offset-4'>
                {liquidationPriceText}
              </div>
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
              <div className='flex items-center'>
                {formatNumber(shrinkDecimals(executionFee?.feeUsd, USD_DECIMALS), Format.USD, {
                  exactFractionDigits: true,
                  fractionDigits: 2,
                })}
              </div>
            </div>
          </div>
          <div className='mt-4 w-full'>
            <Tooltip showArrow color='danger' content={invalidMessage} isDisabled={isValidOrder}>
              <Button
                color='primary'
                className='w-full font-serif'
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
    </div>
  )
})

export default Controller
