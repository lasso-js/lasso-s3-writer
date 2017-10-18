const AWS = require('aws-sdk')
const readResource = require('./util/readResource')
const readBundle = require('./util/readBundle')
const calculateChecksum = require('./util/calculateChecksum')
const getS3UrlIfExists = require('./util/getS3UrlIfExists')
const s3WriteFile = require('./util/s3WriteFile')

async function uploadFile ({ s3, bucket, file, calculateKey }) {
  const key = (calculateKey && calculateKey(file)) || calculateChecksum(file)
  const params = { Bucket: bucket, Key: key }

  // Check whether the file already exists in S3
  let url = await getS3UrlIfExists(s3, params)

  if (!url) {
    url = await s3WriteFile(s3, {
      ...params,
      Body: file,
      ACL: 'public-read'
    })
  }

  return url
}

/**
* @param pluginConfig {Object}
*  pluginConfig.s3 {AWS.S3}
*  pluginConfig.readTimeout {Number}
*/
module.exports = function (pluginConfig) {
  let {
    awsConfig,
    s3,
    s3Config,
    bucket,
    calculateKey,
    readTimeout
  } = pluginConfig || {}

  if (!bucket) throw new Error('"bucket" is a required property of "lasso-s3-writer"')

  if (awsConfig) AWS.config.update(awsConfig)
  s3 = s3 || new AWS.S3(s3Config)

  return {
    /**
     * This will be called for JS and CSS bundles
     */
    async writeBundle (reader, lassoContext, callback) {
      try {
        const bundle = lassoContext.bundle
        const file = await readBundle(reader, bundle.name, readTimeout)
        const url = await uploadFile({ s3, bucket, file, calculateKey })
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
        const file = await readResource(reader, path, readTimeout)
        const url = await uploadFile({ s3, bucket, file, calculateKey })
        if (callback) return callback(null, { url })
        return { url }
      } catch (err) {
        if (callback) return callback(err)
        throw err
      }
    }
  }
}
