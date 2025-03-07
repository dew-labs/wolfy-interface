// eslint-disable
import * as en from "./en.js"
import { getLocale } from '../../runtime.js'

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ from: NonNullable<unknown>, to: NonNullable<unknown> }} inputs
* @param {{ locale?: "en" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
export const game_fancy_manatee_flip = (inputs, options = {}) => {
	const locale = options.locale ?? getLocale()
	if (locale === "en") return en.game_fancy_manatee_flip(inputs)
	return "game_fancy_manatee_flip"
};