// eslint-disable

/** @type {(inputs: { from: NonNullable<unknown>, to: NonNullable<unknown> }) => string} */
export const game_fancy_manatee_flip = (i) => {
	return `Swap ${i.from} for ${i.to}`
};