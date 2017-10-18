const readFileStream = require('./readFileStream')

module.exports = function readResource (reader, path, timeout) {
  return readFileStream({
    readStream: reader.readResource(),
    path,
    timeout
  })
}
