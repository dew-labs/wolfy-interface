import {
  Button,
  Card,
  CardBody,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Select,
  SelectItem,
  Slider,
  Tab,
  Tabs,
  Tooltip,
} from '@nextui-org/react'
import {useCallback, useState} from 'react'
import type {Key} from 'react-aria-components'
import {useLatest} from 'react-use'

import useExecutionType, {ExecutionType} from '@/lib/trade/states/useExecutionType'
import useOrderType, {OrderType} from '@/lib/trade/states/useOrderType'

const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  [OrderType.Long]: 'Long',
  [OrderType.Short]: 'Short',
  [OrderType.Swap]: 'Swap',
}

const INPUT_2_LABEL: Record<OrderType, string> = {
  [OrderType.Long]: 'To long',
  [OrderType.Short]: 'To short',
  [OrderType.Swap]: 'To receive',
}

const AVAILABLE_EXECUTION_TYPES: Record<OrderType, ExecutionType[]> = {
  [OrderType.Long]: [ExecutionType.Market, ExecutionType.Limit, ExecutionType.TPSL],
  [OrderType.Short]: [ExecutionType.Market, ExecutionType.Limit, ExecutionType.TPSL],
  [OrderType.Swap]: [ExecutionType.Market, ExecutionType.Limit],
}

const EXECUTION_TYPE_LABEL: Record<ExecutionType, string> = {
  [ExecutionType.Market]: 'Market',
  [ExecutionType.Limit]: 'Limit',
  [ExecutionType.TPSL]: 'TP/SL',
}

const SUPPORTED_ORDER_TYPES: OrderType[] = [OrderType.Long, OrderType.Short, OrderType.Swap]

const SUPPORTED_ASSETS_TO_PAY = ['BTC', 'ETH', 'SOL', 'USDT'] as const

type Pool = [string, string]

const POOLS: Pool[] = [
  ['ETH', 'USDT'],
  ['ETH', 'USDC'],
  ['wstETH', 'USDT'],
]

