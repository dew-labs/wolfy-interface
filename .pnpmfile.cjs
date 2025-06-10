const { updateConfig: makeBetterDefaults } = require('.pnpm-config/@pnpm/better-defaults/pnpmfile.cjs').hooks

module.exports = {
  hooks: {
    updateConfig (config) {
      return {
        ...makeBetterDefaults(config),
        // Other configs:
        // hoistPattern: ['*'],
      }
    }
  }
}
