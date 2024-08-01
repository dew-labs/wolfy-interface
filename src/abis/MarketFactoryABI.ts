const MarketFactoryABI = [
  {
    type: 'impl',
    name: 'MarketFactory',
    interface_name: 'satoru::market::market_factory::IMarketFactory',
  },
  {
    type: 'interface',
    name: 'satoru::market::market_factory::IMarketFactory',
    items: [
      {
        type: 'function',
        name: 'create_market',
        inputs: [
          {name: 'index_token', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'long_token', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'short_token', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'market_type', type: 'core::felt252'},
        ],
        outputs: [{type: 'core::starknet::contract_address::ContractAddress'}],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'update_market_token_class',
        inputs: [{name: 'market_token_class', type: 'core::starknet::class_hash::ClassHash'}],
        outputs: [],
        state_mutability: 'external',
      },
    ],
  },
  {
    type: 'constructor',
    name: 'constructor',
    inputs: [
      {name: 'data_store_address', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'role_store_address', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'event_emitter_address', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'market_token_class_hash', type: 'core::starknet::class_hash::ClassHash'},
    ],
  },
  {
    type: 'event',
    name: 'satoru::market::market_factory::MarketFactory::Event',
    kind: 'enum',
    variants: [],
  },
] as const
export default MarketFactoryABI
