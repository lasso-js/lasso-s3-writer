async function bucketExists (s3, Bucket) {
  return new Promise((resolve, reject) => {
    s3.headBucket({ Bucket }, (err) => {
      if (err) {
        if (err.code === 'NotFound') {
          resolve(false)
        } else if (err.code === 'Forbidden') {
          reject(new Error(`Bucket "${Bucket}" exists, but you do not have permission to access it. NOTE: S3 buckets must be unique. Ensure the bucket you specified has a unique name.`))
        } else {
          reject(err)
        }
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
