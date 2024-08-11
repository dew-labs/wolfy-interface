import type {EventToPrimitiveType} from 'node_modules/abi-wan-kanabi/dist/kanabi'
import {CallData, events, type ParsedEvent} from 'starknet'

import {getContractAbi, SatoruContract} from './contracts'
export enum SatoruEvent {
  ClaimableCollateralUpdated = 'ClaimableCollateralUpdated',
  ClaimableFundingUpdated = 'ClaimableFundingUpdated',
  PositionImpactPoolAmountUpdated = 'PositionImpactPoolAmountUpdated',
  SwapImpactPoolAmountUpdated = 'SwapImpactPoolAmountUpdated',
  MarketCreated = 'MarketCreated',
  MarketTokenClassHashUpdated = 'MarketTokenClassHashUpdated',
  ClaimableFeeAmountUpdated = 'ClaimableFeeAmountUpdated',
  ClaimableUiFeeAmountUpdated = 'ClaimableUiFeeAmountUpdated',
  FeesClaimed = 'FeesClaimed',
  UiFeesClaimed = 'UiFeesClaimed',
  DepositCreated = 'DepositCreated',
  DepositExecuted = 'DepositExecuted',
  DepositCancelled = 'DepositCancelled',
  WithdrawalCreated = 'WithdrawalCreated',
  WithdrawalExecuted = 'WithdrawalExecuted',
  WithdrawalCancelled = 'WithdrawalCancelled',
  OrderCreated = 'OrderCreated',
  OrderExecuted = 'OrderExecuted',
  OrderUpdated = 'OrderUpdated',
  OrderSizeDeltaAutoUpdated = 'OrderSizeDeltaAutoUpdated',
  OrderCollateralDeltaAmountAutoUpdated = 'OrderCollateralDeltaAmountAutoUpdated',
  OrderCancelled = 'OrderCancelled',
  OrderFrozen = 'OrderFrozen',
  PositionIncrease = 'PositionIncrease',
  PositionDecrease = 'PositionDecrease',
  InsolventClose = 'InsolventClose',
  InsufficientFundingFeePayment = 'InsufficientFundingFeePayment',
  PositionFeesCollected = 'PositionFeesCollected',
  PositionFeesInfo = 'PositionFeesInfo',
  AffiliateRewardUpdated = 'AffiliateRewardUpdated',
  AffiliateRewardClaimed = 'AffiliateRewardClaimed',
  AfterDepositExecutionError = 'AfterDepositExecutionError',
  AfterDepositCancellationError = 'AfterDepositCancellationError',
  AfterWithdrawalExecutionError = 'AfterWithdrawalExecutionError',
  AfterWithdrawalCancellationError = 'AfterWithdrawalCancellationError',
  AfterOrderExecutionError = 'AfterOrderExecutionError',
  AfterOrderCancellationError = 'AfterOrderCancellationError',
  AfterOrderFrozenError = 'AfterOrderFrozenError',
  AdlStateUpdated = 'AdlStateUpdated',
  SetBool = 'SetBool',
  SetAddress = 'SetAddress',
  SetFelt252 = 'SetFelt252',
  SetUint = 'SetUint',
  SetInt = 'SetInt',
  SignalAddOracleSigner = 'SignalAddOracleSigner',
  AddOracleSigner = 'AddOracleSigner',
  SignalRemoveOracleSigner = 'SignalRemoveOracleSigner',
  RemoveOracleSigner = 'RemoveOracleSigner',
  SignalSetFeeReceiver = 'SignalSetFeeReceiver',
  SetFeeReceiver = 'SetFeeReceiver',
  SignalGrantRole = 'SignalGrantRole',
  GrantRole = 'GrantRole',
  SignalRevokeRole = 'SignalRevokeRole',
  RevokeRole = 'RevokeRole',
  SignalSetPriceFeed = 'SignalSetPriceFeed',
  SetPriceFeed = 'SetPriceFeed',
  SignalPendingAction = 'SignalPendingAction',
  ClearPendingAction = 'ClearPendingAction',
  KeeperExecutionFee = 'KeeperExecutionFee',
  ExecutionFeeRefund = 'ExecutionFeeRefund',
  MarketPoolValueInfoEvent = 'MarketPoolValueInfoEvent',
  PoolAmountUpdated = 'PoolAmountUpdated',
  OpenInterestInTokensUpdated = 'OpenInterestInTokensUpdated',
  OpenInterestUpdated = 'OpenInterestUpdated',
  VirtualSwapInventoryUpdated = 'VirtualSwapInventoryUpdated',
  VirtualPositionInventoryUpdated = 'VirtualPositionInventoryUpdated',
  CollateralSumUpdated = 'CollateralSumUpdated',
  CumulativeBorrowingFactorUpdated = 'CumulativeBorrowingFactorUpdated',
  FundingFeeAmountPerSizeUpdated = 'FundingFeeAmountPerSizeUpdated',
  ClaimableFundingAmountPerSizeUpdated = 'ClaimableFundingAmountPerSizeUpdated',
  FundingFeesClaimed = 'FundingFeesClaimed',
  CollateralClaimed = 'CollateralClaimed',
  UiFeeFactorUpdated = 'UiFeeFactorUpdated',
  OraclePriceUpdate = 'OraclePriceUpdate',
  SignerAdded = 'SignerAdded',
  SignerRemoved = 'SignerRemoved',
  SwapReverted = 'SwapReverted',
  SwapInfo = 'SwapInfo',
  SwapFeesCollected = 'SwapFeesCollected',
  SetHandler = 'SetHandler',
  SetTraderReferralCode = 'SetTraderReferralCode',
  SetTier = 'SetTier',
  SetReferrerTier = 'SetReferrerTier',
  SetReferrerDiscountShare = 'SetReferrerDiscountShare',
  SetRegisterCode = 'SetRegisterCode',
  SetCodeOwner = 'SetCodeOwner',
  GovSetCodeOwner = 'GovSetCodeOwner',
  SetGov = 'SetGov',
}

