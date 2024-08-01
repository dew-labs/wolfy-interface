const IncreaseOrderUtilsABI = [
  {
    type: 'impl',
    name: 'IncreaseOrderUtilsImpl',
    interface_name: 'satoru::order::increase_order_utils::IIncreaseOrderUtils',
  },
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
    name: 'satoru::order::order_vault::IOrderVaultDispatcher',
    members: [
      {name: 'contract_address', type: 'core::starknet::contract_address::ContractAddress'},
    ],
  },
  {
    type: 'struct',
    name: 'satoru::oracle::oracle::IOracleDispatcher',
    members: [
      {name: 'contract_address', type: 'core::starknet::contract_address::ContractAddress'},
    ],
  },
  {
    type: 'struct',
    name: 'satoru::swap::swap_handler::ISwapHandlerDispatcher',
    members: [
      {name: 'contract_address', type: 'core::starknet::contract_address::ContractAddress'},
    ],
  },
  {
    type: 'struct',
    name: 'satoru::mock::referral_storage::IReferralStorageDispatcher',
    members: [
      {name: 'contract_address', type: 'core::starknet::contract_address::ContractAddress'},
    ],
  },
  {
    type: 'struct',
    name: 'satoru::order::base_order_utils::ExecuteOrderParamsContracts',
    members: [
      {name: 'data_store', type: 'satoru::data::data_store::IDataStoreDispatcher'},
      {name: 'event_emitter', type: 'satoru::event::event_emitter::IEventEmitterDispatcher'},
      {name: 'order_vault', type: 'satoru::order::order_vault::IOrderVaultDispatcher'},
      {name: 'oracle', type: 'satoru::oracle::oracle::IOracleDispatcher'},
      {name: 'swap_handler', type: 'satoru::swap::swap_handler::ISwapHandlerDispatcher'},
      {
        name: 'referral_storage',
        type: 'satoru::mock::referral_storage::IReferralStorageDispatcher',
      },
    ],
  },
  {
    type: 'enum',
    name: 'satoru::order::order::OrderType',
    variants: [
      {name: 'MarketSwap', type: '()'},
      {name: 'LimitSwap', type: '()'},
      {name: 'MarketIncrease', type: '()'},
      {name: 'LimitIncrease', type: '()'},
      {name: 'MarketDecrease', type: '()'},
      {name: 'LimitDecrease', type: '()'},
      {name: 'StopLossDecrease', type: '()'},
      {name: 'Liquidation', type: '()'},
    ],
  },
  {
    type: 'enum',
    name: 'satoru::order::order::DecreasePositionSwapType',
    variants: [
      {name: 'NoSwap', type: '()'},
      {name: 'SwapPnlTokenToCollateralToken', type: '()'},
      {name: 'SwapCollateralTokenToPnlToken', type: '()'},
    ],
  },
  {
    type: 'struct',
    name: 'core::array::Span::<core::starknet::contract_address::ContractAddress>',
    members: [
      {
        name: 'snapshot',
        type: '@core::array::Array::<core::starknet::contract_address::ContractAddress>',
      },
    ],
  },
  {
    type: 'struct',
    name: 'satoru::utils::span32::Span32::<core::starknet::contract_address::ContractAddress>',
    members: [
      {
        name: 'snapshot',
        type: 'core::array::Span::<core::starknet::contract_address::ContractAddress>',
      },
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
    type: 'enum',
    name: 'core::bool',
    variants: [
      {name: 'False', type: '()'},
      {name: 'True', type: '()'},
    ],
  },
  {
    type: 'struct',
    name: 'satoru::order::order::Order',
    members: [
      {name: 'key', type: 'core::felt252'},
      {name: 'order_type', type: 'satoru::order::order::OrderType'},
      {name: 'decrease_position_swap_type', type: 'satoru::order::order::DecreasePositionSwapType'},
      {name: 'account', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'receiver', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'callback_contract', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'ui_fee_receiver', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'market', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'initial_collateral_token', type: 'core::starknet::contract_address::ContractAddress'},
      {
        name: 'swap_path',
        type: 'satoru::utils::span32::Span32::<core::starknet::contract_address::ContractAddress>',
      },
      {name: 'size_delta_usd', type: 'core::integer::u256'},
      {name: 'initial_collateral_delta_amount', type: 'core::integer::u256'},
      {name: 'trigger_price', type: 'core::integer::u256'},
      {name: 'acceptable_price', type: 'core::integer::u256'},
      {name: 'execution_fee', type: 'core::integer::u256'},
      {name: 'callback_gas_limit', type: 'core::integer::u256'},
      {name: 'min_output_amount', type: 'core::integer::u256'},
      {name: 'updated_at_block', type: 'core::integer::u64'},
      {name: 'is_long', type: 'core::bool'},
      {name: 'is_frozen', type: 'core::bool'},
    ],
  },
  {
    type: 'struct',
    name: 'satoru::market::market::Market',
    members: [
      {name: 'market_token', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'index_token', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'long_token', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'short_token', type: 'core::starknet::contract_address::ContractAddress'},
    ],
  },
  {
    type: 'enum',
    name: 'satoru::order::order::SecondaryOrderType',
    variants: [
      {name: 'None', type: '()'},
      {name: 'Adl', type: '()'},
    ],
  },
  {
    type: 'struct',
    name: 'satoru::order::base_order_utils::ExecuteOrderParams',
    members: [
      {name: 'contracts', type: 'satoru::order::base_order_utils::ExecuteOrderParamsContracts'},
      {name: 'key', type: 'core::felt252'},
      {name: 'order', type: 'satoru::order::order::Order'},
      {name: 'swap_path_markets', type: 'core::array::Array::<satoru::market::market::Market>'},
      {name: 'min_oracle_block_numbers', type: 'core::array::Array::<core::integer::u64>'},
      {name: 'max_oracle_block_numbers', type: 'core::array::Array::<core::integer::u64>'},
      {name: 'market', type: 'satoru::market::market::Market'},
      {name: 'keeper', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'starting_gas', type: 'core::integer::u256'},
      {name: 'secondary_order_type', type: 'satoru::order::order::SecondaryOrderType'},
    ],
  },
  {
    type: 'struct',
    name: 'core::array::Span::<core::integer::u64>',
    members: [{name: 'snapshot', type: '@core::array::Array::<core::integer::u64>'}],
  },
  {
    type: 'interface',
    name: 'satoru::order::increase_order_utils::IIncreaseOrderUtils',
    items: [
      {
        type: 'function',
        name: 'process_order',
        inputs: [{name: 'params', type: 'satoru::order::base_order_utils::ExecuteOrderParams'}],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'validate_oracle_block_numbers',
        inputs: [
          {name: 'min_oracle_block_numbers', type: 'core::array::Span::<core::integer::u64>'},
          {name: 'max_oracle_block_numbers', type: 'core::array::Span::<core::integer::u64>'},
          {name: 'order_type', type: 'satoru::order::order::OrderType'},
          {name: 'order_updated_at_block', type: 'core::integer::u64'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
    ],
  },
  {
    type: 'event',
    name: 'satoru::order::increase_order_utils::IncreaseOrderUtils::Event',
    kind: 'enum',
    variants: [],
  },
] as const
export default IncreaseOrderUtilsABI
