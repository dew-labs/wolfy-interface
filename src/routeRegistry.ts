/* eslint-disable no-barrel-files/no-barrel-files -- this file need to be a barrel */
import {Route as TradeRoute} from '@/routes/index'
import {Route as PoolsRoute} from '@/routes/pools'

export type RegisteredRoutes = typeof TradeRoute | typeof PoolsRoute

export {PoolsRoute, TradeRoute}
/* eslint-enable no-barrel-files/no-barrel-files -- this file need to be a barrel */