// NOTE: use this code to create EVENT_HASHES object
// console.log(Object.keys(Event).reduce(
//   (acc, key) => {
//     acc[key as Event] = num.toHex(hash.starknetKeccak(key))
//     return acc
//   },
//   // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter -- create object using reduce
//   {} as Record<Event, string>,
// ))

const EVENT_HASHES = {
  ClaimableCollateralUpdated: '0x274da576ef5a0071f6d04fcd1780ba213b00e8f11a91e3519e6d2d3025c0bd2',
  ClaimableFundingUpdated: '0x15eebf8297cc3f559ded968b9b253a3f043b1e6da5075ac2111083dc2c456fe',
  PositionImpactPoolAmountUpdated:
    '0x347d1e9a4e585ffe349278ca697ee84e8ce8dfe4b1ca69f75c300753b8f0cf8',
  SwapImpactPoolAmountUpdated: '0x27002ff333e572d1b11e6b64a57aa3bb1c7b16c4ede38dd340c1e3985af7a8',
  MarketCreated: '0x15d762f1fc581b3e684cf095d93d3a2c10754f60124b09bec8bf3d76473baaf',
  MarketTokenClassHashUpdated: '0x14f7b355edcdecf7ae867ad2bad4270fb0f91c430539c9b3bc2f8e2c42bd47e',
  ClaimableFeeAmountUpdated: '0x2f35cb8f4fda8bfdb5c1254792a1c6b0289eb5cfec99fe0283fd15ef0db5103',
  ClaimableUiFeeAmountUpdated: '0x2fd80e50bc7af1ab12428bf8abc426fd1164c00c3458a1b1f3fe3a736b66f35',
  FeesClaimed: '0x25125d293036f3497d1bd937fd93c42cf29e04bf27131baad34bc96f0a66d0e',
  UiFeesClaimed: '0x632ae58481eddee27cebf9c32589e10a99a273e186a2dfd67f9bb0d4cfc34f',
  DepositCreated: '0xee02d31cafad9001fbdc4dd5cf4957e152a372530316a7d856401e4c5d74bd',
  DepositExecuted: '0x56020a9644603d22d7b029b5649a55d708b88d9049150f146ac26c4107b880',
  DepositCancelled: '0x56e709adf36c0cb909b41ebecb620a44a31b6dc3867b92c2acf971785cdb5',
  WithdrawalCreated: '0x2021e2242f6c652ae824bc1428ee0fe7e8771a27295b9450792445dc456e37d',
  WithdrawalExecuted: '0x198e9258f1701223baddabfe884a5dc09ee23a6b31b57c9e8150d60c97707f8',
  WithdrawalCancelled: '0x123e46ff00e99354cd600fed716e4d5ed6346a3b5ff71e771307cac571b479e',
  OrderCreated: '0x3427759bfd3b941f14e687e129519da3c9b0046c5b9aaa290bb1dede63753b3',
  OrderExecuted: '0xf10f06595d3d707241f604672ec4b6ae50eb82728ec2f3c65f6789e897760',
  OrderUpdated: '0xb670ed7b7ee8ccb350963a7dea39493daff6e7a43ab021a0e4ac2d652d359e',
  OrderSizeDeltaAutoUpdated: '0x5b114a7f40ac32ae3434bb471c7c290d8378f8799381f8d644bc6aa86762fb',
  OrderCollateralDeltaAmountAutoUpdated:
    '0x30fdbb2d7dd783d51d86f788fc4377eff6d56b7bf1bf8a58fea76a39af4137',
  OrderCancelled: '0x3bb288dfd646d5b6c69d5099dd75b72f9c8c09ec9d40984c8ad8182357ae4b2',
  OrderFrozen: '0x33fdba4e5f6b272d64068005c56e7adbaa6d8de035ca1f7b08422c6dc9fe606',
  PositionIncrease: '0x14196ccb31f81a3e67df18f2a62cbfb50009c80a7d3c728a3f542e3abc5cb63',
  PositionDecrease: '0x3d51b51b408d7c62dcc47cc558da5ce6a6e0fd129a427ebce150f52b0e5171a',
  InsolventClose: '0x3a5615fee0f8a3be5094b3bca17ec4275ce73d648845f3e7c10226bb9e0eed0',
  InsufficientFundingFeePayment:
    '0x3408f76dd3de54be0ffc07cbb24aad5b7a37b799151dee0231f7fb584056638',
  PositionFeesCollected: '0x96982abd597114bdaa4a60612f87fabfcc7206aa12d61c50e7ba1e6c291100',
  PositionFeesInfo: '0x255f9667b66fc9e7efb1b6d44319284e1d7cffbff9751f70e263723a7080b83',
  AffiliateRewardUpdated: '0x2358c49a9f8be163aa5d0b4889e345b872ba76577745cf3b677029ff488b6b4',
  AffiliateRewardClaimed: '0x39fad21b4dbf94c3b497f2cd200ba9b77f616587568fb17adb2c252159e1f7f',
  AfterDepositExecutionError: '0x29cf6b6e00d64877818de41623ffda37a926f6595f56888e3342f5749b7b3d0',
  AfterDepositCancellationError:
    '0x2b9a4104b33a673a5f67a2170a175bf1c08b0b1283123c6b09d6928181bf228',
  AfterWithdrawalExecutionError:
    '0x1213d173bc404afca24e09084beac73f800a32c3de4a134f5543e511307c297',
  AfterWithdrawalCancellationError:
    '0x2bf71a3c0ddfb9018a060bcacecfecf17a0f4e2dac26acfe0a6b4a2995754a7',
  AfterOrderExecutionError: '0x3642bfe66a07ececef068581ca5bd4401ea41f60e7cc3e1a4c1f5fde1d45ecb',
  AfterOrderCancellationError: '0xfd79ea707ed5fe1e05f242a567b10076c1f6288d0fe95d762d5f54534e7205',
  AfterOrderFrozenError: '0x85057976b6093206515667e7f5b0ed4005282abb8fcc49761b1644e5eaad2a',
  AdlStateUpdated: '0x3781196bf1989f86ce0fb15db712fa1673a65b5f4d421250e8fd73f40a70df4',
  SetBool: '0x1b30f29e7945c41dc84a16fb5345bf8bf9fd87d7b5c60f483dda8520b46db87',
  SetAddress: '0x30e71f83a378fe9c195c33cffacaae2ed4edad52da64e03045e785e358956e2',
  SetFelt252: '0x46f9846915e54265313d693fc463a2bf6dba204363e2895384fbb34b5a0bf3',
  SetUint: '0x2451d757d5863173e04605a5bd6de4cad7710cd78c9cc9cd8a3be2ea73de489',
  SetInt: '0x33aa9dc18f0f93d4670177e51139ee3739165318c92d6e6341f4b4c14890641',
  SignalAddOracleSigner: '0x3af4106cbeec87f071f034d8d97c2772983047f224621baf5d2e117bf3d7a2d',
  AddOracleSigner: '0x1b8d5ad6290621e6bfcf62ff6777896014aeecf97ed0ac55beefed609609727',
  SignalRemoveOracleSigner: '0x1843f57938c711d92b7a3cae4626c5b9723a6ed8e81d6bfd8b2bbca333aa05f',
  RemoveOracleSigner: '0x37b71e05d78684752cf1bb267cd4938c08633f6966ae816aecdbb5ef8f3f02b',
  SignalSetFeeReceiver: '0x1cea82a9d66c0ab0d6d326563facecef1944946f3b5dd6d59e795216a1d76a',
  SetFeeReceiver: '0x21c58cd8102eb1401361e1ba4169fd199cbad7ef70b218f8672badd8238360c',
  SignalGrantRole: '0xdf5a921f6b0e1e3b4587d9c23c790507a093ed049c56abdffe4b1e42776d62',
  GrantRole: '0x26019e7cbeb48011f7e9e777f8840e0c1696a2664bd2ba597fe6dab8b4761ec',
  SignalRevokeRole: '0x10fdf915d704328316b689315f0af0d0ea1b2a857bcd1fc5241368f76fce218',
  RevokeRole: '0x165e8a0944456620e8ad6f647ff32fd8e89cc5b99c8b70da8ded6e971355622',
  SignalSetPriceFeed: '0x1f73093eb2cb716c722274fc4515f61b3b06b50627ba404cfe2b4df1df28296',
  SetPriceFeed: '0x146ed0f498b729af60dd58b3c2cba9a3b5c2a466edc7f48b32b9f9ce7270fbe',
  SignalPendingAction: '0x3fa96d334c184f6d63fc2fec92ffd8aabebff280fa74d3dd06f81cca1dab189',
  ClearPendingAction: '0x6e8cc3bbfef70bd6abece796a61eedef6f0e53d6ff263790269360c56f7dec',
  KeeperExecutionFee: '0x3f0018c9e19829fa2f55e53969d49e96f7bc3936cd7453806b7cd0eaf5593ca',
  ExecutionFeeRefund: '0x2db92bfa9c5428bfb1001511cc8b0376a77baf28e4b374949b9770bbbb799a0',
  MarketPoolValueInfoEvent: '0x25c52e5957a278820f561bc45a890992e74964028ea70ca5cc8caebf5ffc06b',
  PoolAmountUpdated: '0xcb25a2cd3af50847ea41e39e0b572ab9c2d43065dcf3460884e62301851853',
  OpenInterestInTokensUpdated: '0x3be3c3c8271403e547b480ca2b55983a21fe524ed9d85d50d72a461e3290111',
  OpenInterestUpdated: '0x196834ad19e18bcab573766c501e3a5cf9a022e5fc21614e0dc7655b7e9c8f',
  VirtualSwapInventoryUpdated: '0x39774eb57501f226101157baf57877ecefeb2edf113e3159dbffbd7b7c8b0ad',
  VirtualPositionInventoryUpdated:
    '0x2c7348449d8fa3871cf237c8c3d8665edbd6a3a3b875219a634dfd4c79297ad',
  CollateralSumUpdated: '0x99719f5a4203b0fbf52f9cb524b188b40dc9b9e52235d3821d7966f78bb2ac',
  CumulativeBorrowingFactorUpdated:
    '0x237215cac2e30d52faa22ac5f257cc28b963bc20a6aaada17b5814ab489013e',
  FundingFeeAmountPerSizeUpdated:
    '0x3711de9bbcf6742f3644c5088104e3d8801f3e2732c153b19be5cffff228586',
  ClaimableFundingAmountPerSizeUpdated:
    '0x336d7b983bef888d52a7d383be4fb19e1d508ddcb665f140c2f4475666927fb',
  FundingFeesClaimed: '0x27d869368a1c2fca23506342a50d40fcc45d39d44486d9319780252e3b66b2e',
  CollateralClaimed: '0x33ec8f203df825c3d2fbd007cb402df8a513ad84a15a7fb45b24aacc73c8600',
  UiFeeFactorUpdated: '0x1e5664a4dd0dbd3d26c61a0c0747a89f04c0348805bdc44a7a607ccfdb8203c',
  OraclePriceUpdate: '0x1c7b30afab659d385f1996d0addfa6e647694862e72378d0b43773f556cbeb2',
  SignerAdded: '0x13e0a7a1b336b4c26698238e24a7d168b97af745bff0dc136e2c06aab4646a5',
  SignerRemoved: '0x2627fa7cdec2db817ac1a12af8a65561e30994bbdccb75b23ceec377bc9c939',
  SwapReverted: '0xd58009c9fc1104f27f2cc176d1cececc93791918c2e3c0037e573f873e64a',
  SwapInfo: '0x3534d650a9b8eb67820f87038b8e8b36b741c6f7eb14d1a7ac5027e80fd4a82',
  SwapFeesCollected: '0x35c99b746450c623be607459294d15f458678f99d535718db6cfcbccb117c09',
  SetHandler: '0x181a54d863733a562edb6fc766710fee249b51b2563aafa8d1bca55de313166',
  SetTraderReferralCode: '0x16de3c26c0c92b93ac3ad34429dca0d181c1af33290abdc496eddd2880da4de',
  SetTier: '0x348551d55353961ccc537b8d1d875f9dee6d04f8f49f5eee165933c8dccf420',
  SetReferrerTier: '0x7ca5c2cd2fec91943f85c9744d0b4b9d0ef6560a7ce310590b45eb0ea5fd59',
  SetReferrerDiscountShare: '0x2836eee18862cfa1f1bb1f185ac57f0fb30c200f498ab45608e6aca3e1071d9',
  SetRegisterCode: '0x2a5588e9b6e00c2b4fd0a1656778025429ed71207f194448e62f0bafee805fa',
  SetCodeOwner: '0x17c0a07835dba8310958775aef84afdeee8cd34da2ae39a2e3a93149c99e85f',
  GovSetCodeOwner: '0x37806b1dd5eed589ed27d060b0ccbd717dca8d36dad207f255cf08ee7c97a1e',
  SetGov: '0x39f56992fc193f6a7bc3bb48cfa8836e05369722fe3ee4d49b6da81a86e6b02',
} as const satisfies Record<SatoruEvent, string>

export type SatoruEventHash = (typeof EVENT_HASHES)[keyof typeof EVENT_HASHES]

export function getSatoruEventHash(event: SatoruEvent) {
  return EVENT_HASHES[event]
}

const eventEmitterAbi = getContractAbi(SatoruContract.EventEmitter)
const eventEmitterEvents = events.getAbiEvents(eventEmitterAbi)
const eventEmitterStructs = CallData.getAbiStruct(eventEmitterAbi)
const eventEmitterEnums = CallData.getAbiEnum(eventEmitterAbi)

interface EVENT {
  from_address: string
  keys: string[]
  data: string[]
}

export type ParsedSatoruEvent<T extends SatoruEvent> = EventToPrimitiveType<
  typeof eventEmitterAbi,
  `satoru::event::event_emitter::EventEmitter::${T}`
>

export function parseEvent(event: unknown): ParsedEvent | undefined
export function parseEvent<T extends SatoruEvent, R = ParsedSatoruEvent<T>>(
  event: unknown,
): R | undefined {
  return events.parseEvents(
    [event] as [EVENT],
    eventEmitterEvents,
    eventEmitterStructs,
    eventEmitterEnums,
  )[0] as R
}
