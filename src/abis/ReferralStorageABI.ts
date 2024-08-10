const ReferralStorageABI = [
  {
    type: 'impl',
    name: 'ReferralStorageImpl',
    interface_name: 'satoru::mock::referral_storage::IReferralStorage',
  },
  {
    type: 'enum',
    name: 'core::bool',
    variants: [
      {name: 'False', type: '()'},
      {name: 'True', type: '()'},
    ],
  },
  {
    type: 'struct',
    name: 'core::integer::u256',
    members: [
      {name: 'low', type: 'core::integer::u128'},
      {name: 'high', type: 'core::integer::u128'},
    ],
  },
  {
    type: 'struct',
    name: 'satoru::referral::referral_tier::ReferralTier',
    members: [
      {name: 'total_rebate', type: 'core::integer::u256'},
      {name: 'discount_share', type: 'core::integer::u256'},
    ],
  },
  {
    type: 'interface',
    name: 'satoru::mock::referral_storage::IReferralStorage',
    items: [
      {
        type: 'function',
        name: 'initialize',
        inputs: [
          {
            name: 'event_emitter_address',
            type: 'core::starknet::contract_address::ContractAddress',
          },
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'only_handler',
        inputs: [],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'set_handler',
        inputs: [
          {name: 'handler', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'is_active', type: 'core::bool'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'set_referrer_discount_share',
        inputs: [{name: 'discount_share', type: 'core::integer::u256'}],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'set_trader_referral_code_by_user',
        inputs: [{name: 'code', type: 'core::felt252'}],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'register_code',
        inputs: [{name: 'code', type: 'core::felt252'}],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'set_code_owner',
        inputs: [
          {name: 'code', type: 'core::felt252'},
          {name: 'new_account', type: 'core::starknet::contract_address::ContractAddress'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'code_owners',
        inputs: [{name: 'code', type: 'core::felt252'}],
        outputs: [{type: 'core::starknet::contract_address::ContractAddress'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'trader_referral_codes',
        inputs: [{name: 'account', type: 'core::starknet::contract_address::ContractAddress'}],
        outputs: [{type: 'core::felt252'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'referrer_discount_shares',
        inputs: [{name: 'account', type: 'core::starknet::contract_address::ContractAddress'}],
        outputs: [{type: 'core::integer::u256'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'referrer_tiers',
        inputs: [{name: 'account', type: 'core::starknet::contract_address::ContractAddress'}],
        outputs: [{type: 'core::integer::u256'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_trader_referral_info',
        inputs: [{name: 'account', type: 'core::starknet::contract_address::ContractAddress'}],
        outputs: [{type: '(core::felt252, core::starknet::contract_address::ContractAddress)'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'set_trader_referral_code',
        inputs: [
          {name: 'account', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'code', type: 'core::felt252'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'set_tier',
        inputs: [
          {name: 'tier_id', type: 'core::integer::u256'},
          {name: 'total_rebate', type: 'core::integer::u256'},
          {name: 'discount_share', type: 'core::integer::u256'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'set_referrer_tier',
        inputs: [
          {name: 'referrer', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'tier_id', type: 'core::integer::u256'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'gov_set_code_owner',
        inputs: [
          {name: 'code', type: 'core::felt252'},
          {name: 'new_account', type: 'core::starknet::contract_address::ContractAddress'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'tiers',
        inputs: [{name: 'tier_level', type: 'core::integer::u256'}],
        outputs: [{type: 'satoru::referral::referral_tier::ReferralTier'}],
        state_mutability: 'view',
      },
    ],
  },
  {
    type: 'constructor',
    name: 'constructor',
    inputs: [
      {name: 'event_emitter_address', type: 'core::starknet::contract_address::ContractAddress'},
    ],
  },
  {
    type: 'event',
    name: 'satoru::mock::referral_storage::ReferralStorage::Event',
    kind: 'enum',
    variants: [],
  },
] as const
export default ReferralStorageABI
