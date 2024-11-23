import {Icon} from '@iconify/react'
import {
  Button,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from '@nextui-org/react'
import {t} from 'i18next'
import {memo, useCallback, useState} from 'react'

import usePositionsInfoData from '@/lib/trade/hooks/usePositionsInfoData'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import {useSetTokenAddress} from '@/lib/trade/states/useTokenAddress'
// import getMarketIndexName from '@/lib/trade/utils/market/getMarketIndexName'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'
import formatLeverage from '@/lib/trade/utils/position/formatLeverage'
import calculatePriceFractionDigits from '@/lib/trade/utils/price/calculatePriceFractionDigits'
import max from '@/utils/numbers/bigint/max'
import {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'

import {useClosePosition} from './ClosePositionModal'

const TABLE_CLASS_NAMES = {
  th: '!rounded-none font-serif',
}

export default memo(function PositionTab() {
  const {data: positionsInfo, isLoading, isFetching, refetch} = usePositionsInfoData()
  const {data: tokenPricesData} = useTokenPrices(data => data)
  const setTokenAddress = useSetTokenAddress()

  const refetchPositionsInfo = useCallback(() => {
    void refetch()
  }, [refetch])

  const positions = positionsInfo
    ? Array.from(positionsInfo.values()).sort((a, b) => {
        const timeA = max(a.increasedAtBlock, a.decreasedAtBlock)
        const timeB = max(b.increasedAtBlock, b.decreasedAtBlock)
        return Number(timeB - timeA)
      })
    : []
  const [savedShowPnlAfterFees] = useState(true)

  const closePosition = useClosePosition()

  return (
    <div className='relative'>
      <Button
        className='absolute right-2 top-2 z-10'
        size='md'
        variant='solid'
        isIconOnly
        isLoading={isFetching}
        onPress={refetchPositionsInfo}
      >
        <Icon icon='mdi:refresh' />
      </Button>
      <Table className='mt-2' aria-label='Positions' classNames={TABLE_CLASS_NAMES}>
        <TableHeader>
          <TableColumn>Position</TableColumn>
          <TableColumn>Net value</TableColumn>
          <TableColumn>Size</TableColumn>
          <TableColumn>Collateral</TableColumn>
          <TableColumn>Entry Price</TableColumn>
          <TableColumn>Mark Price</TableColumn>
          <TableColumn>Liq. Price</TableColumn>
          <TableColumn> </TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={'No position.'}
          items={positions}
          isLoading={isLoading}
          loadingContent={<Spinner className='mt-4' />}
        >
          {position => {
            if (!tokenPricesData) return <></>

            const tokenPrice = tokenPricesData.get(position.marketData.indexTokenAddress)

            // const indexName = getMarketIndexName(position.marketData)
            const poolName = getMarketPoolName(position.marketData)
            const priceFractionDigits = calculatePriceFractionDigits(tokenPrice?.min)

            const pnl = savedShowPnlAfterFees ? position.pnlAfterFees : position.pnl
            const pnlPercentage = savedShowPnlAfterFees
              ? position.pnlAfterFeesPercentage
              : position.pnlPercentage

            const pnlText = formatNumber(shrinkDecimals(pnl, USD_DECIMALS), Format.USD_SIGNED, {
              exactFractionDigits: true,
            })

            const pnlPercentageText = formatNumber(
              shrinkDecimals(pnlPercentage, 4),
              Format.PERCENT_SIGNED,
            )

            return (
              <TableRow key={position.key} className='relative'>
                <TableCell>
                  <div
                    className={`!absolute left-[-1rem] top-[10%] h-4/5 w-1 ${position.isLong ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  <Tooltip content='Press to switch market'>
                    <Button
                      disableRipple
                      disableAnimation
                      variant='light'
                      className='flex inline-flex min-w-max items-center justify-center gap-2 whitespace-nowrap rounded-none bg-transparent px-0 text-sm !transition-none tap-highlight-transparent hover:bg-transparent focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-[hover=true]:bg-transparent'
                      // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop -- nextui error when separate all this to a new component
                      onClick={() => {
                        setTokenAddress(position.marketData.indexTokenAddress)
                      }}
                    >
                      <img
                        src={position.marketData.indexToken.imageUrl}
                        alt={position.marketData.indexToken.symbol}
                        className='h-6 w-6 rounded'
                      />
                      <div className='flex flex-col'>
                        <div>
                          {position.isLong ? t('Long') : t('Short')}{' '}
                          {position.marketData.indexToken.symbol}
                        </div>
                        <div className='subtext whitespace-nowrap text-xs opacity-50'>
                          [{poolName}]
                        </div>
                      </div>
                    </Button>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <div>
                    {formatNumber(shrinkDecimals(position.netValue, USD_DECIMALS), Format.USD, {
                      exactFractionDigits: true,
                    })}
                  </div>
                  <div className={position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                    <div>{pnlText}</div>
                    <div className='text-xs'>{pnlPercentageText}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    {formatNumber(shrinkDecimals(position.sizeInUsd, USD_DECIMALS), Format.USD, {
                      exactFractionDigits: true,
                    })}
                  </div>
                  <div className='opacity-50'>
                    {formatLeverage(position.leverage) ?? 'Liquidated'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='whitespace-nowrap'>
                    {formatNumber(
                      shrinkDecimals(position.collateralAmount, position.collateralToken.decimals),
                      Format.READABLE,
                      {fractionDigits: priceFractionDigits},
                    )}{' '}
                    {position.collateralToken.symbol}
                  </div>
                  <div className='opacity-50'>
                    {formatNumber(
                      shrinkDecimals(position.remainingCollateralUsd, USD_DECIMALS),
                      Format.USD,
                      {exactFractionDigits: true},
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span>
                    {position.isOpening
                      ? `Opening...`
                      : formatNumber(
                          shrinkDecimals(position.entryPrice, USD_DECIMALS),
                          Format.USD,
                          {
                            exactFractionDigits: true,
                          },
                        )}
                  </span>
                </TableCell>
                <TableCell>
                  <span>
                    {formatNumber(shrinkDecimals(position.markPrice, USD_DECIMALS), Format.USD, {
                      exactFractionDigits: true,
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <span>
                    {formatNumber(
                      shrinkDecimals(position.liquidationPrice, USD_DECIMALS),
                      Format.USD,
                      {
                        exactFractionDigits: true,
                      },
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    size='sm'
                    // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop -- nextui error when separate all this to a new component
                    onClick={() => {
                      closePosition(position.key)
                    }}
                  >
                    Close
                  </Button>
                </TableCell>
              </TableRow>
            )
          }}
        </TableBody>
      </Table>
    </div>
  )
})
