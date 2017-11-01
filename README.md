# lasso-s3-writer

A plugin for [`lasso`](https://github.com/lasso-js/lasso) that will
upload bundles and resources to Amazon S3.

> WARNING: `lasso-s3-writer` should only be used to do Lasso prebuilds

## Usage

```js
require('lasso').configure({
  plugins: [
    {
      plugin: 'lasso-s3-writer',
      config: {
        awsConfig: {
          region: 'us-east-1'
        },
        bucket: 'my-awesome-s3-bucket'
      }
    }
  ],
  ...
});
```

## Configuration Properties

- `bucket` {String} - Name of the AWS S3 bucket to upload to
- `awsConfig` {Object} (optional)- Configuration properties that are passed to `AWS.config.update(...)`
- `s3Config` {Object} (optional) - Configuration properties that are passed to `AWS.S3(...)`
- `s3` {AWS.S3} (optional) - An `AWS.S3` object
- `calculateKey` {Function} (optional) - A function to calculate a unique key
for each bundle or resource. Defaults to using `sha1` checksum.
- `readTimeout` {Number} (optional) - The maximum amount of time to wait for a
file to be read. Defaults to 30 seconds.
- `logger` {Object} (optional) - Logger to write logs to. Does not log if not specified.
