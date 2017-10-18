const generateS3Url = require('./generateS3Url')

module.exports = function s3WriteFile (s3, params) {
  const { Bucket, Key } = params
  return new Promise((resolve, reject) => {
    s3.putObject(params, (err, data) => {
      return err
        ? reject(err)
        : resolve(generateS3Url(Bucket, Key))
    })
  })
}
