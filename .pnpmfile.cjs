const {updateConfig: makeBetterDefaults} =
  require('.pnpm-config/@pnpm/plugin-better-defaults/pnpmfile.cjs').hooks

module.exports = {
  hooks: {
    updateConfig(config) {
      return {
        ...makeBetterDefaults(config),
        // Other configs:
        // hoistPattern: ['*'],
      }
    },
  },
}
