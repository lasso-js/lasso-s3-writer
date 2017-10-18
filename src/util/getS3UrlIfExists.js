const generateS3Url = require('./generateS3Url')

module.exports = async function getS3SignedUrlIfExists (s3, params) {
  return new Promise((resolve, reject) => {
    s3.headObject(params, (err) => {
      if (err) {
        if (err.code === 'NotFound') return resolve(null)
        return reject(err)
      }

      resolve(generateS3Url(params.Bucket, params.Key))
    })
  })
}
