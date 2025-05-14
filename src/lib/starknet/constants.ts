import {StarknetChainId} from 'wolfy-sdk'

export const BLOCK_TIME: Record<StarknetChainId, number> = {
  [StarknetChainId.SN_MAIN]: 31000, // 31 seconds block time
  [StarknetChainId.SN_SEPOLIA]: 31000,
  [StarknetChainId.SN_KATANA]: 31000,
}
