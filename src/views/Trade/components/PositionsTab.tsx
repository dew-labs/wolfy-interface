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
// import getMarketIndexName from '@/lib/trade/utils/market/getMarketIndexName'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'
import formatLeverage from '@/lib/trade/utils/position/formatLeverage'
import calculatePriceDecimals from '@/lib/trade/utils/price/calculatePriceDecimals'
import {shrinkDecimals} from '@/utils/numbers/expandDecimals'

import {useClosePosition} from './ClosePositionModal'

export default memo(function PositionTab() {
  const positionsInfo = usePositionsInfoData()
  const tokenPricesData = useTokenPrices(data => data)

  const positions = positionsInfo ? Array.from(positionsInfo.values()) : []
  const [savedShowPnlAfterFees] = useState(true)

  const closePosition = useClosePosition()

  return (
    <Table className='mt-2' aria-label='Positions'>
      <TableHeader>
        <TableColumn>Position</TableColumn>
        <TableColumn>Pool</TableColumn>
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
            <TableRow key={position.key}>
              <TableCell>
                <div>{position.isLong ? t('Long') : t('Short')}</div>
                <div>{position.marketData.indexToken.symbol}</div>
                {/* <div className='flex items-center'>
                  <span>{indexName}</span>
                </div> */}
              </TableCell>
              <TableCell>
                <div className='flex items-center'>
                  <span className='subtext leading-1 whitespace-nowrap'>{poolName}</span>
                </div>
              </TableCell>
              <TableCell>
                {formatUsd(position.netValue)}
                <div>{formatDeltaUsd(displayedPnl, displayedPnlPercentage)}</div>
              </TableCell>
              <TableCell>
                <div>{formatUsd(position.sizeInUsd)}</div>
                <div className='opacity-50'>{formatLeverage(position.leverage) ?? '...'}</div>
              </TableCell>
              <TableCell>
                <div>
                  {shrinkDecimals(position.collateralAmount, position.collateralToken.decimals)}{' '}
                  {position.collateralToken.symbol}
                </div>
                <div>{formatUsd(position.remainingCollateralUsd)}</div>
              </TableCell>
              <TableCell>
                {' '}
                {position.isOpening
                  ? `Opening...`
                  : formatUsd(position.entryPrice, {
                      displayDecimals: priceDecimals,
                    })}
              </TableCell>
              <TableCell>
                {formatUsd(position.markPrice, {
                  displayDecimals: priceDecimals,
                })}
              </TableCell>
              <TableCell>
                {formatUsd(position.liquidationPrice, {
                  displayDecimals: priceDecimals,
                })}
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
