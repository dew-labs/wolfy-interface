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
* @param {{}} inputs
* @param {{ locale?: "en" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
export const whole_plain_mantis_affirm = (inputs = {}, options = {}) => {
	const locale = options.locale ?? getLocale()
	if (locale === "en") return en.whole_plain_mantis_affirm(inputs)
	return "whole_plain_mantis_affirm"
};