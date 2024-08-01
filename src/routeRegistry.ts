/* eslint-disable no-barrel-files/no-barrel-files -- this file need to be a barrel */
import {Route as FaucetRoute} from '@/routes/faucet/route'
import {Route as TradeRoute} from '@/routes/index/route'

export type RegisteredRoutes = typeof TradeRoute | typeof FaucetRoute

export {FaucetRoute, TradeRoute}
/* eslint-enable no-barrel-files/no-barrel-files -- this file need to be a barrel */
