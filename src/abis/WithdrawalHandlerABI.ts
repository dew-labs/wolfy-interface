const WithdrawalHandlerABI = [
  {
    type: 'impl',
    name: 'WithdrawalHandlerImpl',
    interface_name: 'satoru::exchange::withdrawal_handler::IWithdrawalHandler',
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
    type: 'struct',
    name: 'satoru::withdrawal::withdrawal_utils::CreateWithdrawalParams',
    members: [
      {name: 'receiver', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'callback_contract', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'ui_fee_receiver', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'market', type: 'core::starknet::contract_address::ContractAddress'},
      {
        name: 'long_token_swap_path',
        type: 'satoru::utils::span32::Span32::<core::starknet::contract_address::ContractAddress>',
      },
      {
        name: 'short_token_swap_path',
        type: 'satoru::utils::span32::Span32::<core::starknet::contract_address::ContractAddress>',
      },
      {name: 'min_long_token_amount', type: 'core::integer::u256'},
      {name: 'min_short_token_amount', type: 'core::integer::u256'},
      {name: 'execution_fee', type: 'core::integer::u256'},
      {name: 'callback_gas_limit', type: 'core::integer::u256'},
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
    type: 'struct',
    name: 'satoru::oracle::oracle_utils::SimulatePricesParams',
    members: [
      {
        name: 'primary_tokens',
        type: 'core::array::Array::<core::starknet::contract_address::ContractAddress>',
      },
      {name: 'primary_prices', type: 'core::array::Array::<satoru::price::price::Price>'},
    ],
  },
  {
    type: 'interface',
    name: 'satoru::exchange::withdrawal_handler::IWithdrawalHandler',
    items: [
      {
        type: 'function',
        name: 'create_withdrawal',
        inputs: [
          {name: 'account', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'params', type: 'satoru::withdrawal::withdrawal_utils::CreateWithdrawalParams'},
        ],
        outputs: [{type: 'core::felt252'}],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'cancel_withdrawal',
        inputs: [{name: 'key', type: 'core::felt252'}],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'execute_withdrawal',
        inputs: [
          {name: 'key', type: 'core::felt252'},
          {name: 'oracle_params', type: 'satoru::oracle::oracle_utils::SetPricesParams'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'simulate_execute_withdrawal',
        inputs: [
          {name: 'key', type: 'core::felt252'},
          {name: 'params', type: 'satoru::oracle::oracle_utils::SimulatePricesParams'},
        ],
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
      {name: 'withdrawal_vault_address', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'oracle_address', type: 'core::starknet::contract_address::ContractAddress'},
    ],
  },
  {
    type: 'event',
    name: 'satoru::exchange::withdrawal_handler::WithdrawalHandler::Event',
    kind: 'enum',
    variants: [],
  },
] as const
export default WithdrawalHandlerABI
