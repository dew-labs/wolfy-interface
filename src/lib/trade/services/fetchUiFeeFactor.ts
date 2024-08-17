import {
  cairoIntToBigInt,
  createSatoruContract,
  DataStoreABI,
  SatoruContract,
  StarknetChainId,
} from 'satoru-sdk'

import {UI_FEE_RECEIVER_ADDRESS} from '@/constants/config'
import {uiFeeFactorKey} from '@/constants/dataStore'

export default async function fetchUIFeeFactor(
  chainId: StarknetChainId,
  account = UI_FEE_RECEIVER_ADDRESS,
) {
  const dataStoreContract = createSatoruContract(chainId, SatoruContract.DataStore, DataStoreABI)
  return cairoIntToBigInt(await dataStoreContract.get_u256(uiFeeFactorKey(account)))
}
