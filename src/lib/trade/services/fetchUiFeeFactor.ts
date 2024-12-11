import {
  cairoIntToBigInt,
  createWolfyContract,
  DataStoreABI,
  poseidonHash,
  StarknetChainId,
  WolfyContract,
} from 'wolfy-sdk'
import {UI_FEE_FACTOR} from 'wolfy-sdk/dataStore'

import {UI_FEE_RECEIVER_ADDRESS} from '@/constants/config'

function uiFeeFactorKey(account: string) {
  return poseidonHash([UI_FEE_FACTOR, account])
}

export default async function fetchUIFeeFactor(
  chainId: StarknetChainId,
  account = UI_FEE_RECEIVER_ADDRESS,
) {
  const dataStoreContract = createWolfyContract(chainId, WolfyContract.DataStore, DataStoreABI)
  return cairoIntToBigInt(await dataStoreContract.get_u256(uiFeeFactorKey(account)))
}
