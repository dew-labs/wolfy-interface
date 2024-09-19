/* eslint-disable no-barrel-files/no-barrel-files -- this file need to be a barrel */
import {Route as PoolsRoute} from '@/routes/pools/route'
import {Route as TradeRoute} from '@/routes/trade/route'

export type RegisteredRoutes = typeof TradeRoute | typeof PoolsRoute

export {PoolsRoute, TradeRoute}
/* eslint-enable no-barrel-files/no-barrel-files -- this file need to be a barrel */
