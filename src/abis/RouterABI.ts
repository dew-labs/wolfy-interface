const RouterABI = [
  {type: 'impl', name: 'RouterImpl', interface_name: 'satoru::router::router::IRouter'},
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
    name: 'satoru::router::router::IRouter',
    items: [
      {
        type: 'function',
        name: 'plugin_transfer',
        inputs: [
          {name: 'token', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'account', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'receiver', type: 'core::starknet::contract_address::ContractAddress'},
          {name: 'amount', type: 'core::integer::u256'},
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
      {name: 'role_store_address', type: 'core::starknet::contract_address::ContractAddress'},
    ],
  },
  {type: 'event', name: 'satoru::router::router::Router::Event', kind: 'enum', variants: []},
] as const
export default RouterABI
