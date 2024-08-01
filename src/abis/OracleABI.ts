const OracleABI = [
  {type: 'impl', name: 'OracleImpl', interface_name: 'satoru::oracle::oracle::IOracle'},
  {
    type: 'struct',
    name: 'satoru::data::data_store::IDataStoreDispatcher',
    members: [
      {name: 'contract_address', type: 'core::starknet::contract_address::ContractAddress'},
    ],
  },
  {
    type: 'struct',
    name: 'satoru::event::event_emitter::IEventEmitterDispatcher',
    members: [
      {name: 'contract_address', type: 'core::starknet::contract_address::ContractAddress'},
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
    name: 'core::array::Span::<core::felt252>',
    members: [{name: 'snapshot', type: '@core::array::Array::<core::felt252>'}],
  },
  {
    type: 'struct',
    name: 'satoru::oracle::oracle_utils::SetPricesParams',
    members: [
      {name: 'signer_info', type: 'core::integer::u256'},
      {
        name: 'tokens',
        type: 'core::array::Array::<core::starknet::contract_address::ContractAddress>',
      },
      {
        name: 'compacted_min_oracle_block_numbers',
        type: 'core::array::Array::<core::integer::u64>',
      },
      {
        name: 'compacted_max_oracle_block_numbers',
        type: 'core::array::Array::<core::integer::u64>',
      },
      {name: 'compacted_oracle_timestamps', type: 'core::array::Array::<core::integer::u64>'},
      {name: 'compacted_decimals', type: 'core::array::Array::<core::integer::u256>'},
      {name: 'compacted_min_prices', type: 'core::array::Array::<core::integer::u256>'},
      {name: 'compacted_min_prices_indexes', type: 'core::array::Array::<core::integer::u256>'},
      {name: 'compacted_max_prices', type: 'core::array::Array::<core::integer::u256>'},
      {name: 'compacted_max_prices_indexes', type: 'core::array::Array::<core::integer::u256>'},
      {name: 'signatures', type: 'core::array::Array::<core::array::Span::<core::felt252>>'},
      {
        name: 'price_feed_tokens',
        type: 'core::array::Array::<core::starknet::contract_address::ContractAddress>',
      },
    ],
  },
  {
    type: 'struct',
    name: 'satoru::price::price::Price',
    members: [
      {name: 'min', type: 'core::integer::u256'},
      {name: 'max', type: 'core::integer::u256'},
    ],
  },
  {
    type: 'enum',
    name: 'pragma_lib::types::DataType',
    variants: [
      {name: 'SpotEntry', type: 'core::felt252'},
      {name: 'FutureEntry', type: '(core::felt252, core::integer::u64)'},
      {name: 'GenericEntry', type: 'core::felt252'},
    ],
  },
  {
    type: 'enum',
    name: 'core::option::Option::<core::integer::u64>',
    variants: [
      {name: 'Some', type: 'core::integer::u64'},
      {name: 'None', type: '()'},
    ],
  },
  {
    type: 'struct',
    name: 'pragma_lib::types::PragmaPricesResponse',
    members: [
      {name: 'price', type: 'core::integer::u128'},
      {name: 'decimals', type: 'core::integer::u32'},
      {name: 'last_updated_timestamp', type: 'core::integer::u64'},
      {name: 'num_sources_aggregated', type: 'core::integer::u32'},
      {name: 'expiration_timestamp', type: 'core::option::Option::<core::integer::u64>'},
    ],
  },
  {
    type: 'interface',
    name: 'satoru::oracle::oracle::IOracle',
    items: [
      {
        type: 'function',
        name: 'initialize',
        inputs: [
          {name: 'role_store_address', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'oracle_store_address', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'pragma_address', type: 'core::starknet::contract_address::ContractAddress'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'set_prices',
        inputs: [
          {name: 'data_store', type: 'satoru::data::data_store::IDataStoreDispatcher'},
          {name: 'event_emitter', type: 'satoru::event::event_emitter::IEventEmitterDispatcher'},
          {name: 'params', type: 'satoru::oracle::oracle_utils::SetPricesParams'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'set_primary_price',
        inputs: [
          {name: 'token', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'price', type: 'satoru::price::price::Price'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'clear_all_prices',
        inputs: [],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'get_tokens_with_prices_count',
        inputs: [],
        outputs: [{type: 'core::integer::u32'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_tokens_with_prices',
        inputs: [
          {name: 'start', type: 'core::integer::u32'},
          {name: 'end', type: 'core::integer::u32'},
        ],
        outputs: [
          {type: 'core::array::Array::<core::starknet::contract_address::ContractAddress>'},
        ],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_primary_price',
        inputs: [{name: 'token', type: 'core::starknet::contract_address::ContractAddress'}],
        outputs: [{type: 'satoru::price::price::Price'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_stable_price',
        inputs: [
          {name: 'data_store', type: 'satoru::data::data_store::IDataStoreDispatcher'},
          {name: 'token', type: 'core::starknet::contract_address::ContractAddress'},
        ],
        outputs: [{type: 'core::integer::u256'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_price_feed_multiplier',
        inputs: [
          {name: 'data_store', type: 'satoru::data::data_store::IDataStoreDispatcher'},
          {name: 'token', type: 'core::starknet::contract_address::ContractAddress'},
        ],
        outputs: [{type: 'core::integer::u256'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_asset_price_median',
        inputs: [{name: 'asset', type: 'pragma_lib::types::DataType'}],
        outputs: [{type: 'pragma_lib::types::PragmaPricesResponse'}],
        state_mutability: 'view',
      },
    ],
  },
  {
    type: 'constructor',
    name: 'constructor',
    inputs: [
      {name: 'role_store_address', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'oracle_store_address', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'pragma_address', type: 'core::starknet::contract_address::ContractAddress'},
    ],
  },
  {type: 'event', name: 'satoru::oracle::oracle::Oracle::Event', kind: 'enum', variants: []},
] as const
export default OracleABI
