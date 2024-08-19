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
import {type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState} from 'react'
import type {Key} from 'react-aria-components'
import {useLatest} from 'react-use'
import {toast} from 'sonner'

import useGasPrice from '@/lib/trade/hooks/useGasPrice'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import useTokensData from '@/lib/trade/hooks/useTokensData'
import useTokenAddress from '@/lib/trade/states/useTokenAddress'
import useTradeMode, {TradeMode} from '@/lib/trade/states/useTradeMode'
import useTradeType, {TradeType} from '@/lib/trade/states/useTradeType'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'

import TokenInputs from './TokenInputs'

const TRADE_TYPE_LABEL: Record<TradeType, string> = {
  [TradeType.Long]: 'Long',
  [TradeType.Short]: 'Short',
  [TradeType.Swap]: 'Swap',
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

const TRADE_MODE_LABEL: Record<TradeMode, string> = {
  [TradeMode.Market]: 'Market',
  [TradeMode.Limit]: 'Limit',
  [TradeMode.Trigger]: 'TP/SL',
}

const SUPPORTED_TRADE_TYPES: TradeType[] = [TradeType.Long, TradeType.Short, TradeType.Swap]

function useToken(tradeMode: TradeMode) {
  const tokensData = useTokensData()
  const [tokenAddress] = useTokenAddress()
  const tokenData = tokenAddress ? tokensData?.get(tokenAddress) : undefined
  const tokenDecimals = tokenData?.decimals ?? 0

  const [tokenAmountUsd, setTokenAmountUsd] = useState(0n)
  const [tokenPrice, setTokenPrice] = useState<bigint>()
  const derivedTokenPrice =
    tokenPrice && tradeMode !== TradeMode.Market ? tokenPrice : (tokenData?.price.min ?? 0n)

  const tokenAmount = useMemo(() => {
    if (!derivedTokenPrice) return 0n
    return convertUsdToTokenAmount(tokenAmountUsd, tokenDecimals, derivedTokenPrice)
  }, [derivedTokenPrice, tokenAmountUsd, tokenDecimals])

  const setTokenAmount = useCallback(
    (tokenAmount: bigint) => {
      const tokenAmountUsd = convertTokenAmountToUsd(tokenAmount, tokenDecimals, derivedTokenPrice)
      setTokenAmountUsd(tokenAmountUsd)
    },
    [derivedTokenPrice, tokenDecimals],
  )

  return {
    tokenAddress,
    tokenData,
    tokenAmount,
    tokenAmountUsd,
    setTokenAmount,
    tokenPrice,
    setTokenPrice,
    setTokenAmountUsd,
  }
}

function useAvailableMarketsForIndexToken(indexTokenAddress: string | undefined) {
  const marketsData = useMarketsData()

  return useMemo(() => {
    if (!indexTokenAddress || !marketsData?.size) return []

    const markets = Array.from(marketsData.values())

    return markets.filter(market => market.indexTokenAddress === indexTokenAddress)
  }, [marketsData, indexTokenAddress])
}

function useMarket() {
  const marketsData = useMarketsData()
  const [marketAddress, setMarketAddress] = useState<string>()
  const latestMarketAddress = useLatest(marketAddress)

  const marketData = useMemo(
    () => (marketAddress ? marketsData?.get(marketAddress) : undefined),
    [marketAddress, marketsData],
  )
  const latestMarketData = useLatest(marketData)

  const poolName = marketData && getMarketPoolName(marketData)

  const availableCollateralTokenAddresses = useMemo(
    () => (marketData ? [marketData.longTokenAddress, marketData.shortTokenAddress] : []),
    [marketData],
  )
  const latestAvailableCollateralTokenAddresses = useLatest(availableCollateralTokenAddresses)

  return {
    marketAddress,
    setMarketAddress,
    latestMarketAddress,
    marketData,
    latestMarketData,
    availableCollateralTokenAddresses,
    latestAvailableCollateralTokenAddresses,
    poolName,
  }
}

function usePayToken(
  tradeMode: TradeMode,
  tokenAddress: string | undefined,
  tokenPrice: bigint | undefined,
  tokenAmountUsd: bigint,
  setTokenAmountUsd: Dispatch<SetStateAction<bigint>>,
) {
  const tokensData = useTokensData()

  const [payTokenAddress, setPayTokenAddress] = useState<string>()

  const payTokenData = payTokenAddress ? tokensData?.get(payTokenAddress) : undefined
  const payTokenDecimals = payTokenData?.decimals ?? 0
  const latestPayTokenDecimals = useLatest(payTokenDecimals)
  const payTokenPrice = (() => {
    if (tradeMode === TradeMode.Limit && tokenAddress === payTokenAddress) return tokenPrice ?? 0n
    return payTokenData?.price.min ?? 0n
  })()
  const latestPayTokenPrice = useLatest(payTokenPrice)

  const latestPayTokenData = useLatest(payTokenData)

  const [payTokenAmount, baseSetPayTokenAmount] = useState(0n)

  const setPayTokenAmount = useCallback(
    (payTokenAmount: bigint) => {
      const newPayTokenAmountUsd = convertTokenAmountToUsd(
        payTokenAmount,
        latestPayTokenDecimals.current,
        latestPayTokenPrice.current,
      )

      let leverage = latestLeverage.current
      if (leverage === 0n) leverage = expandDecimals(latestLeverageInput.current, LEVERAGE_DECIMALS)

      setTokenAmountUsd((newPayTokenAmountUsd * leverage) / LEVERAGE_PRECISION)

      baseSetPayTokenAmount(payTokenAmount)
    },
    [setTokenAmountUsd],
  )

  const latestPayTokenAmount = useLatest(payTokenAmount)
  const payTokenAmountUsd = useMemo(
    () =>
      payTokenDecimals && payTokenPrice
        ? convertTokenAmountToUsd(payTokenAmount, payTokenDecimals, payTokenPrice)
        : 0n,
    [payTokenAmount, payTokenDecimals, payTokenPrice],
  )
  const latestPayTokenAmountUsd = useLatest(payTokenAmountUsd)

  // ------------------------------------------------------------------------------------------------------------------

  const [maxLeverage] = useState(100n * LEVERAGE_PRECISION) // 100
  const maxLeverageNumber = Number(shrinkDecimals(maxLeverage, LEVERAGE_DECIMALS))
  const latestMaxLeverage = useLatest(maxLeverage)

  const leverage = useMemo(
    () => calculateLeverage(tokenAmountUsd, payTokenAmountUsd),
    [tokenAmountUsd, payTokenAmountUsd],
  )

  const latestLeverage = useLatest(leverage)
  const [leverageInput, setLeverageInput] = useState('1')
  const latestLeverageInput = useLatest(leverageInput)

  const leverageNumber = Number(leverageInput)

  const handleLeverageChange = useCallback(
    (value: unknown) => {
      if (typeof value !== 'string' && typeof value !== 'number') return
      const leverage = expandDecimals(value, LEVERAGE_DECIMALS)

      if (leverage <= 0 || leverage > latestMaxLeverage.current) return

      const newTokenAmountUsd = (latestPayTokenAmountUsd.current * leverage) / LEVERAGE_PRECISION
      setTokenAmountUsd(newTokenAmountUsd)

      const newLeverageInput = shrinkDecimals(leverage, LEVERAGE_DECIMALS)
      setLeverageInput(newLeverageInput)
    },
    [setTokenAmountUsd],
  )

  useEffect(
    function syncLeverageToLeverageInput() {
      const newLeverageInput = shrinkDecimals(leverage, LEVERAGE_DECIMALS)

      if (leverage > latestMaxLeverage.current) {
        toast.error('Maximum leverage exceeded.')
      }

      if (newLeverageInput === '0') {
        setLeverageInput('1')
        return
      }

      setLeverageInput(newLeverageInput)
    },
    [leverage],
  )

  return {
    payTokenAddress,
    setPayTokenAddress,
    payTokenAmount,
    setPayTokenAmount,
    payTokenAmountUsd,
    latestPayTokenAmount,
    latestPayTokenAmountUsd,
    payTokenData,
    latestPayTokenData,
    maxLeverage,
    maxLeverageNumber,
    leverage,
    leverageNumber,
    latestLeverage,
    leverageInput,
    setLeverageInput,
    handleLeverageChange,
  }
}

function useCollateralToken() {
  const tokensData = useTokensData()

  const [collateralTokenAddress, setCollateralAddress] = useState<string>()
  const latestCollateralAddress = useLatest(collateralTokenAddress)
  const collateralTokenData = collateralTokenAddress
    ? tokensData?.get(collateralTokenAddress)
    : undefined

  return {
    collateralTokenAddress,
    latestCollateralAddress,
    setCollateralAddress,
    collateralTokenData,
  }
}

const LEVERAGE_DECIMALS = 4
const LEVERAGE_PRECISION = expandDecimals(1, LEVERAGE_DECIMALS)

function calculateLeverage(tokenAmountUsd: bigint, payTokenAmountUsd: bigint) {
  if (tokenAmountUsd <= 0 || payTokenAmountUsd <= 0) return 0n
  return (tokenAmountUsd * LEVERAGE_PRECISION) / payTokenAmountUsd
}

export default function Controller() {
  const tokensData = useTokensData()
  const _gasPrice = useGasPrice()

  const [tradeType, setTradeType] = useTradeType()
  const [tradeMode, setTradeMode] = useTradeMode()

  const {
    tokenAddress,
    tokenAmount,
    setTokenAmount,
    tokenAmountUsd,
    setTokenAmountUsd,
    tokenPrice,
    setTokenPrice,
  } = useToken(tradeMode)

  const availableMarkets = useAvailableMarketsForIndexToken(tokenAddress)

  const {
    marketAddress,
    setMarketAddress,
    availableCollateralTokenAddresses,
    latestAvailableCollateralTokenAddresses,
    poolName,
  } = useMarket()

  ;(function setDefaultMarketAddress() {
    if (!tokenAddress || !availableMarkets.length) return

    const currentMarketAddressIsAvailable =
      !!marketAddress &&
      availableMarkets.map(market => market.marketTokenAddress).includes(marketAddress)

    if (!currentMarketAddressIsAvailable) {
      setMarketAddress(availableMarkets[0]?.marketTokenAddress)
    }
  })()

  const {collateralTokenAddress, setCollateralAddress, collateralTokenData} = useCollateralToken()

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
    leverageNumber,
  } = usePayToken(tradeMode, tokenAddress, tokenPrice, tokenAmountUsd, setTokenAmountUsd)

  ;(function syncPayTokenAddressWithCollateralTokenAddress() {
    if (collateralTokenAddress !== payTokenAddress) {
      setPayTokenAddress(collateralTokenAddress)
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

  return (
    <div className='flex w-full max-w-xs flex-col'>
      <Card>
        <CardBody>
          <Tabs
            size='lg'
            selectedKey={tradeType}
            onSelectionChange={handleChangeTradeType}
            aria-label='Order type'
            classNames={{
              tabList: 'gap-2 w-full relative',
            }}
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
            aria-label='Execution type'
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
              tokenAddress={tokenAddress}
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
            maxValue={100}
            minValue={1}
            defaultValue={1}
            className='mt-4 max-w-md'
            renderValue={({_, ...props}) => (
              <output {...props}>
                {'x '}
                <Tooltip
                  className='rounded-md text-tiny text-default-500'
                  content='Press Enter to confirm'
                  placement='left'
                >
                  <input
                    className='w-14 rounded-small border-medium border-transparent bg-default-100 px-1 py-0.5 text-right text-small font-medium text-default-700 outline-none transition-colors hover:border-primary focus:border-primary'
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
                  />
                </Tooltip>
              </output>
            )}
            value={leverageNumber}
            onChange={handleLeverageChange}
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
            <Dropdown backdrop='blur'>
              <DropdownTrigger>
                <Button variant='flat'>{collateralTokenData?.symbol}</Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='Change collateral' onAction={handleCollateralChange}>
                {availableCollateralTokenAddresses.map(tokenAddress => (
                  <DropdownItem key={tokenAddress}>
                    {tokensData ? tokensData.get(tokenAddress)?.symbol : ''}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          <Divider className='mt-3 opacity-50' />
          <div className='text-sm'>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Execution Price</div>
              <div className='flex items-center'>$3,182.83</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Liquidation Price</div>
              <div className='flex items-center'>$2,908.83</div>
            </div>
          </div>
          <Divider className='mt-3 opacity-50' />
          <div className='text-sm'>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Fee</div>
              <div className='flex items-center'>-$0.04</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Network Fee</div>
              <div className='flex items-center'>-$0.05</div>
            </div>
          </div>
          <div className='mt-4 w-full'>
            <Button color='primary' className='w-full' size='lg'>
              Place
            </Button>
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
}
