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
} from '@heroui/react'
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
import invariant from 'tiny-invariant'
import {OrderType} from 'wolfy-sdk'

import {DEFAULT_SLIPPAGE, LEVERAGE_DECIMALS, SLIPPAGE_PRECISION} from '@/constants/config'
import {FEE_TOKEN_ADDRESS, getTokensMetadata} from '@/constants/tokens'
import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useConnect from '@/lib/starknet/hooks/useConnect'
import useIsWalletConnected from '@/lib/starknet/hooks/useIsWalletConnected'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import getScanUrl, {ScanType} from '@/lib/starknet/utils/getScanUrl'
import useFeeToken from '@/lib/trade/hooks/useFeeToken'
import useGasLimits from '@/lib/trade/hooks/useGasLimits'
import useGasPrice from '@/lib/trade/hooks/useGasPrice'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import usePositionsConstants from '@/lib/trade/hooks/usePositionConstants'
import usePositionsInfoData from '@/lib/trade/hooks/usePositionsInfoData'
import useReferralInfo from '@/lib/trade/hooks/useReferralInfo'
import useTokenBalances from '@/lib/trade/hooks/useTokenBalances'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import useUiFeeFactor from '@/lib/trade/hooks/useUiFeeFactor'
import {BASIS_POINTS_DIVISOR_BIGINT, USD_DECIMALS} from '@/lib/trade/numbers/constants'
import {DEFAULT_GAS_LIMITS} from '@/lib/trade/services/fetchGasLimits'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import {getStringReprenetationOfPosition} from '@/lib/trade/services/fetchPositions'
import {DEFAULT_POSITION_CONSTANTS} from '@/lib/trade/services/fetchPositionsConstants'
import sendOrder from '@/lib/trade/services/order/sendOrder'
import useTradeMode, {TRADE_MODE_LABEL, TradeMode} from '@/lib/trade/states/useTradeMode'
import useTradeType, {TRADE_TYPE_LABEL, TradeType} from '@/lib/trade/states/useTradeType'
import estimateExecuteOrderGasLimit from '@/lib/trade/utils/fee/estimateExecuteOrderGasLimit'
import {getExecutionFee} from '@/lib/trade/utils/fee/getExecutionFee'
import {getTradeFees} from '@/lib/trade/utils/fee/getTradeFees'
import getDecreasePositionAmounts from '@/lib/trade/utils/order/decrease/getDecreasePositionAmounts'
import {getIncreasePositionAmounts} from '@/lib/trade/utils/order/increase/getIncreasePositionAmounts'
import {getSwapAmountsByFromValue} from '@/lib/trade/utils/order/swap/getSwapAmountsByFromValue'
import {getSwapAmountsByToValue} from '@/lib/trade/utils/order/swap/getSwapAmountsByToValue'
import getLiquidationPrice from '@/lib/trade/utils/position/getLiquidationPrice'
import {getEntryPrice, type PositionsInfoData} from '@/lib/trade/utils/position/getPositionsInfo'
import calculatePriceFractionDigits from '@/lib/trade/utils/price/calculatePriceFractionDigits'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import errorMessageOrUndefined from '@/utils/errors/errorMessageOrUndefined'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'
import markAsMemoized from '@/utils/react/markAsMemoized'
import createResetableComponent from '@/utils/reset-component/createResettableComponent'

import useAcceptablePriceImpact from './hooks/useAcceptablePriceImpact'
import useAvailableMarketsForIndexToken from './hooks/useAvailableMarketsForIndexToken'
import useCollateralToken from './hooks/useCollateralToken'
import useMarket from './hooks/useMarket'
import usePayToken from './hooks/usePayToken'
import useStrategy from './hooks/useStrategy'
import useToken from './hooks/useToken'
import useTradeFlags from './hooks/useTradeFlags'
import PoolSelectDropdown from './PoolSelectDropdown'
import TokenInputs from './TokenInputs'
import createFindSwapPath from './utils/createFindSwapPath'
import getTradeFlags from './utils/getTradeFlags'
import getTradeRatios from './utils/getTradeRatios'

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

const DEFAULT_AVAILABLE_MARKETS: MarketData[] = []

const selectPositionsInfoViaStringRepresentation = markAsMemoized(
  (data: PositionsInfoData) => data.positionsInfoViaStringRepresentation,
)

