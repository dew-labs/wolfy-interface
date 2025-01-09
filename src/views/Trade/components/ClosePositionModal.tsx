import {Button, Input, Modal, ModalBody, ModalContent, ModalHeader} from '@nextui-org/react'
import {useQueryClient} from '@tanstack/react-query'
import {atom, useAtom, useAtomValue, useSetAtom} from 'jotai'
import {memo, useCallback, useMemo, useState} from 'react'
import {useLatest} from 'react-use'
import {toast} from 'sonner'
import invariant from 'tiny-invariant'
import {OrderType} from 'wolfy-sdk'

import {DEFAULT_SLIPPAGE, SLIPPAGE_PRECISION} from '@/constants/config'
import {FEE_TOKEN_ADDRESS} from '@/constants/tokens'
import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import getScanUrl, {ScanType} from '@/lib/starknet/utils/getScanUrl'
import useFeeToken from '@/lib/trade/hooks/useFeeToken'
import useGasLimits from '@/lib/trade/hooks/useGasLimits'
import useGasPrice from '@/lib/trade/hooks/useGasPrice'
import usePositionsInfoData from '@/lib/trade/hooks/usePositionsInfoData'
import useReferralInfo from '@/lib/trade/hooks/useReferralInfo'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import useUiFeeFactor from '@/lib/trade/hooks/useUiFeeFactor'
import {BASIS_POINTS_DIVISOR_BIGINT, USD_DECIMALS} from '@/lib/trade/numbers/constants'
import {DEFAULT_GAS_LIMITS} from '@/lib/trade/services/fetchGasLimits'
import sendOrder from '@/lib/trade/services/order/sendOrder'
import estimateExecuteOrderGasLimit from '@/lib/trade/utils/fee/estimateExecuteOrderGasLimit'
import {getExecutionFee} from '@/lib/trade/utils/fee/getExecutionFee'
import {getTradeFees} from '@/lib/trade/utils/fee/getTradeFees'
import getDecreasePositionAmounts from '@/lib/trade/utils/order/decrease/getDecreasePositionAmounts'
import type {PositionsInfoData} from '@/lib/trade/utils/position/getPositionsInfo'
import calculateTokenFractionDigits from '@/lib/trade/utils/price/calculateTokenFractionDigits'
import errorMessageOrUndefined from '@/utils/errors/errorMessageOrUndefined'
import {cleanNumberString} from '@/utils/numberInputs'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'
import markAsMemoized from '@/utils/react/markAsMemoized'

const closePositionKeyAtom = atom<bigint>()
const isCLosePositionModalOpenAtom = atom(get => !!get(closePositionKeyAtom))

export function useClosePosition() {
  const setClosePositionKey = useSetAtom(closePositionKeyAtom)

  return useCallback((positionKey: bigint) => {
    setClosePositionKey(positionKey)
  }, [])
}

const selectPositionsInfo = markAsMemoized((data: PositionsInfoData) => data.positionsInfo)

