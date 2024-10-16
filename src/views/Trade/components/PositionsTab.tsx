import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import {t} from 'i18next'
import {memo, useState} from 'react'

import usePositionsInfoData from '@/lib/trade/hooks/usePositionsInfoData'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import formatDeltaUsd from '@/lib/trade/numbers/formatDeltaUsd'
import formatUsd from '@/lib/trade/numbers/formatUsd'
import {useSetTokenAddress} from '@/lib/trade/states/useTokenAddress'
// import getMarketIndexName from '@/lib/trade/utils/market/getMarketIndexName'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'
import formatLeverage from '@/lib/trade/utils/position/formatLeverage'
import calculatePriceDecimals from '@/lib/trade/utils/price/calculatePriceDecimals'
import {shrinkDecimals} from '@/utils/numbers/expandDecimals'

import {useClosePosition} from './ClosePositionModal'

export default memo(function PositionTab() {
  const positionsInfo = usePositionsInfoData()
  const tokenPricesData = useTokenPrices(data => data)
  const setTokenAddress = useSetTokenAddress()

  const positions = positionsInfo ? Array.from(positionsInfo.values()) : []
  const [savedShowPnlAfterFees] = useState(true)

  const closePosition = useClosePosition()

  return (
    <Table
      className='mt-2'
      aria-label='Positions'
      classNames={{
        th: '!rounded-none',
      }}
    >
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
      <TableBody emptyContent={'No position.'} items={positions}>
        {position => {
          if (!tokenPricesData) return <></>

          const tokenPrice = tokenPricesData.get(position.marketData.indexTokenAddress)

          // const indexName = getMarketIndexName(position.marketData)
          const poolName = getMarketPoolName(position.marketData)
          const priceDecimals = calculatePriceDecimals(tokenPrice?.min)

          const displayedPnl = savedShowPnlAfterFees ? position.pnlAfterFees : position.pnl
          const displayedPnlPercentage = savedShowPnlAfterFees
            ? position.pnlAfterFeesPercentage
            : position.pnlPercentage
          return (
            <TableRow key={position.key} className='relative'>
              <TableCell>
                <div
                  className={`!absolute left-[-1rem] top-[10%] h-4/5 w-1 ${position.isLong ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <button
                  className='flex min-w-max items-center gap-2'
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
                    <div className='subtext whitespace-nowrap text-xs opacity-50'>[{poolName}]</div>
                  </div>
                </button>
              </TableCell>
              <TableCell>
                <div>{formatUsd(position.netValue)}</div>
                <div className={position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatDeltaUsd(displayedPnl, displayedPnlPercentage)}
                </div>
              </TableCell>
              <TableCell>
                <div>{formatUsd(position.sizeInUsd)}</div>
                <div className='opacity-50'>
                  {formatLeverage(position.leverage) ?? 'Liquidated'}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  {shrinkDecimals(position.collateralAmount, position.collateralToken.decimals)}{' '}
                  {position.collateralToken.symbol}
                </div>
                <div className='opacity-50'>{formatUsd(position.remainingCollateralUsd)}</div>
              </TableCell>
              <TableCell>
                <span>
                  {position.isOpening
                    ? `Opening...`
                    : formatUsd(position.entryPrice, {
                        displayDecimals: priceDecimals,
                      })}
                </span>
              </TableCell>
              <TableCell>
                <span>
                  {formatUsd(position.markPrice, {
                    displayDecimals: priceDecimals,
                  })}
                </span>
              </TableCell>
              <TableCell>
                <span>
                  {formatUsd(position.liquidationPrice, {
                    displayDecimals: priceDecimals,
                  })}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  size='sm'
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
  )
})
