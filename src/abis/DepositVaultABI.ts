const DepositVaultABI = [
  {
    type: 'impl',
    name: 'DepositVaultImpl',
    interface_name: 'satoru::deposit::deposit_vault::IDepositVault',
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
    type: 'interface',
    name: 'satoru::deposit::deposit_vault::IDepositVault',
    items: [
      {
        type: 'function',
        name: 'initialize',
        inputs: [
          {name: 'data_store_address', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'role_store_address', type: 'core::starknet::contract_address::ContractAddress'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'transfer_out',
        inputs: [
          {name: 'sender', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'token', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'receiver', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'amount', type: 'core::integer::u256'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'record_transfer_in',
        inputs: [{name: 'token', type: 'core::starknet::contract_address::ContractAddress'}],
        outputs: [{type: 'core::integer::u256'}],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'sync_token_balance',
        inputs: [{name: 'token', type: 'core::starknet::contract_address::ContractAddress'}],
        outputs: [{type: 'core::integer::u256'}],
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
    ],
  },
  {
    type: 'event',
    name: 'satoru::deposit::deposit_vault::DepositVault::Event',
    kind: 'enum',
    variants: [],
  },
] as const
export default DepositVaultABI
