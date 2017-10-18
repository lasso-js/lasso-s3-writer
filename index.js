const lassoS3Writer = require('./src/lasso-s3-writer')

module.exports = function (lasso, pluginConfig) {
  lasso.config.writer = lassoS3Writer(pluginConfig)
}