const Controller = createResetableComponent(({reset}) => {
  const latestReset = useLatest(reset)
  const [chainId] = useChainId()
  const latestChainId = useRef(chainId)
  const queryClient = useQueryClient()
  const [wallet] = useWalletAccount()
  const latestWallet = useLatest(wallet)
  const accountAddress = useAccountAddress()
  const latestAccountAddress = useLatest(accountAddress)
  const tokensMetadata = getTokensMetadata(chainId)
  const {data: gasPrice = 0n} = useGasPrice()
  const {data: gasLimits = DEFAULT_GAS_LIMITS} = useGasLimits()
  const {data: uiFeeFactor = 0n} = useUiFeeFactor()
  const {data: referralInfo} = useReferralInfo()
  const {data: tokenBalancesData = new Map()} = useTokenBalances()

  // TODO
  const {
    // isLeverageLocked,
    // latestIsLeverageLocked,
    // setIsLeverageLocked,
    // strategy,
    focusedInput,
    // latestFocusedInput,
    // setFocusedInput,
  } = useStrategy()
  const [tradeType, setTradeType] = useTradeType()
  const latestTradeType = useLatest(tradeType)
  const [tradeMode, setTradeMode] = useTradeMode()
  const latestTradeMode = useLatest(tradeMode)
  const tradeFlags = useTradeFlags(tradeType, tradeMode)

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

  const {data: availableMarkets = DEFAULT_AVAILABLE_MARKETS} =
    useAvailableMarketsForIndexToken(tokenAddress)

  const {
    marketAddress,
    latestMarketAddress,
    setMarketAddress,
    availableCollateralTokenAddresses,
    latestAvailableCollateralTokenAddresses,
    poolName,
    marketData,
  } = useMarket(tokenAddress, availableMarkets)

  const handlePoolChange = useCallback(
    (value: unknown) => {
      if (typeof value !== 'string') return
      setMarketAddress(value)
    },
    [setMarketAddress],
  )

  // collateralToken/toToken: The token that we will swap to, from payToken
  const {
    collateralTokenAddress,
    latestCollateralTokenAddress,
    setCollateralAddress,
    collateralTokenData,
    collateralTokenAmount,
    latestCollateralTokenAmount,
    setCollateralTokenAmount,
  } = useCollateralToken(availableCollateralTokenAddresses)

  const handleCollateralChange = useCallback(
    (value: unknown) => {
      if (typeof value !== 'string') return
      if (!latestAvailableCollateralTokenAddresses.current.length) return
      if (!latestAvailableCollateralTokenAddresses.current.includes(value)) return
      setCollateralAddress(value)
    },
    [setCollateralAddress, latestAvailableCollateralTokenAddresses],
  )

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
    leverageInputIsFocused,
    handleLeverageChangeEnd,
    setLeverageInput,
    setLeverageInputFocused,
    leverage,
    leverageNumber,
    handleLeverageChange,
    maxLeverage,
    maxLeverageNumber,
  } = usePayToken(
    tradeMode,
    tokenAddress,
    tokenPrice,
    tokenAmountUsd,
    setTokenAmountUsd,
    marketData?.minCollateralFactor,
  )

  // TODO: drop this behavior in the future when we support pay token other than collateral token
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

  // TODO: optimize, extract this query to a single function to avoid closure memory leak
  const {
    data: tokenPricesDataShortlisted = {
      tokenPrice: undefined,
      payTokenPrice: undefined,
      collateralTokenPrice: undefined,
      longTokenPrice: undefined,
      shortTokenPrice: undefined,
      feeTokenPrice: undefined,
    },
  } = useTokenPrices(
    useCallback(
      data => {
        const feeTokenAddress = FEE_TOKEN_ADDRESS.get(chainId)
        invariant(feeTokenAddress, `No fee token found for chainId ${chainId}`)

        return {
          tokenPrice: tokenAddress ? data.get(tokenAddress) : undefined,
          payTokenPrice: payTokenAddress ? data.get(payTokenAddress) : undefined,
          collateralTokenPrice: collateralTokenAddress
            ? data.get(collateralTokenAddress)
            : undefined,
          longTokenPrice: marketData?.longTokenAddress
            ? data.get(marketData.longTokenAddress)
            : undefined,
          shortTokenPrice: marketData?.shortTokenAddress
            ? data.get(marketData.shortTokenAddress)
            : undefined,
          feeTokenPrice: data.get(feeTokenAddress),
        }
      },
      [
        chainId,
        collateralTokenAddress,
        marketData?.longTokenAddress,
        marketData?.shortTokenAddress,
        payTokenAddress,
        tokenAddress,
      ],
    ),
  )

  const {data: positionConstants = DEFAULT_POSITION_CONSTANTS} = usePositionsConstants()

  const priceFractionDigits = calculatePriceFractionDigits(
    tokenAddress ? tokenPricesDataShortlisted.tokenPrice?.min : 0,
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
      minCollateralUsd: positionConstants.minCollateralUsd,
      isLong: tradeType === TradeType.Long,
      useMaxPriceImpact: false, // nOTE: Should be true when the configuration is right
      referralInfo,
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

    let longTokenPrice = tokenPricesDataShortlisted.longTokenPrice?.min ?? 0n
    let shortTokenPrice = tokenPricesDataShortlisted.shortTokenPrice?.min ?? 0n

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
    !!payTokenAddress && payTokenAmount <= (tokenBalancesData.get(payTokenAddress) ?? 0n)
  const isValidTokenAmount = tokenAmount > 0n
  const isValidLeverage = leverage > 0n && leverage <= maxLeverage
  const isValidOrder = isValidLeverage && isValidTokenAmount && isValidPayTokenAmount && isValidSize

  const invalidMessage = (() => {
    if (!isConnected) return 'Please connect your wallet before trading'
    if (!isValidTokenAmount) return 'Order size must be greater than 0'
    if (!isValidPayTokenAmount) return 'Insufficient collateral balance'
    if (!isValidSize) return 'Insufficient liquidity'
    if (!isValidLeverage)
      return `Leverage must be between 1 and ${formatNumber(
        shrinkDecimals(maxLeverage, LEVERAGE_DECIMALS),
        Format.PLAIN,
        {
          exactFractionDigits: true,
          fractionDigits: 0,
        },
      )}`
    return ''
  })()

  const {data: marketsData = new Map()} = useMarketsData()
  //TODO: optimize, do not subscribe to entire token prices
  const {data: tokenPricesData = new Map()} = useTokenPrices()

  const swapAmounts = (() => {
    const payToken = payTokenAddress ? tokensMetadata.get(payTokenAddress) : undefined
    const payTokenPrice = tokenPricesDataShortlisted.payTokenPrice?.min
    const collateralToken = collateralTokenAddress
      ? tokensMetadata.get(collateralTokenAddress)
      : undefined
    const tradeFlags = getTradeFlags(TradeType.Swap, tradeMode)

    if (!payToken || !collateralToken || !payTokenPrice) return undefined

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
    }
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
  })()

  // TODO: optimize, extract this query to a single function to avoid closure memory leak
  const {data: positions = new Map()} = usePositionsInfoData(
    selectPositionsInfoViaStringRepresentation,
  )

  const position = useMemo(() => {
    if (!accountAddress || !marketData?.marketTokenAddress || !collateralTokenAddress)
      return undefined
    const positionString = getStringReprenetationOfPosition(
      accountAddress,
      marketData.marketTokenAddress,
      collateralTokenAddress,
      tradeFlags.isLong,
    )

    return positions.get(positionString)
  }, [
    accountAddress,
    collateralTokenAddress,
    marketData?.marketTokenAddress,
    tradeFlags.isLong,
    positions,
  ])

  const increaseAmounts = (() => {
    if (!collateralTokenData || !payTokenData || !marketData) return undefined

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
      strategy: 'leverageByCollateral',
      tokenPricesData,
    })
  })()

  const decreaseAmounts = (() => {
    if (!marketData || !collateralTokenData || !position) return undefined

    const closeSizeUsd = 0n
    const keepLeverage = true
    const minCollateralUsd = 0n
    const minPositionSizeUsd = 0n

    // const receiveToken = collateralTokenAddress ? getByKey(tokensData, receiveTokenAddress) : undefined;
    const receiveToken = undefined

    return getDecreasePositionAmounts({
      marketInfo: marketData,
      collateralToken: collateralTokenData,
      isLong: tradeFlags.isLong,
      position,
      closeSizeUsd,
      keepLeverage,
      triggerPrice: derivedTokenPrice,
      fixedAcceptablePriceImpactBps: acceptablePriceImpactBps,
      acceptablePriceImpactBuffer: 100, // TODO: settings
      userReferralInfo: referralInfo,
      minCollateralUsd,
      minPositionSizeUsd,
      uiFeeFactor,
      receiveToken,
      tokenPricesData,
    })
  })()

  const tradeFees = (() => {
    const tradeFeesType = (() => {
      if (tradeType === TradeType.Swap) return 'swap'
      if (tradeMode === TradeMode.Trigger) return 'decrease'
      return 'increase'
    })()

    switch (tradeFeesType) {
      case 'swap': {
        if (!swapAmounts?.swapPathStats) return undefined

        return getTradeFees({
          initialCollateralUsd: swapAmounts.usdIn,
          collateralDeltaUsd: 0n,
          sizeDeltaUsd: 0n,
          swapSteps: swapAmounts.swapPathStats.swapSteps,
          positionFeeUsd: 0n,
          swapPriceImpactDeltaUsd: swapAmounts.swapPathStats.totalSwapPriceImpactDeltaUsd,
          positionPriceImpactDeltaUsd: 0n,
          priceImpactDiffUsd: 0n,
          borrowingFeeUsd: 0n,
          fundingFeeUsd: 0n,
          feeDiscountUsd: 0n,
          swapProfitFeeUsd: 0n,
          uiFeeFactor,
        })
      }
      case 'increase': {
        if (!increaseAmounts) return undefined

        return getTradeFees({
          initialCollateralUsd: increaseAmounts.initialCollateralUsd,
          collateralDeltaUsd: increaseAmounts.initialCollateralUsd, // pay token amount in usd
          sizeDeltaUsd: increaseAmounts.sizeDeltaUsd,
          swapSteps: increaseAmounts.swapPathStats?.swapSteps ?? [],
          positionFeeUsd: increaseAmounts.positionFeeUsd,
          swapPriceImpactDeltaUsd:
            increaseAmounts.swapPathStats?.totalSwapPriceImpactDeltaUsd ?? 0n,
          positionPriceImpactDeltaUsd: increaseAmounts.positionPriceImpactDeltaUsd,
          priceImpactDiffUsd: 0n,
          borrowingFeeUsd: position?.pendingBorrowingFeesUsd ?? 0n,
          fundingFeeUsd: position?.pendingFundingFeesUsd ?? 0n,
          feeDiscountUsd: increaseAmounts.feeDiscountUsd,
          swapProfitFeeUsd: 0n,
          uiFeeFactor,
        })
      }
      case 'decrease': {
        if (!decreaseAmounts || !position) return undefined
        const sizeReductionBps =
          (decreaseAmounts.sizeDeltaUsd * BASIS_POINTS_DIVISOR_BIGINT) / position.sizeInUsd
        const collateralDeltaUsd =
          (position.collateralUsd * sizeReductionBps) / BASIS_POINTS_DIVISOR_BIGINT

        return getTradeFees({
          initialCollateralUsd: position.collateralUsd,
          collateralDeltaUsd,
          sizeDeltaUsd: decreaseAmounts.sizeDeltaUsd,
          swapSteps: [],
          positionFeeUsd: decreaseAmounts.positionFeeUsd,
          swapPriceImpactDeltaUsd: 0n,
          positionPriceImpactDeltaUsd: decreaseAmounts.positionPriceImpactDeltaUsd,
          priceImpactDiffUsd: decreaseAmounts.priceImpactDiffUsd,
          borrowingFeeUsd: decreaseAmounts.borrowingFeeUsd,
          fundingFeeUsd: decreaseAmounts.fundingFeeUsd,
          feeDiscountUsd: decreaseAmounts.feeDiscountUsd,
          swapProfitFeeUsd: decreaseAmounts.swapProfitFeeUsd,
          uiFeeFactor,
        })
      }
    }
  })()

  const tradeFeeUsdText = tradeFees?.totalFees
    ? formatNumber(shrinkDecimals(tradeFees.totalFees.deltaUsd, USD_DECIMALS), Format.USD, {
        fractionDigits: 2,
      })
    : '-'

  const {feeToken} = useFeeToken()
  const latestFeeToken = useLatest(feeToken)

  const executionFee = useMemo(() => {
    const {isIncrease, isTrigger, isSwap} = tradeFlags
    const feeTokenPrice = tokenPricesDataShortlisted.feeTokenPrice
    if (!feeTokenPrice || !gasPrice) return undefined

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

    invariant(estimatedGas !== undefined, 'Estimated gas is undefined')

    return getExecutionFee(gasLimits, feeTokenPrice, estimatedGas, gasPrice, feeToken)
  }, [
    feeToken,
    tradeFlags,
    tokenPricesDataShortlisted.feeTokenPrice,
    gasLimits,
    gasPrice,
    increaseAmounts?.swapPathStats?.swapPath,
    swapAmounts?.swapPathStats?.swapPath,
  ])
  const executionFeeUsdText = `-${formatNumber(
    shrinkDecimals(executionFee?.feeUsd, USD_DECIMALS),
    Format.USD,
    {
      fractionDigits: 6,
    },
  )}`
  const executionFeeText = `-${formatNumber(
    shrinkDecimals(executionFee?.feeTokenAmount, feeToken.decimals),
    Format.READABLE,
    {
      fractionDigits: 8,
    },
  )} ${feeToken.symbol}`
  const latestExecutionFee = useLatest(executionFee)

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
    const executionFeeAmount = latestExecutionFee.current?.feeTokenAmount

    if (!market) return
    if (!receiver) return
    if (!initialCollateralToken) return
    if (executionFeeAmount === undefined) return

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
        case TradeMode.Trigger:
          throw new Error('Unsupported trade mode')
      }
    })()

    setIsPlacing(true)
    toast.promise(
      sendOrder(
        latestWallet.current,
        {
          receiver,
          market,
          initialCollateralToken,
          sizeDeltaUsd,
          initialCollateralDeltaAmount,
          swapPath: [],
          executionFee: executionFeeAmount,
          minOutputAmount: 0n,
          orderType,
          isLong,
          triggerPrice,
          acceptablePrice,
          referralCode: 0,
        },
        latestFeeToken.current,
      ),
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
          return <div>{errorMessageOrUndefined(error) ?? 'Place order failed.'}</div>
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
          showArrow
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
    <div className='flex w-full flex-col md:max-w-[26rem] lg:max-w-[30rem]'>
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
            <PoolSelectDropdown
              availableMarkets={availableMarkets}
              poolName={poolName}
              handlePoolChange={handlePoolChange}
            />
          </div>
          {tradeMode !== TradeMode.Trigger && (
            <TokenInputs
              marketAddress={marketAddress}
              tradeType={tradeType}
              tradeMode={tradeMode}
              availablePayTokenAddresses={availableCollateralTokenAddresses}
              payTokenAmount={payTokenAmount}
              setPayTokenAmount={setPayTokenAmount}
              payTokenAddress={collateralTokenAddress}
              setPayTokenAddress={setCollateralAddress}
              tokenAmount={tokenAmount}
              setTokenAmount={setTokenAmount}
              tokenAmountUsd={tokenAmountUsd}
              tokenPrice={tokenPrice}
              setTokenPrice={setTokenPrice}
              sync={!leverageInputIsFocused}
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
            renderValue={sliderRenderValue}
            value={leverageNumber}
            onChange={handleLeverageChange}
            onChangeEnd={handleLeverageChangeEnd}
            // TODO: generate marks based on maximum leverage
            marks={[
              {
                value: 1,
                label: '1',
              },
              {
                value: 10,
                label: '10',
              },
              {
                value: 25,
                label: '25',
              },
              {
                value: 50,
                label: '50',
              },
              {
                value: 75,
                label: '75',
              },
              {
                value: 100,
                label: '100',
              },
            ]}
          />
          <div className='mt-2 flex w-full justify-between'>
            <div className='flex items-center'>Collateral in</div>
            <Dropdown backdrop='opaque'>
              <DropdownTrigger>
                <Button variant='flat' className='flex items-center gap-2'>
                  {collateralTokenData?.imageUrl && (
                    <img src={collateralTokenData.imageUrl} alt='' className='size-6' />
                  )}
                  {collateralTokenData?.symbol}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='Change collateral' onAction={handleCollateralChange}>
                {availableCollateralTokenAddresses.map(tokenAddress => {
                  const token = tokensMetadata.get(tokenAddress)

                  return (
                    <DropdownItem key={tokenAddress}>
                      <div className='flex items-center gap-2'>
                        <img src={token?.imageUrl} alt='' className='size-6' />
                        {token?.symbol}
                      </div>
                    </DropdownItem>
                  )
                })}
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
                  classNames={{
                    input: 'text-right',
                    inputWrapper: 'data-[hover=true]:bg-default-200',
                  }}
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
              <div className='flex items-center'>{tradeFeeUsdText}</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Network Fee</div>
              <div className='flex flex-col items-center justify-end'>
                <div className='flex w-full justify-end'>{executionFeeUsdText}</div>
                <div className='flex w-full justify-end text-xs'>{executionFeeText}</div>
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
                {(() => {
                  if (!isConnected) return 'Connect Wallet'
                  if (isPlacing) return 'Placing Order...'
                  return 'Place Order'
                })()}
              </Button>
            </Tooltip>
          </div>
        </CardBody>
      </Card>
    </div>
  )
})

export default Controller