export default function Controller() {
  const [orderType, setOrderType] = useOrderType()
  const [executionType, setExecutionType] = useExecutionType()
  const [assetToPay, setAssetToPay] = useState<string>(SUPPORTED_ASSETS_TO_PAY[0])
  const [leverage, setLeverage] = useState(1)
  const [leverageInput, setLeverageInput] = useState('1')
  const [maxLeverage, _setMaxLeverage] = useState(100)
  const [pool, setPool] = useState<Pool>(['ETH', 'USDT'])
  const latestPool = useLatest(pool)
  const [collateral, setCollateral] = useState('ETH')
  const latestCollateral = useLatest(collateral)

  const setCurrentOrderType = useCallback(
    (value: Key) => {
      setOrderType(value as OrderType)
    },
    [setOrderType],
  )

  const setCurrentExecutionType = useCallback(
    (value: Key) => {
      setExecutionType(value as ExecutionType)
    },
    [setExecutionType],
  )

  const handleLeverageChange = useCallback(
    (value: unknown) => {
      const numValue = Number(value)
      if (!Number.isFinite(numValue) || numValue <= 0) return

      if (numValue > maxLeverage) return

      setLeverage(numValue)
      setLeverageInput(numValue.toString())
    },
    [maxLeverage],
  )

  const handlePoolChange = useCallback((value: unknown) => {
    if (typeof value !== 'string') return
    const valueArray = value.split('/')
    if (valueArray.length !== 2) return
    setPool(valueArray as Pool)
    if (!valueArray.includes(latestCollateral.current)) {
      setCollateral(String(valueArray[0]))
    }
  }, [])

  const handleCollateralChange = useCallback((value: unknown) => {
    if (typeof value !== 'string') return
    if (!latestPool.current.includes(value)) return
    setCollateral(value)
  }, [])

  return (
    <div className='flex w-full max-w-xs flex-col'>
      <Card>
        <CardBody>
          <Tabs
            size='lg'
            selectedKey={orderType}
            onSelectionChange={setCurrentOrderType}
            aria-label='Order type'
            classNames={{
              tabList: 'gap-2 w-full relative',
            }}
          >
            {SUPPORTED_ORDER_TYPES.map(type => (
              <Tab key={type} title={ORDER_TYPE_LABEL[type]} />
            ))}
          </Tabs>
          <Tabs
            size='sm'
            variant='underlined'
            selectedKey={executionType}
            onSelectionChange={setCurrentExecutionType}
            aria-label='Execution type'
          >
            {AVAILABLE_EXECUTION_TYPES[orderType].map(type => (
              <Tab key={type} title={EXECUTION_TYPE_LABEL[type]} />
            ))}
          </Tabs>
          <Input
            className='mt-4'
            size='lg'
            type='text'
            label={`Pay: $604.37`}
            placeholder='0.0'
            // startContent={
            //   <div className='pointer-events-none flex items-center'>
            //     <span className='text-small text-default-400'>$</span>
            //   </div>
            // }
            endContent={
              <Select
                aria-label='Select pay asset'
                className='max-w-xs'
                variant='bordered'
                selectedKeys={[assetToPay]}
                onSelectionChange={selection => {
                  if (!selection.currentKey) return
                  setAssetToPay(selection.currentKey)
                }}
                selectorIcon={<></>}
                classNames={{
                  base: 'w-min',
                  label: 'visually-hidden',
                  innerWrapper: 'group-data-[has-label=true]:pt-0 w-full',
                  trigger: 'h-10 min-h-10 min-w-24 w-24 max-w-24',
                  value: 'text-center',
                }}
              >
                {SUPPORTED_ASSETS_TO_PAY.map(asset => (
                  <SelectItem key={asset}>{asset}</SelectItem>
                ))}
              </Select>
            }
          />
          <Input
            className='mt-4'
            size='lg'
            type='text'
            label={`${INPUT_2_LABEL[orderType]}: $8235.17`}
            placeholder='0.0'
            // startContent={
            //   <div className='pointer-events-none flex items-center'>
            //     <span className='text-small text-default-400'>$</span>
            //   </div>
            // }
            endContent={
              <div className='pointer-events-none flex h-full items-center justify-center'>
                <span className='text-lg text-default-400'>ETH</span>
              </div>
            }
          />
          <Slider
            size='md'
            step={1}
            color='foreground'
            label='Leverage'
            maxValue={100}
            minValue={1}
            defaultValue={1}
            className='mt-4 max-w-md'
            renderValue={({_, ...props}) => (
              <output {...props}>
                {'x '}
                <Tooltip
                  className='rounded-md text-tiny text-default-500'
                  content='Press Enter to confirm'
                  placement='left'
                >
                  <input
                    className='w-10 rounded-small border-medium border-transparent bg-default-100 px-1 py-0.5 text-right text-small font-medium text-default-700 outline-none transition-colors hover:border-primary focus:border-primary'
                    type='text'
                    aria-label='Leverage value'
                    value={leverageInput}
                    onChange={e => {
                      const v = e.target.value
                      setLeverageInput(v)
                    }}
                    max={maxLeverage}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleLeverageChange(leverageInput)
                      }
                    }}
                  />
                </Tooltip>
              </output>
            )}
            value={leverage}
            onChange={handleLeverageChange}
            marks={[
              {
                value: 1,
                label: '1',
              },
              {
                value: 10,
                label: '10',
              },
              {
                value: 25,
                label: '25',
              },
              {
                value: 50,
                label: '50',
              },
              {
                value: 75,
                label: '75',
              },
              {
                value: 100,
                label: '100',
              },
            ]}
          />
          <div className='mt-2 flex w-full justify-between'>
            <div className='flex items-center'>Pool</div>
            <Dropdown backdrop='blur'>
              <DropdownTrigger>
                <Button variant='flat'>{pool.join('/')}</Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='Action event example' onAction={handlePoolChange}>
                {POOLS.map(pool => (
                  <DropdownItem key={pool.join('/')}>{pool.join('/')}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className='mt-2 flex w-full justify-between'>
            <div className='flex items-center'>Collateral in</div>
            <Dropdown backdrop='blur'>
              <DropdownTrigger>
                <Button variant='flat'>{collateral}</Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='Action event example' onAction={handleCollateralChange}>
                {pool.map(token => (
                  <DropdownItem key={token}>{token}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          <Divider className='mt-3 opacity-50' />
          <div className='text-sm'>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Execution Price</div>
              <div className='flex items-center'>$3,182.83</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Liquidation Price</div>
              <div className='flex items-center'>$2,908.83</div>
            </div>
          </div>
          <Divider className='mt-3 opacity-50' />
          <div className='text-sm'>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Fee</div>
              <div className='flex items-center'>-$0.04</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Network Fee</div>
              <div className='flex items-center'>-$0.05</div>
            </div>
          </div>
          <div className='mt-4 w-full'>
            <Button color='primary' className='w-full' size='lg'>
              Place
            </Button>
          </div>
        </CardBody>
      </Card>
      <Card className='mt-4'>
        <CardBody>
          {`${ORDER_TYPE_LABEL[orderType]} ${pool[0]}`}
          <Divider className='mt-3 opacity-50' />
          <div className='text-sm'>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Market</div>
              <div className='flex items-center'>ETH/USD[WETH]</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Ask Price (Entry)</div>
              <div className='flex items-center'>$3,179.33</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Net Rate</div>
              <div className='flex items-center'>-0.0047% / 1h</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Available Liquidity</div>
              <div className='flex items-center'>$1,983,118.56</div>
            </div>
            <div className='mt-2 flex w-full justify-between'>
              <div className='flex items-center'>Open Interest Balance</div>
              <div className='flex items-center'>
                <div className='flex'>
                  <div className='rounded-l bg-emerald-700 px-2 py-1 text-white'>50%</div>
                  <div className='rounded-r bg-rose-700 px-2 py-1 text-white'>43%</div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
