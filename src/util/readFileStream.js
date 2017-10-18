const DEFAULT_READ_TIMEOUT = 30000

module.exports = function readFileStream ({ readStream, path, timeout }) {
  return new Promise((resolve, reject) => {
    const fileParts = []

    timeout = timeout || DEFAULT_READ_TIMEOUT

    const readTimer = setTimeout(() => {
      reject(new Error(`Reading resource at path "${path}" to be uploaded to AWS s3 timed out after ${timeout}ms.`))
    }, timeout)

    readStream.on('data', (part) => fileParts.push(part))

    readStream.on('end', () => {
      clearTimeout(readTimer)
      resolve(Buffer.concat(fileParts))
    })

    readStream.on('error', (err) => {
      clearTimeout(readTimer)
      reject(err)
    })
  })
}
