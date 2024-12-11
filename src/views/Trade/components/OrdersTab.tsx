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
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import cancelOrder from '@/lib/trade/services/order/cancelOrder'
import {useSetTokenAddress} from '@/lib/trade/states/useTokenAddress'
import getMarketIndexName from '@/lib/trade/utils/market/getMarketIndexName'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'
import {isDecreaseOrderType} from '@/lib/trade/utils/order/type/isDecreaseOrderType'
import {isIncreaseOrderType} from '@/lib/trade/utils/order/type/isIncreaseOrderType'
import calculateTokenFractionDigits from '@/lib/trade/utils/price/calculateTokenFractionDigits'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'
import {getMarkPrice} from '@/lib/trade/utils/price/getMarkPrice'
import {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'

const TABLE_CLASS_NAMES = {
  th: '!rounded-none font-serif',
}

export default memo(function OrdersTab() {
  const [walletAccount] = useWalletAccount()
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()
  const latestAccountAddress = useLatest(accountAddress)
  const latestWalletAccount = useLatest(walletAccount)
  const latestChainId = useLatest(chainId)
  const queryClient = useQueryClient()
  const setTokenAddress = useSetTokenAddress()

  const {data: orders = [], isLoading, isFetching, refetch} = useOrders()
  const refetchOrders = useCallback(() => {
    void refetch()
  }, [refetch])

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
    <div className='relative'>
      <Button
        className='absolute right-2 top-2 z-10'
        size='md'
        variant='solid'
        isIconOnly
        isLoading={isFetching}
        onPress={refetchOrders}
      >
        <Icon icon='mdi:refresh' />
      </Button>
      <Table className='mt-2' aria-label='Orders' classNames={TABLE_CLASS_NAMES}>
        <TableHeader>
          <TableColumn>Type</TableColumn>
          <TableColumn>Market</TableColumn>
          <TableColumn>Size</TableColumn>
          <TableColumn>Collateral</TableColumn>
          <TableColumn>Trigger Price</TableColumn>
          <TableColumn>Mark Price</TableColumn>
          <TableColumn> </TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={'No order.'}
          items={orders}
          isLoading={isLoading}
          loadingContent={<Spinner className='mt-4' />}
        >
          {order => {
            const indexTokenPrice = order.indexTokenPrice
            // eslint-disable-next-line @eslint-react/no-useless-fragment -- escape
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
              initialCollateralTokenPrice?.min,
            )

            const collateralUdsShrinked = formatNumber(
              shrinkDecimals(collateralUsd, USD_DECIMALS),
              Format.USD,
              {
                exactFractionDigits: true,
              },
            )

            const collateralText = (() => {
              if (!initialCollateralTokenPrice || !targetCollateralTokenPrice) return ''

              const targetCollateralAmount = convertUsdToTokenAmount(
                collateralUsd,
                targetCollateralToken.decimals,
                targetCollateralTokenPrice.min,
              )

              const tokenAmountFractionDigits = calculateTokenFractionDigits(
                targetCollateralTokenPrice.min,
              )

              const tokenAmountText = formatNumber(
                shrinkDecimals(targetCollateralAmount, targetCollateralToken.decimals),
                Format.PLAIN,
                {exactFractionDigits: true, fractionDigits: tokenAmountFractionDigits},
              )

              return `${tokenAmountText} ${targetCollateralToken.symbol}`
            })()

            const triggerPriceText = `${order.triggerThresholdType} ${formatNumber(
              shrinkDecimals(order.triggerPrice, USD_DECIMALS),
              Format.USD,
              {exactFractionDigits: true},
            )}`

            const markPrice = getMarkPrice({
              price: indexTokenPrice,
              isIncrease: isIncreaseOrderType(order.orderType),
              isLong: order.isLong,
            })

            const markPriceText = formatNumber(
              shrinkDecimals(markPrice, USD_DECIMALS),
              Format.USD,
              {
                exactFractionDigits: true,
              },
            )
            const sizeText = formatNumber(
              shrinkDecimals(order.sizeDeltaUsd, USD_DECIMALS),
              Format.USD,
              {exactFractionDigits: true},
            )

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
                  <Tooltip content='Press to switch market' showArrow>
                    <Button
                      disableRipple
                      disableAnimation
                      variant='light'
                      className='flex inline-flex min-w-max items-center justify-center gap-2 whitespace-nowrap rounded-none bg-transparent px-0 text-sm !transition-none tap-highlight-transparent hover:bg-transparent focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-[hover=true]:bg-transparent'
                      onClick={() => {
                        setTokenAddress(order.marketData.indexTokenAddress)
                      }}
                    >
                      <img
                        src={order.marketData.indexToken.imageUrl}
                        alt={indexName}
                        className='h-6 w-6 rounded'
                      />
                      <div className='flex flex-col'>
                        <div>{indexName}</div>
                        <div className='subtext whitespace-nowrap text-xs opacity-50'>
                          [{poolName}]
                        </div>
                      </div>
                    </Button>
                  </Tooltip>
                </TableCell>
                <TableCell>{sizeText}</TableCell>
                <TableCell>
                  <div className='text-nowrap'>{collateralUdsShrinked}</div>
                  <div className='text-nowrap text-xs opacity-50'>{collateralText}</div>
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
    </div>
  )
})