export default memo(function ClosePositionModal() {
  // TODO: optimize, extract this query to a single function to avoid closure memory leak
  const {data: positionsInfoData = new Map()} = usePositionsInfoData(selectPositionsInfo)
  const [positionKey, setPositionKey] = useAtom(closePositionKeyAtom)

  const position = positionKey ? positionsInfoData.get(positionKey) : undefined
  const latestPosition = useLatest(position)

  // TODO: optimize, extract this query to a single function to avoid closure memory leak
  const {data: collateralTokenPrice = 0n} = useTokenPrices(
    useCallback(
      data => {
        return data.get(position?.collateralTokenAddress ?? '')?.min
      },
      [position],
    ),
  )

  const isOpen = useAtomValue(isCLosePositionModalOpenAtom)

  const handleCloseModal = useCallback(() => {
    setPositionKey(undefined)
  }, [])

  const collateralTokenSymbol = position?.collateralToken.symbol
  const collateralTokenDecimals = position?.collateralToken.decimals ?? 0

  const maximumCollateralUsdToDecrease = position?.netValue ?? 0n
  const maximumSizeUsdToDecrease = position?.sizeInUsd ?? 0n
  const maximumCollateralTokenToDecrease = collateralTokenPrice
    ? expandDecimals(maximumCollateralUsdToDecrease, collateralTokenDecimals) / collateralTokenPrice
    : 0n

  const maximumCollateralTokenToDecreaseText = formatNumber(
    shrinkDecimals(maximumCollateralTokenToDecrease, collateralTokenDecimals),
    Format.READABLE,
    {
      exactFractionDigits: true,
      fractionDigits: calculateTokenFractionDigits(collateralTokenPrice),
    },
  )

  const maximumSizeUsdToDecreaseText = formatNumber(
    shrinkDecimals(maximumSizeUsdToDecrease, USD_DECIMALS),
    Format.USD,
    {
      exactFractionDigits: true,
      fractionDigits: 2,
    },
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

  const {feeToken} = useFeeToken()
  const latestFeeToken = useLatest(feeToken)

  const inputTokenClassNames = useMemo(
    () => ({
      input: 'appearance-none',
      label: !isValidCollateralTokenAmountToDecrease && '!text-danger-500',
    }),
    [isValidCollateralTokenAmountToDecrease],
  )

  const inputSizeClassNames = useMemo(
    () => ({
      input: 'appearance-none',
      label: !isValidSizeUsdToDecrease && '!text-danger-500',
    }),
    [isValidSizeUsdToDecrease],
  )

  const {data: gasPrice = 0n} = useGasPrice()
  const {data: gasLimits = DEFAULT_GAS_LIMITS} = useGasLimits()
  const {data: uiFeeFactor = 0n} = useUiFeeFactor()
  const {data: referralInfo} = useReferralInfo()
  const {data: tokenPricesData = new Map()} = useTokenPrices()

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
          tokenPrice: position?.indexToken.address
            ? data.get(position.indexToken.address)
            : undefined,
          collateralTokenPrice: position?.collateralToken.address
            ? data.get(position.collateralToken.address)
            : undefined,
          longTokenPrice: position?.marketData.longTokenAddress
            ? data.get(position.marketData.longTokenAddress)
            : undefined,
          shortTokenPrice: position?.marketData.shortTokenAddress
            ? data.get(position.marketData.shortTokenAddress)
            : undefined,
          feeTokenPrice: data.get(feeTokenAddress),
        }
      },
      [chainId, position],
    ),
  )

  const decreaseAmounts = useMemo(() => {
    if (!position?.marketData) return undefined

    const closeSizeUsd = sizeUsdToDecrease
    const keepLeverage = false
    const minCollateralUsd = 0n
    const minPositionSizeUsd = 0n

    return getDecreasePositionAmounts({
      marketInfo: position.marketData,
      collateralToken: position.collateralToken,
      isLong: position.isLong,
      position,
      closeSizeUsd,
      keepLeverage,
      triggerPrice: 0n,
      fixedAcceptablePriceImpactBps: 0n,
      acceptablePriceImpactBuffer: 100,
      userReferralInfo: referralInfo,
      minCollateralUsd,
      minPositionSizeUsd,
      uiFeeFactor,
      receiveToken: undefined,
      tokenPricesData,
    })
  }, [position, referralInfo, sizeUsdToDecrease, tokenPricesData, uiFeeFactor])

  const tradeFees = useMemo(() => {
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
  }, [decreaseAmounts, position, uiFeeFactor])

  const tradeFeeUsdText = tradeFees?.totalFees
    ? formatNumber(shrinkDecimals(tradeFees.totalFees.deltaUsd, USD_DECIMALS), Format.USD, {
        fractionDigits: 2,
      })
    : '-'

  const executionFee = useMemo(() => {
    const feeTokenPrice = tokenPricesDataShortlisted.feeTokenPrice
    if (!feeTokenPrice || !gasPrice) return undefined

    const estimatedGas = estimateExecuteOrderGasLimit('decrease', gasLimits, {})

    return getExecutionFee(gasLimits, feeTokenPrice, estimatedGas, gasPrice, feeToken)
  }, [feeToken, tokenPricesDataShortlisted.feeTokenPrice, gasLimits, gasPrice])
  const latestExecutionFee = useLatest(executionFee)

  const executionFeeUsdText = executionFee?.feeUsd
    ? `-${formatNumber(shrinkDecimals(executionFee.feeUsd, USD_DECIMALS), Format.USD, {
        fractionDigits: 6,
      })}`
    : '-'
  const executionFeeText = executionFee?.feeTokenAmount
    ? `-${formatNumber(
        shrinkDecimals(executionFee.feeTokenAmount, feeToken.decimals),
        Format.READABLE,
        {
          fractionDigits: 8,
        },
      )} ${feeToken.symbol}`
    : '-'

  const [isClosing, setIsClosing] = useState(false)
  const handleClose = useCallback(
    (isFull?: boolean) => {
      if (!latestPosition.current || !latestWallet.current) return
      const isLong = latestPosition.current.isLong
      const receiver = latestPosition.current.account
      const market = latestPosition.current.marketAddress
      const initialCollateralToken = latestPosition.current.collateralTokenAddress

      const executionFeeAmount = latestExecutionFee.current?.feeTokenAmount

      if (executionFeeAmount === undefined) return

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
        sendOrder(
          latestWallet.current,
          {
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
            swapPath: [],
            executionFee: executionFeeAmount,
            minOutputAmount: 0n,
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
            return <div>{errorMessageOrUndefined(error) ?? 'Cancel order failed.'}</div>
          },
        },
      )
    },
    [queryClient],
  )

  const handleCloseFull = useCallback(() => {
    handleClose(true)
  }, [handleClose])

  const handleClosePartial = useCallback(() => {
    handleClose(false)
  }, [handleClose])

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
            classNames={inputTokenClassNames}
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
            label={`Size (Max: ${maximumSizeUsdToDecreaseText})`}
            placeholder='0.0'
            classNames={inputSizeClassNames}
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
          <div className='mt-0 flex w-full gap-2'>
            <Button
              color='warning'
              className='w-full'
              size='lg'
              onPress={handleCloseFull}
              isLoading={isClosing}
            >
              Fully close
            </Button>
            <Button
              color='primary'
              className='w-full'
              size='lg'
              onPress={handleClosePartial}
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
})
