const AWS = require('aws-sdk')
const mime = require('mime')
const conflogger = require('conflogger')
const readResource = require('./util/readResource')
const readBundle = require('./util/readBundle')
const calculateChecksum = require('./util/calculateChecksum')
const getS3UrlIfExists = require('./util/getS3UrlIfExists')
const s3WriteFile = require('./util/s3WriteFile')
const createBucketIfNotExist = require('./util/createBucketIfNotExist')

async function uploadFile ({ s3, bucket, file, contentType, calculateKey }) {
  const key = (calculateKey && calculateKey(file)) || calculateChecksum(file)
  const params = { Bucket: bucket, Key: key }

  // Check whether the file already exists in S3
  let url = await getS3UrlIfExists(s3, params)

  if (!url) {
    url = await s3WriteFile(s3, {
      ...params,
      Body: file,
      ACL: 'public-read',
      ContentType: contentType
    })
  }

  return url
}

/**
* @param pluginConfig {Object}
*  pluginConfig.bucket {String} - Name of the AWS S3 bucket to upload to
*  pluginConfig.awsConfig {Object} (optional)- Configuration properties that are passed to `AWS.config.update(...)`
*  pluginConfig.s3Config {Object} (optional) - Configuration properties that are passed to `AWS.S3(...)`
*  pluginConfig.s3 {AWS.S3} (optional) - An `AWS.S3` object
*  pluginConfig.calculateKey {Function} (optional) - A function to calculate a unique key for each bundle or resource. Defaults to using `sha1` checksum.
*  pluginConfig.readTimeout {Number} (optional) - The maximum amount of time to wait for a file to be read. Defaults to 30 seconds.
*  pluginConfig.logger {Object} (optional) - Logger to write logs to. Does not log if not specified.
*/
module.exports = function (pluginConfig) {
  let {
    awsConfig,
    s3,
    s3Config,
    bucket,
    calculateKey,
    readTimeout,
    logger
  } = pluginConfig || {}

  if (!bucket) throw new Error('"bucket" is a required property of "lasso-s3-writer"')

  logger = conflogger.configure(logger)

  let bucketConfig

  if (typeof bucket === 'object') {
    bucketConfig = bucket
    bucket = bucketConfig.Bucket
  } else {
    bucketConfig = { Bucket: bucket }
  }

  if (awsConfig) AWS.config.update(awsConfig)
  s3 = s3 || new AWS.S3(s3Config)

  return {
    async init (lassoContext) {
      await createBucketIfNotExist(s3, bucketConfig, logger)
    },
    /**
     * This will be called for JS and CSS bundles
     */
    async writeBundle (reader, lassoContext, callback) {
      try {
        const bundle = lassoContext.bundle
        const contentType = mime.getType(bundle.contentType)
        const file = await readBundle(reader, bundle.name, readTimeout)
        const url = await uploadFile({ s3, bucket, file, contentType, calculateKey })
        bundle.url = url
        if (callback) return callback()
      } catch (err) {
        if (callback) return callback(err)
        throw err
      }
    },

    /**
     * This will be called for front-end assets such as images, fonts, etc.
     */
    async writeResource (reader, lassoContext, callback) {
      try {
        const path = lassoContext.path
        const contentType = mime.getType(path)
        const file = await readResource(reader, path, readTimeout)
        const url = await uploadFile({ s3, bucket, file, contentType, calculateKey })
        if (callback) return callback(null, { url })
        return { url }
      } catch (err) {
        if (callback) return callback(err)
        throw err
      }
    }
  }
}
