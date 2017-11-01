async function bucketExists (s3, Bucket) {
  return new Promise((resolve, reject) => {
    s3.headBucket({ Bucket }, (err) => {
      if (err && err.code === 'NotFound') {
        resolve(false)
      } else if (err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}

async function createBucket (s3, bucketConfig) {
  return new Promise((resolve, reject) => {
    s3.createBucket(bucketConfig, (err) => {
      return err ? reject(err) : resolve()
    })
  })
}

module.exports = async function (s3, bucketConfig, logger) {
  const { Bucket } = bucketConfig
  logger.info(`Checking if S3 bucket "${Bucket}" exists...`)

  const exists = await bucketExists(s3, Bucket)

  logger.info(`S3 bucket "${Bucket}" exists: "${exists}"`)

  if (!exists) {
    logger.info(`Creating S3 bucket: "${Bucket}"`)
    await createBucket(s3, bucketConfig)
    logger.info(`Successfully created S3 bucket: "${Bucket}"`)
  }
}
