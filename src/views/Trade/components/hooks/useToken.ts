import {getTokensMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useTokenPricesQuery from '@/lib/trade/hooks/useTokenPricesQuery'
import useTokenAddress from '@/lib/trade/states/useTokenAddress'
import {TradeMode} from '@/lib/trade/states/useTradeMode'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'

export default function useToken(tradeMode: TradeMode) {
  const [chainId] = useChainId()
  const tokensMetadata = getTokensMetadata(chainId)
  const [tokenAddress] = useTokenAddress()

  // TODO: optimize, extract this query to a single function to avoid closure memory leak
  const {data: tokenMinPriceData = 0n} = useTokenPricesQuery(
    useCallback(
      tokenPrices => {
        return tokenPrices.get(tokenAddress ?? '')?.min
      },
      [tokenAddress],
    ),
  )

  const tokenData = tokenAddress ? tokensMetadata.get(tokenAddress) : undefined
  const tokenDecimals = tokenData?.decimals ?? 0
  const latestTokenDecimals = useLatest(tokenDecimals)

  const [tokenAmountUsd, setTokenAmountUsd] = useState(0n)
  const latestTokenAmountUsd = useLatest(tokenAmountUsd)
  const [tokenPrice, setTokenPrice] = useState(0n)
  const derivedTokenPrice =
    tokenPrice && tradeMode !== TradeMode.Market ? tokenPrice : tokenMinPriceData // TODO: market shouldn't use min price?
  const latestDerivedTokenPrice = useLatest(derivedTokenPrice)

  const tokenAmount = useMemo(() => {
    if (!derivedTokenPrice) return 0n
    return convertUsdToTokenAmount(tokenAmountUsd, tokenDecimals, derivedTokenPrice)
  }, [derivedTokenPrice, tokenAmountUsd, tokenDecimals])

  const setTokenAmount = useCallback(
    (tokenAmount: bigint) => {
      const tokenAmountUsd = convertTokenAmountToUsd(
        tokenAmount,
        tokenDecimals,
        latestDerivedTokenPrice.current,
      )
      setTokenAmountUsd(tokenAmountUsd)
    },
    [tokenDecimals],
  )

  return {
    tokenAddress,
    tokenData,
    tokenAmount,
    tokenAmountUsd,
    latestTokenAmountUsd,
    setTokenAmount,
    tokenPrice,
    derivedTokenPrice,
    latestDerivedTokenPrice,
    setTokenPrice,
    setTokenAmountUsd,
    tokenDecimals,
    latestTokenDecimals,
  }
}
