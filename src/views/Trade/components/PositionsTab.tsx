import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@nextui-org/react'
import {queryOptions, skipToken, useQuery} from '@tanstack/react-query'
import {t} from 'i18next'
import type {StarknetChainId} from 'satoru-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import formatDeltaUsd from '@/lib/trade/numbers/formatDeltaUsd'
import formatUsd from '@/lib/trade/numbers/formatUsd'
import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import fetchPositions from '@/lib/trade/services/fetchPositions'
import type {TokensData} from '@/lib/trade/services/fetchTokensData'
import getMarketIndexName from '@/lib/trade/utils/market/getMarketIndexName'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'
import formatLeverage from '@/lib/trade/utils/position/formatLeverage'
import getPositionsInfo from '@/lib/trade/utils/position/getPositionsInfo'
import calculatePriceDecimals from '@/lib/trade/utils/price/calculatePriceDecimals'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

function createGetPositionQueryOptions(
  chainId: StarknetChainId,
  marketsData: MarketsData | undefined,
  tokensData: TokensData | undefined,
  accountAddress: string | undefined,
) {
  return queryOptions({
    queryKey: ['positions', chainId, marketsData, tokensData, accountAddress] as const,
    queryFn:
      marketsData && tokensData
        ? async () => {
            return await fetchPositions(chainId, marketsData, tokensData, accountAddress)
          }
        : skipToken,
    ...NO_REFETCH_OPTIONS,
  })
}

const savedShowPnlAfterFees: boolean = true

export default function PositionTab() {
  const [walletAccount] = useWalletAccount()
  const [chainId] = useChainId()
  const account = walletAccount?.address

  const {data: markets} = useQuery({
    queryKey: ['markets', chainId],
    enabled: false,
  })

  const {data: tokensData} = useQuery({
    queryKey: ['tokens', chainId, account] as const,
    enabled: false,
  })

  const {data: marketsData} = useQuery({
    queryKey: ['marketsData', chainId, markets, tokensData, account] as const,
    enabled: false,
  })

  const {data: positionsData} = useQuery(
    // TODO: type later
    // @ts-expect-error type later
    createGetPositionQueryOptions(chainId, marketsData, tokensData, account),
  )

  const {data: positionsConstants} = useQuery({
    queryKey: ['positionsConstants', chainId] as const,
    enabled: false,
  })

  const {data: uiFeeFactor} = useQuery({
    queryKey: ['uiFeeFactor', chainId] as const,
    enabled: false,
  })

  const {data: referralInfo} = useQuery({
    queryKey: ['referralInfo', chainId, account] as const,
    enabled: false,
  })

  let positionsInfo

  if (
    marketsData &&
    tokensData &&
    positionsData &&
    positionsConstants &&
    uiFeeFactor !== undefined
  ) {
    positionsInfo = getPositionsInfo(
      // TODO: type later
      // @ts-expect-error type later
      marketsData,
      tokensData,
      positionsData,
      positionsConstants,
      uiFeeFactor,
      true,
      referralInfo,
    )
  }

  const positions = positionsInfo ? Array.from(positionsInfo.values()) : []

  return (
    <Table className='mt-2' aria-label='Positions'>
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
          const indexName = getMarketIndexName(position.marketData)
          const poolName = getMarketPoolName(position.marketData)
          const marketDecimals = calculatePriceDecimals(
            position.marketData.indexTokenAddress,
            // TODO: type later
            // @ts-expect-error type later
            tokensData,
          )

          const displayedPnl = savedShowPnlAfterFees ? position.pnlAfterFees : position.pnl
          const displayedPnlPercentage = savedShowPnlAfterFees
            ? position.pnlAfterFeesPercentage
            : position.pnlPercentage
          return (
            <TableRow key={position.key}>
              <TableCell>
                {/* {position.marketData.indexToken.symbol} */}
                <div className='flex items-center'>
                  <span>{indexName}</span>
                  <span className='subtext leading-1'>{poolName && `[${poolName}]`}</span>
                </div>
                <span className='muted Position-leverage'>
                  {formatLeverage(position.leverage) ?? '...'}
                </span>
                <span>[{position.isLong ? t('Long') : t('Short')}]</span>
              </TableCell>
              <TableCell>
                {formatUsd(position.netValue)}
                <div>{formatDeltaUsd(displayedPnl, displayedPnlPercentage)}</div>
              </TableCell>
              <TableCell>{formatUsd(position.sizeInUsd)}</TableCell>
              <TableCell>{formatUsd(position.remainingCollateralUsd)}</TableCell>
              <TableCell>
                {' '}
                {position.isOpening
                  ? `Opening...`
                  : formatUsd(position.entryPrice, {
                      displayDecimals: marketDecimals,
                    })}
              </TableCell>
              <TableCell>
                {formatUsd(position.markPrice, {
                  displayDecimals: marketDecimals,
                })}
              </TableCell>
              <TableCell>
                {formatUsd(position.liquidationPrice, {
                  displayDecimals: marketDecimals,
                })}
              </TableCell>
              <TableCell>Close</TableCell>
            </TableRow>
          )
        }}
      </TableBody>
    </Table>
  )
}
