import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import {useQueryClient} from '@tanstack/react-query'
import {t} from 'i18next'
import {memo, useCallback} from 'react'
import {useLatest} from 'react-use'
import {toast} from 'sonner'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import getScanUrl, {ScanType} from '@/lib/starknet/utils/getScanUrl'
import useOrders from '@/lib/trade/hooks/useOrders'
import formatTokenAmount from '@/lib/trade/numbers/formatTokenAmount'
import formatUsd from '@/lib/trade/numbers/formatUsd'
import cancelOrder from '@/lib/trade/services/order/cancelOrder'
import getMarketIndexName from '@/lib/trade/utils/market/getMarketIndexName'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'
import {isDecreaseOrderType} from '@/lib/trade/utils/order/type/isDecreaseOrderType'
import {isIncreaseOrderType} from '@/lib/trade/utils/order/type/isIncreaseOrderType'
import {getMarkPrice} from '@/lib/trade/utils/position/getPositionsInfo'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'

export default memo(function OrdersTab() {
  const [walletAccount] = useWalletAccount()
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()
  const latestAccountAddress = useLatest(accountAddress)
  const latestWalletAccount = useLatest(walletAccount)
  const latestChainId = useLatest(chainId)
  const queryClient = useQueryClient()

  const orders = useOrders()

  const handleCancelOrder = useCallback(
    (orderKey: string) => {
      if (!latestWalletAccount.current) return
      toast.promise(cancelOrder(latestChainId.current, latestWalletAccount.current, orderKey), {
        loading: 'Cancelling...',
        success: data => {
          void queryClient.invalidateQueries({
            queryKey: ['orders', latestChainId.current, latestAccountAddress.current],
          })
          return (
            <>
              Order cancelled.
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
        error: 'Cancel order failed.',
      })
    },
    [queryClient],
  )

  return (
    <Table
      className='mt-2'
      aria-label='Orders'
      classNames={{
        th: '!rounded-none',
      }}
    >
      <TableHeader>
        <TableColumn>Type</TableColumn>
        <TableColumn>Market</TableColumn>
        <TableColumn>Size</TableColumn>
        <TableColumn>Collateral</TableColumn>
        <TableColumn>Trigger Price</TableColumn>
        <TableColumn>Mark Price</TableColumn>
        <TableColumn> </TableColumn>
      </TableHeader>
      <TableBody emptyContent={'No order.'} items={orders}>
        {order => {
          const indexTokenPrice = order.indexTokenPrice

          if (!indexTokenPrice) return <></>

          const indexName = getMarketIndexName(order.marketData)
          const poolName = getMarketPoolName(order.marketData)

          const initialCollateralToken = order.initialCollateralToken
          const targetCollateralToken = order.targetCollateralToken

          const initialCollateralTokenPrice = order.initialCollateralTokenPrice
          const targetCollateralTokenPrice = order.targetCollateralTokenPrice

          const collateralUsd = convertTokenAmountToUsd(
            order.initialCollateralDeltaAmount,
            initialCollateralToken.decimals,
            initialCollateralTokenPrice?.min ?? 0n,
          )

          const collateralUdsShrinked = formatUsd(collateralUsd)

          const collateralText = (function () {
            if (!initialCollateralTokenPrice || !targetCollateralTokenPrice) return ''

            const targetCollateralAmount = convertUsdToTokenAmount(
              collateralUsd,
              targetCollateralToken.decimals,
              targetCollateralTokenPrice.min,
            )

            const tokenAmountText = formatTokenAmount(
              targetCollateralAmount,
              targetCollateralToken.decimals,
              targetCollateralToken.symbol,
            )

            return `${tokenAmountText}`
          })()

          const triggerPriceText = `${order.triggerThresholdType} ${formatUsd(order.triggerPrice)}`

          const markPrice = getMarkPrice({
            price: indexTokenPrice,
            isIncrease: isIncreaseOrderType(order.orderType),
            isLong: order.isLong,
          })

          const markPriceText = formatUsd(markPrice)
          const sizeText = formatUsd(order.sizeDeltaUsd)
          return (
            <TableRow key={order.key}>
              <TableCell>
                <div
                  className={`!absolute left-[-1rem] top-[10%] h-4/5 w-1 ${order.isLong ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <div>
                  {isDecreaseOrderType(order.orderType) ? t(`Trigger`) : t(`Limit`)}
                  {` `}
                  {order.isLong ? 'Long' : 'Short'}
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <img
                    src={order.marketData.indexToken.imageUrl}
                    alt={indexName}
                    className='h-6 w-6 rounded'
                  />
                  <div>
                    <div className='text-nowrap'>{indexName}</div>
                    <div className='subtext lh-1 text-nowrap text-xs opacity-50'>
                      {poolName && `[${poolName}]`}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{sizeText}</TableCell>
              <TableCell>
                <div className='text-nowrap'>{collateralUdsShrinked}</div>
                <div className='text-xs opacity-50'>{collateralText}</div>
              </TableCell>
              <TableCell>
                <span>{triggerPriceText}</span>
              </TableCell>
              <TableCell>
                <span>{markPriceText}</span>
              </TableCell>
              <TableCell>
                <Button
                  size='sm'
                  onClick={() => {
                    handleCancelOrder(order.key)
                  }}
                >
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
          )
        }}
      </TableBody>
    </Table>
  )
})
