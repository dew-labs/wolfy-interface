import {Button, Input, Modal, ModalBody, ModalContent, ModalHeader} from '@nextui-org/react'
import {useQueryClient} from '@tanstack/react-query'
import {atom, useAtom, useAtomValue, useSetAtom} from 'jotai'
import {useCallback, useState} from 'react'
import {useLatest} from 'react-use'
import {OrderType} from 'satoru-sdk'
import {toast} from 'sonner'

import {DEFAULT_SLIPPAGE, SLIPPAGE_PRECISION} from '@/constants/config'
import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import getScanUrl, {ScanType} from '@/lib/starknet/utils/getScanUrl'
import usePositionsInfoData from '@/lib/trade/hooks/usePositionsInfoData'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import sendOrder from '@/lib/trade/services/order/sendOrder'
import calculatePriceDecimals from '@/lib/trade/utils/price/calculatePriceDecimals'
import errorMessageOrUndefined from '@/utils/errors/errorMessageOrUndefined'
import {cleanNumberString} from '@/utils/numberInputs'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'

const closePositionKeyAtom = atom<bigint>()
const isCLosePositionModalOpenAtom = atom(get => !!get(closePositionKeyAtom))

export function useClosePosition() {
  const setClosePositionKey = useSetAtom(closePositionKeyAtom)

  return useCallback((positionKey: bigint) => {
    setClosePositionKey(positionKey)
  }, [])
}

