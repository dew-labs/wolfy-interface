const RoleStoreABI = [
  {type: 'impl', name: 'RoleStore', interface_name: 'satoru::role::role_store::IRoleStore'},
  {
    type: 'enum',
    name: 'core::bool',
    variants: [
      {name: 'False', type: '()'},
      {name: 'True', type: '()'},
    ],
  },
  {
    type: 'interface',
    name: 'satoru::role::role_store::IRoleStore',
    items: [
      {
        type: 'function',
        name: 'has_role',
        inputs: [
          {name: 'account', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'role_key', type: 'core::felt252'},
        ],
        outputs: [{type: 'core::bool'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'grant_role',
        inputs: [
          {name: 'account', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'role_key', type: 'core::felt252'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'revoke_role',
        inputs: [
          {name: 'account', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'role_key', type: 'core::felt252'},
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'assert_only_role',
        inputs: [
          {name: 'account', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'role_key', type: 'core::felt252'},
        ],
        outputs: [],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_role_count',
        inputs: [],
        outputs: [{type: 'core::integer::u32'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_roles',
        inputs: [
          {name: 'start', type: 'core::integer::u32'},
          {name: 'end', type: 'core::integer::u32'},
        ],
        outputs: [{type: 'core::array::Array::<core::felt252>'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_role_member_count',
        inputs: [{name: 'role_key', type: 'core::felt252'}],
        outputs: [{type: 'core::integer::u32'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_role_members',
        inputs: [
          {name: 'role_key', type: 'core::felt252'},
          {name: 'start', type: 'core::integer::u32'},
          {name: 'end', type: 'core::integer::u32'},
        ],
        outputs: [
          {type: 'core::array::Array::<core::starknet::contract_address::ContractAddress>'},
        ],
        state_mutability: 'view',
      },
    ],
  },
  {
    type: 'constructor',
    name: 'constructor',
    inputs: [{name: 'admin', type: 'core::starknet::contract_address::ContractAddress'}],
  },
  {
    type: 'event',
    name: 'satoru::role::role_store::RoleStore::RoleGranted',
    kind: 'struct',
    members: [
      {name: 'role_key', type: 'core::felt252', kind: 'data'},
      {name: 'account', type: 'core::starknet::contract_address::ContractAddress', kind: 'data'},
      {name: 'sender', type: 'core::starknet::contract_address::ContractAddress', kind: 'data'},
    ],
  },
  {
    type: 'event',
    name: 'satoru::role::role_store::RoleStore::RoleRevoked',
    kind: 'struct',
    members: [
      {name: 'role_key', type: 'core::felt252', kind: 'data'},
      {name: 'account', type: 'core::starknet::contract_address::ContractAddress', kind: 'data'},
      {name: 'sender', type: 'core::starknet::contract_address::ContractAddress', kind: 'data'},
    ],
  },
  {
    type: 'event',
    name: 'satoru::role::role_store::RoleStore::Event',
    kind: 'enum',
    variants: [
      {
        name: 'RoleGranted',
        type: 'satoru::role::role_store::RoleStore::RoleGranted',
        kind: 'nested',
      },
      {
        name: 'RoleRevoked',
        type: 'satoru::role::role_store::RoleStore::RoleRevoked',
        kind: 'nested',
      },
    ],
  },
] as const
export default RoleStoreABI
