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
import {useCallback} from 'react'
import {useLatest} from 'react-use'
import {toast} from 'sonner'

import useChainId from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
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

export default function OrdersTab() {
  const [walletAccount] = useWalletAccount()
  const [chainId] = useChainId()
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
            queryKey: ['orders'],
          })
          return (
            <>
              Order cancelled.
              <a href={`https://sepolia.starkscan.co/tx/${data.tx}`}>View tx</a>
            </>
          )
        },
        error: 'Cancel order failed.',
      })
    },
    [queryClient],
  )

  return (
    <Table className='mt-2' aria-label='Positions'>
      <TableHeader>
        <TableColumn>Type</TableColumn>
        <TableColumn>Market</TableColumn>
        <TableColumn>Size</TableColumn>
        <TableColumn>Collateral</TableColumn>
        <TableColumn>Trigger Price</TableColumn>
        <TableColumn>Mark Price</TableColumn>
        <TableColumn> </TableColumn>
      </TableHeader>
      <TableBody emptyContent={'No order.'} items={orders ?? []}>
        {order => {
          const indexName = getMarketIndexName(order.marketData)
          const poolName = getMarketPoolName(order.marketData)

          const collateralText = (function () {
            const initialCollateralToken = order.initialCollateralToken
            const targetCollateralToken = order.targetCollateralToken

            const collateralUsd = convertTokenAmountToUsd(
              order.initialCollateralDeltaAmount,
              initialCollateralToken.decimals,
              initialCollateralToken.price.min,
            )

            const targetCollateralAmount = convertUsdToTokenAmount(
              collateralUsd,
              targetCollateralToken.decimals,
              targetCollateralToken.price.min,
            )

            const tokenAmountText = formatTokenAmount(
              targetCollateralAmount,
              targetCollateralToken.decimals,
              targetCollateralToken.symbol,
            )

            return `${tokenAmountText}`
          })()

          const priceDecimals = order.indexToken.priceDecimals

          const triggerPriceText = `${order.triggerThresholdType} ${formatUsd(order.triggerPrice, {
            displayDecimals: priceDecimals,
          })}`

          const markPrice = getMarkPrice({
            price: order.indexToken.price,
            isIncrease: isIncreaseOrderType(order.orderType),
            isLong: order.isLong,
          })

          const markPriceText = formatUsd(markPrice, {displayDecimals: priceDecimals})
          const sizeText = formatUsd(order.sizeDeltaUsd)
          return (
            <TableRow key={order.key}>
              <TableCell>
                {isDecreaseOrderType(order.orderType) ? t(`Trigger`) : t(`Limit`)}
              </TableCell>
              <TableCell>
                <span>{indexName}</span>
                <span className='subtext lh-1'>{poolName && `[${poolName}]`}</span>
              </TableCell>
              <TableCell>{sizeText}</TableCell>
              <TableCell>{collateralText}</TableCell>
              <TableCell>{triggerPriceText}</TableCell>
              <TableCell>{markPriceText}</TableCell>
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
}