export default function ClosePositionModal() {
  const positionsInfoData = usePositionsInfoData()
  const [positionKey, setPositionKey] = useAtom(closePositionKeyAtom)

  const position = positionsInfoData && positionKey ? positionsInfoData.get(positionKey) : undefined
  const latestPosition = useLatest(position)

  const collateralTokenPrice = useTokenPrices(data =>
    data.get(position?.collateralTokenAddress ?? ''),
  )

  const isOpen = useAtomValue(isCLosePositionModalOpenAtom)

  const handleCloseModal = useCallback(() => {
    setPositionKey(undefined)
  }, [])

  const collateralTokenSymbol = position?.collateralToken.symbol
  const collateralTokenDecimals = position?.collateralToken.decimals ?? 0

  const maximumCollateralUsdToDecrease = position?.netValue ?? 0n
  const maximumSizeUsdToDecrease = position?.sizeInUsd ?? 0n
  const maximumCollateralTokenToDecrease =
    expandDecimals(maximumCollateralUsdToDecrease, collateralTokenDecimals) /
    (collateralTokenPrice?.min ?? 1n)

  const maximumCollateralTokenToDecreaseText = shrinkDecimals(
    maximumCollateralTokenToDecrease,
    collateralTokenDecimals,
    calculatePriceDecimals(maximumCollateralTokenToDecrease),
    true,
    true,
  )
  const maximumSizeUsdToDecreaseText = shrinkDecimals(
    maximumSizeUsdToDecrease,
    USD_DECIMALS,
    2,
    true,
    true,
  )

  //----------------------------------------------------------------------------

  const [collateralTokenAmountToDecrease, setCollateralTokenAmountToDecrease] = useState(
    maximumCollateralTokenToDecrease,
  )
  const latestCollateralTokenAmountToDecrease = useLatest(collateralTokenAmountToDecrease)
  const [collaterTokenAmountToDecreaseInput, setCollateralTokenAmountToDecreaseInput] = useState(
    () => shrinkDecimals(maximumCollateralTokenToDecrease, collateralTokenDecimals),
  )

  const handleTokenAmountInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const valueInput = cleanNumberString(value)
      const valueBigint = expandDecimals(valueInput, collateralTokenDecimals)

      setCollateralTokenAmountToDecreaseInput(valueInput)
      setCollateralTokenAmountToDecrease(valueBigint)
    },
    [collateralTokenDecimals],
  )

  const isValidCollateralTokenAmountToDecrease =
    collateralTokenAmountToDecrease >= 0 &&
    collateralTokenAmountToDecrease <= maximumCollateralTokenToDecrease

  //----------------------------------------------------------------------------

  const [sizeUsdToDecrease, setSizeUsdToDecrease] = useState(maximumSizeUsdToDecrease)
  const latestSizeUsdToDecrease = useLatest(sizeUsdToDecrease)
  const [sizeUsdToDecreaseInput, setSizeUsdToDecreaseInput] = useState(() =>
    shrinkDecimals(maximumSizeUsdToDecrease, USD_DECIMALS),
  )

  const handleSizeUsdInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const valueInput = cleanNumberString(value)
    const valueBigint = expandDecimals(valueInput, USD_DECIMALS)

    setSizeUsdToDecreaseInput(valueInput)
    setSizeUsdToDecrease(valueBigint)
  }, [])

  const isValidSizeUsdToDecrease =
    sizeUsdToDecrease >= 0 && sizeUsdToDecrease <= maximumSizeUsdToDecrease

  //----------------------------------------------------------------------------

  const isValid = isValidCollateralTokenAmountToDecrease && isValidSizeUsdToDecrease

  const [wallet] = useWalletAccount()
  const latestWallet = useLatest(wallet)
  const accountAddress = useAccountAddress()
  const latestAccountAddress = useLatest(accountAddress)
  const queryClient = useQueryClient()
  const [chainId] = useChainId()
  const latestChainId = useLatest(chainId)

  const [isClosing, setIsClosing] = useState(false)
  const handleClose = useCallback(
    (isFull?: boolean) => {
      if (!latestPosition.current || !latestWallet.current) return
      const isLong = latestPosition.current.isLong
      const receiver = latestPosition.current.account
      const market = latestPosition.current.marketAddress
      const initialCollateralToken = latestPosition.current.collateralTokenAddress

      const sizeDeltaUsd = isFull
        ? latestPosition.current.sizeInUsd
        : latestSizeUsdToDecrease.current
      const initialCollateralDeltaAmount = isFull
        ? latestPosition.current.collateralAmount
        : latestCollateralTokenAmountToDecrease.current

      const currentPrice =
        latestPosition.current.markPrice /
        expandDecimals(1, latestPosition.current.indexToken.decimals)

      const triggerPrice = 0n // TODO: support limit decrease
      let differences = (currentPrice * DEFAULT_SLIPPAGE) / SLIPPAGE_PRECISION
      if (isLong) {
        differences = -differences
      }
      const acceptablePrice = currentPrice + differences

      const orderType = OrderType.MarketDecrease

      setIsClosing(true)
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
            void queryClient.invalidateQueries({
              queryKey: ['positions', latestChainId.current, latestAccountAddress.current],
            })
            setPositionKey(undefined)
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
            setIsClosing(false)
          },
          error: error => {
            return (
              <>
                <div>{errorMessageOrUndefined(error) ?? 'Cancel order failed.'}</div>
              </>
            )
          },
        },
      )
    },
    [queryClient],
  )

  if (!positionKey) return

  return (
    <Modal isOpen={isOpen} placement={'top-center'} onOpenChange={handleCloseModal} backdrop='blur'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          Close [{position?.isLong ? 'Long' : 'Short'} {position?.marketData.indexToken.symbol}]
          Position
        </ModalHeader>
        <ModalBody className='mb-4 w-full'>
          <Input
            className='mt-0'
            size='lg'
            type='text'
            label={`Collateral (Max: ${maximumCollateralTokenToDecreaseText})`}
            placeholder='0.0'
            classNames={{
              input: 'appearance-none',
              label: !isValidCollateralTokenAmountToDecrease && '!text-danger-500',
            }}
            value={collaterTokenAmountToDecreaseInput}
            onChange={handleTokenAmountInputChange}
            endContent={
              <div className='pointer-events-none flex h-full items-center justify-center'>
                {collateralTokenSymbol}
              </div>
            }
          />
          <Input
            className='mt-0'
            size='lg'
            type='text'
            label={`Size (Max: $${maximumSizeUsdToDecreaseText})`}
            placeholder='0.0'
            classNames={{
              input: 'appearance-none',
              label: !isValidSizeUsdToDecrease && '!text-danger-500',
            }}
            value={sizeUsdToDecreaseInput}
            onChange={handleSizeUsdInputChange}
            startContent={
              <div className='pointer-events-none flex items-center'>
                <span className='text-small text-default-400'>$</span>
              </div>
            }
            endContent={
              <div className='pointer-events-none flex h-full items-center justify-center'>
                {/* <span className='text-lg text-default-400'>{tokenData?.symbol}</span> */}
              </div>
            }
          />
          <div className='mt-0 flex w-full gap-2'>
            <Button
              color='warning'
              className='w-full'
              size='lg'
              onPress={() => {
                handleClose(true)
              }}
              isLoading={isClosing}
            >
              Fully close
            </Button>
            <Button
              color='primary'
              className='w-full'
              size='lg'
              onPress={() => {
                handleClose()
              }}
              isDisabled={!isValid}
              isLoading={isClosing}
            >
              Partially close
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
