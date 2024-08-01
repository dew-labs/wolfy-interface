const OracleStoreABI = [
  {
    type: 'impl',
    name: 'OracleStoreImpl',
    interface_name: 'satoru::oracle::oracle_store::IOracleStore',
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
    name: 'satoru::oracle::oracle_store::IOracleStore',
    items: [
      {
        type: 'function',
        name: 'initialize',
        inputs: [
          {name: 'role_store_address', type: 'core::starknet::contract_address::ContractAddress'},
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
        name: 'add_signer',
        inputs: [{name: 'account', type: 'core::starknet::contract_address::ContractAddress'}],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'remove_signer',
        inputs: [{name: 'account', type: 'core::starknet::contract_address::ContractAddress'}],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'get_signer_count',
        inputs: [],
        outputs: [{type: 'core::integer::u256'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_signer',
        inputs: [{name: 'index', type: 'core::integer::u32'}],
        outputs: [{type: 'core::starknet::contract_address::ContractAddress'}],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_signers',
        inputs: [
          {name: 'start', type: 'core::integer::u256'},
          {name: 'end', type: 'core::integer::u256'},
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
    inputs: [
      {name: 'role_store_address', type: 'core::starknet::contract_address::ContractAddress'},
      {name: 'event_emitter_address', type: 'core::starknet::contract_address::ContractAddress'},
    ],
  },
  {
    type: 'event',
    name: 'satoru::oracle::oracle_store::OracleStore::Event',
    kind: 'enum',
    variants: [],
  },
] as const
export default OracleStoreABI
